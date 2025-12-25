import friendService from '../services/friendService.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

/**
 * POST /friends/requests
 */
export const sendFriendRequest = async (req, res, next) => {
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
export const getFriendRequests = async (req, res, next) => {
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
export const acceptFriendRequest = async (req, res, next) => {
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
export const rejectFriendRequest = async (req, res, next) => {
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
export const cancelFriendRequest = async (req, res, next) => {
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
export const getFriends = async (req, res, next) => {
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
export const unfriend = async (req, res, next) => {
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
export const blockUser = async (req, res, next) => {
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
export const unblockUser = async (req, res, next) => {
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
export const getBlockedUsers = async (req, res, next) => {
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
export const getSuggestions = async (req, res, next) => {
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

export default {
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
