import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Parse duration string to milliseconds
 * Supports: 1h, 7d, 30m, etc.
 */
const parseDuration = (duration) => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 3600000; // Default 1 hour

  const value = parseInt(match[1]);
  const unit = match[2];

  const multipliers = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };

  return value * multipliers[unit];
};

/**
 * Sign access token (short-lived)
 */
export const signAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};

/**
 * Sign refresh token (long-lived)
 */
export const signRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    env.JWT_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN }
  );
};

/**
 * Verify and decode a token
 * @returns {Object} Decoded payload or throws error
 */
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

/**
 * Get expiration date for refresh token
 */
export const getRefreshTokenExpiry = () => {
  const ms = parseDuration(env.REFRESH_TOKEN_EXPIRES_IN);
  return new Date(Date.now() + ms);
};

export default {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  getRefreshTokenExpiry
};
