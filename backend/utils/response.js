import { HTTP_STATUS } from '../constants/index.js';

export class ApiResponse {
  static success(res, data, statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  static error(res, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    const response = {
      success: false,
      timestamp: new Date().toISOString(),
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, data) {
    return this.success(res, data, HTTP_STATUS.CREATED);
  }

  static notFound(res) {
    return this.error(res, HTTP_STATUS.NOT_FOUND);
  }

  static badRequest(res, errors = null) {
    return this.error(res, HTTP_STATUS.BAD_REQUEST, errors);
  }

  static validationError(res, errors) {
    return this.error(res, HTTP_STATUS.BAD_REQUEST, errors);
  }
} 