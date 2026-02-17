# Scripts Documentation

This directory contains utility scripts for managing the Drama LLM project, including version management, database initialization, and testing.

## Table of Contents

- [Version Management](#version-management)
- [Database Management](#database-management)
- [Testing Scripts](#testing-scripts)
- [Usage Examples](#usage-examples)

---

## Version Management

### `update-changelog.js`

Automatically updates the CHANGELOG.md file when bumping versions.

**Usage:**
```bash
# Automatically called by version scripts
npm run version:patch   # 2.1.0 -> 2.1.1
npm run version:minor   # 2.1.0 -> 2.2.0
npm run version:major   # 2.1.0 -> 3.0.0
```

**What it does:**
1. Reads the new version from `package.json`
2. Creates a new changelog entry with today's date
3. Adds template sections for different types of changes
4. Maintains the Keep a Changelog format

**Features:**
- ✅ Automatic version detection
- ✅ Date formatting (YYYY-MM-DD)
- ✅ Template sections (Features, Bug Fixes, etc.)
- ✅ Prevents duplicate entries
- ✅ Maintains changelog structure

**Output Format:**
```markdown
## [2.1.1] - 2025-01-15

### 🚀 Features
-

### ✨ Improvements
-

### 🐛 Bug Fixes
-

### 📚 Documentation
-

### 🔧 Technical Changes
-

---
```

---

## Database Management

### `check-postgres.sh`

Checks PostgreSQL installation, connection, and provides setup instructions.

**Usage:**
```bash
npm run db:check
make db-check
```

**What it checks:**
1. PostgreSQL client installation
2. PostgreSQL server running status
3. Database connection with credentials
4. Provides OS-specific setup instructions

**Features:**
- ✅ Detects operating system (macOS/Linux)
- ✅ Shows installation commands
- ✅ Shows startup commands
- ✅ Provides troubleshooting steps
- ✅ Colored output for easy reading

**Output Example:**
```
🔍 PostgreSQL Setup Check
==========================

✅ PostgreSQL client is installed
PostgreSQL 14.5

✅ PostgreSQL server is running

✅ Can connect to PostgreSQL

==========================
📊 Summary
==========================

🎉 PostgreSQL is ready!

Next steps:
  1. Initialize database: make db-init
  2. Start backend: make dev-backend
  3. Start frontend: make dev-frontend
```

---

### `init-db.js`

Initializes the PostgreSQL database for Drama LLM with proper error handling.

**Usage:**
```bash
npm run db:init
make db-init

# With custom credentials
DB_USER=myuser DB_PASSWORD=mypass npm run db:init
```

**Environment Variables:**
```bash
DB_HOST=localhost      # Database host
DB_PORT=5432          # Database port
DB_USER=postgres      # Database user
DB_PASSWORD=postgres  # Database password
DB_NAME=drama_llm     # Database name
```

**What it does:**
1. Connects to PostgreSQL server
2. Checks if target database exists
3. Creates database if it doesn't exist (skips if exists)
4. Applies schema from `database/schema.sql`
5. Verifies tables were created
6. Shows database statistics

**Features:**
- ✅ Graceful handling of existing databases
- ✅ Automatic schema application
- ✅ Table verification
- ✅ Detailed error messages
- ✅ Connection testing
- ✅ Safe idempotent operation

**Output:**
```
🚀 Drama LLM Database Initialization
=====================================

Configuration:
  Host: localhost
  Port: 5432
  User: postgres
  Database: drama_llm

🔌 Connecting to PostgreSQL...
✅ Connected successfully!

🔍 Checking if database "drama_llm" exists...
✅ Database "drama_llm" already exists. Skipping creation.

🔍 Verifying tables...
✅ Found 5 tables:
   - users
   - conversations
   - messages
   - chat_settings
   - sessions

🎉 Database initialization complete!

Default admin user:
  Email: admin@drama-llm.local
  Password: admin123

⚠️  Please change the admin password after first login!
```

**Error Handling:**
- Database connection failures
- Permission issues
- Schema application errors
- Missing schema file
- Already existing databases (not an error)

**Exit Codes:**
- `0` - Success
- `1` - Failure (connection, schema, etc.)

---

## Testing Scripts

### Integration Test Suite (`../test-integration.sh`)

Comprehensive integration testing for all Drama LLM components.

**Usage:**
```bash
# Local development testing
npm run test:integration

# Docker environment testing
TEST_MODE=docker npm run test:integration
```

**What it tests:**

#### 1. Backend Health
- HTTP endpoint availability
- Health check response
- JSON parsing

#### 2. Ollama Server
- Server availability
- API endpoint access
- Model count

#### 3. Database Connection
- PostgreSQL connectivity
- User count
- Conversation count
- Message count
- Table verification

#### 4. Frontend
- Server availability
- URL accessibility

#### 5. API Endpoints
- `/api/auth/me` - Authentication endpoint
- `/api/conversations` - Conversations endpoint
- `/api/models` - Models endpoint
- HTTP status codes

#### 6. Authentication Flow
- User registration
- JWT token generation
- Authenticated requests
- Token validation

#### 7. Docker Setup (Docker mode only)
- Container status
- Container health

**Features:**
- ✅ Colored output (green/red/yellow)
- ✅ Test counters (passed/failed/warnings)
- ✅ Detailed error messages
- ✅ Suggestions for fixes
- ✅ JSON response parsing (with jq)
- ✅ HTTP status code validation
- ✅ Random test user generation
- ✅ Summary report

**Exit Codes:**
- `0` - All tests passed
- `1` - One or more tests failed

**Sample Output:**
```
🧪 Drama LLM Integration Test Suite
====================================

Test Mode: local
Backend URL: http://localhost:3001
Frontend URL: http://localhost:5173
Ollama URL: http://localhost:11434

▶ Testing Backend Health
✅ Backend is healthy
{
  "status": "ok",
  "timestamp": "2025-01-15T10:30:00.000Z"
}

▶ Testing Ollama Server
✅ Ollama is running
   API endpoint accessible
   Models available: 5

▶ Testing Database Connection
✅ Database is accessible
   Database: drama_llm
   Users: 1
   Active Conversations: 5
   Active Messages: 42
   Tables: 5

====================================
📊 Test Summary
====================================

✅ Passed: 10
⚠️  Warnings: 0
❌ Failed: 0

🎉 All critical tests passed!

Next steps:
1. Open http://localhost:5173 in your browser
2. Login with: admin@drama-llm.local / admin123
3. Or register a new user
4. Start chatting and verify conversations are saved
```

---

## Usage Examples

### Complete Release Workflow

**1. Make your changes:**
```bash
# Make code changes
git add .
git commit -m "feat: add new feature"
```

**2. Run tests:**
```bash
# Run all tests
npm test

# Or individually
npm run test:unit
npm run test:integration
npm run test:e2e
```

**3. Bump version:**
```bash
# For bug fixes (2.1.0 -> 2.1.1)
npm run version:patch

# For new features (2.1.0 -> 2.2.0)
npm run version:minor

# For breaking changes (2.1.0 -> 3.0.0)
npm run version:major
```

**4. Update changelog:**
```bash
# Edit CHANGELOG.md with your changes
nano CHANGELOG.md

# Commit the changes
git add CHANGELOG.md
git commit --amend --no-edit
```

**5. Push to repository:**
```bash
# Push commits and tags
git push
git push --tags
```

---

### Database Setup Workflow

**1. Start PostgreSQL:**
```bash
# Local PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux

# Docker PostgreSQL
docker-compose up -d postgres
```

**2. Initialize database:**
```bash
# Using npm script
npm run db:init

# With custom credentials
DB_USER=myuser DB_PASSWORD=mypass npm run db:init
```

**3. Verify setup:**
```bash
# Check database
psql -U postgres -d drama_llm -c "\dt"

# Or use integration test
npm run test:integration
```

**4. Seed data (optional):**
```bash
cd server
npm run db:seed
```

---

### Testing Workflow

**Development Testing:**
```bash
# Run type checking
npm run type-check

# Run linter
npm run lint

# Fix linting issues
npm run format

# Run all unit tests
npm run test:unit
```

**Integration Testing:**
```bash
# Start all services
npm run dev                    # Terminal 1 - Frontend
cd server && npm run dev       # Terminal 2 - Backend
ollama serve                   # Terminal 3 - Ollama

# Run integration tests
npm run test:integration       # Terminal 4
```

**Docker Testing:**
```bash
# Build and start containers
docker-compose up -d

# Wait for services to start
sleep 10

# Run tests in Docker mode
TEST_MODE=docker npm run test:integration

# Check logs
docker-compose logs -f
```

**E2E Testing:**
```bash
# Run Cucumber tests
npm run test:e2e

# Run specific feature
npx cucumber-js features/chat.feature
```

---

### Docker Workflow

**Build and Deploy:**
```bash
# Build images
npm run docker:build

# Start all services
npm run docker:run

# Check status
docker-compose ps

# View logs
npm run docker:logs

# Stop services
npm run docker:stop
```

**Database in Docker:**
```bash
# Initialize database (automatic on first run)
docker-compose up -d postgres

# Manual initialization
docker-compose exec frontend npm run db:init

# Access database
docker-compose exec postgres psql -U postgres -d drama_llm
```

---

## Environment Variables

### PostgreSQL Check (`check-postgres.sh`)
```bash
DB_USER=postgres          # Database user for connection test
DB_PASSWORD=postgres      # Database password for connection test
```

### Database (`init-db.js`)
```bash
DB_HOST=localhost          # Default: localhost
DB_PORT=5432              # Default: 5432
DB_USER=postgres          # Default: postgres
DB_PASSWORD=postgres      # Default: postgres
DB_NAME=drama_llm         # Default: drama_llm
```

### Testing (`test-integration.sh`)
```bash
TEST_MODE=local           # Default: local | docker
DB_USER=postgres          # Database user
DB_PASSWORD=postgres      # Database password
DB_NAME=drama_llm         # Database name
```

### Docker (`.env` file)
```bash
# Copy from .env.example
cp .env.example .env

# Edit configuration
nano .env
```

---

## Troubleshooting

### Version Bump Issues

**Problem:** Version already exists in changelog
```bash
⚠️  Version already exists in CHANGELOG.md
   Please manually update the changelog entry.
```
**Solution:** Manually edit CHANGELOG.md or use `git tag -d v2.1.0` to delete the tag and try again.

---

### Database Issues

**Problem:** PostgreSQL not installed or not running
```bash
❌ PostgreSQL is not running
```
**Solution:**
```bash
# Check PostgreSQL status and get setup instructions
npm run db:check
make db-check

# Quick starts:
# macOS
brew services start postgresql

# Linux
sudo service postgresql start

# Docker
docker run -d --name drama-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

**Problem:** Cannot connect to database
```bash
❌ Database initialization failed!
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
1. Check PostgreSQL is running: `pg_isready`
2. Check credentials in `.env`
3. Ensure PostgreSQL accepts connections: check `postgresql.conf`

**Problem:** Permission denied
```bash
❌ Error creating database: permission denied to create database
```
**Solution:**
Grant CREATE DATABASE permission:
```sql
ALTER USER postgres CREATEDB;
```

---

### Integration Test Issues

**Problem:** Backend not accessible
```bash
❌ Backend is NOT running
   Start it with: cd server && npm run dev
```
**Solution:**
```bash
cd server
npm install
npm run dev
```

**Problem:** PostgreSQL client not installed
```bash
⚠️  psql not found - skipping database tests
```
**Solution:**
Run the PostgreSQL check script for installation instructions:
```bash
make db-check
```

Or install manually:
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Alpine (Docker)
apk add postgresql-client
```

**Problem:** Database test fails (no psql - old issue)
```bash
⚠️  psql not found - skipping database tests
```
**Solution:**
```bash
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Alpine (Docker)
apk add postgresql-client
```

---

## Best Practices

### Version Management
1. ✅ Always run tests before bumping version
2. ✅ Use semantic versioning (major.minor.patch)
3. ✅ Update changelog with meaningful descriptions
4. ✅ Tag releases for easy rollback
5. ✅ Push tags after version bump

### Database Management
1. ✅ Always backup before schema changes
2. ✅ Use migrations for schema updates
3. ✅ Test on local/staging before production
4. ✅ Keep schema.sql updated
5. ✅ Document all schema changes

### Testing
1. ✅ Run tests before commits
2. ✅ Test locally before Docker
3. ✅ Use integration tests in CI/CD
4. ✅ Keep tests fast and focused
5. ✅ Mock external dependencies when possible

---

## Contributing

When adding new scripts:

1. **Document thoroughly** - Add to this README
2. **Use consistent style** - Follow existing patterns
3. **Add error handling** - Always handle failures gracefully
4. **Provide examples** - Show common use cases
5. **Test thoroughly** - Ensure scripts work in all environments

---

## License

MIT License - See LICENSE.md for details

---

**Last Updated:** January 15, 2025
**Version:** 2.1.0