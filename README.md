# Coding Challenge - Working Student

## Docker Setup

This project includes Docker Compose configuration to run the entire application stack in containers.

### Prerequisites

- Docker
- Docker Compose

### Running with Docker Compose

1. **Start all services:**
   ```bash
   docker-compose up
   ```

2. **Start services in detached mode:**
   ```bash
   docker-compose up -d
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

4. **Rebuild and start services:**
   ```bash
   docker-compose up --build
   ```

### Services

- **Frontend**: React app running on http://localhost:5173
- **Backend**: Node.js API running on http://localhost:4000
- **Database**: PostgreSQL running on localhost:5432

### Development

The Docker setup includes volume mounts for development, so changes to your code will be reflected immediately without rebuilding containers.

### Database

The PostgreSQL database will be automatically initialized with the schema from `db/schema.sql` when the container starts for the first time.

#### Seeding the Database

To populate the database with sample data, you can run the seed script:

```bash
# Option 1: Run seed script directly (TypeORM)
./seed-docker.sh

# Option 2: Run seed manually (TypeORM)
docker-compose exec backend npm run seed:typeorm

# Option 3: Run seed locally (TypeORM)
cd backend
npm run seed:typeorm

# Option 4: Legacy SQL seed (if needed)
docker-compose exec backend npm run seed
```

The seed script will populate the database with:
- 5 sample organisations
- 10 sample users
- 15 sample tickets with various statuses

#### API Endpoints

The backend now includes a complete REST API with TypeORM following industry best practices:

- **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- **Tickets**: `GET/POST/PATCH/DELETE /api/tickets` (authenticated users only)
- **Users**: `GET/POST/PATCH/DELETE /api/users` (admin only)
- **Organisations**: `GET/POST/PATCH/DELETE /api/organisations` (admin only)
- **Statistics**: `/api/tickets/stats`, `/api/users/stats`, `/api/organisations/stats`

Visit `http://localhost:4000/api` for comprehensive API documentation.

#### JWT Authentication

The system now includes comprehensive JWT authentication:

**Features:**
- User registration and login with email/password
- Secure password hashing with bcrypt
- JWT token generation and verification
- Protected routes with authentication middleware
- Role-based access control (admin vs regular users)
- Token refresh functionality
- Profile management and password updates

**Test Users (from seed data):**
- Alice: `alice@acme.com` / `password123`
- Bob: `bob@acme.com` / `password123`
- Carol: `carol@globex.com` / `password123`

**Testing Authentication:**
```bash
# Test the authentication system
cd backend
node test-auth.js
```

See `docs/JWT-Authentication.md` for detailed documentation.

#### Backend Architecture

The backend follows industry best practices with a clean, scalable architecture:

```
backend/
├── config/           # Configuration files
├── constants/        # Application constants
├── controllers/      # HTTP request handlers
├── db/              # Database connection and seeds
├── entities/        # TypeORM entities
├── middleware/      # Custom middleware
├── routes/          # API route definitions
├── services/        # Business logic layer
├── utils/           # Utility functions
└── tests/           # Test structure
```

**Key Features:**
- **JWT Authentication**: Secure token-based authentication with bcrypt password hashing
- **Role-Based Access Control**: Admin and user role management
- **Separation of Concerns**: Controllers, Services, Repositories
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **Pagination**: Built-in pagination support
- **Filtering**: Query-based filtering for all endpoints
- **Statistics**: Analytics endpoints for data insights
- **Type Safety**: TypeORM with proper entity relationships

## Manual Setup

If you prefer to run the services manually without Docker, see the individual README files in the `frontend/` and `backend/` directories.
