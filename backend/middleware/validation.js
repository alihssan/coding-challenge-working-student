import { ValidationUtils } from '../utils/validation.js';
import { ApiResponse } from '../utils/response.js';
import { TICKET_STATUS } from '../constants/index.js';

export const validateTicket = (req, res, next) => {
  const { title, description, status, user_id, organisation_id } = req.body;
  const errors = [];

  // Required fields
  const requiredErrors = ValidationUtils.validateRequired(['title', 'user_id', 'organisation_id'], req.body);
  errors.push(...requiredErrors);

  // Status validation
  if (status && !ValidationUtils.validateStatus(status, Object.values(TICKET_STATUS))) {
    errors.push(`Status must be one of: ${Object.values(TICKET_STATUS).join(', ')}`);
  }

  // Type validation
  if (user_id && isNaN(parseInt(user_id))) {
    errors.push('user_id must be a number');
  }

  if (organisation_id && isNaN(parseInt(organisation_id))) {
    errors.push('organisation_id must be a number');
  }

  if (errors.length > 0) {
    return ApiResponse.validationError(res, errors);
  }

  next();
};

export const validateUser = (req, res, next) => {
  const { name, email, organisation_id } = req.body;
  const errors = [];

  // Required fields
  const requiredErrors = ValidationUtils.validateRequired(['name', 'organisation_id'], req.body);
  errors.push(...requiredErrors);

  // Email validation (if provided)
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }
  }

  // Type validation
  if (organisation_id && isNaN(parseInt(organisation_id))) {
    errors.push('organisation_id must be a number');
  }

  if (errors.length > 0) {
    return ApiResponse.validationError(res, errors);
  }

  next();
};

export const validateOrganisation = (req, res, next) => {
  const { name } = req.body;
  const errors = [];

  // Required fields
  const requiredErrors = ValidationUtils.validateRequired(['name'], req.body);
  errors.push(...requiredErrors);

  if (errors.length > 0) {
    return ApiResponse.validationError(res, errors);
  }

  next();
};

export const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  const errors = ValidationUtils.validatePagination(page, limit);

  if (errors.length > 0) {
    return ApiResponse.validationError(res, errors);
  }

  next();
}; 