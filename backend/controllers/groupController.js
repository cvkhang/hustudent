// Study Groups Controller
import { Op } from 'sequelize';
import Group from '../models/Group.js';
import GroupMember from '../models/GroupMember.js';
import User from '../models/User.js';
import StudySession from '../models/StudySession.js';
import SessionRsvp from '../models/SessionRsvp.js';


export const getStudyGroups = async (req, res) => {
  try {
    const { type, search } = req.query;
    const userId = req.user?.id || 1; // Mock user ID

    let groups = [];

    if (type === 'my_groups') {
      // Filter: only groups where user is a member
      const myMemberships = await GroupMember.findAll({
        where: { user_id: userId, status: 'active' },
        include: [{
          model: Group,
          as: 'group',
          where: search ? {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { description: { [Op.iLike]: `%${search}%` } }
            ]
          } : {}
        }]
      });
      groups = myMemberships.map(m => m.group).filter(g => g);
    } else {
      // Explore: all groups (optionally filtered by search)
      const where = search ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      } : {};
      groups = await Group.findAll({ where });
    }

    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createGroup = async (req, res) => {
  try {
    const { name, description } = req.body;
    const creatorId = req.user?.id || 1; // Mock user ID

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    const group = await Group.create({ name, description, owner_id: creatorId });
    await GroupMember.create({ group_id: group.id, user_id: creatorId, role: 'admin', status: 'active' });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id || 2; // Mock user ID

    const group = await Group.findByPk(parseInt(groupId));
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const existingMember = await GroupMember.findOne({
      where: { group_id: parseInt(groupId), user_id: userId }
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'Already a member'
      });
    }

    await GroupMember.create({ group_id: parseInt(groupId), user_id: userId, role: 'member', status: 'active' });

    res.status(200).json({
      success: true,
      message: 'Joined group successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id || 2; // Mock user ID

    const group = await Group.findByPk(parseInt(groupId));
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const member = await GroupMember.findOne({
      where: { group_id: parseInt(groupId), user_id: userId }
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        error: 'Not a member of this group'
      });
    }

    await member.destroy();

    res.status(200).json({
      success: true,
      message: 'Left group successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user?.id || 1; // Mock user ID
    const myMemberships = await GroupMember.findAll({
      where: { user_id: userId, status: 'active' },
      include: [{
        model: Group,
        as: 'group'
      }]
    });
    const groups = myMemberships.map(m => m.group).filter(g => g);

    res.status(200).json({
      success: true,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getGroupDetail = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByPk(parseInt(groupId));
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findByPk(parseInt(groupId));
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const members = await GroupMember.findAll({
      where: { group_id: parseInt(groupId) },
      include: [{
        model: User, // Ensure User is imported
        as: 'user', // Ensure association alias matches (usually 'user')
        attributes: ['id', 'full_name', 'email', 'avatar_url', 'role']
      }]
    });

    res.status(200).json({
      success: true,
      data: members
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const createSession = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { title, description, dateTime } = req.body;
    const creatorId = req.user?.id || 1;

    const group = await Group.findByPk(parseInt(groupId));
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const session = await StudySession.create({
      group_id: parseInt(groupId),
      title,
      description,
      scheduled_at: dateTime,
      creator_id: creatorId
    });

    res.status(201).json({
      success: true,
      data: session
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getSessionsByGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { type } = req.query; // 'upcoming' or 'past'

    const group = await Group.findByPk(parseInt(groupId));
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const where = { group_id: parseInt(groupId) };
    const now = new Date();

    if (type === 'upcoming') {
      where.start_time = { [Op.gte]: now };
    } else if (type === 'past') {
      where.start_time = { [Op.lt]: now };
    }

    const sessions = await StudySession.findAll({
      where,
      order: [['start_time', type === 'past' ? 'DESC' : 'ASC']]
    });

    // Add attendee count to each session
    const sessionsWithCount = await Promise.all(sessions.map(async (session) => {
      const attendeeCount = await SessionRsvp.count({
        where: { session_id: session.id, status: 'yes' }
      });
      return {
        ...session.toJSON(),
        attendeeCount
      };
    }));

    res.status(200).json({
      success: true,
      data: sessionsWithCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const rsvpToSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body; // 'yes', 'no', 'cancel'
    const userId = req.user?.id || 1;

    const session = await StudySession.findByPk(parseInt(sessionId));
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found'
      });
    }

    if (!['yes', 'no', 'cancel'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const rsvp = await SessionRsvp.create({
      session_id: parseInt(sessionId),
      user_id: userId,
      status
    });

    res.status(200).json({
      success: true,
      data: rsvp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};