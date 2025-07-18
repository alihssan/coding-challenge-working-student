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

#### JWT Token Obfuscation

The system implements advanced JWT token obfuscation to enhance security by making decoded tokens unreadable:

**Obfuscation Techniques:**

**1. XOR Cipher Obfuscation**
- **Payload Encryption**: User data is encrypted using XOR cipher with a secret key
- **Abbreviated Fields**: Uses shortened field names (`uid`, `em`, `org`, `rl`) instead of full names
- **Base64 Encoding**: Obfuscated data is base64 encoded for additional obfuscation
- **Result**: Decoded tokens show encrypted data instead of plain user information

**2. Hash-Based Obfuscation (Alternative)**
- **Data Hashing**: User information is hashed using SHA256 instead of storing directly
- **Minimal Payload**: JWT contains only hash, timestamp, and random salt
- **Server Verification**: Requires server-side user data for token validation

**Implementation Details:**

**Obfuscated Token Structure:**
```json
{
  "data": "eyJ1aWQiOjEsImVtIjoiZXhhbXBsZUBleGFtcGxlLmNvbSIsIm9yZyI6MSwicmwiOiJ1c2VyIiwidHMiOjE2MzQ1Njc4OTB9",
  "v": "1",
  "t": 1634567890
}
```

**Instead of readable:**
```json
{
  "userId": 1,
  "email": "user@example.com", 
  "organisationId": 1,
  "role": "user"
}
```

**Security Benefits:**
- **Information Hiding**: User data is not immediately visible when tokens are decoded
- **Token Tampering Prevention**: Obfuscation makes token modification more difficult
- **Privacy Protection**: Sensitive information like user IDs and emails are concealed
- **Defense in Depth**: Additional security layer beyond standard JWT signing

**Configuration:**
```env
# JWT Obfuscation Key (add to .env)
JWT_OBFUSCATION_KEY=your-super-secret-obfuscation-key-change-this
```

**Usage:**
- **Automatic**: All JWT tokens are automatically obfuscated during generation
- **Transparent**: Authentication middleware handles deobfuscation automatically
- **Backward Compatible**: Legacy token verification methods still available

**Testing Obfuscation:**
```bash
# Login and get obfuscated token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"password123"}'

# Decode the token at jwt.io - you'll see obfuscated data
# The actual user information is encrypted and not readable
```

**Files:**
- `backend/services/ObfuscatedJWTService.js` - Core obfuscation logic
- `backend/services/AuthService.js` - Integration with authentication
- `backend/middleware/auth.js` - Updated middleware for obfuscated tokens

#### Row-Level Security (RLS)

The system implements comprehensive database-level Row-Level Security using PostgreSQL RLS policies with TypeORM integration:

**RLS Policies Overview:**

**1. SELECT Policy (`tickets_select_policy`)**
- **Admin users**: Can view all tickets across all organizations
- **Regular users**: Can only view tickets from their own organization
- **Enforcement**: Database-level filtering using `organisation_id = get_current_user_organisation_id()`

**2. INSERT Policy (`tickets_insert_policy`)**
- **Admin users**: Cannot create tickets (business rule enforced at database level)
- **Regular users**: Can only create tickets for their own organization
- **Validation**: `organisation_id = get_current_user_organisation_id()` AND `NOT is_current_user_admin()`

**3. UPDATE Policy (`tickets_update_policy`)**
- **Admin users**: Can update any ticket across all organizations
- **Regular users**: Can only update tickets from their own organization
- **Dual validation**: Both `USING` (for finding records) and `WITH CHECK` (for new values)

**4. DELETE Policy (`tickets_delete_policy`)**
- **Admin users**: Can delete any ticket across all organizations
- **Regular users**: Can only delete tickets from their own organization
- **Enforcement**: `organisation_id = get_current_user_organisation_id()`

**Database Functions:**

**`set_current_user_id(user_id integer)`**
- Sets the current user context for RLS policies
- Called before every database operation
- Stores user ID in PostgreSQL session variables

**`get_current_user_organisation_id()`**
- Returns the organization ID of the current user
- Used by RLS policies to filter data
- Handles null/error cases gracefully

**`is_current_user_admin()`**
- Checks if the current user has admin role
- Used by RLS policies for admin-specific logic
- Returns boolean for policy evaluation

**Key Features:**
- **Database-level enforcement**: Impossible to bypass, even with direct database access
- **TypeORM integration**: Custom repository with RLS support
- **JWT token integration**: User context from authentication tokens
- **Comprehensive coverage**: All CRUD operations protected
- **Performance optimized**: No additional application-level filtering needed
- **Error handling**: Graceful handling of edge cases

**Security Benefits:**
- **Data isolation**: Users cannot access data from other organizations
- **Privilege escalation prevention**: Admin users cannot create tickets (business rule)
- **Consistent enforcement**: Works across all database connections
- **Audit trail**: All access controlled at database level

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

**Expected Behavior:**
- **Alice (Acme Corp)**: Sees tickets 1, 2, 4, 5 (Acme Corp only)
- **Carol (Globex Inc)**: Sees ticket 3 (Globex Inc only)
- **Admin**: Sees all 35 tickets but cannot create new tickets
- **Cross-organization access**: Impossible due to RLS enforcement

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
