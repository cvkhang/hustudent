import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const QuizQuestion = sequelize.define('QuizQuestion', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  quiz_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'quizzes', key: 'id' },
    onDelete: 'CASCADE'
  },
  question_type: {
    type: DataTypes.ENUM('mcq', 'tf', 'short'),
    defaultValue: 'mcq'
  },
  question_text: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSONB, // Array of { id, text } for MCQ
    defaultValue: []
  },
  correct_answer: {
    type: DataTypes.STRING(255), // option id or 'true'/'false' or short answer
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  points: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  position: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'quiz_questions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default QuizQuestion;

