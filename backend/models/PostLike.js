import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PostLike = sequelize.define('PostLike', {
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: { model: 'posts', key: 'id' },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'post_likes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default PostLike;

