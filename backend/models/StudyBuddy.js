import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StudyBuddy = sequelize.define('StudyBuddy', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_a: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_b: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  subject_code: {
    type: DataTypes.STRING(20),
    allowNull: true,
    references: { model: 'subjects', key: 'code' }
  },
  status: {
    type: DataTypes.ENUM('active', 'expired', 'upgraded'),
    defaultValue: 'active'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'study_buddies',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['user_a', 'user_b', 'subject_code'] }
  ]
});

// Helper to get ordered user IDs
StudyBuddy.getOrderedIds = (userId1, userId2) => {
  return userId1 < userId2
    ? { userA: userId1, userB: userId2 }
    : { userA: userId2, userB: userId1 };
};

export default StudyBuddy;

