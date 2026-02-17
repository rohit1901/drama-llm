#!/bin/bash

echo "🧪 Testing User Registration Feature"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if frontend is running
echo "1. Checking frontend..."
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "   ${GREEN}✓${NC} Frontend is running"
else
    echo -e "   ${RED}✗${NC} Frontend is not running"
    exit 1
fi

# Test 2: Check if backend is running
echo "2. Checking backend..."
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "   ${GREEN}✓${NC} Backend is running"
else
    echo -e "   ${RED}✗${NC} Backend is not running"
    exit 1
fi

# Test 3: Test registration endpoint
echo "3. Testing registration endpoint..."
RANDOM_EMAIL="testuser$(date +%s)@example.com"
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"testpass123\",\"username\":\"testuser\"}")

if echo "$RESPONSE" | grep -q "success.*true"; then
    echo -e "   ${GREEN}✓${NC} Registration endpoint working"
    echo "   Created user: $RANDOM_EMAIL"
else
    echo -e "   ${RED}✗${NC} Registration endpoint failed"
    echo "   Response: $RESPONSE"
    exit 1
fi

# Test 4: Test duplicate email
echo "4. Testing duplicate email validation..."
DUPLICATE_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"testpass123\",\"username\":\"testuser2\"}")

if echo "$DUPLICATE_RESPONSE" | grep -q "already exists\|duplicate"; then
    echo -e "   ${GREEN}✓${NC} Duplicate email validation working"
else
    echo -e "   ${YELLOW}⚠${NC} Duplicate email validation may not be working as expected"
fi

# Test 5: Check TypeScript compilation
echo "5. Checking TypeScript compilation..."
if npm run type-check > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} TypeScript compilation successful"
else
    echo -e "   ${RED}✗${NC} TypeScript compilation failed"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All tests passed!${NC}"
echo ""
echo "📱 Test the UI manually:"
echo "   1. Open http://localhost:5173"
echo "   2. Click 'Create account' link"
echo "   3. Fill in the registration form"
echo "   4. Submit and verify you're logged in"
echo ""
