import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../db/entities/User.js';
import { getRepository } from '../db/typeorm.js';
import { config } from '../config/app.js';
import { ObfuscatedJWTService } from './ObfuscatedJWTService.js';

export class AuthService {
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    this.obfuscatedJWTService = new ObfuscatedJWTService();
  }

  get userRepository() {
    return getRepository(User);
  }

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user (without password)
   */
  async register(userData) {
    const { name, email, password, organisation_id } = userData;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      organisationId: organisation_id
    });

    const savedUser = await this.userRepository.save(user);

    // Return user without password
    const { password: _, ...userWithoutPassword } = savedUser;
    return userWithoutPassword;
  }

  /**
   * Authenticate user and generate JWT token
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Object} User data and JWT token
   */
  async login(email, password) {
    // Find user by email
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['organisation']
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const error = new Error('Invalid password');
      error.statusCode = 400;
      throw error;
    }

    // Generate obfuscated JWT token
    const token = this.obfuscatedJWTService.generateToken(user);

    // Return user data and token
    const { password: _, ...userWithoutPassword } = user;
    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Generate JWT token for user
   * @param {Object} user - User object
   * @returns {string} JWT token
   */
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      organisationId: user.organisationId,
      name: user.name,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });
  }

  /**
   * Verify JWT token (legacy method)
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify obfuscated JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token payload
   */
  verifyObfuscatedToken(token) {
    return this.obfuscatedJWTService.verifyToken(token);
  }

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Object} User object (without password)
   */
  async getUserById(userId) {
    const user = await this.userRepository.findOne({ 
      where: { id: userId },
      relations: ['organisation']
    });

    if (!user) {
      throw new Error('User not found');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Update user password
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Object} Updated user (without password)
   */
  async updatePassword(userId, currentPassword, newPassword) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    await this.userRepository.save(user);

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Refresh token (optional - for token refresh functionality)
   * @param {string} token - Current JWT token
   * @returns {string} New JWT token
   */
  async refreshToken(token) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret, { ignoreExpiration: true });
      const user = await this.getUserById(decoded.userId);
      return this.generateToken(user);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}
