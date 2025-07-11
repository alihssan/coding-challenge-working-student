import { ApiResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../constants/index.js';

export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // TypeORM errors
  if (err.name === 'QueryFailedError') {
    if (err.code === '23505') { // Unique constraint violation
      return ApiResponse.error(res, 'Resource already exists', HTTP_STATUS.CONFLICT);
    }
    if (err.code === '23503') { // Foreign key constraint violation
      return ApiResponse.error(res, 'Referenced resource does not exist', HTTP_STATUS.BAD_REQUEST);
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return ApiResponse.validationError(res, err.errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token', HTTP_STATUS.UNAUTHORIZED);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired', HTTP_STATUS.UNAUTHORIZED);
  }

  // Default error
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal server error';

  return ApiResponse.error(res, message, statusCode);
};

export const notFoundHandler = (req, res) => {
  return ApiResponse.notFound(res, `Route ${req.originalUrl} not found`);
}; 