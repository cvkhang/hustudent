import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FlashcardProgress = sequelize.define('FlashcardProgress', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
    onDelete: 'CASCADE'
  },
  card_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: { model: 'flashcards', key: 'id' },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('known', 'unknown', 'learning'),
    defaultValue: 'unknown'
  },
  review_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  last_reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  next_review_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'flashcard_progress',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default FlashcardProgress;

