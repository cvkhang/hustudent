import bcryptjs from 'bcryptjs';
import crypto from 'crypto';

const bcrypt = bcryptjs;

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a random token (for refresh tokens, password reset, etc.)
 */
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash a token for storage (we don't store raw tokens in DB)
 */
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export default {
  hashPassword,
  comparePassword,
  generateRandomToken,
  hashToken
};
