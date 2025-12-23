import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Subject = sequelize.define('Subject', {
  code: {
    type: DataTypes.STRING(20),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name_en: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  department: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  credits: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  recommended_group_size: {
    type: DataTypes.STRING(10),
    defaultValue: '3-5'
  },
  subject_type: {
    type: DataTypes.ENUM('theory', 'practice', 'project'),
    defaultValue: 'theory'
  }
}, {
  tableName: 'subjects',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default Subject;

