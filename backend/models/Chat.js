import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Chat = sequelize.define('Chat', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('direct', 'group'),
    allowNull: false,
    defaultValue: 'direct'
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'groups',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_a: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_b: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'chats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  validate: {
    chatTypeValidation() {
      if (this.type === 'direct') {
        if (!this.user_a || !this.user_b) {
          throw new Error('Direct chat must have two users');
        }
        if (this.user_a === this.user_b) {
          throw new Error('Cannot create chat with yourself');
        }
      } else if (this.type === 'group') {
        if (!this.group_id) {
          throw new Error('Group chat must have group_id');
        }
      }
    }
  }
});

/**
 * Get ordered user IDs for consistent storage
 */
Chat.getOrderedUsers = (userId1, userId2) => {
  return userId1 < userId2
    ? { userA: userId1, userB: userId2 }
    : { userA: userId2, userB: userId1 };
};

export default Chat;

