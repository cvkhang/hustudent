import { Message, MessageAttachment, Chat, Friendship, User, FriendRequest, GroupMember } from '../models/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { Op } from 'sequelize';
import socketManager from '../socket/socketManager.js';
import uploadService from './uploadService.js';

/**
 * Core Chat Service
 * Handles business logic for messaging (both 1-1 and Groups)
 */

class ChatService {
  /**
   * Check if users can chat (Friendship check / Block check)
   */
  async canChat(senderId, receiverId) {
    // Legacy support for direct chat check only
    const { userLow, userHigh } = Friendship.getOrderedIds(senderId, receiverId);
    const friendship = await Friendship.findOne({
      where: { user_low: userLow, user_high: userHigh }
    });

    if (!friendship) return false;
    if (friendship.status === 'blocked') return false;
    return true;
  }

  /**
   * Send a message
   */
  async sendMessage({ senderId, chatId, content, files = [] }) {
    // 1. Validate Chat Exists
    const chat = await Chat.findByPk(chatId);
    if (!chat) throw new AppError(ErrorCodes.NOT_FOUND, 'Chat not found');

    let recipientId = null;

    if (chat.type === 'direct') {
      recipientId = chat.user_a === senderId ? chat.user_b : chat.user_a;
      // Check permissions
      // const canChat = await this.canChat(senderId, recipientId);
      // if (!canChat) throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot send message. User might be blocked or not friends.');
    } else if (chat.type === 'group') {
      // Check membership
      const member = await GroupMember.findOne({
        where: { group_id: chat.group_id, user_id: senderId, status: 'active' }
      });
      if (!member) throw new AppError(ErrorCodes.FORBIDDEN, 'You must be a member of the group to chat');
    }

    // 3. Create Message
    const message = await Message.create({
      chat_id: chatId,
      sender_id: senderId,
      content: content || '',
      status: 'sent'
    });

    // 4. Handle Attachments
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadService.uploadAttachment(file, `chat-${chatId}`);
        return MessageAttachment.create({
          message_id: message.id,
          type: result.contentType.startsWith('image/') ? 'image' : 'file',
          file_name: result.filename,
          file_url: result.url,
          file_size: result.size,
          mime_type: result.contentType
        });
      });
      await Promise.all(uploadPromises);
    }

    // 5. Fetch full message
    const fullMessage = await Message.findByPk(message.id, {
      include: [
        { model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar_url'] },
        { model: MessageAttachment, as: 'attachments' }
      ]
    });

    // 6. Update Chat timestamp
    await Chat.update(
      { updated_at: new Date() },
      { where: { id: chatId } } // Removed validate: false as it might conflict depending on sequelize version
    );

    // 7. Emit Socket Event
    this.emitMessage(chat, fullMessage, recipientId);

    return fullMessage;
  }

  /**
   * Emit socket event
   */
  emitMessage(chat, message, recipientId) {
    try {
      const io = socketManager.getIO();

      if (chat.type === 'group') {
        // Emit to group room? Or simply to everyone in the group if they joined a room?
        // For now, let's assume we use a room `chat-{chatId}`
        io.to(`chat-${chat.id}`).emit('receive_message', message);
      } else {
        // Direct
        io.to(recipientId).emit('receive_message', message);
      }
    } catch (err) {
      console.warn('Socket emit failed:', err.message);
    }
  }

  async markAsRead(messageId, userId) {
    // Existing logic...
    // For group chats, 'seen' status on message usually implies "seen by everyone" or we track per-user read receipt.
    // Simulating "seen" for groups is complex (needs MessageRead status table).
    // For now, we skip marking as read for groups or just let it update if the sender logic allows.
    // The current schema only has `status` on Message. That's for 1-1.
    // We will leave as is, might behave weirdly for groups (last reader updates status).
    // Better to ignore for groups for now.

    const message = await Message.findByPk(messageId);
    if (!message) return;

    // Check chat type
    const chat = await Chat.findByPk(message.chat_id);
    if (chat && chat.type === 'group') return; // Skip for groups for now

    if (message.sender_id !== userId && message.status !== 'seen') {
      message.status = 'seen';
      await message.save();
      try {
        const io = socketManager.getIO();
        io.to(message.sender_id).emit('message_read', { messageId, readerId: userId });
      } catch (e) { }
    }
  }

  async markChatAsRead(userId, chatId) {
    // Check type
    const chat = await Chat.findByPk(chatId);
    if (!chat) return;
    if (chat.type === 'group') return; // Group read receipts not supported yet

    if (chat.user_a !== userId && chat.user_b !== userId) return;

    const otherUserId = chat.user_a === userId ? chat.user_b : chat.user_a;

    const [updatedCount] = await Message.update(
      { status: 'seen' },
      {
        where: {
          chat_id: chatId,
          sender_id: otherUserId,
          status: { [Op.ne]: 'seen' }
        }
      }
    );

    if (updatedCount > 0) {
      try {
        const io = socketManager.getIO();
        io.to(otherUserId).emit('chat_read', { chatId, readerId: userId });
      } catch (e) { }
    }
    return updatedCount;
  }

  /**
   * Get or create a 1-1 chat
   */
  async getOrCreateChat(userId1, userId2) {
    if (userId1 == userId2) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Cannot chat with yourself');

    const { userA, userB } = Chat.getOrderedUsers(userId1, userId2);

    let chat = await Chat.findOne({
      where: { user_a: userA, user_b: userB, type: 'direct' }
    });

    if (!chat) {
      chat = await Chat.create({ user_a: userA, user_b: userB, type: 'direct' });
    }

    return chat;
  }

  /**
   * Get or create Group Chat
   */
  async getOrCreateGroupChat(groupId) {
    let chat = await Chat.findOne({
      where: { group_id: groupId, type: 'group' }
    });

    if (!chat) {
      chat = await Chat.create({
        group_id: groupId,
        type: 'group',
        user_a: null, // Allow null as per model
        user_b: null
      });
    }
    return chat;
  }

  /**
   * Get list of chats
   */
  async getChats(userId) {
    // Only return direct chats for now or both?
    // "My Messages" page typically shows user's chats.
    // If we want to show Group Chats there too, we need to query based on GroupMembership.
    // For now, let's keep getChats for DIRECT chats, and fetch Group Chat via getOrCreateGroupChat in the Group Detail page.

    // However, if we want them in list...
    // Let's stick to Direct Chats for /chats endpoint.

    const chats = await Chat.findAll({
      where: {
        type: 'direct',
        [Op.or]: [{ user_a: userId }, { user_b: userId }]
      },
      include: [
        { model: User, as: 'userA', attributes: ['id', 'full_name', 'avatar_url', 'email', 'major'] },
        { model: User, as: 'userB', attributes: ['id', 'full_name', 'avatar_url', 'email', 'major'] }
      ],
      order: [['updated_at', 'DESC']]
    });

    // Format... (existing logic)
    const formattedChats = await Promise.all(chats.map(async (chat) => {
      const otherUser = chat.user_a === userId ? chat.userB : chat.userA;

      // ... Friendship logic ...
      // We can reuse or copy paste. Ideally refactor Friendship logic into helper.
      // Copying simplified logic from previous version to save diff size if possible, or fully replacing.

      // RE-IMPLEMENTING FRIENDSHIP LOGIC
      const { userLow, userHigh } = Friendship.getOrderedIds(userId, otherUser.id);
      const friendship = await Friendship.findOne({
        where: { user_low: userLow, user_high: userHigh }
      });

      let friendshipStatus = 'none';
      let isBlockedByMe = false;
      let isBlockedByOther = false;

      if (friendship) {
        if (friendship.status === 'blocked') {
          friendshipStatus = 'blocked';
          isBlockedByMe = friendship.action_user_id === userId;
          isBlockedByOther = friendship.action_user_id === otherUser.id;
        } else if (friendship.status === 'accepted') {
          friendshipStatus = 'friends';
        }
      } else {
        const pendingReq = await FriendRequest.findOne({
          where: {
            [Op.or]: [
              { from_user_id: userId, to_user_id: otherUser.id },
              { from_user_id: otherUser.id, to_user_id: userId }
            ]
          }
        });
        if (pendingReq) friendshipStatus = pendingReq.from_user_id === userId ? 'pending_sent' : 'pending_received';
      }

      const lastMessage = await Message.findOne({
        where: { chat_id: chat.id },
        order: [['created_at', 'DESC']],
        limit: 1,
        include: [{ model: MessageAttachment, as: 'attachments' }]
      });

      const unreadCount = await Message.count({
        where: {
          chat_id: chat.id,
          status: { [Op.ne]: 'seen' },
          sender_id: { [Op.ne]: userId }
        }
      });

      return {
        id: chat.id,
        otherUser: otherUser ? otherUser.toJSON() : null,
        lastMessage,
        unreadCount,
        updatedAt: chat.updated_at,
        isBlockedByMe,
        isBlockedByOther,
        friendshipStatus
      };
    }));

    return formattedChats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  /**
   * Get messages for a chat
   */
  async getMessages(userId, chatId, { before, limit = 50 }) {
    const chat = await Chat.findByPk(chatId);
    if (!chat) throw new AppError(ErrorCodes.NOT_FOUND, 'Chat not found');

    if (chat.type === 'direct') {
      if (chat.user_a !== userId && chat.user_b !== userId) {
        throw new AppError(ErrorCodes.FORBIDDEN, 'Not a participant of this chat');
      }
    } else if (chat.type === 'group') {
      const member = await GroupMember.findOne({
        where: { group_id: chat.group_id, user_id: userId, status: 'active' }
      });
      if (!member) throw new AppError(ErrorCodes.FORBIDDEN, 'Not a member of this group');
    }

    const where = { chat_id: chatId };
    if (before) {
      where.created_at = { [Op.lt]: before };
    }

    const messages = await Message.findAll({
      where,
      limit,
      order: [['created_at', 'DESC']],
      include: [
        { model: MessageAttachment, as: 'attachments' },
        { model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar_url'] }
      ]
    });

    return messages.reverse();
  }
}

export default new ChatService();
