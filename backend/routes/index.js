import express from 'express';
// Import route modules when created
// import authRoutes from './auth.routes.js';
// import userRoutes from './user.routes.js';
// import postRoutes from './post.routes.js';

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
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/posts', postRoutes);

// Default API info
router.get('/', (req, res) => {
  res.json({
    message: 'HUSTUDENT API',
    version: '1.0.0',
    docs: '/api-docs'
  });
});

export default router;
