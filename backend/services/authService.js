import { User, AuthRefreshToken } from '../models/index.js';
import { hashPassword, comparePassword, hashToken } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyToken, getRefreshTokenExpiry } from '../utils/jwt.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

/**
 * Register a new user
 */
export const register = async ({ email, password, fullName }) => {
  // Check if user exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new AppError(ErrorCodes.CONFLICT, 'Email already registered');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user = await User.create({
    email,
    password_hash: passwordHash,
    full_name: fullName,
    auth_provider: 'email'
  });

  // Generate tokens
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  // Store refresh token hash
  await AuthRefreshToken.create({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: getRefreshTokenExpiry()
  });

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken
  };
};

/**
 * Login user with email/password
 */
export const login = async ({ email, password }) => {
  // Find user with password
  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (!user || user.deleted_at) {
    throw new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS);
  }

  // Check if user has password (might be Google-only)
  if (!user.password_hash) {
    throw new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Please login with Google');
  }

  // Verify password
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS);
  }

  // Generate tokens
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  // Store refresh token hash
  await AuthRefreshToken.create({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: getRefreshTokenExpiry()
  });

  return {
    user: user.toJSON(),
    accessToken,
    refreshToken
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  // Verify token
  let decoded;
  try {
    decoded = verifyToken(refreshToken);
  } catch (err) {
    throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Invalid refresh token');
  }

  if (decoded.type !== 'refresh') {
    throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Invalid token type');
  }

  // Find token in database
  const tokenHash = hashToken(refreshToken);
  const storedToken = await AuthRefreshToken.findOne({
    where: {
      user_id: decoded.userId,
      token_hash: tokenHash,
      revoked: false
    }
  });

  if (!storedToken) {
    throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Refresh token not found or revoked');
  }

  // Check expiry
  if (new Date() > storedToken.expires_at) {
    await storedToken.update({ revoked: true });
    throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Refresh token expired');
  }

  // Generate new access token
  const accessToken = signAccessToken(decoded.userId);

  return { accessToken };
};

/**
 * Logout - revoke refresh token
 */
export const logout = async (refreshToken) => {
  if (!refreshToken) return;

  const tokenHash = hashToken(refreshToken);

  await AuthRefreshToken.update(
    { revoked: true },
    { where: { token_hash: tokenHash } }
  );
};

/**
 * Revoke all refresh tokens for a user
 */
export const revokeAllTokens = async (userId) => {
  await AuthRefreshToken.update(
    { revoked: true },
    { where: { user_id: userId } }
  );
};

/**
 * Change password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.scope('withPassword').findByPk(userId);

  if (!user || user.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'User not found');
  }

  if (!user.password_hash) {
    throw new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Account uses external auth provider');
  }

  const isValid = await comparePassword(currentPassword, user.password_hash);
  if (!isValid) {
    throw new AppError(ErrorCodes.AUTH_INVALID_CREDENTIALS, 'Current password is incorrect');
  }

  const passwordHash = await hashPassword(newPassword);

  await user.update({ password_hash: passwordHash });

  // Revoke all existing sessions/tokens for security
  await revokeAllTokens(userId);

  return true;
};

export default {
  register,
  login,
  refreshAccessToken,
  logout,
  revokeAllTokens,
  changePassword
};
