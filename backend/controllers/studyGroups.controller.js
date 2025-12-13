// Study Groups Controller
import { Group } from '../models/Group.js';
import { GroupMember } from '../models/GroupMember.js';

export const getStudyGroups = (req, res) => {
  try {
    const groups = Group.findAll();
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

export const createGroup = (req, res) => {
  try {
    const { name, description } = req.body;
    const creatorId = req.user?.id || 1; // Mock user ID

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Name and description are required'
      });
    }

    const group = Group.create(name, description, creatorId);
    GroupMember.create(group.id, creatorId, 'admin');

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

export const joinGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id || 2; // Mock user ID

    const group = Group.findById(parseInt(groupId));
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    const added = GroupMember.create(group.id, userId, 'member');
    if (!added) {
      return res.status(400).json({
        success: false,
        error: 'Already a member'
      });
    }

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

export const leaveGroup = (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id || 2; // Mock user ID

    const group = Group.findById(parseInt(groupId));
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Group not found'
      });
    }

    GroupMember.remove(parseInt(groupId), userId);

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

export const getMyGroups = (req, res) => {
  try {
    const userId = req.user?.id || 1; // Mock user ID
    const myMemberships = GroupMember.findByUser(userId);
    const groups = myMemberships.map(m => Group.findById(m.groupId)).filter(g => g);

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

export const getGroupDetail = (req, res) => {
  try {
    const { groupId } = req.params;
    const group = Group.findById(parseInt(groupId));
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