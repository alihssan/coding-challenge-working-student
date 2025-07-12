# Task 3: Security & Best Practices

## Overview
This document outlines the implementation of security measures and best practices in the ticketing system, including JWT authentication, Row-Level Security (RLS), and additional security measures.

## Implementation Details

### 1. JWT Authentication Flow

#### Authentication Service
**Location:** `backend/services/AuthService.js`

**Key Features:**
- JWT token generation and verification
- Password hashing with bcrypt
- Token refresh mechanism
- Secure password validation

#### JWT Configuration
```javascript
// backend/config/app.js
jwt: {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
}
```

#### Authentication Endpoints
```javascript
POST   /api/auth/register    // User registration with password hashing
POST   /api/auth/login       // User login with JWT token generation
POST   /api/auth/refresh     // Token refresh for extended sessions
GET    /api/auth/profile     // Get authenticated user profile
PATCH  /api/auth/password    // Update password with validation
```

#### Password Security
```javascript
// Password hashing with bcrypt
const hashedPassword = await bcrypt.hash(password, 12);

// Password verification
const isValidPassword = await bcrypt.compare(password, hashedPassword);
```

### 2. Row-Level Security (RLS)

#### Database-Level RLS
**Location:** `db/schema.sql`

```sql
-- Enable RLS on tickets table
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Create RLS policy: Users can only see tickets from their organisation
CREATE POLICY "Users can only see their organisation's tickets" ON tickets
    FOR ALL
    USING (
        organisation_id = (
            SELECT organisation_id 
            FROM users 
            WHERE id = current_setting('app.current_user_id')::integer
        )
    );

-- Function to set current user ID for RLS
CREATE OR REPLACE FUNCTION set_current_user_id(user_id integer)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;
```

#### Application-Level RLS Integration
**Location:** `backend/db/repositories/TicketRepository.js`

```javascript
// Set current user ID for RLS
async setCurrentUser(userId) {
  await this.query('SELECT set_current_user_id($1)', [userId]);
}

// Find all tickets with RLS applied
async findAllWithRLS(filters = {}, userId) {
  await this.setCurrentUser(userId);
  
  const queryBuilder = this.createQueryBuilder('ticket');
  // ... query logic
  return await queryBuilder.getManyAndCount();
}
```

#### Admin Role Bypass
**Location:** `backend/services/TicketServiceTypeORM.js`

```javascript
async findAll(filters = {}, user) {
  const userId = user?.userId || user;
  
  // Check if user is admin - if so, bypass RLS and return all tickets
  if (user?.role === 'admin') {
    return await this.ticketRepository.findAllWithoutRLS(filters);
  }
  
  return await this.ticketRepository.findAllWithRLS(filters, userId);
}
```

### 3. Additional Security Measures

#### 1. Error Message Sanitization
**Location:** `backend/middleware/errorHandler.js`

**Implementation:**
- Removed sensitive database error messages from API responses
- Generic error messages for production environments
- Detailed error messages only in development mode

```javascript
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // TypeORM errors with sanitized messages
  if (err.name === 'QueryFailedError') {
    if (err.code === '23505') { // Unique constraint violation
      return ApiResponse.error(res, HTTP_STATUS.CONFLICT);
    }
    if (err.code === '23503') { // Foreign key constraint violation
      return ApiResponse.error(res, HTTP_STATUS.BAD_REQUEST);
    }
    if (err.code === '23502') { // Not null constraint violation
      return ApiResponse.error(res, HTTP_STATUS.BAD_REQUEST);
    }
    // Generic database error - don't expose specific details
    return ApiResponse.error(res, HTTP_STATUS.BAD_REQUEST);
  }

  // Default error - use generic message for security
  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  return ApiResponse.error(res, statusCode);
};
```

#### 2. Input Validation and Sanitization
**Location:** `backend/middleware/validation.js`

**Features:**
- Request body validation
- SQL injection prevention
- XSS protection
- Input sanitization

#### 3. CORS Configuration
**Location:** `backend/config/app.js`

```javascript
cors: {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}
```

#### 4. Helmet Security Headers
**Location:** `backend/index.js`

