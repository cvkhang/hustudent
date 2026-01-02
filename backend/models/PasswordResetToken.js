import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PasswordResetToken = sequelize.define('PasswordResetToken', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  token_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'password_reset_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default PasswordResetToken;
