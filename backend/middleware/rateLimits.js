import rateLimit from 'express-rate-limit';

/**
 * Rate limiting configurations for different endpoint types
 */

// General API rate limit (existing)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // limit each IP to 2000 requests per windowMs
  message: {
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Strict rate limit for login attempts
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  message: {
    error: {
      code: 'TOO_MANY_LOGIN_ATTEMPTS',
      message: 'Too many login attempts. Please try again after 15 minutes.'
    }
  },
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for registration
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per hour per IP
  message: {
    error: {
      code: 'TOO_MANY_REGISTRATIONS',
      message: 'Too many registration attempts. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for password changes
export const passwordChangeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 password change attempts per 15 minutes
  message: {
    error: {
      code: 'TOO_MANY_PASSWORD_CHANGES',
      message: 'Too many password change attempts. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for file uploads
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads per 15 minutes
  message: {
    error: {
      code: 'TOO_MANY_UPLOADS',
      message: 'Too many upload attempts. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limit for sensitive operations (creating groups, posts, etc.)
export const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 create operations per 15 minutes
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests. Please slow down.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  apiLimiter,
  loginLimiter,
  registerLimiter,
  passwordChangeLimiter,
  uploadLimiter,
  createLimiter
};
