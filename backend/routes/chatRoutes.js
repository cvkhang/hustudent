
import express from 'express';
import chatController from '../controllers/chatController.js';
import { authenticate } from '../middleware/auth.js';
import { uploadChatAttachments } from '../middleware/upload.js';

const router = express.Router();

// All chat routes require authentication
router.use(authenticate);

// Chats
router.get('/', chatController.getChats);
router.post('/', chatController.createChat);

// Messages
router.get('/:chatId/messages', chatController.getMessages);
router.post('/:chatId/messages', uploadChatAttachments, chatController.sendMessage);
router.post('/:chatId/read', chatController.markChatAsRead);

// Group Chat
router.get('/group/:groupId', chatController.getGroupChat);

export default router;
