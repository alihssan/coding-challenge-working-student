import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const authController = new AuthController();

// POST /auth/register - Register a new user
router.post('/register', authController.register);

// POST /auth/login - Login user
router.post('/login', authController.login);

// POST /auth/refresh - Refresh JWT token
router.post('/refresh', authController.refreshToken);

// GET /auth/profile - Get current user profile (protected)
router.get('/profile', authenticateToken, authController.getProfile);

// PATCH /auth/password - Update user password (protected)
router.patch('/password', authenticateToken, authController.updatePassword);

export default router; 