import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../utils/response.js';

const authService = new AuthService();

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return ApiResponse.error(res, 'Access token required', 401);
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired token', 401);
  }
};

/**
 * Middleware to optionally authenticate JWT token
 * Useful for routes that can work with or without authentication
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = authService.verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but we continue without authentication
      req.user = null;
    }
  } else {
    req.user = null;
  }

  next();
};

/**
 * Middleware to check if user belongs to specific organisation
 */
export const requireOrganisation = (organisationId) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    if (req.user.organisationId !== parseInt(organisationId)) {
      return ApiResponse.error(res, 'Access denied: Organisation mismatch', 403);
    }

    next();
  };
};

/**
 * Middleware to check if user is accessing their own resource
 */
export const requireOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Authentication required', 401);
    }

    const resourceId = parseInt(req.params[paramName]);
    if (req.user.userId !== resourceId) {
      return ApiResponse.error(res, 'Access denied: Resource ownership required', 403);
    }

    next();
  };
};

/**
 * Middleware to check if user has admin privileges
 * This is a simple implementation - you might want to add role-based access control
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, 'Authentication required', 401);
  }

  // For now, we'll consider users with ID 1 as admin
  // In a real application, you'd have a proper role system
  if (req.user.userId !== 1) {
    return ApiResponse.error(res, 'Access denied: Admin privileges required', 403);
  }

  next();
}; 