#!/bin/bash

echo "🧪 Testing Registration Flow with Navigation"
echo "============================================="
echo ""

# Generate random email
RANDOM_EMAIL="testuser$(date +%s)@example.com"

echo "1. Testing registration endpoint..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"testpass123\",\"username\":\"testuser\"}")

if echo "$RESPONSE" | grep -q "success.*true"; then
    echo "   ✓ Registration successful"
    echo "   Email: $RANDOM_EMAIL"
    
    # Extract token
    TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$TOKEN" ]; then
        echo "   ✓ JWT token generated"
        
        # Test authenticated endpoint
        AUTH_TEST=$(curl -s http://localhost:3001/api/auth/me \
          -H "Authorization: Bearer $TOKEN")
        
        if echo "$AUTH_TEST" | grep -q "$RANDOM_EMAIL"; then
            echo "   ✓ Authentication working"
            echo ""
            echo "✅ Registration flow is working correctly!"
            echo ""
            echo "📱 To test in browser:"
            echo "   1. Open http://localhost:5173"
            echo "   2. Click 'Create account'"
            echo "   3. Fill in the form"
            echo "   4. Submit - you should be redirected to home page"
        else
            echo "   ✗ Authentication test failed"
        fi
    else
        echo "   ✗ No token in response"
    fi
else
    echo "   ✗ Registration failed"
    echo "   Response: $RESPONSE"
fi

echo ""
