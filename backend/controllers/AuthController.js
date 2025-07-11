import { AuthService } from '../services/AuthService.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  register = asyncHandler(async (req, res) => {
    const { name, email, password, organisationId } = req.body;

    // Validate required fields
    if (!name || !email || !password || !organisationId) {
      return ApiResponse.error(res, 'All fields are required', 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiResponse.error(res, 'Invalid email format', 400);
    }

    // Validate password strength
    if (password.length < 6) {
      return ApiResponse.error(res, 'Password must be at least 6 characters long', 400);
    }

    const user = await this.authService.register({
      name,
      email,
      password,
      organisationId
    });

    return ApiResponse.created(res, user, 'User registered successfully');
  });

  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return ApiResponse.error(res, 'Email and password are required', 400);
    }

    const result = await this.authService.login(email, password);

    return ApiResponse.success(res, result, 'Login successful');
  });

  getProfile = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await this.authService.getUserById(userId);
    
    return ApiResponse.success(res, user, 'Profile retrieved successfully');
  });

  updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return ApiResponse.error(res, 'Current password and new password are required', 400);
    }

    // Validate new password strength
    if (newPassword.length < 6) {
      return ApiResponse.error(res, 'New password must be at least 6 characters long', 400);
    }

    const user = await this.authService.updatePassword(userId, currentPassword, newPassword);
    
    return ApiResponse.success(res, user, 'Password updated successfully');
  });

  refreshToken = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return ApiResponse.error(res, 'Token is required', 400);
    }

    const newToken = await this.authService.refreshToken(token);
    
    return ApiResponse.success(res, { token: newToken }, 'Token refreshed successfully');
  });
} 