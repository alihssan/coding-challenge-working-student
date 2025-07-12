# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### 1. Clone and Start
```bash
git clone <repository-url>
cd coding-challenge-working-student-1
docker-compose up -d
```

### 2. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **Database**: localhost:5432

### 3. Test Users (Auto-seeded)
```
Alice (Acme Corp): alice@acme.com / password123
Bob (Acme Corp): bob@acme.com / password123
Carol (Globex Inc): carol@globex.com / password123
Admin: admin@system.com / password123
```

### 4. Test the System
```bash
# Test authentication
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"password123"}'

# Test RLS (should only see Acme Corp tickets)
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Development Setup

### Backend Development
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Database Migrations
```bash
cd backend
npm run migrate
```

## 🔐 Security Features

### JWT Obfuscation
- Tokens are obfuscated using XOR cipher
- User data is not readable when decoded
- Configure with `JWT_OBFUSCATION_KEY` in `.env`

### Row-Level Security
- Database-level data isolation
- Users can only see their organization's data
- Admin users can see all data

### Authentication Flow
1. User logs in → JWT token generated (obfuscated)
2. Frontend stores token → API requests include token
3. Backend validates token → Sets user context
4. Database RLS → Filters data by organization

## 📁 Key Files

### Backend
- `services/AuthService.js` - Authentication logic
- `services/ObfuscatedJWTService.js` - JWT obfuscation
- `middleware/auth.js` - JWT validation
- `db/repositories/TicketRepository.js` - RLS integration

### Frontend
- `src/api.js` - API client functions
- `src/components/Auth.jsx` - Login/register forms
- `src/components/Tickets.jsx` - Ticket management

### Database
- `db/schema.sql` - Complete schema with RLS policies
- `backend/migrations/` - Database migrations

## 🧪 Testing

### Authentication Tests
```bash
cd backend
node tests/test-auth.js
```

### RLS Tests
```bash
cd backend
./tests/test-rls.sh
```

### API Testing
```bash
# Test as regular user
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer USER_TOKEN"

# Test as admin
curl -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🔍 Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres
```

**JWT Token Issues**
```bash
# Check JWT secret in .env
echo $JWT_SECRET

# Verify obfuscation key
echo $JWT_OBFUSCATION_KEY
```

**RLS Not Working**
```bash
# Check if RLS is enabled
docker-compose exec postgres psql -U postgres -d ticketing_db -c "SELECT * FROM pg_policies;"
```

### Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

## 📚 Next Steps

1. **Read the Comprehensive Guide**: `docs/COMPREHENSIVE-GUIDE.md`
2. **Explore Security Documentation**: `docs/TASK-3-SECURITY-BEST-PRACTICES.md`
3. **Understand RLS Implementation**: `docs/TYPEORM-RLS-IMPLEMENTATION.md`
4. **Test API Endpoints**: Use the Postman collection in `docs/`

## 🎯 Key Features to Explore

- **Multi-tenant Architecture**: Organizations are completely isolated
- **JWT Obfuscation**: Tokens are encrypted and unreadable when decoded
- **Row-Level Security**: Database-level data isolation
- **Role-Based Access**: Admin vs regular user permissions
- **Real-time Frontend**: React with automatic data updates
- **Docker Support**: Complete containerized deployment

## 🆘 Need Help?

- Check the comprehensive documentation in `docs/`
- Review the main README.md for detailed setup instructions
- Test the system using the provided test scripts
- Verify your environment variables are correctly set 