#!/bin/sh
set -e

echo "🚀 Drama LLM Container Starting..."
echo "=================================="
echo ""

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."

    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
            echo "✅ PostgreSQL is ready!"
            return 0
        fi

        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - waiting..."
        sleep 2
    done

    echo "⚠️  Warning: Could not connect to PostgreSQL after $MAX_RETRIES attempts"
    echo "   The application will start anyway, but database features may not work."
    return 1
}

# Function to initialize database
init_database() {
    echo ""
    echo "📦 Initializing database..."

    # Check if database initialization should be skipped
    if [ "$SKIP_DB_INIT" = "true" ]; then
        echo "⏭️  Skipping database initialization (SKIP_DB_INIT=true)"
        return 0
    fi

    # Try to initialize database
    if npm run db:init 2>&1 | tee /tmp/db-init.log; then
        echo "✅ Database initialized successfully!"
        return 0
    else
        # Check if the error was because database already exists
        if grep -q "already exists" /tmp/db-init.log; then
            echo "✅ Database already exists, continuing..."
            return 0
        else
            echo "⚠️  Warning: Database initialization failed"
            echo "   Check the logs above for details"
            echo "   The application will start anyway"
            return 1
        fi
    fi
}

# Function to build the application
build_app() {
    echo ""
    echo "🔨 Building application..."

    # Remove old build
    rm -rf dist

    # Build the application
    if npm run build; then
        echo "✅ Build completed successfully!"
        return 0
    else
        echo "❌ Build failed!"
        exit 1
    fi
}

# Function to start the server
start_server() {
    echo ""
    echo "🌐 Starting preview server..."
    echo "   Listening on: http://0.0.0.0:4173"
    echo ""
    echo "=================================="
    echo ""

    exec npx vite preview --host 0.0.0.0 --port 4173
}

# Main execution flow
main() {
    # Wait for PostgreSQL if DB_HOST is set
    if [ -n "$DB_HOST" ] && [ "$DB_HOST" != "localhost" ]; then
        if wait_for_postgres; then
            init_database
        fi
    else
        echo "ℹ️  No external database configured (DB_HOST not set)"
        echo "   Skipping database initialization"
    fi

    # Build the application
    build_app

    # Start the server
    start_server
}

# Run main function
main
