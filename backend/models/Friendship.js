const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Friendship model
 * Stores one row per pair (user_low, user_high) to enforce uniqueness
 * status: 'accepted' | 'blocked'
 */
const Friendship = sequelize.define('Friendship', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_low: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_high: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
    allowNull: false,
    defaultValue: 'accepted'
  },
  action_user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE',
    comment: 'User who last changed the status (blocker in case of block)'
  }
}, {
  tableName: 'friendships',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_low', 'user_high']
    }
  ]
});

/**
 * Helper to get ordered user IDs (low, high)
 */
Friendship.getOrderedIds = (userId1, userId2) => {
  return userId1 < userId2
    ? { userLow: userId1, userHigh: userId2 }
    : { userLow: userId2, userHigh: userId1 };
};

module.exports = Friendship;
