import * as notificationService from '../services/notificationService.js';

const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(req.userId, req.query);
    res.json({ data: result });
  } catch (e) { next(e); }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.userId, req.params.notificationId);
    res.json({ data: notification });
  } catch (e) { next(e); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.userId);
    res.json({ data: result });
  } catch (e) { next(e); }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(req.userId, req.params.notificationId);
    res.json({ data: result });
  } catch (e) { next(e); }
};

export { getNotifications, markAsRead, markAllAsRead, deleteNotification };
