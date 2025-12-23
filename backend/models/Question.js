import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  author_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
  group_id: { type: DataTypes.INTEGER, allowNull: true, references: { model: 'groups', key: 'id' }, onDelete: 'SET NULL' },
  visibility: { type: DataTypes.ENUM('public', 'private', 'friends', 'group'), allowNull: false, defaultValue: 'public' },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  attachment_url: { type: DataTypes.STRING, allowNull: true },
  attachment_name: { type: DataTypes.STRING, allowNull: true },
  best_answer_id: { type: DataTypes.INTEGER, allowNull: true },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Question;

