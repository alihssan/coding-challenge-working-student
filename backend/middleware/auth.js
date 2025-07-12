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
    return ApiResponse.error(res, 401);
  }

  try {
    // Use obfuscated token verification
    const decoded = authService.verifyObfuscatedToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 401);
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
      // Use obfuscated token verification
      const decoded = authService.verifyObfuscatedToken(token);
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
      return ApiResponse.error(res, 401);
    }

    if (req.user.organisationId !== parseInt(organisationId)) {
      return ApiResponse.error(res, 403);
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
      return ApiResponse.error(res, 401);
    }

    const resourceId = parseInt(req.params[paramName]);
    if (req.user.userId !== resourceId) {
      return ApiResponse.error(res, 403);
    }

    next();
  };
};

/**
 * Middleware to check if user has admin privileges
 * This checks for role === 'admin'
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, 401);
  }

  if (req.user.role !== 'admin') {
    return ApiResponse.error(res, 403);
  }

  next();
}; 