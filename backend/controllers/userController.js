const userService = require('../services/userService');

/**
 * GET /me
 */
/**
 * GET /me
 */
const getProfile = async (req, res, next) => {
  try {
    const [stats, activities] = await Promise.all([
      userService.getProfileStats(req.userId),
      userService.getRecentActivity(req.userId)
    ]);

    res.json({
      data: {
        ...req.user.toJSON(),
        stats,
        recent_activity: activities
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /me
 */
const updateProfile = async (req, res, next) => {
  try {
    const updatedUser = await userService.updateProfile(req.userId, req.body);

    res.json({ data: updatedUser.toJSON() });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users
 */
const searchUsers = async (req, res, next) => {
  try {
    const { q, major, academicYear, page, limit } = req.query;

    const result = await userService.searchUsers({
      q,
      major,
      academicYear,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({ data: result.users, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /users/:id
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);

    res.json({ data: user.toJSON() });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /users/:id/block
 */
const blockUser = async (req, res, next) => {
  try {
    await userService.blockUser(req.userId, req.params.id);
    res.json({ message: 'Blocked successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /users/:id/block (Unblock)
 */
const unblockUser = async (req, res, next) => {
  try {
    await userService.unblockUser(req.userId, req.params.id);
    res.json({ message: 'Unblocked successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  searchUsers,
  getUserById,
  blockUser,
  unblockUser
};
