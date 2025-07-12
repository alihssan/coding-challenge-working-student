import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req, res) => {
    const { name, email, password, organisation_id } = req.body;

    // Validate required fields
    if (!name || !email || !password || !organisation_id) {
      return ApiResponse.error(res, 400, 'All fields are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiResponse.error(res, 400, 'Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      return ApiResponse.error(res, 400, 'Password must be at least 6 characters long');
    }

    const user = await this.authService.register({
      name,
      email,
      password,
      organisation_id
    });

    return ApiResponse.created(res, user);
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return ApiResponse.error(res, 400, 'Email and password are required');
    }

    try {
      const result = await this.authService.login(email, password);
      return ApiResponse.success(res, result);
    } catch (error) {
      // Handle specific error status codes from AuthService
      const statusCode = error.statusCode || 500;
      return ApiResponse.error(res, statusCode, error.message);
    }
  });

  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await this.authService.getUserById(userId);
    
    return ApiResponse.success(res, user);
  });

  updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return ApiResponse.error(res, 400, 'Current password and new password are required');
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return ApiResponse.error(res, 400, 'New password must be at least 6 characters long');
    }

    const user = await this.authService.updatePassword(userId, currentPassword, newPassword);
    
    return ApiResponse.success(res, user);
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return ApiResponse.error(res, 400, 'Token is required');
    }

    const newToken = await this.authService.refreshToken(token);
    
    return ApiResponse.success(res, { token: newToken });
  });
} 