import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import friendRoutes from './friendRoutes.js';
import groupRoutes from './groupRoutes.js';
import chatRoutes from './chatRoutes.js';
import quizRoutes from './quizRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import flashcardRoutes from './flashcardRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import postRoutes from './postRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import sessionRoutes from './sessionRoutes.js';
import questionRoutes from './questionRoutes.js';
import answerRoutes from './answerRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/', userRoutes); // Contains /me, /users
router.use('/friends', friendRoutes);
router.use('/questions', questionRoutes);
router.use('/answers', answerRoutes);
router.use('/groups', groupRoutes);
router.use('/chats', chatRoutes);
router.use('/posts', postRoutes);
router.use('/sessions', sessionRoutes);
router.use('/', notificationRoutes);
router.use('/', quizRoutes); // Check if this should be /quizzes
router.use('/', matchingRoutes);
router.use('/', flashcardRoutes);
router.use('/', uploadRoutes);

// Default API info
router.get('/', (req, res) => {
  res.json({
    message: 'HUSTUDENT API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

export default router;
