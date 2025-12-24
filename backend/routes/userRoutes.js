const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// GET /api/me - Get current user profile (protected)
router.get('/me', authenticate, userController.getProfile);

// PATCH /api/me - Update current user profile (protected)
router.patch('/me', authenticate, userController.updateProfile);

// GET /api/users - Search users (protected)
router.get('/users', authenticate, userController.searchUsers);

// GET /api/users/:id - Get user by ID (protected)
router.get('/users/:id', authenticate, userController.getUserById);

// Block/Unblock
router.post('/users/:id/block', authenticate, userController.blockUser);
router.delete('/users/:id/block', authenticate, userController.unblockUser);

module.exports = router;
