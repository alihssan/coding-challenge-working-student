# Comprehensive Guide - Ticketing System

## Table of Contents
1. [Project Overview](#project-overview)
2. [Repository Structure](#repository-structure)
3. [Architecture Overview](#architecture-overview)
4. [Authentication System](#authentication-system)
5. [Security Implementation](#security-implementation)
6. [Database Design](#database-design)
7. [API Documentation](#api-documentation)
8. [Frontend Implementation](#frontend-implementation)
9. [Docker Setup](#docker-setup)
10. [Development Workflow](#development-workflow)
11. [Testing](#testing)
12. [Deployment](#deployment)

## Project Overview

This is a full-stack ticketing system built with modern technologies and security best practices. The system allows users to create, manage, and track support tickets within their organizations, with comprehensive role-based access control and data isolation.

### Key Features
- **Multi-tenant Architecture**: Organizations are completely isolated
- **Role-Based Access Control**: Admin and regular user roles
- **JWT Authentication**: Secure token-based authentication with obfuscation
- **Row-Level Security**: Database-level data isolation
- **Real-time Updates**: Frontend-backend integration
- **Docker Support**: Complete containerized deployment
- **Comprehensive Security**: Multiple security layers

### Technology Stack
- **Frontend**: React + Vite
- **Backend**: Node.js + Express + TypeORM
- **Database**: PostgreSQL with Row-Level Security
- **Authentication**: JWT with obfuscation
- **Containerization**: Docker + Docker Compose
- **Security**: Helmet, CORS, Input validation

## Repository Structure

```
coding-challenge-working-student-1/
├── backend/                          # Backend API server
│   ├── config/                       # Configuration files
│   │   ├── app.js                    # Main application config
│   │   └── database.js               # Database configuration
│   ├── constants/                    # Application constants
│   │   └── index.js                  # HTTP status codes, etc.
│   ├── controllers/                  # HTTP request handlers
│   │   ├── AuthController.js         # Authentication endpoints
│   │   ├── OrganisationController.js # Organization management
│   │   ├── TicketController.js       # Ticket CRUD operations
│   │   └── UserController.js         # User management
│   ├── db/                          # Database layer
│   │   ├── entities/                 # TypeORM entities
│   │   │   ├── Organisation.js       # Organization model
│   │   │   ├── Ticket.js             # Ticket model
│   │   │   └── User.js               # User model
│   │   ├── repositories/             # Custom repositories
│   │   │   └── TicketRepository.js   # RLS-enabled repository
│   │   ├── index.js                  # Database connection
│   │   ├── typeorm.js                # TypeORM configuration
│   │   └── migrate.js                # Migration runner
│   ├── middleware/                   # Express middleware
│   │   ├── auth.js                   # JWT authentication
│   │   ├── errorHandler.js           # Error handling
│   │   ├── validation.js             # Input validation
│   │   └── asyncHandler.js           # Async error wrapper
│   ├── migrations/                   # Database migrations
│   │   ├── 001_add_timestamp_columns.sql
│   │   └── run-migrations.js
│   ├── routes/                       # API route definitions
│   │   ├── auth.js                   # Authentication routes
│   │   ├── organisations.js          # Organization routes
│   │   ├── tickets.js                # Ticket routes
│   │   └── users.js                  # User routes
│   ├── services/                     # Business logic layer
│   │   ├── AuthService.js            # Authentication logic
│   │   ├── ObfuscatedJWTService.js   # JWT obfuscation
│   │   ├── OrganisationService.js    # Organization logic
│   │   ├── TicketService.js          # Ticket business logic
│   │   ├── TicketServiceRLS.js       # RLS-enabled service
│   │   ├── TicketServiceTypeORM.js   # TypeORM service
│   │   └── UserService.js            # User management logic
│   ├── utils/                        # Utility functions
│   │   ├── response.js               # API response helpers
│   │   └── validation.js             # Validation utilities
│   ├── tests/                        # Test files and scripts
│   │   ├── test-auth.js              # Authentication tests
│   │   ├── test-rls.sh               # RLS testing script
│   │   └── README.md                 # Testing documentation
│   ├── index.js                      # Main server file
│   ├── package.json                  # Backend dependencies
│   ├── .env                          # Environment variables
│   ├── .env.example                  # Environment template
│   └── nodemon.json                  # Development configuration
├── frontend/                         # React frontend application
│   ├── src/                          # Source code
│   │   ├── components/               # React components
│   │   │   ├── Auth.jsx              # Authentication component
│   │   │   └── Tickets.jsx           # Ticket management component
│   │   ├── api.js                    # API client functions
│   │   ├── App.jsx                   # Main application component
│   │   └── main.jsx                  # Application entry point
│   ├── index.html                    # HTML template
│   ├── package.json                  # Frontend dependencies
│   └── vite.config.js                # Vite configuration
├── db/                               # Database schema and seeds
│   └── schema.sql                    # Complete database schema
├── docs/                             # Documentation
│   ├── AUTHENTICATION-SUMMARY.md     # Authentication overview
│   ├── JWT-Authentication.md         # JWT implementation details
│   ├── TASK-1-BACKEND-POSTGRESQL.md  # Backend task documentation
│   ├── TASK-2-FRONTEND-BACKEND.md    # Frontend integration docs
│   ├── TASK-3-SECURITY-BEST-PRACTICES.md # Security implementation
│   ├── TYPEORM-RLS-IMPLEMENTATION.md # RLS implementation details
│   ├── Ticketing-System-API.postman_collection.json # API collection
│   └── COMPREHENSIVE-GUIDE.md        # This comprehensive guide
├── docker-compose.yml                # Docker services configuration
├── package.json                      # Root package.json
├── README.md                         # Main project documentation
└── seed-docker.sh                    # Database seeding script
```

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
│                 │    │                 │    │                 │
│ - Authentication│    │ - JWT Auth      │    │ - RLS Policies  │
│ - Ticket Mgmt   │    │ - API Routes    │    │ - Data Isolation│
│ - Real-time UI  │    │ - Business Logic│    │ - Migrations    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **Authentication**: User logs in → JWT token generated with obfuscation
2. **API Requests**: Frontend sends requests with JWT token
3. **Authorization**: Backend validates token and sets user context
4. **Database Access**: RLS policies enforce data isolation
5. **Response**: Filtered data returned to frontend

### Security Layers
1. **Frontend**: Token storage, input validation
2. **Network**: HTTPS, CORS protection
3. **Backend**: JWT validation, input sanitization, rate limiting
4. **Database**: Row-Level Security, parameterized queries

## Authentication System

### JWT Implementation
The authentication system uses JWT tokens with multiple security enhancements:

#### Token Structure
```javascript
// Standard JWT (before obfuscation)
{
  "userId": 1,
  "email": "user@example.com",
  "organisationId": 1,
  "role": "user",
  "iat": 1634567890,
  "exp": 1634654290
}

// Obfuscated JWT (after obfuscation)
{
  "data": "eyJ1aWQiOjEsImVtIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsIm9yZyI6MSwicmwiOiJ1c2VyIiwidHMiOjE2MzQ1Njc4OTB9",
  "v": "1",
  "t": 1634567890
}
```

#### Obfuscation Process
1. **Data Preparation**: User data is structured with abbreviated field names
2. **XOR Encryption**: Data is encrypted using XOR cipher with secret key
3. **Base64 Encoding**: Encrypted data is base64 encoded
4. **JWT Creation**: Obfuscated data is embedded in JWT payload

#### Authentication Flow
```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database

    U->>F: Enter credentials
    F->>B: POST /api/auth/login
    B->>D: Verify user credentials
    D->>B: Return user data
    B->>B: Generate obfuscated JWT
    B->>F: Return token + user data
    F->>F: Store token in localStorage
    F->>B: API requests with token
    B->>B: Deobfuscate and validate token
    B->>D: Query with user context
    D->>B: Return filtered data (RLS)
    B->>F: Return response
```

### Key Files
- `backend/services/AuthService.js`: Main authentication logic
- `backend/services/ObfuscatedJWTService.js`: JWT obfuscation implementation
- `backend/middleware/auth.js`: Authentication middleware
- `backend/controllers/AuthController.js`: Authentication endpoints

## Security Implementation

### Multi-Layer Security Approach

#### 1. JWT Token Security
- **Obfuscation**: User data encrypted in tokens
- **Short Expiry**: 2-hour access tokens
- **Refresh Tokens**: 7-day refresh tokens
- **Token Blacklisting**: Support for token revocation

#### 2. Row-Level Security (RLS)
PostgreSQL RLS policies enforce data isolation at the database level:

```sql
-- Users can only see tickets from their organization
CREATE POLICY "Users can only see their organisation's tickets" ON tickets
    FOR ALL
    USING (
        organisation_id = (
            SELECT organisation_id 
            FROM users 
            WHERE id = current_setting('app.current_user_id')::integer
        )
    );
```

#### 3. Application Security
- **Input Validation**: Comprehensive request validation
- **Error Sanitization**: No sensitive data in error messages
- **CORS Protection**: Controlled cross-origin access
- **Security Headers**: Helmet.js for HTTP security headers
- **Rate Limiting**: Protection against brute force attacks

#### 4. Password Security
- **bcrypt Hashing**: 12 rounds of bcrypt hashing
- **Password Validation**: Strong password requirements
- **Secure Storage**: Passwords never stored in plain text

### Security Benefits
- **Data Isolation**: Users cannot access other organizations' data
- **Token Protection**: JWT tokens are obfuscated and secure
- **Database Security**: RLS prevents unauthorized data access
- **Input Protection**: All inputs validated and sanitized
- **Error Security**: No sensitive information leaked in errors

## Database Design

### Entity Relationships
```mermaid
erDiagram
    ORGANISATION ||--o{ USER : has
    ORGANISATION ||--o{ TICKET : contains
    USER ||--o{ TICKET : creates
    USER {
        int id PK
        string name
        string email UK
        string password
        string role
        int organisation_id FK
        timestamp created_at
        timestamp updated_at
    }
    ORGANISATION {
        int id PK
        string name
        timestamp created_at
        timestamp updated_at
    }
    TICKET {
        int id PK
        string title
        text description
        string status
        int user_id FK
        int organisation_id FK
        timestamp created_at
        timestamp updated_at
    }
```

### Database Schema
```sql
-- Users table with organization relationship
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    organisation_id INTEGER REFERENCES organisations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Organizations table
CREATE TABLE organisations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tickets table with user and organization relationships
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'open',
    user_id INTEGER REFERENCES users(id),
    organisation_id INTEGER REFERENCES organisations(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Row-Level Security Implementation
- **RLS Policies**: Database-level access control
- **User Context**: PostgreSQL session variables for user identification
- **Organization Isolation**: Users can only access their organization's data
- **Admin Override**: Admin users can access all data but with restrictions

## API Documentation

### Authentication Endpoints

#### POST /api/auth/register
Register a new user account.
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "organisation_id": 1
}
```

#### POST /api/auth/login
Authenticate user and receive JWT token.
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### GET /api/auth/profile
Get authenticated user's profile information.

#### PATCH /api/auth/password
Update user password.
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

### Ticket Endpoints

#### GET /api/tickets
Get tickets with filtering and pagination.
```
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 10)
- status: Filter by status
- search: Search in title/description
```

#### POST /api/tickets
Create a new ticket.
```json
{
  "title": "Bug Report",
  "description": "Application crashes on login",
  "status": "open"
}
```

#### PATCH /api/tickets/:id
Update an existing ticket.
```json
{
  "title": "Updated Bug Report",
  "status": "in_progress"
}
```

#### DELETE /api/tickets/:id
Delete a ticket.

### User Endpoints (Admin Only)

#### GET /api/users
Get all users (admin only).

#### POST /api/users
Create a new user (admin only).

#### PATCH /api/users/:id
Update user information (admin only).

#### DELETE /api/users/:id
Delete a user (admin only).

### Organization Endpoints (Admin Only)

#### GET /api/organisations
Get all organizations (admin only).

#### POST /api/organisations
Create a new organization (admin only).

#### PATCH /api/organisations/:id
Update organization (admin only).

#### DELETE /api/organisations/:id
Delete organization (admin only).

## Frontend Implementation

### Component Structure
```
src/
├── components/
│   ├── Auth.jsx           # Authentication forms
│   └── Tickets.jsx        # Ticket management interface
├── api.js                 # API client functions
├── App.jsx                # Main application component
└── main.jsx               # Application entry point
```

### Key Features
- **Real-time Updates**: Automatic data refresh
- **Form Validation**: Client-side input validation
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Mobile-friendly interface
- **Token Management**: Automatic JWT token handling

### API Integration
```javascript
// Example API call with authentication
export async function getTickets(filters = {}) {
  const response = await fetch(`${API_URL}/api/tickets?${new URLSearchParams(filters)}`, {
    headers: getAuthHeaders()
  });
  return handleResponse(response);
}
```

## Docker Setup

### Services Configuration
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:4000

  backend:
    build: ./backend
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_USER=postgres
      - DB_PASSWORD=postgres
      - DB_NAME=ticketing_db
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=ticketing_db
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/schema.sql:/docker-entrypoint-initdb.d/schema.sql
```

### Running with Docker
```bash
# Start all services
docker-compose up

# Start in detached mode
docker-compose up -d

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build
```

## Development Workflow

### Local Development Setup
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd coding-challenge-working-student-1
   ```

2. **Environment Setup**
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   ```

3. **Database Setup**
   ```bash
   # Using Docker
   docker-compose up postgres
   
   # Or local PostgreSQL
   createdb ticketing_db
   psql ticketing_db < ../db/schema.sql
   ```

4. **Start Development Servers**
   ```bash
   # Backend
   cd backend
   npm run dev
   
   # Frontend (new terminal)
   cd frontend
   npm run dev
   ```

### Code Organization
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle data access
- **Middleware**: Request processing and validation
- **Entities**: Database models
- **Utils**: Helper functions

### Development Best Practices
- **TypeORM**: Use TypeORM for database operations
- **Validation**: Always validate input data
- **Error Handling**: Use centralized error handling
- **Testing**: Write tests for critical functionality
- **Documentation**: Keep documentation updated

## Testing

### Authentication Testing
```bash
# Test login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"password123"}'
```

### RLS Testing
```bash
# Test as regular user
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer USER_TOKEN"

# Test as admin
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### JWT Obfuscation Testing
```bash
# Get obfuscated token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"password123"}'

# Decode token at jwt.io to see obfuscated data
```

### Test Scripts
- `backend/tests/test-auth.js`: Authentication tests
- `backend/tests/test-rls.sh`: RLS policy tests
- `backend/tests/test-password.js`: Password validation tests

## Deployment

### Production Environment Variables
```env
NODE_ENV=production
JWT_SECRET=your-super-secure-secret-key
JWT_OBFUSCATION_KEY=your-super-secret-obfuscation-key
DATABASE_URL=postgresql://user:pass@host:port/db?sslmode=require
CORS_ORIGIN=https://yourdomain.com
PORT=4000
```

### Security Checklist
- [ ] Change default JWT secrets
- [ ] Set up HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up database SSL
- [ ] Enable security headers
- [ ] Set up monitoring and logging
- [ ] Configure rate limiting
- [ ] Set up backup strategy

### Performance Considerations
- **Database Indexing**: Index frequently queried columns
- **Connection Pooling**: Use database connection pooling
- **Caching**: Implement caching for frequently accessed data
- **CDN**: Use CDN for static assets
- **Load Balancing**: Set up load balancer for high availability

## Conclusion

This ticketing system implements a comprehensive, secure, and scalable solution with:

- **Multi-tenant architecture** with complete data isolation
- **Advanced JWT authentication** with obfuscation
- **Database-level security** with Row-Level Security
- **Modern frontend** with real-time updates
- **Docker support** for easy deployment
- **Comprehensive testing** and documentation

The system follows industry best practices and provides a solid foundation for a production-ready ticketing application. 