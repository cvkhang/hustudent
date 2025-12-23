import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const MessageAttachment = sequelize.define('MessageAttachment', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  message_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'messages',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM('link', 'file', 'image'),
    allowNull: false,
    defaultValue: 'file'
  },
  file_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING,
    allowNull: false
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true
  },
  mime_type: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'message_attachments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default MessageAttachment;

