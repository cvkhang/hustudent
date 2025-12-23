import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UserStudyProfile = sequelize.define('UserStudyProfile', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  gpa: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true
  },
  gpa_visibility: {
    type: DataTypes.ENUM('public', 'friends', 'private'),
    defaultValue: 'private'
  },
  study_modes: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  study_styles: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  study_pace: {
    type: DataTypes.ENUM('slow', 'intensive'),
    allowNull: true
  },
  available_times: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  campus: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  study_locations: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  available_offline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  learning_status: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  learning_status_subject: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  learning_status_updated_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  weekly_study_streak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  total_helpful_answers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_active_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'user_study_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UserStudyProfile;

