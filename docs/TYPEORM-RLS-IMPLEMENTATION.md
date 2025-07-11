# TypeORM Row-Level Security (RLS) Implementation

This document explains how Row-Level Security (RLS) is implemented using TypeORM in the ticketing system.

## Overview

The RLS implementation ensures that users can only access tickets from their own organisation, providing data isolation at the database level while maintaining the benefits of TypeORM's ORM features.

## Architecture

### 1. Database-Level RLS

**PostgreSQL RLS Policy:**
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
```

**RLS Function:**
```sql
-- Function to set current user ID for RLS
CREATE OR REPLACE FUNCTION set_current_user_id(user_id integer)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.current_user_id', user_id::text, false);
END;
$$ LANGUAGE plpgsql;
```

### 2. TypeORM Integration

#### Custom Repository (`TicketRepository.js`)

The custom repository extends TypeORM's base Repository and adds RLS functionality:

```javascript
export class TicketRepository extends Repository {
  constructor(dataSource) {
    super(Ticket, dataSource.createEntityManager());
  }

  // Set current user ID for RLS
  async setCurrentUser(userId) {
    await this.query('SELECT set_current_user_id($1)', [userId]);
  }

  // All CRUD operations call setCurrentUser before executing queries
  async findAllWithRLS(filters = {}, userId) {
    await this.setCurrentUser(userId);
    // ... TypeORM query builder logic
  }
}
```

#### Service Layer (`TicketServiceTypeORM.js`)

The service layer uses the custom repository and handles business logic:

```javascript
export class TicketServiceTypeORM {
  constructor() {
    this.ticketRepository = new TicketRepository(AppDataSource);
    // ... other repositories
  }

  async findAll(filters = {}, userId) {
    return await this.ticketRepository.findAllWithRLS(filters, userId);
  }
}
```

#### Controller Layer (`TicketController.js`)

Controllers extract the user ID from the JWT token and pass it to the service:

```javascript
getAllTickets = asyncHandler(async (req, res) => {
  const result = await this.ticketService.findAll(filters, req.user.userId);
  // ... response handling
});
```

## How RLS Works

### 1. Authentication Flow

1. **User Login**: JWT token contains `userId`
2. **API Request**: Token decoded, `req.user.userId` available
3. **Service Call**: `userId` passed to service methods
4. **Repository**: `setCurrentUser(userId)` called before queries
5. **Database**: PostgreSQL RLS policy filters results

### 2. Data Isolation

- **Alice (Acme Corp)**: Can only see tickets where `organisation_id = 1`
- **Bob (Acme Corp)**: Can only see tickets where `organisation_id = 1`
- **Carol (Globex Inc)**: Can only see tickets where `organisation_id = 2`

### 3. Query Execution

```javascript
// 1. Set current user for RLS
await this.setCurrentUser(userId);

// 2. Execute TypeORM query
const tickets = await this.createQueryBuilder('ticket')
  .leftJoinAndSelect('ticket.user', 'user')
  .leftJoinAndSelect('ticket.organisation', 'organisation')
  .getMany();

// 3. PostgreSQL automatically applies RLS policy
// Only returns tickets where organisation_id matches user's organisation
```

## Benefits of TypeORM + RLS

### 1. **Type Safety**
- Full TypeScript support
- Entity relationships maintained
- IntelliSense and autocomplete

### 2. **ORM Features**
- Query builder
- Entity relationships
- Migrations
- Validation

### 3. **Security**
- Database-level enforcement
- Impossible to bypass
- Consistent across all queries

### 4. **Performance**
- No additional application-level filtering
- Database-optimized queries
- Indexes work properly

## Implementation Details

### Entity Updates

All entities include timestamp fields for better tracking:

```javascript
@Entity("tickets")
export class Ticket {
  // ... other fields

  @CreateDateColumn({ name: "created_at" })
  createdAt;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt;
}
```

### Migration System

TypeORM-compatible migration runner:

```javascript
// Run migrations
npm run migrate

// Run migrations in Docker
npm run migrate:docker
```

### Error Handling

Comprehensive error handling for RLS scenarios:

```javascript
// User not found
if (!user) {
  throw new Error('User not found');
}

// Organisation mismatch
if (user.organisationId !== organisation_id) {
  throw new Error('User does not belong to the specified organisation');
}

// Ticket not found (filtered by RLS)
if (!ticket) {
  throw new Error('Ticket not found');
}
```

## Testing RLS

### Manual Testing

1. **Login as Alice (Acme Corp)**:
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"alice@acme.com","password":"password123"}'
   ```

2. **Get tickets (should only see Acme Corp tickets)**:
   ```bash
   curl -X GET http://localhost:4000/api/tickets \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Login as Carol (Globex Inc)**:
   ```bash
   curl -X POST http://localhost:4000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"carol@globex.com","password":"password123"}'
   ```

4. **Get tickets (should only see Globex Inc tickets)**:
   ```bash
   curl -X GET http://localhost:4000/api/tickets \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

### Expected Results

- **Alice**: Sees tickets 1, 2, 4, 5 (Acme Corp)
- **Carol**: Sees ticket 3 (Globex Inc)
- **Cross-organisation access**: Impossible due to RLS

## Security Considerations

### 1. **Database-Level Security**
- RLS policies cannot be bypassed
- Works even if application logic is compromised
- Consistent across all database connections

### 2. **Application-Level Validation**
- User organisation verification
- Input validation and sanitization
- JWT token verification

### 3. **Error Messages**
- Generic error messages to prevent information leakage
- No disclosure of other organisations' data

## Performance Optimizations

### 1. **Indexes**
```sql
CREATE INDEX IF NOT EXISTS idx_tickets_organisation_id ON tickets(organisation_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON tickets(user_id);
```

### 2. **Query Optimization**
- RLS policies use indexed columns
- TypeORM query builder generates efficient SQL
- Pagination support for large datasets

## Troubleshooting

### Common Issues

1. **"Ticket not found" errors**:
   - Check if user belongs to the correct organisation
   - Verify RLS policy is working correctly

2. **Performance issues**:
   - Ensure indexes are created
   - Check query execution plans

3. **Migration errors**:
   - Verify database connection
   - Check migration file syntax

### Debugging

Enable TypeORM logging in development:

```javascript
// config/database.js
export const createDataSource = () => {
  return new DataSource({
    // ... other config
    logging: process.env.NODE_ENV === "development",
  });
};
```

## Conclusion

The TypeORM + RLS implementation provides:

- **Strong security** through database-level enforcement
- **Type safety** through TypeORM entities
- **Developer experience** through ORM features
- **Performance** through optimized queries
- **Maintainability** through clean architecture

This approach ensures that data isolation is enforced at the database level while maintaining all the benefits of using TypeORM as an ORM. 