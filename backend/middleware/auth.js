import { verifyToken } from '../utils/jwt.js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import User from '../models/User.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // Fallback: Check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(ErrorCodes.AUTH_REQUIRED);
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN);
    }

    // Check token type
    if (decoded.type !== 'access') {
      throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'Invalid token type');
    }

    // Get user from database
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user || user.deleted_at) {
      throw new AppError(ErrorCodes.AUTH_INVALID_TOKEN, 'User not found');
    }

    // Check if user is banned
    if (user.is_banned) {
      throw new AppError(ErrorCodes.FORBIDDEN, 'Your account has been banned');
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = verifyToken(token);
      if (decoded.type === 'access') {
        const user = await User.findByPk(decoded.userId, {
          attributes: { exclude: ['password_hash'] }
        });
        if (user && !user.deleted_at) {
          req.user = user;
          req.userId = user.id;
        }
      }
    } catch (err) {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize based on user roles
 * @param {...String} roles - Allowed roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

export default { authenticate, optionalAuth, authorize };