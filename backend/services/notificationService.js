import { Op } from 'sequelize';
import { Notification, User } from '../models/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

// Create notification
const create = async ({ userId, type, title, content, referenceType, referenceId, senderId }) => {
  const notification = await Notification.create({
    user_id: userId,
    type,
    title,
    content,
    reference_type: referenceType,
    reference_id: referenceId,
    sender_id: senderId
  });
  return notification;
};

// Get user notifications
const getNotifications = async (userId, { unreadOnly = false, limit = 50, offset = 0 } = {}) => {
  const where = { user_id: userId };
  if (unreadOnly) where.is_read = false;

  const notifications = await Notification.findAll({
    where,
    include: [{ model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar_url'] }],
    order: [['created_at', 'DESC']],
    limit,
    offset
  });

  const unreadCount = await Notification.count({ where: { user_id: userId, is_read: false } });

  return { notifications, unreadCount };
};

// Mark as read
const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findByPk(notificationId);
  if (!notification) throw new AppError(ErrorCodes.NOT_FOUND, 'Notification not found');
  if (notification.user_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your notification');

  await notification.update({ is_read: true, read_at: new Date() });
  return notification;
};

// Mark all as read
const markAllAsRead = async (userId) => {
  await Notification.update(
    { is_read: true, read_at: new Date() },
    { where: { user_id: userId, is_read: false } }
  );
  return { message: 'All notifications marked as read' };
};

// Delete notification
const deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findByPk(notificationId);
  if (!notification) throw new AppError(ErrorCodes.NOT_FOUND, 'Notification not found');
  if (notification.user_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your notification');

  await notification.destroy();
  return { message: 'Notification deleted' };
};

// ==========================================
// NOTIFICATION HELPERS (called from other services)
// ==========================================
const notifyFriendRequest = async (toUserId, fromUser) => {
  return create({
    userId: toUserId,
    type: 'friend_request',
    title: 'New friend request',
    content: `${fromUser.full_name} sent you a friend request`,
    referenceType: 'user',
    referenceId: fromUser.id,
    senderId: fromUser.id
  });
};

const notifyFriendAccepted = async (toUserId, fromUser) => {
  return create({
    userId: toUserId,
    type: 'friend_accepted',
    title: 'Friend request accepted',
    content: `${fromUser.full_name} accepted your friend request`,
    referenceType: 'user',
    referenceId: fromUser.id,
    senderId: fromUser.id
  });
};

const notifyNewMessage = async (toUserId, fromUser, chatId) => {
  return create({
    userId: toUserId,
    type: 'new_message',
    title: 'New message',
    content: `${fromUser.full_name} sent you a message`,
    referenceType: 'chat',
    referenceId: chatId,
    senderId: fromUser.id
  });
};

const notifyPostLike = async (toUserId, fromUser, postId) => {
  return create({
    userId: toUserId,
    type: 'post_like',
    title: 'Post liked',
    content: `${fromUser.full_name} liked your post`,
    referenceType: 'post',
    referenceId: postId,
    senderId: fromUser.id
  });
};

const notifyPostComment = async (toUserId, fromUser, postId) => {
  return create({
    userId: toUserId,
    type: 'post_comment',
    title: 'New comment',
    content: `${fromUser.full_name} commented on your post`,
    referenceType: 'post',
    referenceId: postId,
    senderId: fromUser.id
  });
};

const notifyQuestionAnswer = async (toUserId, fromUser, questionId) => {
  return create({
    userId: toUserId,
    type: 'question_answer',
    title: 'New answer',
    content: `${fromUser.full_name} answered your question`,
    referenceType: 'question',
    referenceId: questionId,
    senderId: fromUser.id
  });
};

const notifyBestAnswer = async (toUserId, fromUser, questionId) => {
  return create({
    userId: toUserId,
    type: 'best_answer',
    title: 'Best answer!',
    content: `${fromUser.full_name} marked your answer as best`,
    referenceType: 'question',
    referenceId: questionId,
    senderId: fromUser.id
  });
};

const notifyStudyInvitation = async (toUserId, fromUser, invitationId) => {
  return create({
    userId: toUserId,
    type: 'study_invitation',
    title: 'Study invitation',
    content: `${fromUser.full_name} invited you to study together`,
    referenceType: 'invitation',
    referenceId: invitationId,
    senderId: fromUser.id
  });
};

export {
  create, getNotifications, markAsRead, markAllAsRead, deleteNotification,
  // Helpers
  notifyFriendRequest, notifyFriendAccepted, notifyNewMessage,
  notifyPostLike, notifyPostComment, notifyQuestionAnswer, notifyBestAnswer, notifyStudyInvitation
};
