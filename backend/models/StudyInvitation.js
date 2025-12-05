const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StudyInvitation = sequelize.define('StudyInvitation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  from_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  to_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('session', 'group', 'buddy'),
    allowNull: false
  },
  target_id: {
    type: DataTypes.INTEGER,
    allowNull: true // null for buddy invites
  },
  subject_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    references: { model: 'subjects', key: 'code' }
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined', 'expired'),
    defaultValue: 'pending'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  responded_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'study_invitations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  validate: {
    differentUsers() {
      if (this.from_user_id === this.to_user_id) {
        throw new Error('Cannot invite yourself');
      }
    }
  }
});

module.exports = StudyInvitation;
