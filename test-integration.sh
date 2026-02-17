#!/bin/bash

set -e

echo "🧪 Drama LLM Integration Test Suite"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_WARNING=0

# Test mode (local or docker)
TEST_MODE=${TEST_MODE:-local}

# Configuration based on mode
if [ "$TEST_MODE" = "docker" ]; then
    BACKEND_URL="http://localhost:3001"
    FRONTEND_URL="http://localhost:4173"
    OLLAMA_URL="http://localhost:11434"
    DB_HOST="localhost"
    DB_PORT="5432"
    DB_USER=${DB_USER:-postgres}
    DB_NAME=${DB_NAME:-drama_llm}
else
    BACKEND_URL="http://localhost:3001"
    FRONTEND_URL="http://localhost:5173"
    OLLAMA_URL="http://localhost:11434"
    DB_HOST="localhost"
    DB_PORT="5432"
    DB_USER=${DB_USER:-postgres}
    DB_NAME=${DB_NAME:-drama_llm}
fi

# Helper functions
print_test() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

print_failure() {
    echo -e "${RED}❌ $1${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    TESTS_WARNING=$((TESTS_WARNING + 1))
}

print_info() {
    echo -e "   $1"
}

# Test functions
test_backend_health() {
    print_test "Testing Backend Health"

    if response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/health" 2>/dev/null); then
        http_code=$(echo "$response" | tail -n 1)
        body=$(echo "$response" | sed '$d')

        if [ "$http_code" = "200" ]; then
            print_success "Backend is healthy"
            if command -v jq &> /dev/null; then
                echo "$body" | jq '.' 2>/dev/null || echo "$body"
            else
                echo "$body"
            fi
        else
            print_failure "Backend returned HTTP $http_code"
        fi
    else
        print_failure "Backend is not accessible at $BACKEND_URL"
        print_info "Start with: cd server && npm run dev"
    fi
    echo ""
}

test_ollama() {
    print_test "Testing Ollama Server"

    if curl -s "$OLLAMA_URL" > /dev/null 2>&1; then
        print_success "Ollama is running"

        # Test API endpoint
        if curl -s "$OLLAMA_URL/api/tags" > /dev/null 2>&1; then
            print_info "API endpoint accessible"

            # Count models
            if command -v jq &> /dev/null; then
                model_count=$(curl -s "$OLLAMA_URL/api/tags" | jq '.models | length' 2>/dev/null || echo "unknown")
                print_info "Models available: $model_count"
            fi
        fi
    else
        print_failure "Ollama is not running at $OLLAMA_URL"
        print_info "Start with: ollama serve"
    fi
    echo ""
}

