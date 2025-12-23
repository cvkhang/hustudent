import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudySession = sequelize.define('StudySession', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'groups',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  location_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'online' // online | offline
  },
  location_text: {
    type: DataTypes.STRING,
    allowNull: true
  },
  agenda: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'study_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  validate: {
    endAfterStart() {
      if (this.end_time <= this.start_time) {
        throw new Error('End time must be after start time');
      }
    }
  }
});

export default StudySession;
