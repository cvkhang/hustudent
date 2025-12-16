
export class AppError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

export const ErrorCodes = {
  NOT_FOUND: 404,
  FORBIDDEN: 403,
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500
};
