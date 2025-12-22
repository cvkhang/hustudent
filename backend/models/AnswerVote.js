const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AnswerVote = sequelize.define('AnswerVote', {
  answer_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, references: { model: 'answers', key: 'id' }, onDelete: 'CASCADE' },
  user_id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
  value: { type: DataTypes.INTEGER, allowNull: false, validate: { isIn: [[-1, 1]] } }
}, {
  tableName: 'answer_votes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = AnswerVote;
