import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const AuthRefreshToken = sequelize.define('AuthRefreshToken', {
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
  revoked: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'auth_refresh_tokens',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

export default AuthRefreshToken;

