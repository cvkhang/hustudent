import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: true // NULL if using Google OAuth only
  },
  full_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  avatar_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  cover_photo_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  university: {
    type: DataTypes.STRING,
    allowNull: true
  },
  major: {
    type: DataTypes.STRING,
    allowNull: true
  },
  academic_year: {
    type: DataTypes.STRING,
    allowNull: true
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  goals: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Auth provider
  auth_provider: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'email' // email | google
  },
  google_id: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },
  // Privacy settings
  allow_message_from: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'friends' // friends | everyone
  },
  profile_visibility: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'public' // public | friends | private
  },
  // Timestamps
  deleted_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  // Don't return password_hash by default
  defaultScope: {
    attributes: { exclude: ['password_hash'] }
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password_hash'] }
    }
  }
});

/**
 * Get safe user data for API responses
 */
User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password_hash;
  delete values.deleted_at;
  return values;
};

export default User;

