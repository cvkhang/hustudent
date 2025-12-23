import { Op, literal } from 'sequelize';
import { User, Subject, UserStudyProfile, UserSubject, StudyInvitation, StudyBuddy, Friendship, FriendRequest, Group, GroupMember, sequelize } from '../models/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

// ==========================================
// SUBJECT CATALOG
// ==========================================
export const getAllSubjects = async ({ q, department } = {}) => {
  const where = {};
  if (q) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${q}%` } },
      { code: { [Op.iLike]: `%${q}%` } }
    ];
  }
  if (department) where.department = department;

  return Subject.findAll({ where, order: [['code', 'ASC']], limit: 50 });
};

export const getSubjectByCode = async (code) => {
  const subject = await Subject.findByPk(code);
  if (!subject) throw new AppError(ErrorCodes.NOT_FOUND, 'Subject not found');
  return subject;
};

// ==========================================
// STUDY PROFILE
// ==========================================
export const getStudyProfile = async (userId) => {
  let profile = await UserStudyProfile.findByPk(userId, {
    include: [{ model: Subject, as: 'currentSubject', attributes: ['code', 'name'] }]
  });

  if (!profile) {
    profile = await UserStudyProfile.create({ user_id: userId });
  }

  return profile;
};

export const updateStudyProfile = async (userId, updates) => {
  let profile = await UserStudyProfile.findByPk(userId);

  if (!profile) {
    profile = await UserStudyProfile.create({ user_id: userId, ...updates });
  } else {
    await profile.update(updates);
  }

  return getStudyProfile(userId);
};

export const updateLearningStatus = async (userId, { status, subjectCode }) => {
  const profile = await getStudyProfile(userId);
  await profile.update({
    learning_status: status,
    learning_status_subject: subjectCode || null,
    learning_status_updated_at: new Date(),
    last_active_at: new Date()
  });
  return profile;
};

// ==========================================
// USER SUBJECTS
// ==========================================
export const getUserSubjects = async (userId) => {
  return UserSubject.findAll({
    where: { user_id: userId },
    include: [{ model: Subject, as: 'subject' }],
    order: [['created_at', 'DESC']]
  });
};

export const addUserSubject = async (userId, { subjectCode, level, goals, canHelp, needsHelp, semester }) => {
  // Verify subject exists
  const subject = await Subject.findByPk(subjectCode);
  if (!subject) throw new AppError(ErrorCodes.NOT_FOUND, 'Subject not found');

  const [userSubject, created] = await UserSubject.findOrCreate({
    where: { user_id: userId, subject_code: subjectCode },
    defaults: { user_id: userId, subject_code: subjectCode, level, goals: goals || [], can_help: canHelp || false, needs_help: needsHelp || false, semester }
  });

  if (!created) {
    await userSubject.update({ level, goals: goals || userSubject.goals, can_help: canHelp ?? userSubject.can_help, needs_help: needsHelp ?? userSubject.needs_help, semester: semester || userSubject.semester });
  }

  return UserSubject.findOne({
    where: { user_id: userId, subject_code: subjectCode },
    include: [{ model: Subject, as: 'subject' }]
  });
};

export const updateUserSubject = async (userId, subjectCode, updates) => {
  const userSubject = await UserSubject.findOne({ where: { user_id: userId, subject_code: subjectCode } });
  if (!userSubject) throw new AppError(ErrorCodes.NOT_FOUND, 'Subject not in your list');

  await userSubject.update(updates);
  return UserSubject.findOne({
    where: { user_id: userId, subject_code: subjectCode },
    include: [{ model: Subject, as: 'subject' }]
  });
};

export const removeUserSubject = async (userId, subjectCode) => {
  const result = await UserSubject.destroy({ where: { user_id: userId, subject_code: subjectCode } });
  if (result === 0) throw new AppError(ErrorCodes.NOT_FOUND, 'Subject not in your list');
  return { message: 'Subject removed' };
};

// ==========================================
// FRIEND SUGGESTIONS (Smart Matching)
// ==========================================
export const getFriendSuggestions = async (userId, { limit = 20 } = {}) => {
  // Get user's subjects
  const mySubjects = await UserSubject.findAll({ where: { user_id: userId }, attributes: ['subject_code', 'level', 'goals', 'can_help', 'needs_help'] });
  const mySubjectCodes = mySubjects.map(s => s.subject_code);

  if (mySubjectCodes.length === 0) {
    return []; // No subjects = no suggestions
  }

  // Get user's study profile
  const myProfile = await UserStudyProfile.findByPk(userId);

  // Get existing friends and pending requests to exclude
  const { userLow: _, userHigh: __ } = Friendship.getOrderedIds ? Friendship.getOrderedIds(userId, userId) : { userLow: userId, userHigh: userId };
  const friendships = await Friendship.findAll({ where: { [Op.or]: [{ user_low: userId }, { user_high: userId }] } });
  const friendIds = friendships.map(f => f.user_low === userId ? f.user_high : f.user_low);

  const pendingRequests = await FriendRequest.findAll({ where: { [Op.or]: [{ from_user_id: userId }, { to_user_id: userId }] } });
  const pendingIds = pendingRequests.map(r => r.from_user_id === userId ? r.to_user_id : r.from_user_id);

  const excludeIds = [...new Set([userId, ...friendIds, ...pendingIds])];

  // Find users with same subjects
  const matchingUserSubjects = await UserSubject.findAll({
    where: { subject_code: { [Op.in]: mySubjectCodes }, user_id: { [Op.notIn]: excludeIds } },
    include: [
      { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url', 'university', 'major'] },
      { model: Subject, as: 'subject', attributes: ['code', 'name'] }
    ]
  });

  // Group by user and calculate scores
  const userScores = {};

  for (const us of matchingUserSubjects) {
    const uid = us.user_id;
    if (!userScores[uid]) {
      userScores[uid] = { user: us.user, score: 0, commonSubjects: [], badges: [] };
    }

    userScores[uid].commonSubjects.push(us.subject);
    userScores[uid].score += 5; // Same subject

    const mySubject = mySubjects.find(s => s.subject_code === us.subject_code);
    if (mySubject) {
      // 1. Me helps Them
      if (mySubject.can_help && us.needs_help) {
        userScores[uid].score += 15;
        userScores[uid].badges.push({ type: 'help_them', text: `Cần bạn giúp ${us.subject.name}` });
      }

      // 2. Them helps Me
      else if (mySubject.needs_help && us.can_help) {
        userScores[uid].score += 15;
        userScores[uid].badges.push({ type: 'help_me', text: `Có thể giúp bạn ${us.subject.name}` });
      }

      // 3. Both need help (Study Buddy)
      else if (mySubject.needs_help && us.needs_help) {
        userScores[uid].score += 10;
        userScores[uid].badges.push({ type: 'both_need', text: `Cùng ôn thi ${us.subject.name}` });
      }

      // 4. Same Level
      else {
        userScores[uid].score += 5;
        if (mySubject.level === us.level) {
          userScores[uid].badges.push({ type: 'same_level', text: `Cùng trình độ ${us.subject.name}` });
        }
      }
    }
  }

  // Add profile-based scoring
  if (myProfile) {
    for (const uid of Object.keys(userScores)) {
      const theirProfile = await UserStudyProfile.findByPk(uid);
      if (theirProfile) {
        if (myProfile.campus && myProfile.campus === theirProfile.campus) {
          userScores[uid].score += 5;
          userScores[uid].badges.push({ type: 'same_campus', text: 'Cùng trường/Cơ sở' });
        }
        // Check study mode overlap
        const myModes = myProfile.study_modes || [];
        const theirModes = theirProfile.study_modes || [];
        if (myModes.some(m => theirModes.includes(m))) {
          userScores[uid].score += 1;
        }
      }
    }
  }

  // Sort by score and return top suggestions
  const suggestions = Object.values(userScores)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => ({
      user: s.user,
      commonSubjects: s.commonSubjects,
      badges: s.badges.slice(0, 3),
      compatibilityScore: s.score
    }));

  return suggestions;
};

// ==========================================
// RECOMMENDED GROUPS
// ==========================================
export const getRecommendedGroups = async (userId, { limit = 10 } = {}) => {
  const mySubjects = await UserSubject.findAll({ where: { user_id: userId }, attributes: ['subject_code'] });
  const mySubjectCodes = mySubjects.map(s => s.subject_code);

  // Get groups user is not in
  const myMemberships = await GroupMember.findAll({ where: { user_id: userId }, attributes: ['group_id'] });
  const myGroupIds = myMemberships.map(m => m.group_id);

  const where = {
    deleted_at: null,
    visibility: 'public'
  };

  if (myGroupIds.length > 0) {
    where.id = { [Op.notIn]: myGroupIds };
  }

  if (mySubjectCodes.length > 0) {
    where.subject_tag = { [Op.in]: mySubjectCodes };
  }

  const groups = await Group.findAll({
    where,
    include: [{ model: User, as: 'owner', attributes: ['id', 'full_name'] }],
    limit,
    order: [['created_at', 'DESC']]
  });

  // Add member count
  const result = await Promise.all(groups.map(async (g) => {
    const memberCount = await GroupMember.count({ where: { group_id: g.id, status: 'active' } });
    return { ...g.toJSON(), memberCount, reason: `Matches your subject: ${g.subject_tag}` };
  }));

  return result;
};

// ==========================================
// STUDY INVITATIONS
// ==========================================
export const sendStudyInvitation = async (userId, { toUserId, type, targetId, subjectCode, message }) => {
  if (userId === toUserId) throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Cannot invite yourself');

  // Check target user exists
  const toUser = await User.findByPk(toUserId);
  if (!toUser) throw new AppError(ErrorCodes.NOT_FOUND, 'User not found');

  // Check for existing pending invitation
  const existing = await StudyInvitation.findOne({
    where: { from_user_id: userId, to_user_id: toUserId, status: 'pending' }
  });
  if (existing) throw new AppError(ErrorCodes.CONFLICT, 'Already sent invitation to this user');

  const invitation = await StudyInvitation.create({
    from_user_id: userId,
    to_user_id: toUserId,
    type,
    target_id: targetId,
    subject_code: subjectCode,
    message,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  return StudyInvitation.findByPk(invitation.id, {
    include: [
      { model: User, as: 'toUser', attributes: ['id', 'full_name', 'avatar_url'] },
      { model: Subject, as: 'subject' }
    ]
  });
};

export const getStudyInvitations = async (userId, { type = 'received' } = {}) => {
  const where = type === 'received'
    ? { to_user_id: userId }
    : { from_user_id: userId };

  where.status = 'pending';
  where.expires_at = { [Op.gt]: new Date() };

  return StudyInvitation.findAll({
    where,
    include: [
      { model: User, as: 'fromUser', attributes: ['id', 'full_name', 'avatar_url'] },
      { model: User, as: 'toUser', attributes: ['id', 'full_name', 'avatar_url'] },
      { model: Subject, as: 'subject' }
    ],
    order: [['created_at', 'DESC']]
  });
};

export const respondToInvitation = async (userId, invitationId, accept) => {
  const invitation = await StudyInvitation.findByPk(invitationId);
  if (!invitation) throw new AppError(ErrorCodes.NOT_FOUND, 'Invitation not found');
  if (invitation.to_user_id !== userId) throw new AppError(ErrorCodes.FORBIDDEN, 'Not your invitation');
  if (invitation.status !== 'pending') throw new AppError(ErrorCodes.CONFLICT, 'Already responded');

  await invitation.update({
    status: accept ? 'accepted' : 'declined',
    responded_at: new Date()
  });

  // If accepted buddy invite, create study buddy
  if (accept && invitation.type === 'buddy') {
    const { userA, userB } = StudyBuddy.getOrderedIds(invitation.from_user_id, invitation.to_user_id);
    await StudyBuddy.findOrCreate({
      where: { user_a: userA, user_b: userB, subject_code: invitation.subject_code },
      defaults: {
        user_a: userA, user_b: userB,
        subject_code: invitation.subject_code,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
  }

  return invitation;
};

// ==========================================
// STUDY BUDDIES
// ==========================================
export const getStudyBuddies = async (userId) => {
  const buddies = await StudyBuddy.findAll({
    where: {
      [Op.or]: [{ user_a: userId }, { user_b: userId }],
      status: 'active',
      expires_at: { [Op.gt]: new Date() }
    },
    include: [
      { model: User, as: 'userA', attributes: ['id', 'full_name', 'avatar_url'] },
      { model: User, as: 'userB', attributes: ['id', 'full_name', 'avatar_url'] },
      { model: Subject, as: 'subject' }
    ]
  });

  return buddies.map(b => ({
    id: b.id,
    buddy: b.user_a === userId ? b.userB : b.userA,
    subject: b.subject,
    expiresAt: b.expires_at
  }));
};

export default {
  getAllSubjects, getSubjectByCode,
  getStudyProfile, updateStudyProfile, updateLearningStatus,
  getUserSubjects, addUserSubject, updateUserSubject, removeUserSubject,
  getFriendSuggestions, getRecommendedGroups,
  sendStudyInvitation, getStudyInvitations, respondToInvitation,
  getStudyBuddies
};

