import { User, Group, StudySession, Quiz } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Get dashboard statistics for admin
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalGroups = await Group.count();
    const totalSessions = await StudySession.count();
    const totalQuizzes = await Quiz.count();

    // Get recent users
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'full_name', 'email', 'role', 'created_at']
    });

    res.status(200).json({
      success: true,
      data: {
        counts: {
          users: totalUsers,
          groups: totalGroups,
          sessions: totalSessions,
          quizzes: totalQuizzes
        },
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get all users with pagination and filtering
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, role } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role) {
      where.role = role;
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']],
      attributes: { exclude: ['password_hash'] }
    });

    res.status(200).json({
      success: true,
      data: {
        users: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Update user role (Admin only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role updated to ${role}`,
      data: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get single user by ID (Admin only)
 */
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const adminId = req.user.id;

    // Prevent self-deletion
    if (parseInt(userId) === adminId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Soft delete - set deleted_at timestamp
    user.deleted_at = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Ban or Unban user (Admin only)
 */
export const toggleBanUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ban, reason } = req.body;
    const adminId = req.user.id;

    // Prevent self-ban
    if (parseInt(userId) === adminId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot ban your own account'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (ban) {
      user.is_banned = true;
      user.banned_at = new Date();
      user.ban_reason = reason || 'Violated community guidelines';
    } else {
      user.is_banned = false;
      user.banned_at = null;
      user.ban_reason = null;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: ban ? 'User banned successfully' : 'User unbanned successfully',
      data: {
        id: user.id,
        email: user.email,
        is_banned: user.is_banned
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
