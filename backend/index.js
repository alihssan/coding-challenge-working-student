import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { config } from './config/app.js';
import { initializeDatabase } from './db/typeorm.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import ticketsRouter from './routes/tickets.js';
import usersRouter from './routes/users.js';
import organisationsRouter from './routes/organisations.js';
import authRouter from './routes/auth.js';

dotenv.config();
const app = express();

// Security middleware
app.use(helmet());
app.use(cors(config.cors));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/ping', (_, res) => {
  res.json({ 
    message: 'pong',
    timestamp: new Date().toISOString(),
    environment: config.app.environment
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/tickets', ticketsRouter);
app.use('/api/users', usersRouter);
app.use('/api/organisations', organisationsRouter);

// API Documentation
app.get('/api', (_, res) => {
  res.json({
    message: config.app.name,
    version: config.app.version,
    environment: config.app.environment,
    endpoints: {
      auth: {
        base: '/api/auth',
        operations: ['POST'],
        endpoints: {
          register: '/api/auth/register',
          login: '/api/auth/login',
          refresh: '/api/auth/refresh',
          profile: '/api/auth/profile (GET)',
          password: '/api/auth/password (PATCH)'
        }
      },
      tickets: {
        base: '/api/tickets',
        operations: ['GET', 'POST', 'PATCH', 'DELETE'],
        stats: '/api/tickets/stats'
      },
      users: {
        base: '/api/users',
        operations: ['GET', 'POST', 'PATCH', 'DELETE'],
        stats: '/api/users/stats'
      },
      organisations: {
        base: '/api/organisations',
        operations: ['GET', 'POST', 'PATCH', 'DELETE'],
        stats: '/api/organisations/stats'
      }
    },
    features: [
      'JWT Authentication',
      'User registration and login',
      'Password hashing with bcrypt',
      'Token refresh functionality',
      'Pagination support',
      'Filtering by status, organisation, user',
      'Statistics endpoints',
      'Input validation',
      'Error handling'
    ]
  });
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    
    app.listen(config.app.port, () => {
      console.log(`🚀 ${config.app.name} running at http://localhost:${config.app.port}`);
      console.log(`📚 API Documentation: http://localhost:${config.app.port}/api`);
      console.log(`🌍 Environment: ${config.app.environment}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
