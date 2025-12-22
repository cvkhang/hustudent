<<<<<<< HEAD
// GroupMember Model (In-memory for demo)
let groupMembers = [];

export class GroupMember {
  constructor(groupId, userId, role = 'member') {
    this.groupId = groupId;
    this.userId = userId;
    this.role = role;
    this.joinedAt = new Date();
  }

  static create(groupId, userId, role) {
    const member = new GroupMember(groupId, userId, role);
    groupMembers.push(member);
    return member;
  }

  static findByGroup(groupId) {
    return groupMembers.filter(m => m.groupId === groupId);
  }

  static findByUser(userId) {
    return groupMembers.filter(m => m.userId === userId);
  }

  static remove(groupId, userId) {
    groupMembers = groupMembers.filter(m => !(m.groupId === groupId && m.userId === userId));
  }

  static isAdmin(groupId, userId) {
    const member = groupMembers.find(m => m.groupId === groupId && m.userId === userId);
    return member && member.role === 'admin';
  }
}
=======
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GroupMember = sequelize.define('GroupMember', {
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'groups',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    allowNull: false,
    defaultValue: 'member'
  },
  status: {
    type: DataTypes.ENUM('active', 'pending'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'group_members',
  timestamps: true,
  createdAt: 'joined_at',
  updatedAt: false
});

module.exports = GroupMember;
>>>>>>> 462527b96fc15095c276acdd1a184feb484472e6
