const { Op } = require('sequelize');
const { User, FriendRequest, Friendship, sequelize } = require('../models');
const { AppError, ErrorCodes } = require('../utils/errors');
const { getIO } = require('../socket/socketManager');

/**
 * Send friend request
 */
const sendFriendRequest = async (fromUserId, toUserId) => {
  // Can't send request to self
  if (fromUserId === toUserId) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Cannot send friend request to yourself');
  }

  // Check if target user exists
  const toUser = await User.findByPk(toUserId);
  if (!toUser || toUser.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'User not found');
  }

  // Check existing friendship
  const { userLow, userHigh } = Friendship.getOrderedIds(fromUserId, toUserId);
  const existingFriendship = await Friendship.findOne({
    where: { user_low: userLow, user_high: userHigh }
  });

  if (existingFriendship) {
    if (existingFriendship.status === 'blocked') {
      throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot send friend request');
    }
    if (existingFriendship.status === 'accepted') {
      throw new AppError(ErrorCodes.CONFLICT, 'Already friends');
    }
  }

  // Check existing pending request (either direction)
  const existingRequest = await FriendRequest.findOne({
    where: {
      [Op.or]: [
        { from_user_id: fromUserId, to_user_id: toUserId },
        { from_user_id: toUserId, to_user_id: fromUserId }
      ]
    }
  });

  if (existingRequest) {
    if (existingRequest.from_user_id === fromUserId) {
      throw new AppError(ErrorCodes.CONFLICT, 'Friend request already sent');
    } else {
      throw new AppError(ErrorCodes.CONFLICT, 'This user already sent you a friend request');
    }
  }

  // Create friend request
  const request = await FriendRequest.create({
    from_user_id: fromUserId,
    to_user_id: toUserId
  });

  // Reload with user info
  const fullRequest = await FriendRequest.findByPk(request.id, {
    include: [
      { model: User, as: 'fromUser', attributes: ['id', 'full_name', 'avatar_url', 'university', 'major'] }
    ]
  });

  // Socket: Notify recipient
  try {
    getIO().to(toUserId).emit('new_friend_request', fullRequest);
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }

  return fullRequest;
};

/**
 * Get friend requests (incoming or outgoing)
 */
const getFriendRequests = async (userId, type = 'incoming') => {
  const where = type === 'incoming'
    ? { to_user_id: userId }
    : { from_user_id: userId };

  const include = type === 'incoming'
    ? { model: User, as: 'fromUser', attributes: ['id', 'full_name', 'avatar_url', 'university', 'major'] }
    : { model: User, as: 'toUser', attributes: ['id', 'full_name', 'avatar_url', 'university', 'major'] };

  const requests = await FriendRequest.findAll({
    where,
    include: [include],
    order: [['created_at', 'DESC']]
  });

  return requests;
};

/**
 * Accept friend request
 */
const acceptFriendRequest = async (userId, requestId) => {
  const request = await FriendRequest.findByPk(requestId);

  if (!request) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Friend request not found');
  }

  // Only recipient can accept
  if (request.to_user_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot accept this request');
  }

  // Create friendship and delete request in transaction
  const { userLow, userHigh } = Friendship.getOrderedIds(request.from_user_id, request.to_user_id);

  await sequelize.transaction(async (t) => {
    // Create friendship
    await Friendship.create({
      user_low: userLow,
      user_high: userHigh,
      status: 'accepted',
      action_user_id: userId
    }, { transaction: t });

    // Delete request
    await request.destroy({ transaction: t });
  });

  // Socket: Notify sender that their request was accepted
  try {
    const acceptor = await User.findByPk(userId, { attributes: ['id', 'full_name', 'avatar_url'] });
    getIO().to(request.from_user_id).emit('friend_request_accepted', acceptor);
  } catch (err) {
    console.error('Socket emit error:', err.message);
  }

  return { message: 'Friend request accepted' };
};

/**
 * Reject friend request
 */
const rejectFriendRequest = async (userId, requestId) => {
  const request = await FriendRequest.findByPk(requestId);

  if (!request) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Friend request not found');
  }

  // Only recipient can reject
  if (request.to_user_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot reject this request');
  }

  await request.destroy();

  return { message: 'Friend request rejected' };
};

/**
 * Cancel outgoing friend request
 */
const cancelFriendRequest = async (userId, requestId) => {
  const request = await FriendRequest.findByPk(requestId);

  if (!request) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Friend request not found');
  }

  // Only sender can cancel
  if (request.from_user_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot cancel this request');
  }

  await request.destroy();

  return { message: 'Friend request cancelled' };
};

/**
 * Get list of friends
 */
