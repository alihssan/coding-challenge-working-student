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

The database is automatically seeded when you start the Docker containers. The `db/schema.sql` file contains comprehensive seed data that is automatically executed by PostgreSQL on first startup.

**No manual seeding required!** The database will be populated with:

**To reseed the database (if needed):**
```bash
# Restart Docker containers to reseed
docker compose down
docker compose up

# Test the seeding (optional)
./test-schema-seeding.sh
```

The schema file will populate the database with:
- 10 sample organisations
- 21 sample users
- 35 sample tickets with various statuses

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
- Alice: `alice@acme.com` / `password123` (Acme Corp)
- Bob: `bob@acme.com` / `password123` (Acme Corp)
- Carol: `carol@globex.com` / `password123` (Globex Inc)
- Sarah: `sarah@techcorp.com` / `password123` (TechCorp Solutions)
- Michael: `michael@techcorp.com` / `password123` (TechCorp Solutions)
- James: `james@digitalinnovations.com` / `password123` (Digital Innovations Ltd)
- Admin: `admin@system.com` / `password123` (Admin - can see all organizations)
- And 15 more users across 10 organizations...

**Testing Authentication:**
```bash
# Test the authentication system
cd backend
node test-auth.js
```

See `docs/JWT-Authentication.md` for detailed documentation.

#### Row-Level Security (RLS)

The system implements database-level Row-Level Security using TypeORM:

**Features:**
- Users can only see tickets from their own organisation
- Admin users can see all tickets across all organisations
- Database-level enforcement (impossible to bypass)
- TypeORM integration with custom repository
- Comprehensive RLS policies for SELECT, INSERT, UPDATE, DELETE
- Admin users cannot create tickets (business rule enforced by RLS)
- Regular users can only modify tickets from their organisation
- Performance optimized with proper indexes

**Implementation:**
- PostgreSQL RLS policies
- Custom TypeORM repository with RLS support
- JWT token integration for user context
- Comprehensive error handling

**Testing RLS:**
```bash
# Test RLS policies
./test-rls.sh

# Login as Alice (Acme Corp) - should only see Acme Corp tickets
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"password123"}'

# Login as Carol (Globex Inc) - should only see Globex Inc tickets  
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"carol@globex.com","password":"password123"}'

# Login as Admin - should see all tickets but cannot create tickets
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.com","password":"password123"}'
```

See `docs/TYPEORM-RLS-IMPLEMENTATION.md` for detailed documentation.

#### Database Migrations

The system includes a proper migration system:

**Features:**
- TypeORM-compatible migration runner
- SQL-based migrations for complex operations
- Migration tracking and rollback support
- Docker-compatible migration scripts

**Running Migrations:**
```bash
# Run migrations
npm run migrate

# Run migrations in Docker
npm run migrate:docker
```

#### Frontend-Backend Integration

The frontend now connects to the real backend API:

**Features:**
- Real API calls replacing fake data
- Automatic JWT token inclusion
- Error handling and response processing
- Filtering and pagination support

**API Functions:**
- `getTickets(filters)` - Get tickets with filtering
- `createTicket(data)` - Create new tickets
- `updateTicket(id, data)` - Update tickets
- `deleteTicket(id)` - Delete tickets
- `getTicketStats()` - Get ticket statistics

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