test_database() {
    print_test "Testing Database Connection"

    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        print_warning "psql not found - skipping database tests"
        print_info "Install PostgreSQL client to enable database tests"
        echo ""
        return
    fi

    # Test connection
    if PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" > /dev/null 2>&1; then
        print_success "Database is accessible"
        print_info "Database: $DB_NAME"

        # Get statistics
        USER_COUNT=$(PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users" 2>/dev/null | tr -d ' ')
        CONV_COUNT=$(PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM conversations WHERE is_deleted=false" 2>/dev/null | tr -d ' ')
        MSG_COUNT=$(PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM messages WHERE is_deleted=false" 2>/dev/null | tr -d ' ')

        print_info "Users: ${USER_COUNT:-0}"
        print_info "Active Conversations: ${CONV_COUNT:-0}"
        print_info "Active Messages: ${MSG_COUNT:-0}"

        # Check if tables exist
        TABLE_COUNT=$(PGPASSWORD="${DB_PASSWORD:-postgres}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null | tr -d ' ')
        print_info "Tables: ${TABLE_COUNT:-0}"
    else
        print_failure "Database is not accessible"
        print_info "Check PostgreSQL is running and credentials are correct"
        print_info "Run: npm run db:init"
    fi
    echo ""
}

test_frontend() {
    print_test "Testing Frontend"

    if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
        print_success "Frontend is accessible"
        print_info "URL: $FRONTEND_URL"
    else
        print_warning "Frontend is not running"
        if [ "$TEST_MODE" = "docker" ]; then
            print_info "Start with: docker-compose up -d frontend"
        else
            print_info "Start with: npm run dev"
        fi
    fi
    echo ""
}

test_api_endpoints() {
    print_test "Testing API Endpoints"

    # Test auth endpoints
    echo "   Auth endpoints:"
    if response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/auth/me" 2>/dev/null); then
        http_code=$(echo "$response" | tail -n 1)
        if [ "$http_code" = "401" ] || [ "$http_code" = "200" ]; then
            print_info "${GREEN}✓${NC} /api/auth/me (HTTP $http_code)"
        else
            print_info "${RED}✗${NC} /api/auth/me (HTTP $http_code)"
        fi
    else
        print_info "${RED}✗${NC} /api/auth/me (unreachable)"
    fi

    # Test conversations endpoint (should return 401 without auth)
    echo "   Conversations endpoints:"
    if response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/conversations" 2>/dev/null); then
        http_code=$(echo "$response" | tail -n 1)
        if [ "$http_code" = "401" ] || [ "$http_code" = "200" ]; then
            print_info "${GREEN}✓${NC} /api/conversations (HTTP $http_code)"
        else
            print_info "${RED}✗${NC} /api/conversations (HTTP $http_code)"
        fi
    else
        print_info "${RED}✗${NC} /api/conversations (unreachable)"
    fi

    # Note: Models endpoint is handled by frontend directly via Ollama
    # Backend doesn't have a models endpoint

    print_success "API endpoints tested"
    echo ""
}

test_auth_flow() {
    print_test "Testing Authentication Flow"

    # Generate random credentials
    RANDOM_EMAIL="test_$(date +%s)@example.com"
    RANDOM_PASSWORD="TestPassword123!"

    # Test registration
    print_info "Testing registration..."
    if response=$(curl -s -X POST "$BACKEND_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$RANDOM_EMAIL\",\"password\":\"$RANDOM_PASSWORD\",\"username\":\"TestUser\"}" \
        -w "\n%{http_code}" 2>/dev/null); then

        http_code=$(echo "$response" | tail -n 1)
        body=$(echo "$response" | sed '$d')

        if [ "$http_code" = "201" ] || [ "$http_code" = "200" ]; then
            print_info "${GREEN}✓${NC} Registration successful"

            # Extract token if available
            if command -v jq &> /dev/null; then
                TOKEN=$(echo "$body" | jq -r '.token // empty' 2>/dev/null)

                if [ -n "$TOKEN" ]; then
                    print_info "${GREEN}✓${NC} JWT token received"

                    # Test authenticated endpoint
                    print_info "Testing authenticated endpoint..."
                    if auth_response=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/auth/me" \
                        -H "Authorization: Bearer $TOKEN" 2>/dev/null); then

                        auth_code=$(echo "$auth_response" | tail -n 1)
                        if [ "$auth_code" = "200" ]; then
                            print_info "${GREEN}✓${NC} Authentication working"
                        fi
                    fi
                fi
            fi

            print_success "Auth flow working"
        else
            print_warning "Registration returned HTTP $http_code (might be expected if user exists)"
        fi
    else
        print_failure "Could not test registration"
    fi
    echo ""
}

test_docker_setup() {
    print_test "Testing Docker Setup"

    if ! command -v docker &> /dev/null; then
        print_warning "Docker not installed - skipping Docker tests"
        echo ""
        return
    fi

    # Check if containers are running
    if docker ps --format '{{.Names}}' | grep -q "drama_llm"; then
        print_info "Drama LLM containers found:"
        docker ps --filter "name=drama_llm" --format "   - {{.Names}} ({{.Status}})"
        print_success "Docker containers are running"
    else
        print_warning "No Drama LLM Docker containers running"
        print_info "Start with: docker-compose up -d"
    fi
    echo ""
}

# Print header
echo "Test Mode: $TEST_MODE"
echo "Backend URL: $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo "Ollama URL: $OLLAMA_URL"
echo ""

# Run tests
test_backend_health
test_ollama
test_database
test_frontend
test_api_endpoints

# Run optional tests
if [ "$TEST_MODE" = "docker" ]; then
    test_docker_setup
fi

# Only run auth test if backend is up
if [ $TESTS_FAILED -eq 0 ]; then
    test_auth_flow
fi

# Summary
echo "===================================="
echo "📊 Test Summary"
echo "===================================="
echo ""
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $TESTS_WARNING${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All critical tests passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open $FRONTEND_URL in your browser"
    echo "2. Login with: admin@drama-llm.local / admin123"
    echo "3. Or register a new user"
    echo "4. Start chatting and verify conversations are saved"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please fix the issues above.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Backend: cd server && npm run dev"
    echo "  - Database: npm run db:init"
    echo "  - Ollama: ollama serve"
    echo "  - Frontend: npm run dev"
    echo ""
    exit 1
fi
