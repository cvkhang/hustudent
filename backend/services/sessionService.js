import { Op } from 'sequelize';
import { User, Group, GroupMember, StudySession, SessionRsvp } from '../models/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

/**
 * Create study session
 */
const createSession = async (userId, groupId, data) => {
  // Verify user is admin/owner
  const membership = await GroupMember.findOne({
    where: { group_id: groupId, user_id: userId, status: 'active' }
  });

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Only owner or admin can create sessions');
  }

  const session = await StudySession.create({
    group_id: groupId,
    created_by: userId,
    title: data.title,
    start_time: data.startTime,
    end_time: data.endTime,
    location_type: data.locationType || 'online',
    location_text: data.locationText,
    agenda: data.agenda
  });

  return getSessionById(session.id, userId);
};

/**
 * Get session by ID
 */
const getSessionById = async (sessionId, userId = null) => {
  const session = await StudySession.findByPk(sessionId, {
    include: [
      { model: Group, as: 'group', attributes: ['id', 'name', 'subject_tag'] },
      { model: User, as: 'creator', attributes: ['id', 'full_name', 'avatar_url'] },
      {
        model: SessionRsvp,
        as: 'rsvps',
        include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url'] }]
      }
    ]
  });

  if (!session) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Session not found');
  }

  // Get user's RSVP if logged in
  let myRsvp = null;
  if (userId) {
    const rsvp = session.rsvps.find(r => r.user_id === userId);
    myRsvp = rsvp?.status || null;
  }

  return { ...session.toJSON(), myRsvp };
};

/**
 * Get sessions for a group
 */
const getGroupSessions = async (groupId, { from, to, page = 1, limit = 20 }) => {
  const where = { group_id: groupId };

  if (from) {
    where.start_time = { [Op.gte]: new Date(from) };
  }
  if (to) {
    where.end_time = { ...(where.end_time || {}), [Op.lte]: new Date(to) };
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await StudySession.findAndCountAll({
    where,
    include: [
      { model: User, as: 'creator', attributes: ['id', 'full_name'] }
    ],
    limit,
    offset,
    order: [['start_time', 'ASC']]
  });

  return {
    sessions: rows,
    meta: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
  };
};

/**
 * Get all user's sessions (aggregated from all groups)
 */
const getUserSessions = async (userId, { from, to }) => {
  // Get user's groups
  const memberships = await GroupMember.findAll({
    where: { user_id: userId, status: 'active' },
    attributes: ['group_id']
  });

  const groupIds = memberships.map(m => m.group_id);

  if (groupIds.length === 0) return [];

  const where = { group_id: { [Op.in]: groupIds } };

  if (from) where.start_time = { [Op.gte]: new Date(from) };
  if (to) where.end_time = { ...(where.end_time || {}), [Op.lte]: new Date(to) };

  const sessions = await StudySession.findAll({
    where,
    include: [
      { model: Group, as: 'group', attributes: ['id', 'name'] }
    ],
    order: [['start_time', 'ASC']]
  });

  // Add user's RSVP to each session
  const rsvps = await SessionRsvp.findAll({
    where: { user_id: userId, session_id: { [Op.in]: sessions.map(s => s.id) } }
  });

  const rsvpMap = Object.fromEntries(rsvps.map(r => [r.session_id, r.status]));

  return sessions.map(s => ({
    id: s.id,
    groupId: s.group_id,
    groupName: s.group.name,
    title: s.title,
    startTime: s.start_time,
    endTime: s.end_time,
    myRsvp: rsvpMap[s.id] || null
  }));
};

/**
 * Update session
 */
const updateSession = async (userId, sessionId, updates) => {
  const session = await StudySession.findByPk(sessionId);
  if (!session) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Session not found');
  }

  const membership = await GroupMember.findOne({
    where: { group_id: session.group_id, user_id: userId, status: 'active' }
  });

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Only owner or admin can update sessions');
  }

  const allowedFields = ['title', 'start_time', 'end_time', 'location_type', 'location_text', 'agenda'];
  const filteredUpdates = {};
  for (const field of allowedFields) {
    const camelField = field.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    if (updates[field] !== undefined) filteredUpdates[field] = updates[field];
    else if (updates[camelField] !== undefined) filteredUpdates[field] = updates[camelField];
  }

  await session.update(filteredUpdates);
  return getSessionById(sessionId, userId);
};

/**
 * Delete session
 */
const deleteSession = async (userId, sessionId) => {
  const session = await StudySession.findByPk(sessionId);
  if (!session) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Session not found');
  }

  const membership = await GroupMember.findOne({
    where: { group_id: session.group_id, user_id: userId, status: 'active' }
  });

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Only owner or admin can delete sessions');
  }

  await session.destroy();
  return { message: 'Session deleted' };
};

/**
 * Submit RSVP
 */
const submitRsvp = async (userId, sessionId, status) => {
  const session = await StudySession.findByPk(sessionId);
  if (!session) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Session not found');
  }

  // Verify user is group member
  const membership = await GroupMember.findOne({
    where: { group_id: session.group_id, user_id: userId, status: 'active' }
  });

  if (!membership) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Must be group member to RSVP');
  }

  if (!['going', 'not_going', 'maybe'].includes(status)) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Invalid RSVP status');
  }

  const [rsvp, created] = await SessionRsvp.findOrCreate({
    where: { session_id: sessionId, user_id: userId },
    defaults: { session_id: sessionId, user_id: userId, status }
  });

  if (!created) {
    await rsvp.update({ status });
  }

  return rsvp;
};

/**
 * Get RSVPs for session
 */
const getSessionRsvps = async (sessionId) => {
  const rsvps = await SessionRsvp.findAll({
    where: { session_id: sessionId },
    include: [
      { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url'] }
    ]
  });

  return rsvps;
};

export {
  createSession,
  getSessionById,
  getGroupSessions,
  getUserSessions,
  updateSession,
  deleteSession,
  submitRsvp,
  getSessionRsvps
};
