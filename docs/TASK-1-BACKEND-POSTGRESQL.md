# Task 1: Backend ↔ PostgreSQL Connection

## Overview
This document outlines the implementation of the database connection between the backend and PostgreSQL, including the database service module, migrations, and seeding scripts.

## Implementation Details

### 1. Database Connection Setup

**Technology Stack:**
- **ORM**: TypeORM with PostgreSQL
- **Driver**: `pg` (node-postgres)
- **Configuration**: Environment-based via `process.env.DATABASE_URL`

**Key Files:**
- `backend/config/database.js` - Database configuration
- `backend/db/typeorm.js` - TypeORM setup and initialization
- `backend/db/index.js` - Database service module exports

### 2. Database Service Module

**Location:** `backend/db/index.js`

**Exports:**
```javascript
export { initializeDatabase, getRepository } from './typeorm.js';
export { AppDataSource } from '../config/database.js';
```

**Key Functions:**
- `initializeDatabase()` - Initializes TypeORM connection
- `getRepository(Entity)` - Returns repository for specific entity
- `AppDataSource` - TypeORM DataSource instance

### 3. Entity Definitions

**Organisation Entity:** `backend/db/entities/Organisation.js`
```javascript
@Entity('organisation')
export class Organisation {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'text' })
  name;

  @CreateDateColumn()
  createdAt;

  @UpdateDateColumn()
  updatedAt;
}
```

**User Entity:** `backend/db/entities/User.js`
```javascript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'text' })
  name;

  @Column({ type: 'text', unique: true })
  email;

  @Column({ type: 'text' })
  password;

  @Column({ type: 'text', default: 'user' })
  role;

  @ManyToOne(() => Organisation)
  @JoinColumn({ name: 'organisation_id' })
  organisation;

  @Column({ name: 'organisation_id' })
  organisationId;
}
```

**Ticket Entity:** `backend/db/entities/Ticket.js`
```javascript
@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id;

  @Column({ type: 'text' })
  title;

  @Column({ type: 'text', nullable: true })
  description;

  @Column({ type: 'text', default: 'open' })
  status;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user;

  @Column({ name: 'user_id' })
  userId;

  @ManyToOne(() => Organisation)
  @JoinColumn({ name: 'organisation_id' })
  organisation;

  @Column({ name: 'organisation_id' })
  organisationId;
}
```

### 4. Database Schema

**Location:** `db/schema.sql`

**Tables Created:**
1. **organisation** - Stores company information
2. **users** - Stores user accounts with organisation relationships
3. **tickets** - Stores support tickets with user and organisation relationships

**Key Features:**
- Foreign key relationships between tables
- Timestamps for created_at and updated_at
- Row-Level Security (RLS) policies on tickets table

### 5. Migrations and Scripts

**Migration Scripts:**
- `backend/migrations/001_add_timestamp_columns.sql` - Adds timestamp columns
- `backend/migrations/run-migrations.js` - Migration runner

**Seeding Scripts:**
- `db/schema.sql` - Database schema and seed data (automatically run by Docker)
- `backend/db/example-seed-typeorm.js` - Example seeding data (for reference only)

**Available Commands:**
```bash
# Run migrations
npm run migrate
npm run migrate:docker

# Database is automatically seeded via db/schema.sql
# No manual seeding required!
```

### 6. Environment Configuration

**Required Environment Variables:**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/ticketing_db
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ticketing_db
```

### 7. Repository Pattern

**Custom Repositories:**
- `backend/db/repositories/TicketRepository.js` - Custom ticket repository with RLS support

**Key Methods:**
- `findAllWithRLS()` - Find tickets with Row-Level Security
- `findAllWithoutRLS()` - Find all tickets (admin bypass)
- `createWithRLS()` - Create ticket with RLS validation
- `updateWithRLS()` - Update ticket with RLS validation
- `deleteWithRLS()` - Delete ticket with RLS validation

### 8. Database Connection Flow

1. **Server Startup:**
   ```javascript
   // backend/index.js
   await initializeDatabase();
   ```

2. **Repository Usage:**
   ```javascript
   // In services
   const ticketRepo = getRepository(Ticket);
   const tickets = await ticketRepo.find();
   ```

3. **Custom Repository:**
   ```javascript
   // In services
   const ticketRepository = new TicketRepository(AppDataSource);
   const tickets = await ticketRepository.findAllWithRLS(filters, userId);
   ```

### 9. Error Handling

**Database Connection Errors:**
- Connection timeout handling
- Retry logic for failed connections
- Graceful shutdown on connection loss

**Query Errors:**
- TypeORM error handling
- Custom error messages for security
- Validation error handling

### 10. Performance Considerations

**Optimizations:**
- Connection pooling via TypeORM
- Query optimization with proper indexes
- Pagination support for large datasets
- Efficient RLS implementation

**Monitoring:**
- Query logging in development
- Performance metrics tracking
- Database connection monitoring

## Testing the Connection

**Health Check:**
```bash
curl http://localhost:4000/ping
```

**Database Status:**
```bash
curl http://localhost:4000/api
```

## Security Features

1. **Environment-based Configuration** - No hardcoded credentials
2. **Connection Pooling** - Efficient resource management
3. **SQL Injection Prevention** - TypeORM parameterized queries
4. **Row-Level Security** - Database-level access control
5. **Error Sanitization** - No sensitive data in error messages

## Dependencies

**Core Dependencies:**
- `typeorm` - ORM framework
- `pg` - PostgreSQL driver
- `reflect-metadata` - TypeORM metadata support

**Development Dependencies:**
- `ts-node` - TypeScript execution
- `nodemon` - Development server with auto-restart

This implementation provides a robust, secure, and scalable database connection layer for the ticketing system. 