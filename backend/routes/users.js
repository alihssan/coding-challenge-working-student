import express from 'express';
import { UserController } from '../controllers/UserController.js';
import { validateUser, validatePagination } from '../middleware/validation.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const userController = new UserController();

// GET /users - Get all users with optional filtering (admin only)
router.get('/', authenticateToken, requireAdmin, validatePagination, userController.getAllUsers);

// GET /users/stats - Get user statistics (admin only)
router.get('/stats', authenticateToken, requireAdmin, userController.getUserStats);

// GET /users/:id - Get a specific user (admin only)
router.get('/:id', authenticateToken, requireAdmin, userController.getUserById);

// POST /users - Create a new user (admin only)
router.post('/', authenticateToken, requireAdmin, validateUser, userController.createUser);

// PATCH /users/:id - Update a user (admin only)
router.patch('/:id', authenticateToken, requireAdmin, validateUser, userController.updateUser);

// DELETE /users/:id - Delete a user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);

export default router; 