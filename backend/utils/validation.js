export class ValidationUtils {
  static validateRequired(fields, data) {
    const errors = [];
    
    fields.forEach(field => {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`${field} is required`);
      }
    });
    
    return errors;
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateStatus(status, allowedStatuses) {
    return allowedStatuses.includes(status);
  }

  static validatePagination(page, limit, maxLimit = 100) {
    const errors = [];
    
    if (page && (isNaN(page) || page < 1)) {
      errors.push('Page must be a positive number');
    }
    
    if (limit && (isNaN(limit) || limit < 1 || limit > maxLimit)) {
      errors.push(`Limit must be between 1 and ${maxLimit}`);
    }
    
    return errors;
  }

  static sanitizeInput(input) {
    if (typeof input === 'string') {
      return input.trim();
    }
    return input;
  }
} 