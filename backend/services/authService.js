import { User, AuthRefreshToken, PasswordResetToken } from '../models/index.js';
import { hashPassword, comparePassword, hashToken } from '../utils/crypto.js';
import { signAccessToken, signRefreshToken, verifyToken, getRefreshTokenExpiry } from '../utils/jwt.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import crypto from 'crypto';

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

  // Check if user is banned
  if (user.is_banned) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Your account has been banned. Reason: ' + (user.ban_reason || 'Violated community guidelines'));
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

/**
 * Request password reset - generates token and sends email
 */
export const forgotPassword = async (email) => {
  const user = await User.findOne({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user || user.deleted_at) {
    return { message: 'If this email exists, a reset link has been sent' };
  }

  // Check if user is banned
  if (user.is_banned) {
    return { message: 'If this email exists, a reset link has been sent' };
  }

  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(resetToken);

  // Token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  // Invalidate any existing reset tokens for this user
  await PasswordResetToken.update(
    { used: true },
    { where: { user_id: user.id, used: false } }
  );

  // Store new token
  await PasswordResetToken.create({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt
  });

  // Build reset URL
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

  // Send email
  try {
    const { sendPasswordResetEmail } = await import('./emailService.js');
    await sendPasswordResetEmail(email, resetUrl, resetToken);
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    // Don't throw - we still want to return success to prevent email enumeration
  }

  return {
    message: 'If this email exists, a reset link has been sent'
  };
};

/**
 * Reset password with token
 */
export const resetPassword = async (email, token, newPassword) => {
  const user = await User.findOne({ where: { email } });

  if (!user || user.deleted_at) {
    throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Invalid or expired reset token');
  }

  // Find valid token
  const tokenHash = hashToken(token);
  const resetToken = await PasswordResetToken.findOne({
    where: {
      user_id: user.id,
      token_hash: tokenHash,
      used: false
    }
  });

  if (!resetToken) {
    throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Invalid or expired reset token');
  }

  // Check if token expired
  if (new Date() > resetToken.expires_at) {
    await resetToken.update({ used: true });
    throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Reset token has expired');
  }

  // Update password
  const passwordHash = await hashPassword(newPassword);
  await user.update({ password_hash: passwordHash });

  // Mark token as used
  await resetToken.update({ used: true });

  // Revoke all existing sessions for security
  await revokeAllTokens(user.id);

  return { message: 'Password reset successfully' };
};

export default {
  register,
  login,
  refreshAccessToken,
  logout,
  revokeAllTokens,
  changePassword,
  forgotPassword,
  resetPassword
};
