# JWT Authentication Implementation

This document describes the JWT authentication system implemented in the ticketing system.

## Overview

The authentication system provides secure user registration, login, and token-based authentication using JSON Web Tokens (JWT).

## Features

- **User Registration**: Create new user accounts with email and password
- **User Login**: Authenticate users and receive JWT tokens
- **Password Hashing**: Secure password storage using bcrypt
- **Token Management**: JWT token generation, verification, and refresh
- **Protected Routes**: Middleware for securing API endpoints
- **Profile Management**: Get and update user profiles
- **Password Updates**: Secure password change functionality

## API Endpoints

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "organisationId": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "organisationId": 1,
    "organisation": {
      "id": 1,
      "name": "Acme Corp"
    }
  },
  "message": "User registered successfully"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "organisationId": 1,
      "organisation": {
        "id": 1,
        "name": "Acme Corp"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "organisationId": 1,
    "organisation": {
      "id": 1,
      "name": "Acme Corp"
    }
  },
  "message": "Profile retrieved successfully"
}
```

#### PATCH `/api/auth/password`
Update user password (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### POST `/api/auth/refresh`
Refresh JWT token.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Authentication Middleware

### `authenticateToken`
Verifies JWT token and adds user information to request object.

```javascript
import { authenticateToken } from '../middleware/auth.js';

// Protect a route
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains decoded token information
  res.json({ user: req.user });
});
```

### `optionalAuth`
Optionally authenticates JWT token (useful for public routes that can work with or without authentication).

```javascript
import { optionalAuth } from '../middleware/auth.js';

router.get('/public', optionalAuth, (req, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is not authenticated
  }
});
```

### `requireOrganisation`
Ensures user belongs to a specific organisation.

```javascript
import { requireOrganisation } from '../middleware/auth.js';

router.get('/org/:id/data', authenticateToken, requireOrganisation('id'), (req, res) => {
  // User belongs to the specified organisation
});
```

### `requireOwnership`
Ensures user is accessing their own resource.

```javascript
import { requireOwnership } from '../middleware/auth.js';

router.get('/users/:id/profile', authenticateToken, requireOwnership('id'), (req, res) => {
  // User is accessing their own profile
});
```

## Frontend Integration

### Authentication Functions

The frontend includes helper functions for authentication:

```javascript
import { login, register, logout, getProfile, isAuthenticated } from './api.js';

// Login
const result = await login({ email: 'user@example.com', password: 'password' });

// Register
const user = await register({ name: 'John', email: 'john@example.com', password: 'password', organisationId: 1 });

// Check authentication status
if (isAuthenticated()) {
  // User is logged in
}

// Logout
logout();
```

### Token Storage

JWT tokens are automatically stored in localStorage when logging in and removed when logging out.

### Automatic Token Inclusion

API calls automatically include the JWT token in the Authorization header:

```javascript
// The getAuthHeaders() function automatically includes the token
const response = await fetch('/api/protected', {
  headers: getAuthHeaders()
});
```

## Security Features

### Password Security
- Passwords are hashed using bcrypt with 12 salt rounds
- Minimum password length of 6 characters
- Password validation on registration and updates

### Token Security
- JWT tokens expire after 24 hours (configurable)
- Tokens include user ID, email, organisation ID, and name
- Secure token verification with proper error handling

### Input Validation
- Email format validation
- Required field validation
- Type checking for numeric fields
- Duplicate email prevention

## Configuration

### Environment Variables

Set these environment variables for production:

```bash
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
```

### Default Configuration

If environment variables are not set, the system uses these defaults:

- `JWT_SECRET`: 'your-secret-key-change-in-production'
- `JWT_EXPIRES_IN`: '24h'
- `JWT_REFRESH_EXPIRES_IN`: '7d'

## Database Schema Updates

The user table has been updated to include authentication fields:

```sql
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    organisation_id INTEGER REFERENCES organisation(id)
);
```

## Testing the Authentication

### Using the Seed Data

The database includes seed data with test users:

- **Alice**: alice@acme.com / password123
- **Bob**: bob@acme.com / password123  
- **Carol**: carol@globex.com / password123

### Example API Calls

```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","organisationId":1}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"password123"}'

# Get profile (with token)
curl -X GET http://localhost:4000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

The authentication system provides clear error messages for common issues:

- Invalid email or password
- User already exists
- Invalid or expired token
- Missing required fields
- Invalid email format
- Password too short
- Organisation not found

## Best Practices

1. **Always use HTTPS in production** for secure token transmission
2. **Change the JWT secret** in production environments
3. **Implement rate limiting** for login and registration endpoints
4. **Add password complexity requirements** for production use
5. **Consider implementing refresh tokens** for better security
6. **Log authentication events** for security monitoring
7. **Implement account lockout** after failed login attempts 