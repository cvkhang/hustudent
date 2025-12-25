import express from 'express';
import * as notificationController from '../controllers/notificationController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/notifications', notificationController.getNotifications);
router.post('/notifications/:notificationId/read', notificationController.markAsRead);
router.post('/notifications/read-all', notificationController.markAllAsRead);
router.delete('/notifications/:notificationId', notificationController.deleteNotification);

export default router;