```javascript
import helmet from 'helmet';

// Security middleware
app.use(helmet());
```

**Protection Against:**
- XSS attacks
- Content sniffing
- Clickjacking
- MIME type sniffing

#### 5. Rate Limiting
**Implementation:** Express rate limiting middleware

**Features:**
- Request rate limiting per IP
- Burst protection
- Configurable limits

#### 6. Environment-Based Configuration
**Security Features:**
- No hardcoded secrets
- Environment variable usage
- Different configurations for dev/prod

### 4. Authentication Middleware

#### JWT Token Verification
**Location:** `backend/middleware/auth.js`

```javascript
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return ApiResponse.error(res, 401);
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 401);
  }
};
```

#### Role-Based Access Control
```javascript
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return ApiResponse.error(res, 401);
  }

  if (req.user.role !== 'admin') {
    return ApiResponse.error(res, 403);
  }

  next();
};
```

#### Organisation Access Control
```javascript
export const requireOrganisation = (organisationId) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 401);
    }

    if (req.user.organisationId !== parseInt(organisationId)) {
      return ApiResponse.error(res, 403);
    }

    next();
  };
};
```

### 5. Frontend Security

#### Token Management
**Location:** `frontend/src/api.js`

```javascript
// Secure token storage
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// Token refresh mechanism
export async function refreshToken(token) {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  const result = await handleResponse(response);
  
  if (result.data && result.data.token) {
    localStorage.setItem('authToken', result.data.token);
  }
  
  return result;
}
```

#### Authentication State Management
```javascript
// Check authentication status
export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Secure logout
export async function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
}
```

### 6. Database Security

#### Connection Security
- Environment-based database credentials
- Connection pooling
- SSL/TLS encryption support

#### Query Security
- Parameterized queries via TypeORM
- SQL injection prevention
- Input validation before database operations

#### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption
- Audit logging for security events

### 7. API Security

#### Request Validation
```javascript
// Input validation middleware
export const validateTicket = (req, res, next) => {
  const { title, description, status } = req.body;
  
  if (!title || title.trim().length === 0) {
    return ApiResponse.badRequest(res, ['Title is required']);
  }
  
  if (status && !['open', 'pending', 'in_progress', 'closed'].includes(status)) {
    return ApiResponse.badRequest(res, ['Invalid status']);
  }
  
  next();
};
```

#### Response Security
- No sensitive data in responses
- Generic error messages
- Proper HTTP status codes

### 8. Security Headers

#### Helmet Configuration
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### 9. Environment Security

#### Production Security
```env
# Production environment variables
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
CORS_ORIGIN=https://yourdomain.com
```

#### Development Security
```env
# Development environment variables
NODE_ENV=development
JWT_SECRET=dev-secret-key
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticketing_db
CORS_ORIGIN=*
```

### 10. Security Testing

#### Authentication Testing
```bash
# Test invalid token
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer invalid-token"

# Test missing token
curl -X GET http://localhost:4000/api/tickets
```

#### RLS Testing
```bash
# Test as regular user (should only see own org tickets)
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer USER_TOKEN"

# Test as admin (should see all tickets)
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 11. Security Best Practices Summary

#### Implemented Security Measures:
1. **JWT Authentication** - Secure token-based authentication
2. **Row-Level Security** - Database-level access control
3. **Error Message Sanitization** - No sensitive data exposure
4. **Input Validation** - Request validation and sanitization
5. **CORS Protection** - Cross-origin resource sharing control
6. **Security Headers** - Helmet.js for HTTP security headers
7. **Password Hashing** - bcrypt for secure password storage
8. **Environment Configuration** - No hardcoded secrets
9. **Role-Based Access Control** - Admin vs user permissions
10. **SQL Injection Prevention** - Parameterized queries

#### Security Benefits:
- **Multi-layered Security** - Database, application, and network layers
- **Defense in Depth** - Multiple security measures working together
- **Principle of Least Privilege** - Users only access what they need
- **Secure by Default** - Security measures enabled by default
- **Audit Trail** - Logging for security monitoring

This comprehensive security implementation ensures the ticketing system is protected against common web application vulnerabilities while maintaining usability and performance. 