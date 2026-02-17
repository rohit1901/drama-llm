#!/bin/sh

# PostgreSQL Check and Setup Helper Script
# Checks if PostgreSQL is installed and running, provides setup instructions

set -e

# Colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

printf "${BLUE}🔍 PostgreSQL Setup Check${NC}\n"
printf "==========================\n"
printf "\n"

# Check if PostgreSQL is installed
check_postgres_installed() {
    if command -v psql > /dev/null 2>&1; then
        printf "${GREEN}✅ PostgreSQL client is installed${NC}\n"
        psql --version
        return 0
    else
        printf "${RED}❌ PostgreSQL client is not installed${NC}\n"
        return 1
    fi
}

# Check if PostgreSQL server is running
check_postgres_running() {
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        printf "${GREEN}✅ PostgreSQL server is running${NC}\n"
        return 0
    else
        printf "${RED}❌ PostgreSQL server is not running${NC}\n"
        return 1
    fi
}

# Check if we can connect to PostgreSQL
check_postgres_connection() {
    local DB_USER=${DB_USER:-postgres}
    local DB_PASSWORD=${DB_PASSWORD:-postgres}

    if PGPASSWORD=$DB_PASSWORD psql -h localhost -p 5432 -U $DB_USER -c "SELECT 1" > /dev/null 2>&1; then
        printf "${GREEN}✅ Can connect to PostgreSQL${NC}\n"
        return 0
    else
        printf "${RED}❌ Cannot connect to PostgreSQL${NC}\n"
        printf "   Default credentials (postgres/postgres) didn't work\n"
        return 1
    fi
}

# Provide installation instructions
show_installation_instructions() {
    printf "\n"
    printf "${YELLOW}📦 PostgreSQL Installation Instructions:${NC}\n"
    printf "\n"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "macOS (using Homebrew):"
        echo "  1. Install PostgreSQL:"
        echo "     brew install postgresql@14"
        echo ""
        echo "  2. Start PostgreSQL:"
        echo "     brew services start postgresql@14"
        echo ""
        echo "  3. Initialize database:"
        echo "     initdb /usr/local/var/postgres"

    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v apt-get &> /dev/null; then
            # Debian/Ubuntu
            echo "Ubuntu/Debian:"
            echo "  1. Install PostgreSQL:"
            echo "     sudo apt-get update"
            echo "     sudo apt-get install postgresql postgresql-contrib"
            echo ""
            echo "  2. Start PostgreSQL:"
            echo "     sudo service postgresql start"

        elif command -v yum &> /dev/null; then
            # RedHat/CentOS
            echo "RedHat/CentOS:"
            echo "  1. Install PostgreSQL:"
            echo "     sudo yum install postgresql-server postgresql-contrib"
            echo ""
            echo "  2. Initialize database:"
            echo "     sudo postgresql-setup initdb"
            echo ""
            echo "  3. Start PostgreSQL:"
            echo "     sudo systemctl start postgresql"
        fi
    fi

    echo ""
    echo "Or use Docker:"
    echo "  docker run -d \\"
    echo "    --name drama-postgres \\"
    echo "    -e POSTGRES_PASSWORD=postgres \\"
    echo "    -e POSTGRES_DB=drama_llm \\"
    echo "    -p 5432:5432 \\"
    echo "    -v postgres_data:/var/lib/postgresql/data \\"
    echo "    postgres:16-alpine"
}

# Provide startup instructions
show_startup_instructions() {
    printf "\n"
    printf "${YELLOW}🚀 PostgreSQL Startup Instructions:${NC}\n"
    printf "\n"

    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        echo "macOS:"
        echo "  Start:   brew services start postgresql@14"
        echo "  Stop:    brew services stop postgresql@14"
        echo "  Restart: brew services restart postgresql@14"

    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        if command -v systemctl &> /dev/null; then
            echo "Linux (systemd):"
            echo "  Start:   sudo systemctl start postgresql"
            echo "  Stop:    sudo systemctl stop postgresql"
            echo "  Restart: sudo systemctl restart postgresql"
            echo "  Status:  sudo systemctl status postgresql"
        else
            echo "Linux (SysV):"
            echo "  Start:   sudo service postgresql start"
            echo "  Stop:    sudo service postgresql stop"
            echo "  Restart: sudo service postgresql restart"
            echo "  Status:  sudo service postgresql status"
        fi
    fi

    echo ""
    echo "Docker:"
    echo "  Start:   docker start drama-postgres"
    echo "  Stop:    docker stop drama-postgres"
    echo "  Logs:    docker logs -f drama-postgres"
}

# Provide connection troubleshooting
show_connection_troubleshooting() {
    printf "\n"
    printf "${YELLOW}🔧 Connection Troubleshooting:${NC}\n"
    printf "\n"
    echo "If you can't connect with default credentials:"
    echo ""
    echo "1. Check your PostgreSQL authentication:"
    echo "   macOS:  /usr/local/var/postgres/pg_hba.conf"
    echo "   Linux:  /etc/postgresql/*/main/pg_hba.conf"
    echo ""
    echo "2. Ensure 'trust' or 'md5' authentication is enabled for localhost"
    echo ""
    echo "3. Set custom credentials with environment variables:"
    echo "   export DB_USER=myuser"
    echo "   export DB_PASSWORD=mypass"
    echo "   make db-init"
    echo ""
    echo "4. Create PostgreSQL user if needed:"
    echo "   sudo -u postgres createuser --superuser $USER"
    echo "   sudo -u postgres psql -c \"ALTER USER $USER WITH PASSWORD 'postgres';\""
}

# Main execution
main() {
    local postgres_installed=false
    local postgres_running=false
    local postgres_connected=false

    # Check installation
    if check_postgres_installed; then
        postgres_installed=true
        echo ""

        # Check if running
        if check_postgres_running; then
            postgres_running=true
            echo ""

            # Check connection
            if check_postgres_connection; then
                postgres_connected=true
            fi
        fi
    fi

    printf "\n"
    printf "==========================\n"
    printf "${BLUE}📊 Summary${NC}\n"
    printf "==========================\n"

    if [ "$postgres_installed" = true ] && [ "$postgres_running" = true ] && [ "$postgres_connected" = true ]; then
        printf "\n"
        printf "${GREEN}🎉 PostgreSQL is ready!${NC}\n"
        printf "\n"
        echo "Next steps:"
        echo "  1. Initialize database: make db-init"
        echo "  2. Start backend: make dev-backend"
        echo "  3. Start frontend: make dev-frontend"
        echo ""
        exit 0
    fi

    # Show appropriate instructions based on what's missing
    if [ "$postgres_installed" = false ]; then
        show_installation_instructions
    fi

    if [ "$postgres_installed" = true ] && [ "$postgres_running" = false ]; then
        show_startup_instructions
    fi

    if [ "$postgres_installed" = true ] && [ "$postgres_running" = true ] && [ "$postgres_connected" = false ]; then
        show_connection_troubleshooting
    fi

    printf "\n"
    printf "${YELLOW}After fixing the issues above, run this script again to verify.${NC}\n"
    printf "\n"
    exit 1
}

# Run main function
main
