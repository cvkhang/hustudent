const { User } = require('../models');
const { AppError, ErrorCodes } = require('../utils/errors');

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user || user.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
  const user = await User.findByPk(userId);

  if (!user || user.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'User not found');
  }

  // Allowed fields to update
  const ALLOWED_FIELDS = [
    'full_name', 'avatar_url', 'major', 'academic_year',
    'allow_message_from', 'profile_visibility',
    'university', 'interests', 'goals', 'bio'
  ];

  // Filter updates to only allowed fields
  const filteredUpdates = {};
  for (const field of ALLOWED_FIELDS) {
    // Convert camelCase to snake_case for frontend compatibility
    const camelField = field.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    } else if (updates[camelField] !== undefined) {
      filteredUpdates[field] = updates[camelField];
    }
  }

  // VALIDATION: Ensure Major and Academic Year are valid
  const { MAJORS, ACADEMIC_YEARS } = require('../config/constants');

  if (filteredUpdates.major && !MAJORS.includes(filteredUpdates.major)) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, `Ngành học không hợp lệ. Phải thuộc: ${MAJORS.join(', ')}`);
  }

  if (filteredUpdates.academic_year && !ACADEMIC_YEARS.includes(filteredUpdates.academic_year)) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, `Niên khóa không hợp lệ. Phải thuộc: ${ACADEMIC_YEARS.join(', ')}`);
  }

  await user.update(filteredUpdates);

  return user;
};

/**
 * Search users (for discovery)
 */
const searchUsers = async ({ q, major, academicYear, page = 1, limit = 20 }) => {
  const { Op } = require('sequelize');

  const where = {
    deleted_at: null
  };

  if (q) {
    where[Op.or] = [
      { full_name: { [Op.iLike]: `%${q}%` } },
      { email: { [Op.iLike]: `%${q}%` } }
    ];
  }

  if (major) {
    where.major = major;
  }

  if (academicYear) {
    where.academic_year = academicYear;
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
    attributes: ['id', 'full_name', 'avatar_url', 'university', 'major', 'academic_year']
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
 * Get profile stats
 */
const getProfileStats = async (userId) => {
  const { FlashcardProgress, QuizAttempt, GroupMember, Post, Question, Answer } = require('../models');
  const { Op } = require('sequelize');

  // Parallelize counts for better performance
  const [flashcardCount, quizCount, groupCount, postsCount, questionsCount, answersCount] = await Promise.all([
    // Count distinct flashcards reviewed
    FlashcardProgress.count({ where: { user_id: userId } }),
    // Count finished quizzes
    QuizAttempt.count({ where: { user_id: userId, completed_at: { [Op.ne]: null } } }),
    // Count groups joined
    GroupMember.count({ where: { user_id: userId } }),
    // Count posts uploaded (tài liệu đã chia sẻ)
    Post.count({ where: { author_id: userId } }),
    // Count questions asked (câu hỏi đã hỏi)
    Question.count({ where: { author_id: userId } }),
    // Count answers given (câu trả lời đóng góp)
    Answer.count({ where: { author_id: userId } })
  ]);

  return {
    flashcards_learned: flashcardCount,
    quizzes_completed: quizCount,
    groups_joined: groupCount,
    posts_uploaded: postsCount,
    questions_asked: questionsCount,
    answers_count: answersCount
  };
};

/**
 * Get recent activity
 */
const getRecentActivity = async (userId) => {
  const { QuizAttempt, GroupMember, FlashcardSet, User } = require('../models');

  const activities = [];

  // Get recent quiz attempts
  const recentQuizzes = await QuizAttempt.findAll({
    where: { user_id: userId, completed_at: { [require('sequelize').Op.ne]: null } },
    include: ['quiz'],
    limit: 3,
    order: [['completed_at', 'DESC']]
  });

  recentQuizzes.forEach(q => {
    activities.push({
      type: 'quiz',
      action: 'Hoàn thành quiz',
      subject: q.quiz.title,
      time: q.completed_at,
      icon: 'Trophy',
      color: 'green'
    });
  });

  // Get recent groups joined
  const recentGroups = await GroupMember.findAll({
    where: { user_id: userId },
    include: ['group'],
    limit: 3,
    order: [['joined_at', 'DESC']]
  });

  recentGroups.forEach(g => {
    activities.push({
      type: 'group',
      action: 'Tham gia nhóm',
      subject: g.group.name,
      time: g.joined_at,
      icon: 'Users',
      color: 'orange'
    });
  });

  // Get created flashcard sets
  const recentSets = await FlashcardSet.findAll({
    where: { owner_id: userId },
    limit: 3,
    order: [['created_at', 'DESC']]
  });

  recentSets.forEach(s => {
    activities.push({
      type: 'flashcard',
      action: 'Tạo bộ flashcard',
      subject: s.title,
      time: s.created_at,
      icon: 'Zap',
      color: 'blue'
    });
  });

  // Sort by time and take top 5
  return activities
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);
};

/**
 * Block a user
 */
const blockUser = async (currentUserId, targetUserId) => {
  const { Friendship } = require('../models');
  const { Op } = require('sequelize');

  if (currentUserId === targetUserId) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Cannot block yourself');
  }

  // Find existing friendship or create new block record
  const { userLow, userHigh } = Friendship.getOrderedIds(currentUserId, targetUserId);

  let friendship = await Friendship.findOne({
    where: { user_low: userLow, user_high: userHigh }
  });

  if (friendship) {
    friendship.status = 'blocked';
    friendship.action_user_id = currentUserId;
    await friendship.save();
  } else {
    friendship = await Friendship.create({
      user_low: userLow,
      user_high: userHigh,
      status: 'blocked',
      action_user_id: currentUserId
    });
  }

  return friendship;
};

/**
 * Unblock a user
 */
const unblockUser = async (currentUserId, targetUserId) => {
  const { Friendship } = require('../models');

  const { userLow, userHigh } = Friendship.getOrderedIds(currentUserId, targetUserId);

  const friendship = await Friendship.findOne({
    where: {
      user_low: userLow,
      user_high: userHigh,
      status: 'blocked'
    }
  });

  if (!friendship) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Block record not found');
  }

  // Only the blocker can unblock
  if (friendship.action_user_id !== currentUserId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'You cannot unblock this user');
  }

  // Delete the friendship/block record entirely, or set to some other state?
  // Usually unblocking means no relation exists anymore (unless we revert to 'friend', but that's weird).
  // Let's destroy it. They can add friend again.
  await friendship.destroy();

  return { message: 'Unblocked successfully' };
};

module.exports = {
  getUserById,
  updateProfile,
  searchUsers,
  getProfileStats,
  getRecentActivity,
  blockUser,
  unblockUser
};
