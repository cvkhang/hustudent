const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PostBookmark = sequelize.define('PostBookmark', {
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
  tableName: 'post_bookmarks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = PostBookmark;
