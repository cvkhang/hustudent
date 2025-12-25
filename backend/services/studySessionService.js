import { StudySession, SessionRsvp, Group, GroupMember, User } from '../models/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import { Op } from 'sequelize';

class StudySessionService {
  /**
   * Create a new session for a group
   */
  async createSession(groupId, data, userId) {
    // 1. Check if user is member of group
    const member = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId, status: 'active' }
    });

    if (!member) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'You must be a member of the group to create a session');
    }

    // 2. Validate time
    const startTime = new Date(data.start_time);
    const endTime = new Date(data.end_time);

    if (endTime <= startTime) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'End time must be after start time');
    }

    // 3. Create Session
    const session = await StudySession.create({
      group_id: groupId,
      created_by: userId,
      title: data.title,
      start_time: startTime,
      end_time: endTime,
      location_type: data.location_type || 'online',
      location_text: data.location_text,
      agenda: data.agenda
    });

    // 4. Auto RSVP creator as 'going'
    await SessionRsvp.create({
      session_id: session.id,
      user_id: userId,
      status: 'going'
    });

    return session;
  }

  /**
   * Get sessions for a group
   */
  async getGroupSessions(groupId, userId) {
    // Check membership? optional for public groups?
    // For now, assume public groups allow viewing sessions?
    // Let's enforce membership or public visibility check if needed.
    // Simplifying: just fetch.

    // Fetch upcoming sessions by default? Or all?
    // Let's fetch all future sessions + sessions in past 24h?
    // Or just all and let frontend filter?
    // Let's fetch ordered by start_time.

    const sessions = await StudySession.findAll({
      where: { group_id: groupId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'full_name', 'avatar_url']
        },
        {
          model: SessionRsvp,
          as: 'rsvps',
          include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url'] }]
        }
      ],
      order: [['start_time', 'ASC']]
    });

    // Enhance with "myRsvp"
    const sessionsWithRsvp = sessions.map(session => {
      const json = session.toJSON();
      const myRsvp = json.rsvps.find(r => r.user_id === userId);
      return {
        ...json,
        myRsvp: myRsvp ? myRsvp.status : null,
        goingCount: json.rsvps.filter(r => r.status === 'going').length
      };
    });

    return sessionsWithRsvp;
  }

  /**
   * RSVP to a session
   */
  async rsvpSession(sessionId, userId, status) {
    if (!['going', 'not_going', 'maybe'].includes(status)) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Invalid status');
    }

    const session = await StudySession.findByPk(sessionId);
    if (!session) throw new AppError(ErrorCodes.NOT_FOUND, 'Session not found');

    // Check if user is member of the group
    const member = await GroupMember.findOne({
      where: { group_id: session.group_id, user_id: userId, status: 'active' }
    });

    if (!member) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'You must be a member of the group to RSVP');
    }

    // Upsert RSVP
    const [rsvp, created] = await SessionRsvp.findOrCreate({
      where: { session_id: sessionId, user_id: userId },
      defaults: { status }
    });

    if (!created) {
      await rsvp.update({ status });
    }

    return rsvp;
  }

  /**
   * Get attendees for a session
   */
  async getSessionAttendees(sessionId) {
    const rsvps = await SessionRsvp.findAll({
      where: { session_id: sessionId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'avatar_url', 'major']
        }
      ],
      order: [['updated_at', 'ASC']]
    });
    return rsvps;
  }

  /**
   * Get user's personal schedule (sessions they are going or maybe)
   */
  async getMySchedule(userId) {
    // 1. Find IDs of sessions user is attending/maybe
    const rsvps = await SessionRsvp.findAll({
      where: {
        user_id: userId,
        status: { [Op.in]: ['going', 'maybe'] }
      },
      attributes: ['session_id']
    });

    const sessionIds = rsvps.map(r => r.session_id);

    if (sessionIds.length === 0) return [];

    // 2. Fetch full session details
    const sessions = await StudySession.findAll({
      where: { id: { [Op.in]: sessionIds } },
      include: [
        {
          model: Group,
          as: 'group',
          attributes: ['id', 'name']
        },
        {
          model: SessionRsvp,
          as: 'rsvps',
          attributes: ['user_id', 'status'] // Minimized attributes
        }
      ],
      order: [['start_time', 'ASC']]
    });

    // 3. Format
    return sessions.map(session => {
      const json = session.toJSON();
      const myRsvpObj = json.rsvps.find(r => r.user_id === userId);
      return {
        ...json,
        myRsvp: myRsvpObj ? myRsvpObj.status : null,
        goingCount: json.rsvps.filter(r => r.status === 'going').length
      };
    });
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId, userId) {
    const session = await StudySession.findByPk(sessionId);
    if (!session) throw new AppError(ErrorCodes.NOT_FOUND, 'Session not found');

    if (session.created_by !== userId) {
      const member = await GroupMember.findOne({
        where: { group_id: session.group_id, user_id: userId, status: 'active' }
      });
      if (!member || !['owner', 'admin'].includes(member.role)) {
        throw new AppError(ErrorCodes.FORBIDDEN, 'You do not have permission to delete this session');
      }
    }

    await session.destroy();
    return { success: true };
  }

  /**
   * Update a session
   */
  async updateSession(sessionId, userId, data) {
    const session = await StudySession.findByPk(sessionId);
    if (!session) throw new AppError(ErrorCodes.NOT_FOUND, 'Session not found');

    if (session.created_by !== userId) {
      const member = await GroupMember.findOne({
        where: { group_id: session.group_id, user_id: userId, status: 'active' }
      });
      if (!member || !['owner', 'admin'].includes(member.role)) {
        throw new AppError(ErrorCodes.FORBIDDEN, 'You do not have permission to update this session');
      }
    }

    const updates = {};
    if (data.title) updates.title = data.title;
    if (data.start_time) updates.start_time = new Date(data.start_time);
    if (data.end_time) updates.end_time = new Date(data.end_time);
    if (data.location_type) updates.location_type = data.location_type;
    if (data.location_text) updates.location_text = data.location_text;
    if (data.agenda) updates.agenda = data.agenda;

    // Use existing times if not provided
    const startTime = updates.start_time || new Date(session.start_time);
    const endTime = updates.end_time || new Date(session.end_time);

    if (endTime <= startTime) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'End time must be after start time');
    }

    await session.update(updates);
    return session;
  }
}

export default new StudySessionService();
