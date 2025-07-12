#!/bin/bash

echo "🔒 Testing API Integration with Row-Level Security (RLS)"
echo "========================================================"

echo ""
echo "1. Starting all services..."
docker compose up -d

echo ""
echo "2. Waiting for services to be ready..."
sleep 20

echo ""
echo "3. Testing API Authentication and RLS..."

# Test 1: Login as regular user (Alice)
echo ""
echo "   - Testing login as Alice (Acme Corp):"
ALICE_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@acme.com","password":"password123"}')

echo "Response: $ALICE_RESPONSE"

# Extract Alice's token
ALICE_TOKEN=$(echo $ALICE_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ALICE_TOKEN" ]; then
    echo "❌ Failed to get Alice's token"
    exit 1
fi

echo "✅ Alice's token: ${ALICE_TOKEN:0:20}..."

# Test 2: Login as admin user
echo ""
echo "   - Testing login as Admin:"
ADMIN_RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@system.com","password":"password123"}')

echo "Response: $ADMIN_RESPONSE"

# Extract Admin's token
ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to get Admin's token"
    exit 1
fi

echo "✅ Admin's token: ${ADMIN_TOKEN:0:20}..."

# Test 3: Get tickets as Alice (should see only Acme Corp tickets)
echo ""
echo "   - Testing tickets endpoint as Alice (should see only Acme Corp tickets):"
ALICE_TICKETS=$(curl -s -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "Alice's tickets response: $ALICE_TICKETS"

# Test 4: Get tickets as Admin (should see all tickets)
echo ""
echo "   - Testing tickets endpoint as Admin (should see all tickets):"
ADMIN_TICKETS=$(curl -s -X GET http://localhost:4000/api/tickets \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Admin's tickets response: $ADMIN_TICKETS"

# Test 5: Create ticket as Alice (should work)
echo ""
echo "   - Testing ticket creation as Alice:"
ALICE_CREATE=$(curl -s -X POST http://localhost:4000/api/tickets \
  -H "Authorization: Bearer $ALICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test ticket from Alice API",
    "description": "Testing RLS with API",
    "status": "open",
    "user_id": 1,
    "organisation_id": 1
  }')

echo "Alice's create response: $ALICE_CREATE"

# Test 6: Create ticket as Admin (should fail due to RLS)
echo ""
echo "   - Testing ticket creation as Admin (should fail):"
ADMIN_CREATE=$(curl -s -X POST http://localhost:4000/api/tickets \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test ticket from Admin API",
    "description": "Testing RLS with API",
    "status": "open",
    "user_id": 22,
    "organisation_id": 1
  }')

echo "Admin's create response: $ADMIN_CREATE"

# Test 7: Get ticket stats as Alice
echo ""
echo "   - Testing ticket stats as Alice:"
ALICE_STATS=$(curl -s -X GET http://localhost:4000/api/tickets/stats \
  -H "Authorization: Bearer $ALICE_TOKEN")

echo "Alice's stats response: $ALICE_STATS"

# Test 8: Get ticket stats as Admin
echo ""
echo "   - Testing ticket stats as Admin:"
ADMIN_STATS=$(curl -s -X GET http://localhost:4000/api/tickets/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN")

echo "Admin's stats response: $ADMIN_STATS"

echo ""
echo "✅ API RLS Testing completed!"
echo ""
echo "Expected Results:"
echo "   - Alice should only see tickets from Acme Corp (organization 1)"
echo "   - Admin should see all tickets from all organizations"
echo "   - Alice should be able to create tickets for her organization"
echo "   - Admin should NOT be able to create tickets (RLS policy blocks this)"
echo "   - Ticket stats should reflect the appropriate data isolation"
echo ""
echo "If all tests show the expected behavior, RLS is working correctly with the APIs! 🎉" 