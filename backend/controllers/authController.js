const authService = require('../services/authService');
const { AppError, ErrorCodes, validationError } = require('../utils/errors');

/**
 * POST /auth/register
 */
const register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    const errors = [];
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });
    if (!fullName) errors.push({ field: 'fullName', message: 'Full name is required' });

    if (password && password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters' });
    }

    if (errors.length > 0) {
      throw validationError(errors);
    }

    const result = await authService.register({ email, password, fullName });

    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    const errors = [];
    if (!email) errors.push({ field: 'email', message: 'Email is required' });
    if (!password) errors.push({ field: 'password', message: 'Password is required' });

    if (errors.length > 0) {
      throw validationError(errors);
    }

    const result = await authService.login({ email, password });

    // Set access token as HTTP-only cookie
    // Note: sameSite 'none' requires secure:true, but localhost is exempt in most browsers
    res.cookie('token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/'
    });

    res.json({
      data: {
        user: result.user,
        // Don't send tokens in response body (they're in cookies)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/refresh
 */
const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Refresh token is required');
    }

    const result = await authService.refreshAccessToken(refreshToken);

    res.json({ data: result });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    await authService.logout(refreshToken);

    // Clear the token cookie
    res.clearCookie('token');

    res.json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/change-password
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Current and new password are required');
    }

    if (newPassword.length < 6) {
      throw new AppError(ErrorCodes.VALIDATION_ERROR, 'New password must be at least 6 characters');
    }

    await authService.changePassword(req.userId, currentPassword, newPassword);

    res.json({ data: { message: 'Password changed successfully' } });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  changePassword
};
