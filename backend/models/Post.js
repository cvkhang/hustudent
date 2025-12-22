const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  group_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'groups', key: 'id' },
    onDelete: 'SET NULL'
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private', 'friends', 'group'),
    allowNull: false,
    defaultValue: 'public'
  },
  content: {
    type: DataTypes.TEXT, // Used as 'Description'
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('share', 'request'),
    defaultValue: 'share'
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachment_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachment_name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subject_tag: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Post;