const getFriends = async (userId, { q, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;

  // Find all accepted friendships involving this user
  const friendships = await Friendship.findAll({
    where: {
      [Op.or]: [
        { user_low: userId },
        { user_high: userId }
      ],
      status: 'accepted'
    }
  });

  // Extract friend IDs
  const friendIds = friendships.map(f =>
    f.user_low === userId ? f.user_high : f.user_low
  );

  if (friendIds.length === 0) {
    return { users: [], meta: { page, limit, total: 0, totalPages: 0 } };
  }

  // Build user query
  const whereClause = {
    id: { [Op.in]: friendIds },
    deleted_at: null
  };

  if (q) {
    whereClause.full_name = { [Op.iLike]: `%${q}%` };
  }

  const { rows, count } = await User.findAndCountAll({
    where: whereClause,
    attributes: ['id', 'full_name', 'avatar_url', 'university', 'major', 'academic_year'],
    limit,
    offset,
    order: [['full_name', 'ASC']]
  });

  return {
    users: rows,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Unfriend a user
 */
const unfriend = async (userId, friendUserId) => {
  const { userLow, userHigh } = Friendship.getOrderedIds(userId, friendUserId);

  const friendship = await Friendship.findOne({
    where: {
      user_low: userLow,
      user_high: userHigh,
      status: 'accepted'
    }
  });

  if (!friendship) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Friendship not found');
  }

  await friendship.destroy();

  return { message: 'Unfriended successfully' };
};

/**
 * Block a user
 */
const blockUser = async (userId, targetUserId) => {
  if (userId === targetUserId) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Cannot block yourself');
  }

  const { userLow, userHigh } = Friendship.getOrderedIds(userId, targetUserId);

  await sequelize.transaction(async (t) => {
    // Delete any pending friend requests
    await FriendRequest.destroy({
      where: {
        [Op.or]: [
          { from_user_id: userId, to_user_id: targetUserId },
          { from_user_id: targetUserId, to_user_id: userId }
        ]
      },
      transaction: t
    });

    // Create or update friendship to blocked
    const [friendship, created] = await Friendship.findOrCreate({
      where: { user_low: userLow, user_high: userHigh },
      defaults: {
        user_low: userLow,
        user_high: userHigh,
        status: 'blocked',
        action_user_id: userId
      },
      transaction: t
    });

    if (!created) {
      await friendship.update({
        status: 'blocked',
        action_user_id: userId
      }, { transaction: t });
    }
  });

  return { message: 'User blocked' };
};

/**
 * Unblock a user
 */
const unblockUser = async (userId, targetUserId) => {
  const { userLow, userHigh } = Friendship.getOrderedIds(userId, targetUserId);

  const friendship = await Friendship.findOne({
    where: {
      user_low: userLow,
      user_high: userHigh,
      status: 'blocked'
    }
  });

  if (!friendship) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Block not found');
  }

  // Only the blocker can unblock
  if (friendship.action_user_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Cannot unblock');
  }

  await friendship.destroy();

  return { message: 'User unblocked' };
};

/**
 * Get friendship status between two users
 */
const getFriendshipStatus = async (userId, otherUserId) => {
  if (userId === otherUserId) {
    return 'self';
  }

  // Check pending request
  const pendingRequest = await FriendRequest.findOne({
    where: {
      [Op.or]: [
        { from_user_id: userId, to_user_id: otherUserId },
        { from_user_id: otherUserId, to_user_id: userId }
      ]
    }
  });

  if (pendingRequest) {
    return pendingRequest.from_user_id === userId ? 'pending_sent' : 'pending_received';
  }

  // Check friendship
  const { userLow, userHigh } = Friendship.getOrderedIds(userId, otherUserId);
  const friendship = await Friendship.findOne({
    where: { user_low: userLow, user_high: userHigh }
  });

  if (!friendship) {
    return 'none';
  }

  return friendship.status; // 'accepted' or 'blocked'
};

/**
 * Get blocked users list
 */
const getBlockedUsers = async (userId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;

  // Find all blocked friendships where action_user_id is the current user
  const blockedFriendships = await Friendship.findAll({
    where: {
      action_user_id: userId,
      status: 'blocked'
    }
  });

  const blockedUserIds = blockedFriendships.map(f =>
    f.user_low === userId ? f.user_high : f.user_low
  );

  if (blockedUserIds.length === 0) {
    return { users: [], meta: { page, limit, total: 0, totalPages: 0 } };
  }

  const { rows, count } = await User.findAndCountAll({
    where: {
      id: { [Op.in]: blockedUserIds },
      deleted_at: null
    },
    attributes: ['id', 'full_name', 'avatar_url', 'major'],
    limit,
    offset
  });

  return {
    users: rows,
    meta: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: count,
      totalPages: Math.ceil(count / limit)
    }
  };
};

/**
 * Get friend suggestions
 */
const getSuggestions = async (userId, { limit = 10 } = {}) => {
  const user = await User.findByPk(userId);
  if (!user) return [];

  // Exclude current friends, blocked users, and pending requests
  const [friendships, requests] = await Promise.all([
    Friendship.findAll({
      where: { [Op.or]: [{ user_low: userId }, { user_high: userId }] }
    }),
    FriendRequest.findAll({
      where: { [Op.or]: [{ from_user_id: userId }, { to_user_id: userId }] }
    })
  ]);

  const excludeIds = new Set([userId]);
  friendships.forEach(f => excludeIds.add(f.user_low === userId ? f.user_high : f.user_low));
  requests.forEach(r => excludeIds.add(r.from_user_id === userId ? r.to_user_id : r.from_user_id));

  // Find candidates: Same Major OR Same University
  const suggestions = await User.findAll({
    where: {
      id: { [Op.notIn]: Array.from(excludeIds) },
      deleted_at: null,
      [Op.or]: [
        { major: user.major }
      ]
    },
    limit,
    order: sequelize.random() // Randomize to show different people
  });

  return suggestions;
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
  getFriendshipStatus,
  getSuggestions
};
