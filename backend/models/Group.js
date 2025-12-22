<<<<<<< HEAD
// Group Model (In-memory for demo)
let groups = [];
let nextId = 1;

export class Group {
  constructor(name, description, creatorId) {
    this.id = nextId++;
    this.name = name;
    this.description = description;
    this.creatorId = creatorId;
    this.createdAt = new Date();
    this.members = [{ userId: creatorId, role: 'admin', joinedAt: new Date() }];
  }

  static create(name, description, creatorId) {
    const group = new Group(name, description, creatorId);
    groups.push(group);
    return group;
  }

  static findAll() {
    return groups;
  }

  static findById(id) {
    return groups.find(g => g.id === id);
  }

  static findByCreator(creatorId) {
    return groups.filter(g => g.creatorId === creatorId);
  }

  static addMember(groupId, userId, role = 'member') {
    const group = this.findById(groupId);
    if (group && !group.members.find(m => m.userId === userId)) {
      group.members.push({ userId, role, joinedAt: new Date() });
      return true;
    }
    return false;
  }

  static removeMember(groupId, userId) {
    const group = this.findById(groupId);
    if (group) {
      group.members = group.members.filter(m => m.userId !== userId);
      return true;
    }
    return false;
  }
}
=======
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Group = sequelize.define('Group', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  subject_tag: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'friends', 'group'),
    allowNull: false,
    defaultValue: 'public'
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'groups',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Group;
>>>>>>> 462527b96fc15095c276acdd1a184feb484472e6
