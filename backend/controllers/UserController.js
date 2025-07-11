import { UserService } from '../services/UserService.js';
import { ApiResponse } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  getAllUsers = asyncHandler(async (req, res) => {
    const filters = {
      organisation_id: req.query.organisation_id,
      page: req.query.page,
      limit: req.query.limit
    };

    const result = await this.userService.findAll(filters);
    
    return ApiResponse.success(res, result.users, 'Users retrieved successfully', 200, {
      pagination: result.pagination
    });
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await this.userService.findById(req.params.id);
    return ApiResponse.success(res, user, 'User retrieved successfully');
  });

  createUser = asyncHandler(async (req, res) => {
    const user = await this.userService.create(req.body);
    return ApiResponse.created(res, user, 'User created successfully');
  });

  updateUser = asyncHandler(async (req, res) => {
    const user = await this.userService.update(req.params.id, req.body);
    return ApiResponse.success(res, user, 'User updated successfully');
  });

  deleteUser = asyncHandler(async (req, res) => {
    await this.userService.delete(req.params.id);
    return ApiResponse.success(res, null, 'User deleted successfully');
  });

  getUserStats = asyncHandler(async (req, res) => {
    const stats = await this.userService.getUserStats();
    return ApiResponse.success(res, stats, 'User statistics retrieved successfully');
  });
} 