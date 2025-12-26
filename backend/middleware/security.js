import mongoSanitize from 'express-mongo-sanitize';
import { body, param, query, validationResult } from 'express-validator';

/**
 * Security middleware for XSS and NoSQL injection protection
 */

// NoSQL injection protection middleware
export const sanitizeNoSQL = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`[Security] Potential NoSQL injection attempt detected in ${key}`);
  }
});

/**
 * XSS sanitization using express-validator
 * Escapes HTML characters to prevent XSS attacks
 */
export const sanitizeInput = (field) => {
  return body(field).trim().escape();
};

/**
 * Sanitize all string inputs in request body, query, and params
 */
export const sanitizeAll = (req, res, next) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    sanitizeObject(req.query);
  }

  // Sanitize URL parameters
  if (req.params && typeof req.params === 'object') {
    sanitizeObject(req.params);
  }

  next();
};

/**
 * Recursively sanitize object properties
 */
function sanitizeObject(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];

      // If string, remove dangerous characters
      if (typeof value === 'string') {
        // Remove script tags and event handlers
        obj[key] = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
          .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
          .replace(/javascript:/gi, '');
      }
      // If object or array, recurse
      else if (typeof value === 'object' && value !== null) {
        sanitizeObject(value);
      }
    }
  }
}

/**
 * Validation error handler
 * Returns formatted validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(err => ({
          field: err.path || err.param,
          message: err.msg,
          value: err.value
        }))
      }
    });
  }

  next();
};

/**
 * Common validation chains
 */

// Email validation
export const validateEmail = () =>
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email too long');

// Password validation
export const validatePassword = (field = 'password') =>
  body(field)
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 128 }).withMessage('Password too long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number');

// Simple password (for backward compatibility)
export const validatePasswordSimple = (field = 'password') =>
  body(field)
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .isLength({ max: 128 }).withMessage('Password too long');

// Name validation
export const validateName = (field = 'fullName') =>
  body(field)
    .trim()
    .notEmpty().withMessage(`${field} is required`)
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2-100 characters')
    .matches(/^[\p{L}\s'-]+$/u).withMessage('Name contains invalid characters');

// ID validation
export const validateId = (paramName = 'id') =>
  param(paramName)
    .notEmpty().withMessage('ID is required')
    .isInt({ min: 1 }).withMessage('Invalid ID format');

// UUID validation
export const validateUUID = (paramName = 'id') =>
  param(paramName)
    .notEmpty().withMessage('ID is required')
    .isUUID().withMessage('Invalid UUID format');

// String validation with length
export const validateString = (field, minLength = 1, maxLength = 1000) =>
  body(field)
    .trim()
    .notEmpty().withMessage(`${field} is required`)
    .isLength({ min: minLength, max: maxLength })
    .withMessage(`${field} must be between ${minLength}-${maxLength} characters`);

// Optional string validation
export const validateOptionalString = (field, maxLength = 1000) =>
  body(field)
    .optional()
    .trim()
    .isLength({ max: maxLength })
    .withMessage(`${field} must not exceed ${maxLength} characters`);

// Boolean validation
export const validateBoolean = (field) =>
  body(field)
    .optional()
    .isBoolean().withMessage(`${field} must be a boolean`);

// Array validation
export const validateArray = (field, itemValidator = null) => {
  const chain = body(field)
    .optional()
    .isArray().withMessage(`${field} must be an array`);

  return chain;
};

// Pagination validation
export const validatePagination = () => [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1-100')
    .toInt()
];

// Search query validation
export const validateSearchQuery = () =>
  query('q')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Search query too long');

export default {
  sanitizeNoSQL,
  sanitizeInput,
  sanitizeAll,
  handleValidationErrors,
  validateEmail,
  validatePassword,
  validatePasswordSimple,
  validateName,
  validateId,
  validateUUID,
  validateString,
  validateOptionalString,
  validateBoolean,
  validateArray,
  validatePagination,
  validateSearchQuery
};
