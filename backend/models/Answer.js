import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Answer = sequelize.define('Answer', {
  id: { type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true },
  question_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'questions', key: 'id' }, onDelete: 'CASCADE' },
  author_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
  content: { type: DataTypes.TEXT, allowNull: false },
  vote_score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  deleted_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'answers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Answer;

