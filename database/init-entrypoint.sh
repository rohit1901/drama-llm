#!/bin/sh
set -e

echo "🚀 Database Initialization Container"
echo "====================================="
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi

    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - waiting..."
    sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "❌ PostgreSQL did not become ready in time"
    exit 1
fi

echo ""
echo "📦 Initializing database..."
echo ""

# Run the database initialization script
cd /init
export SCHEMA_PATH=/init/schema.sql
node init-db.js

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Database initialization complete!"
    echo ""
    exit 0
else
    echo ""
    echo "❌ Database initialization failed with exit code $EXIT_CODE"
    echo ""
    exit $EXIT_CODE
fi
