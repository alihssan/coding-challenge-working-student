# Ticketing System - Complete Implementation

## Project Overview

This is a full-stack ticketing system built with Node.js/Express backend, React frontend, and PostgreSQL database. The system implements comprehensive security measures, role-based access control, and follows modern web development best practices.

## Task Completion Status

### ✅ Task 1: Backend ↔ PostgreSQL Connection
**Status:** COMPLETED

**Key Features:**
- TypeORM integration with PostgreSQL
- Database service module (`backend/db/index.js`)
- Entity definitions for Organisation, User, and Ticket
- Migration and seeding scripts
- Repository pattern with custom implementations
- Row-Level Security (RLS) database policies

**Files:**
- `backend/config/database.js` - Database configuration
- `backend/db/typeorm.js` - TypeORM setup
- `backend/db/entities/` - Entity definitions
- `backend/db/repositories/` - Custom repositories
- `db/schema.sql` - Database schema with RLS
- `backend/db/seed-typeorm.js` - Seeding script

### ✅ Task 2: Frontend ↔ Backend Connection
**Status:** COMPLETED

**Key Features:**
- Complete CRUD API endpoints for tickets
- Real API integration replacing fake data
- JWT authentication integration
- Error handling and loading states
- Pagination and filtering support
- Secure token management

**Files:**
- `frontend/src/api.js` - API integration layer
- `backend/routes/tickets.js` - Ticket endpoints
- `backend/controllers/TicketController.js` - Ticket controller
- `backend/services/TicketServiceTypeORM.js` - Ticket service

### ✅ Task 3: Security & Best Practices
**Status:** COMPLETED

**Key Features:**
- JWT token-based authentication
- Row-Level Security (RLS) implementation
- **Additional Security Measure:** Error message sanitization
- Role-based access control (Admin vs User)
- Input validation and sanitization
- Security headers with Helmet.js
- Environment-based configuration

**Files:**
- `backend/services/AuthService.js` - Authentication service
- `backend/middleware/auth.js` - Authentication middleware
- `backend/middleware/errorHandler.js` - Error handling with sanitization
- `backend/middleware/validation.js` - Input validation

## Architecture Overview

### Backend Architecture
```
backend/
├── config/           # Configuration files
├── controllers/      # Request handlers
├── services/         # Business logic
├── middleware/       # Express middleware
├── routes/           # API route definitions
├── db/              # Database layer
│   ├── entities/     # TypeORM entities
│   ├── repositories/ # Custom repositories
│   └── typeorm.js    # TypeORM setup
└── utils/           # Utility functions
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── api.js       # API integration layer
│   ├── App.jsx      # Main application component
│   └── main.jsx     # Application entry point
└── index.html       # HTML template
```

### Database Schema
```
organisation (id, name, created_at, updated_at)
    ↓ (1:N)
users (id, name, email, password, role, organisation_id, created_at, updated_at)
    ↓ (1:N)
tickets (id, title, description, status, user_id, organisation_id, created_at, updated_at)
```

## Security Implementation

### 1. JWT Authentication
- Secure token generation and verification
- Password hashing with bcrypt (12 rounds)
- Token refresh mechanism
- Automatic token inclusion in requests

### 2. Row-Level Security (RLS)
- Database-level access control
- Users can only see tickets from their organisation
- Admin users can access all tickets
- Automatic filtering at database level

### 3. Error Message Sanitization (Additional Security Measure)
**Why this was chosen:**
Error message sanitization is crucial for security because it prevents information disclosure attacks. By removing sensitive database error messages from API responses, we prevent attackers from gaining insights into:
- Database schema structure
- Internal error codes
- System vulnerabilities
- Sensitive data patterns

**Implementation:**
- Generic error messages in production
- Detailed error messages only in development
- No database constraint details exposed
- Proper HTTP status codes without sensitive context

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `GET /api/auth/profile` - Get user profile
- `PATCH /api/auth/password` - Update password

### Tickets
- `GET /api/tickets` - Get all tickets (with filters)
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `GET /api/tickets/stats` - Get ticket statistics

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Organisations
- `GET /api/organisations` - Get all organisations
- `GET /api/organisations/:id` - Get single organisation
- `POST /api/organisations` - Create new organisation
- `PATCH /api/organisations/:id` - Update organisation
- `DELETE /api/organisations/:id` - Delete organisation

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd coding-challenge-working-student-1
   ```

2. **Set up the database**
   ```bash
   # Start PostgreSQL and create database
   createdb ticketing_db
   ```

3. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

4. **Environment configuration**
   ```bash
   # Backend (.env)
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ticketing_db
   JWT_SECRET=your-secret-key
   PORT=4000
   
   # Frontend (.env)
   VITE_API_URL=http://localhost:4000
   ```

5. **Seed the database**
   ```bash
   cd backend
   npm run seed:typeorm
   ```

6. **Start the servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

### Default Users

**Admin User:**
- Email: `ali@donexus.com`
- Password: `password123`
- Role: `admin`
- Organisation: Acme Corp (but can access all)

**Regular Users:**
- Alice: `alice@acme.com` / `password123` (Acme Corp)
- Bob: `bob@acme.com` / `password123` (Acme Corp)
- Carol: `carol@globex.com` / `password123` (Globex Inc)

## Testing

### API Testing
```bash
# Health check
curl http://localhost:4000/ping

# API documentation
curl http://localhost:4000/api

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ali@donexus.com","password":"password123"}'
```

### RLS Testing
```bash
# Test as regular user (should only see own org tickets)
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer USER_TOKEN"

# Test as admin (should see all tickets)
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## Key Features

### Multi-layered Security
- Database-level RLS policies
- Application-level role checks
- Network-level security headers
- Input validation and sanitization

### Role-Based Access Control
- **Admin users**: Can access all tickets across all organisations
- **Regular users**: Can only access tickets from their own organisation
- **Organisation isolation**: Complete data separation between organisations

### Performance Optimizations
- Connection pooling
- Query optimization
- Pagination support
- Efficient RLS implementation

### Developer Experience
- Comprehensive error handling
- Detailed API documentation
- Environment-based configuration
- Hot reloading for development

## Documentation

For detailed implementation information, see:
- [Task 1: Backend ↔ PostgreSQL](TASK-1-BACKEND-POSTGRESQL.md)
- [Task 2: Frontend ↔ Backend](TASK-2-FRONTEND-BACKEND.md)
- [Task 3: Security & Best Practices](TASK-3-SECURITY-BEST-PRACTICES.md)

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeORM** - Object-Relational Mapping
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Fetch API** - HTTP client

### Development
- **Docker** - Containerization
- **nodemon** - Development server
- **ESLint** - Code linting

This implementation provides a production-ready ticketing system with enterprise-grade security, scalability, and maintainability. 