import express from 'express';
import { getDashboardStats, getAllUsers, updateUserRole } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate);
// Apply admin authorization to all admin routes
router.use(authorize('admin'));

/**
 * @route GET /api/admin/stats
 * @desc Get system-wide statistics
 * @access Admin
 */
router.get('/stats', getDashboardStats);

/**
 * @route GET /api/admin/users
 * @desc Get all users with filtering
 * @access Admin
 */
router.get('/users', getAllUsers);

/**
 * @route PUT /api/admin/users/:userId/role
 * @desc Update user role
 * @access Admin
 */
router.put('/users/:userId/role', updateUserRole);

export default router;
