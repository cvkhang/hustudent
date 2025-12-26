import ChatService from '../services/chatService.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

export const getChats = async (req, res, next) => {
  try {
    // req.user.id from auth middleware
    const chats = await ChatService.getChats(req.user.id);
    res.json({ data: chats });
  } catch (err) {
    next(err);
  }
};

export const createChat = async (req, res, next) => {
  try {
    const { otherUserId } = req.body;
    const chat = await ChatService.getOrCreateChat(req.user.id, otherUserId);
    res.json({ data: chat });
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { before, limit } = req.query;
    const messages = await ChatService.getMessages(req.user.id, chatId, { before, limit });
    res.json({ data: messages });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    const { content } = req.body;
    const files = req.files || [];
    const message = await ChatService.sendMessage({
      senderId: req.user.id,
      chatId,
      content,
      files
    });
    res.json({ data: message });
  } catch (err) {
    next(err);
  }
};

export const markChatAsRead = async (req, res, next) => {
  try {
    const { chatId } = req.params;
    await ChatService.markChatAsRead(req.user.id, chatId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getGroupChat = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const chat = await ChatService.getOrCreateGroupChat(groupId);
    res.json({ data: chat });
  } catch (err) {
    next(err);
  }
};

export default {
  getChats,
  createChat,
  getMessages,
  sendMessage,
  markChatAsRead,
  getGroupChat
};
