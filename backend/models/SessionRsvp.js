const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SessionRsvp = sequelize.define('SessionRsvp', {
  session_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'study_sessions',
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
  status: {
    type: DataTypes.ENUM('going', 'not_going', 'maybe'),
    allowNull: false
  }
}, {
  tableName: 'session_rsvps',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

module.exports = SessionRsvp;
