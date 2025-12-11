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