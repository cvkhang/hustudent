const { OAuth2Client } = require('google-auth-library');
const { User, AuthRefreshToken } = require('../models');
const { generateTokens, hashToken } = require('../utils/jwt');
const { AppError, ErrorCodes } = require('../utils/errors');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

/**
 * Verify Google ID token and get user info
 */
const verifyGoogleToken = async (idToken) => {
  if (!client) {
    throw new AppError(ErrorCodes.SERVER_ERROR, 'Google OAuth not configured');
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    return {
      googleId: payload.sub,
      email: payload.email,
      emailVerified: payload.email_verified,
      fullName: payload.name,
      avatarUrl: payload.picture
    };
  } catch (error) {
    throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Invalid Google token');
  }
};

/**
 * Login or register with Google
 */
const googleLogin = async (idToken) => {
  const googleUser = await verifyGoogleToken(idToken);

  // Check email domain (optional - for HUST students)
  // if (!googleUser.email.endsWith('@hust.edu.vn')) {
  //   throw new AppError(ErrorCodes.VALIDATION_FAILED, 'Only HUST email allowed');
  // }

  // Find or create user
  let user = await User.findOne({
    where: { google_id: googleUser.googleId }
  });

  if (!user) {
    // Try to find by email (maybe registered with email first)
    user = await User.findOne({ where: { email: googleUser.email } });

    if (user) {
      // Link Google account to existing user
      await user.update({
        google_id: googleUser.googleId,
        avatar_url: user.avatar_url || googleUser.avatarUrl
      });
    } else {
      // Create new user
      user = await User.create({
        email: googleUser.email,
        full_name: googleUser.fullName,
        avatar_url: googleUser.avatarUrl,
        google_id: googleUser.googleId,
        auth_provider: 'google'
        // password_hash is null for Google-only users
      });
    }
  }

  if (user.deleted_at) {
    throw new AppError(ErrorCodes.AUTH_REQUIRED, 'Account has been deleted');
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user.id);

  // Store refresh token
  await AuthRefreshToken.create({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
      auth_provider: user.auth_provider || 'google'
    },
    accessToken,
    refreshToken
  };
};

module.exports = { verifyGoogleToken, googleLogin };
