/**
 * Standard error codes
 */
export const ErrorCodes = {
  AUTH_REQUIRED: { code: 'AUTH_REQUIRED', status: 401, message: 'Authentication required' },
  AUTH_INVALID_TOKEN: { code: 'AUTH_INVALID_TOKEN', status: 401, message: 'Invalid or expired token' },
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_INVALID_CREDENTIALS', status: 401, message: 'Invalid email or password' },
  FORBIDDEN: { code: 'FORBIDDEN', status: 403, message: 'You are not allowed to perform this action' },
  NOT_FOUND: { code: 'NOT_FOUND', status: 404, message: 'Resource not found' },
  VALIDATION_FAILED: { code: 'VALIDATION_FAILED', status: 400, message: 'Invalid request data' },
  CONFLICT: { code: 'CONFLICT', status: 409, message: 'Resource already exists' },
  RATE_LIMITED: { code: 'RATE_LIMITED', status: 429, message: 'Too many requests' },
  INTERNAL_ERROR: { code: 'INTERNAL_ERROR', status: 500, message: 'Internal server error' }
};

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(errorCode, customMessage = null, details = null) {
    const { code, status, message } = errorCode;
    super(customMessage || message);

    this.code = code;
    this.status = status;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details && { details: this.details })
      }
    };
  }
}

/**
 * Helper to create validation error with field details
 */
export const validationError = (fields) => {
  return new AppError(ErrorCodes.VALIDATION_FAILED, 'Validation failed', fields);
};

export default {
  ErrorCodes,
  AppError,
  validationError
};
