#!/bin/bash

echo "🧪 Testing Schema-Based Seeding"
echo "================================"

echo ""
echo "1. Starting Docker containers..."
docker compose up -d postgres

echo ""
echo "2. Waiting for PostgreSQL to be ready..."
sleep 15

echo ""
echo "3. Checking if database is seeded..."
docker compose exec postgres psql -U postgres -d ticketing_db -c "
SELECT 
    'Organisations: ' || COUNT(*) as org_count 
FROM organisation;
"

docker compose exec postgres psql -U postgres -d ticketing_db -c "
SELECT 
    'Users: ' || COUNT(*) as user_count 
FROM users;
"

docker compose exec postgres psql -U postgres -d ticketing_db -c "
SELECT 
    'Tickets: ' || COUNT(*) as ticket_count 
FROM tickets;
"

echo ""
echo "4. Sample data verification:"
echo "   - First 3 organizations:"
docker compose exec postgres psql -U postgres -d ticketing_db -c "
SELECT name FROM organisation LIMIT 3;
"

echo ""
echo "   - First 3 users:"
docker compose exec postgres psql -U postgres -d ticketing_db -c "
SELECT name, email FROM users LIMIT 3;
"

echo ""
echo "   - First 3 tickets:"
docker compose exec postgres psql -U postgres -d ticketing_db -c "
SELECT title, status FROM tickets LIMIT 3;
"

echo ""
echo "✅ Schema-based seeding test completed!"
echo ""
echo "Expected results:"
echo "   - 10 organizations"
echo "   - 21 users"
echo "   - 35 tickets"
echo ""
echo "If the counts match, the schema-based seeding is working correctly!" 