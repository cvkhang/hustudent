import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PostComment = sequelize.define('PostComment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'posts', key: 'id' },
    onDelete: 'CASCADE'
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachment_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachment_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'post_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default PostComment;

