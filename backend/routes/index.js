import express from 'express';
import groupRoutes from './groupRoutes.js';
import chatRoutes from './chatRoutes.js';
import quizRoutes from './quizRoutes.js';
import matchingRoutes from './matchingRoutes.js';
import flashcardRoutes from './flashcardRoutes.js';
import uploadRoutes from './uploadRoutes.js';

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
router.use('/groups', groupRoutes);
router.use('/chats', chatRoutes);
router.use('/', quizRoutes);
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
