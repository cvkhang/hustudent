const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSubject = sequelize.define('UserSubject', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  subject_code: {
    type: DataTypes.STRING(20),
    primaryKey: true,
    references: { model: 'subjects', key: 'code' },
    onDelete: 'CASCADE'
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  goals: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  can_help: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  needs_help: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  semester: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  grade: {
    type: DataTypes.STRING(5),
    allowNull: true
  },
  grade_visibility: {
    type: DataTypes.ENUM('public', 'friends', 'private'),
    defaultValue: 'private'
  }
}, {
  tableName: 'user_subjects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = UserSubject;
