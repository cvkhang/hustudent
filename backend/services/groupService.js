import { Group, GroupMember, User, StudySession } from '../models/index.js';
import { Op } from 'sequelize';
import { AppError, ErrorCodes } from '../utils/errors.js';

class GroupService {
  /**
   * Create a new group
   */
  async createGroup(data, userId) {
    // 1. Create Group
    const group = await Group.create({
      name: data.name,
      description: data.description,
      subject_tag: data.subject_tag,
      visibility: data.visibility || 'public',
      avatar_url: data.avatar_url,
      owner_id: userId
    });

    // 2. Add Owner as Member (Role: owner)
    await GroupMember.create({
      group_id: group.id,
      user_id: userId,
      role: 'owner',
      status: 'active'
    });

    return group;
  }

  /**
   * Get groups (Explore or My Groups)
   */
  async getGroups(query, userId) {
    const { type = 'explore', search } = query;
    // type: 'explore' (all public), 'my_groups' (joined)

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }

    if (type === 'my_groups') {
      const myMemberships = await GroupMember.findAll({
        where: { user_id: userId, status: 'active' },
        attributes: ['group_id']
      });
      const groupIds = myMemberships.map(m => m.group_id);
      where.id = { [Op.in]: groupIds };
    } else {
      // Explore: Public groups
      where.visibility = 'public';
    }

    // Include member count
    const groups = await Group.findAll({
      where,
      include: [
        {
          model: GroupMember,
          as: 'members',
          attributes: [], // We only want count
          where: { status: 'active' },
          required: false // LEFT JOIN instead of INNER JOIN
        }
      ],
      attributes: {
        include: [
          [
            User.sequelize.literal(`(
              SELECT COUNT(*)
              FROM group_members AS members
              WHERE
                members.group_id = "Group"."id"
                AND members.status = 'active'
            )`),
            'memberCount'
          ]
        ]
      },
      order: [['created_at', 'DESC']]
    });

    return groups;
  }

  /**
   * Get Group Details
   */
  async getGroupDetails(groupId, userId) {
    const group = await Group.findByPk(groupId, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'full_name', 'avatar_url']
        }
      ]
    });

    if (!group) throw new AppError('Group not found', 404);

    // Get current user's membership
    const membership = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId }
    });

    // Get member count
    const memberCount = await GroupMember.count({
      where: { group_id: groupId, status: 'active' }
    });

    return {
      ...group.toJSON(),
      memberCount,
      membership: membership ? membership.toJSON() : null, // { role: '...', status: '...' }
      isMember: !!membership
    };
  }

  /**
   * Join Group
   */
  async joinGroup(groupId, userId) {
    const group = await Group.findByPk(groupId);
    if (!group) throw new AppError('Group not found', 404);

    const existingMember = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId }
    });

    if (existingMember) {
      if (existingMember.status === 'active') {
        throw new AppError('Already a member', 400);
      }
      // Re-join if previously left? Or pending?
      // For public groups, just set active.
      await existingMember.update({ status: 'active' });
      return existingMember;
    }

    // Check visibility? If private, maybe need request?
    // For now, simple join for public.
    const member = await GroupMember.create({
      group_id: groupId,
      user_id: userId,
      role: 'member',
      status: 'active'
    });

    return member;
  }

  /**
   * Leave Group
   */
  async leaveGroup(groupId, userId) {
    const member = await GroupMember.findOne({
      where: { group_id: groupId, user_id: userId }
    });

    if (!member) throw new AppError('Not a member', 400);

    // If owner leaves, must transfer ownership? Or group deleted?
    // Simplify: Owner cannot leave without transfer (or just delete group).
    if (member.role === 'owner') {
      throw new AppError('Owner cannot leave group. Transfer ownership or delete group.', 400);
    }

    await member.destroy(); // Hard delete or soft? Hard for now.
    return { message: 'Left group successfully' };
  }

  /**
   * Get Members
   */
  async getMembers(groupId) {
    return GroupMember.findAll({
      where: { group_id: groupId, status: 'active' },
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url', 'major'] }
      ],
      order: [['joined_at', 'ASC']]
    });
  }
}

export default new GroupService();
