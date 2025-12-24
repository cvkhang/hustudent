const friendService = require('../services/friendService');
const { AppError, ErrorCodes } = require('../utils/errors');

/**
 * POST /friends/requests
 */
const sendFriendRequest = async (req, res, next) => {
  try {
    const { toUserId } = req.body;

    if (!toUserId) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'toUserId is required');
    }

    const request = await friendService.sendFriendRequest(req.userId, toUserId);

    res.status(201).json({ data: request });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /friends/requests
 */
const getFriendRequests = async (req, res, next) => {
  try {
    const { type = 'incoming' } = req.query;

    if (!['incoming', 'outgoing'].includes(type)) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'type must be incoming or outgoing');
    }

    const requests = await friendService.getFriendRequests(req.userId, type);

    res.json({ data: requests });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /friends/requests/:requestId/accept
 */
const acceptFriendRequest = async (req, res, next) => {
  try {
    const result = await friendService.acceptFriendRequest(req.userId, req.params.requestId);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /friends/requests/:requestId/reject
 */
const rejectFriendRequest = async (req, res, next) => {
  try {
    const result = await friendService.rejectFriendRequest(req.userId, req.params.requestId);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /friends/requests/:requestId
 */
const cancelFriendRequest = async (req, res, next) => {
  try {
    const result = await friendService.cancelFriendRequest(req.userId, req.params.requestId);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /friends
 */
const getFriends = async (req, res, next) => {
  try {
    const { q, page, limit } = req.query;

    const result = await friendService.getFriends(req.userId, {
      q,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({ data: result.users, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /friends/:userId
 */
const unfriend = async (req, res, next) => {
  try {
    const result = await friendService.unfriend(req.userId, req.params.userId);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /friends/:userId/block
 */
const blockUser = async (req, res, next) => {
  try {
    const result = await friendService.blockUser(req.userId, req.params.userId);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /friends/:userId/unblock
 */
const unblockUser = async (req, res, next) => {
  try {
    const result = await friendService.unblockUser(req.userId, req.params.userId);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /friends/blocked
 */
const getBlockedUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await friendService.getBlockedUsers(req.userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20
    });

    res.json({ data: result.users, meta: result.meta });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /friends/suggestions
 */
const getSuggestions = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const suggestions = await friendService.getSuggestions(req.userId, {
      limit: parseInt(limit) || 10
    });
    res.json({ data: suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriends,
  unfriend,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getSuggestions
};
