.PHONY: help install dev build test clean docker-build docker-run docker-stop docker-logs db-init db-migrate db-seed version-patch version-minor version-major

# Default target
.DEFAULT_GOAL := help

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m # No Color

##@ General

help: ## Display this help message
	@echo "$(BLUE)Drama LLM - Makefile Commands$(NC)"
	@echo "================================"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2 } /^##@/ { printf "\n$(YELLOW)%s$(NC)\n", substr($$0, 5) } ' $(MAKEFILE_LIST)
	@echo ""

##@ Development

install: ## Install all dependencies (frontend and backend)
	@echo "$(BLUE)📦 Installing dependencies...$(NC)"
	@npm install
	@cd server && npm install
	@echo "$(GREEN)✅ Dependencies installed!$(NC)"

dev: ## Start development servers (frontend and backend)
	@echo "$(BLUE)🚀 Starting development servers...$(NC)"
	@echo "$(YELLOW)Note: Run 'make dev-frontend' and 'make dev-backend' in separate terminals$(NC)"
	@npm run dev

dev-frontend: ## Start frontend development server
	@echo "$(BLUE)🎨 Starting frontend dev server...$(NC)"
	@npm run dev

dev-backend: ## Start backend development server
	@echo "$(BLUE)⚙️  Starting backend dev server...$(NC)"
	@cd server && npm run dev

dev-all: ## Start all services (requires tmux or run in separate terminals)
	@echo "$(BLUE)🚀 Starting all services...$(NC)"
	@echo "$(YELLOW)Frontend: http://localhost:5173$(NC)"
	@echo "$(YELLOW)Backend: http://localhost:3001$(NC)"
	@echo "$(YELLOW)Ollama: http://localhost:11434$(NC)"

lint: ## Run linter on all code
	@echo "$(BLUE)🔍 Running linter...$(NC)"
	@npm run lint
	@cd server && npm run lint
	@echo "$(GREEN)✅ Linting complete!$(NC)"

format: ## Format code with prettier
	@echo "$(BLUE)✨ Formatting code...$(NC)"
	@npm run format
	@cd server && npm run format
	@echo "$(GREEN)✅ Code formatted!$(NC)"

type-check: ## Run TypeScript type checking
	@echo "$(BLUE)🔍 Checking types...$(NC)"
	@npm run type-check
	@echo "$(GREEN)✅ Type checking complete!$(NC)"

##@ Building

build: ## Build frontend for production
	@echo "$(BLUE)🔨 Building frontend...$(NC)"
	@npm run build
	@echo "$(GREEN)✅ Build complete!$(NC)"

build-backend: ## Build backend for production
	@echo "$(BLUE)🔨 Building backend...$(NC)"
	@cd server && npm run build
	@echo "$(GREEN)✅ Backend build complete!$(NC)"

build-all: build build-backend ## Build both frontend and backend
	@echo "$(GREEN)✅ All builds complete!$(NC)"

preview: ## Preview production build locally
	@echo "$(BLUE)👁️  Starting preview server...$(NC)"
	@npm run preview

##@ Testing

test: ## Run all tests
	@echo "$(BLUE)🧪 Running tests...$(NC)"
	@npm test

test-unit: ## Run unit tests only
	@echo "$(BLUE)🧪 Running unit tests...$(NC)"
	@npm run test:unit

test-integration: ## Run integration tests
	@echo "$(BLUE)🧪 Running integration tests...$(NC)"
	@npm run test:integration

test-e2e: ## Run end-to-end tests
	@echo "$(BLUE)🧪 Running E2E tests...$(NC)"
	@npm run test:e2e

test-docker: ## Run integration tests in Docker mode
	@echo "$(BLUE)🧪 Running Docker integration tests...$(NC)"
	@TEST_MODE=docker npm run test:integration

##@ Database

db-check: ## Check PostgreSQL installation and connection
	@echo "$(BLUE)🔍 Checking PostgreSQL...$(NC)"
	@sh scripts/check-postgres.sh

db-init: ## Initialize database with schema
	@echo "$(BLUE)📦 Initializing database...$(NC)"
	@if npm run db:init; then \
		echo "$(GREEN)✅ Database initialized!$(NC)"; \
	else \
		echo "$(RED)❌ Database initialization failed!$(NC)"; \
		echo "$(YELLOW)Troubleshooting:$(NC)"; \
		echo "  1. Make sure PostgreSQL is running: pg_isready"; \
		echo "  2. Check credentials (default: postgres/postgres)"; \
		echo "  3. Set environment variables if needed:"; \
		echo "     DB_USER=myuser DB_PASSWORD=mypass make db-init"; \
		echo "  4. Or run: make db-check"; \
		exit 1; \
	fi

db-migrate: ## Run database migrations
	@echo "$(BLUE)🔄 Running migrations...$(NC)"
	@npm run db:migrate
	@echo "$(GREEN)✅ Migrations complete!$(NC)"

db-seed: ## Seed database with test data
	@echo "$(BLUE)🌱 Seeding database...$(NC)"
	@npm run db:seed
	@echo "$(GREEN)✅ Database seeded!$(NC)"

db-reset: ## Reset database (drop and recreate)
	@echo "$(RED)⚠️  This will delete all data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		psql -U postgres -c "DROP DATABASE IF EXISTS drama_llm"; \
		make db-init; \
		make db-seed; \
	fi

db-backup: ## Backup database to file
	@echo "$(BLUE)💾 Backing up database...$(NC)"
	@mkdir -p backups
	@pg_dump -U postgres drama_llm > backups/drama_llm_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backed up!$(NC)"

db-restore: ## Restore database from latest backup
	@echo "$(BLUE)📥 Restoring database...$(NC)"
	@LATEST=$$(ls -t backups/*.sql | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(RED)❌ No backup files found!$(NC)"; \
		exit 1; \
	fi; \
	echo "$(YELLOW)Restoring from: $$LATEST$(NC)"; \
	psql -U postgres drama_llm < $$LATEST
	@echo "$(GREEN)✅ Database restored!$(NC)"

##@ Docker

docker-build: ## Build Docker images
	@echo "$(BLUE)🐳 Building Docker images...$(NC)"
	@docker-compose build
	@echo "$(GREEN)✅ Docker images built!$(NC)"

docker-run: ## Start Docker containers (includes database)
	@echo "$(BLUE)🐳 Starting Docker containers...$(NC)"
	@docker-compose up -d
	@echo ""
	@echo "$(YELLOW)⏳ Waiting for services to be healthy...$(NC)"
	@sleep 5
	@docker-compose ps
	@echo ""
	@echo "$(GREEN)✅ Containers started!$(NC)"
	@echo ""
	@echo "$(YELLOW)📊 Service URLs:$(NC)"
	@echo "  Frontend:  http://localhost:4173"
	@echo "  Backend:   http://localhost:3001"
	@echo "  Database:  localhost:5432"
	@echo "  Health:    http://localhost:3001/health"
	@echo ""
	@echo "$(YELLOW)💡 Tips:$(NC)"
	@echo "  - View logs:    make docker-logs"
	@echo "  - Check status: make docker-ps"
	@echo "  - Test setup:   make test-docker"
	@echo ""

docker-run-db: ## Start only PostgreSQL container
	@echo "$(BLUE)🐳 Starting PostgreSQL container...$(NC)"
	@docker-compose up -d postgres
	@echo "$(YELLOW)⏳ Waiting for PostgreSQL to be healthy...$(NC)"
	@sleep 5
	@docker-compose ps postgres
	@echo "$(GREEN)✅ PostgreSQL is running on localhost:5432$(NC)"
	@echo ""
	@echo "To initialize database, run: make docker-init-db"

docker-init-db: ## Initialize database in Docker
	@echo "$(BLUE)📦 Initializing database...$(NC)"
	@docker-compose up db-init
	@echo "$(GREEN)✅ Database initialized!$(NC)"

docker-stop: ## Stop Docker containers
	@echo "$(BLUE)🐳 Stopping Docker containers...$(NC)"
	@docker-compose down
	@echo "$(GREEN)✅ Containers stopped!$(NC)"

docker-restart: docker-stop docker-run ## Restart Docker containers

docker-logs: ## Show Docker logs (follow mode)
	@docker-compose logs -f

docker-logs-backend: ## Show backend logs only
	@docker-compose logs -f backend

docker-logs-frontend: ## Show frontend logs only
	@docker-compose logs -f frontend

docker-logs-db: ## Show database logs only
	@docker-compose logs -f postgres

docker-ps: ## Show running containers
	@docker-compose ps

docker-exec-backend: ## Open shell in backend container
	@docker-compose exec backend sh

docker-exec-frontend: ## Open shell in frontend container
	@docker-compose exec frontend sh

docker-exec-db: ## Open PostgreSQL shell
	@docker-compose exec postgres psql -U ${DB_USER:-postgres} -d ${DB_NAME:-drama_llm}

docker-shell-db: ## Open shell in PostgreSQL container
	@docker-compose exec postgres sh

docker-clean: ## Remove all containers, volumes, and images
	@echo "$(RED)⚠️  This will remove all Docker data including database!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(BLUE)🧹 Stopping containers...$(NC)"; \
		docker-compose down -v; \
		echo "$(BLUE)🧹 Removing Drama LLM volumes...$(NC)"; \
		docker volume rm drama_llm_postgres_data 2>/dev/null || true; \
		echo "$(BLUE)🧹 Pruning system...$(NC)"; \
		docker system prune -af --volumes; \
		echo "$(GREEN)✅ Docker cleaned!$(NC)"; \
	fi

docker-clean-volumes: ## Remove only Docker volumes (keeps images)
	@echo "$(YELLOW)⚠️  This will remove database data!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose down -v; \
		docker volume rm drama_llm_postgres_data 2>/dev/null || true; \
		echo "$(GREEN)✅ Volumes removed!$(NC)"; \
	fi

docker-rebuild: ## Rebuild and restart all containers
	@echo "$(BLUE)🔄 Rebuilding containers...$(NC)"
	@docker-compose down
	@docker-compose build --no-cache
	@docker-compose up -d
	@echo "$(GREEN)✅ Containers rebuilt and started!$(NC)"

docker-db-backup: ## Backup PostgreSQL database from Docker
	@echo "$(BLUE)💾 Backing up database from Docker...$(NC)"
	@mkdir -p backups
	@docker-compose exec -T postgres pg_dump -U ${DB_USER:-postgres} ${DB_NAME:-drama_llm} > backups/docker_drama_llm_$$(date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)✅ Database backed up!$(NC)"

docker-db-restore: ## Restore PostgreSQL database to Docker
	@echo "$(BLUE)📥 Restoring database to Docker...$(NC)"
	@LATEST=$$(ls -t backups/*.sql | head -1); \
	if [ -z "$$LATEST" ]; then \
		echo "$(RED)❌ No backup files found!$(NC)"; \
		exit 1; \
	fi; \
	echo "$(YELLOW)Restoring from: $$LATEST$(NC)"; \
	docker-compose exec -T postgres psql -U ${DB_USER:-postgres} ${DB_NAME:-drama_llm} < $$LATEST
	@echo "$(GREEN)✅ Database restored!$(NC)"

##@ Version Management

version-patch: ## Bump patch version (2.1.0 -> 2.1.1)
	@echo "$(BLUE)📦 Bumping patch version...$(NC)"
	@npm run version:patch
	@echo "$(GREEN)✅ Version bumped! Don't forget to update CHANGELOG.md$(NC)"

version-minor: ## Bump minor version (2.1.0 -> 2.2.0)
	@echo "$(BLUE)📦 Bumping minor version...$(NC)"
	@npm run version:minor
	@echo "$(GREEN)✅ Version bumped! Don't forget to update CHANGELOG.md$(NC)"

version-major: ## Bump major version (2.1.0 -> 3.0.0)
	@echo "$(BLUE)📦 Bumping major version...$(NC)"
	@npm run version:major
	@echo "$(GREEN)✅ Version bumped! Don't forget to update CHANGELOG.md$(NC)"

##@ Cleanup

clean: ## Clean build artifacts and dependencies
	@echo "$(BLUE)🧹 Cleaning...$(NC)"
	@rm -rf dist
	@rm -rf node_modules
	@rm -rf server/dist
	@rm -rf server/node_modules
	@echo "$(GREEN)✅ Cleaned!$(NC)"

clean-logs: ## Clean log files
	@echo "$(BLUE)🧹 Cleaning logs...$(NC)"
	@rm -rf server/logs/*.log
	@echo "$(GREEN)✅ Logs cleaned!$(NC)"

clean-cache: ## Clean npm cache
	@echo "$(BLUE)🧹 Cleaning cache...$(NC)"
	@npm cache clean --force
	@echo "$(GREEN)✅ Cache cleaned!$(NC)"

##@ Quick Actions

quick-start: install ## Quick setup: install deps and init database
	@echo "$(BLUE)🔍 Checking PostgreSQL...$(NC)"
	@if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then \
		echo "$(YELLOW)⚠️  PostgreSQL is not running$(NC)"; \
		echo "$(YELLOW)Run 'make db-check' for setup instructions$(NC)"; \
		echo ""; \
		echo "Quick options:"; \
		echo "  macOS:  brew services start postgresql"; \
		echo "  Linux:  sudo service postgresql start"; \
		echo "  Docker: docker run -d --name drama-postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine"; \
		echo ""; \
		echo "$(YELLOW)Then run: make db-init$(NC)"; \
	else \
		echo "$(GREEN)✅ PostgreSQL is running$(NC)"; \
		make db-init; \
	fi
	@echo ""
	@echo "$(GREEN)✅ Quick start complete!$(NC)"
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "  1. Terminal 1: make dev-backend"
	@echo "  2. Terminal 2: make dev-frontend"
	@echo "  3. Terminal 3: ollama serve"
	@echo "  4. Open http://localhost:5173"

quick-docker: docker-build docker-run ## Quick Docker setup: build and run with database
	@echo ""
	@echo "$(GREEN)✅ Docker environment ready!$(NC)"
	@echo ""
	@echo "$(YELLOW)⏳ Waiting for database initialization...$(NC)"
	@sleep 15
	@echo ""
	@make docker-ps
	@echo ""
	@echo "$(YELLOW)💡 Next steps:$(NC)"
	@echo "  1. Test setup:  make test-docker"
	@echo "  2. View logs:   make docker-logs"
	@echo "  3. Open app:    http://localhost:4173"
	@echo ""

quick-docker-db: ## Quick start: PostgreSQL only
	@echo "$(BLUE)🚀 Starting PostgreSQL in Docker...$(NC)"
	@docker-compose up -d postgres
	@echo "$(YELLOW)⏳ Waiting for PostgreSQL...$(NC)"
	@sleep 5
	@docker-compose up db-init
	@echo ""
	@echo "$(GREEN)✅ PostgreSQL is ready!$(NC)"
	@echo "$(YELLOW)Connection: localhost:5432$(NC)"
	@echo "$(YELLOW)Database: drama_llm$(NC)"
	@echo "$(YELLOW)User: postgres$(NC)"
	@echo ""
	@echo "You can now run local development:"
	@echo "  make dev-backend"
	@echo "  make dev-frontend"

quick-test: lint type-check test-integration ## Quick test: lint, type-check, and integration tests
	@echo "$(GREEN)✅ All tests passed!$(NC)"

##@ Information

status: ## Show status of all services
	@echo "$(BLUE)📊 Service Status$(NC)"
	@echo "===================="
	@echo ""
	@echo "$(YELLOW)Local Services:$(NC)"
	@echo "  Frontend (dev):"
	@curl -s http://localhost:5173 > /dev/null 2>&1 && echo "    $(GREEN)✓ Running$(NC)" || echo "    $(RED)✗ Not running$(NC)"
	@echo "  Frontend (preview):"
	@curl -s http://localhost:4173 > /dev/null 2>&1 && echo "    $(GREEN)✓ Running$(NC)" || echo "    $(RED)✗ Not running$(NC)"
	@echo "  Backend API:"
	@curl -s http://localhost:3001/health > /dev/null 2>&1 && echo "    $(GREEN)✓ Running$(NC)" || echo "    $(RED)✗ Not running$(NC)"
	@echo "  Ollama:"
	@curl -s http://localhost:11434 > /dev/null 2>&1 && echo "    $(GREEN)✓ Running$(NC)" || echo "    $(RED)✗ Not running$(NC)"
	@echo "  PostgreSQL:"
	@pg_isready -h localhost -p 5432 > /dev/null 2>&1 && echo "    $(GREEN)✓ Running$(NC)" || echo "    $(RED)✗ Not running$(NC)"
	@echo ""
	@echo "$(YELLOW)Docker Containers:$(NC)"
	@if docker ps --filter "name=drama_llm" --format "{{.Names}}" 2>/dev/null | grep -q .; then \
		docker ps --filter "name=drama_llm" --format "  - {{.Names}}: {{.Status}}" | while read line; do \
			if echo "$$line" | grep -q "Up"; then \
				echo "$$line" | sed "s/Up/$(GREEN)Up$(NC)/"; \
			else \
				echo "$$line" | sed "s/Exited/$(RED)Exited$(NC)/"; \
			fi; \
		done; \
	else \
		echo "  $(RED)✗ No containers running$(NC)"; \
	fi

info: ## Show project information
	@echo "$(BLUE)Drama LLM - Project Information$(NC)"
	@echo "=================================="
	@echo ""
	@echo "$(YELLOW)Version:$(NC) $$(node -p "require('./package.json').version")"
	@echo "$(YELLOW)Node:$(NC) $$(node --version)"
	@echo "$(YELLOW)NPM:$(NC) $$(npm --version)"
	@echo "$(YELLOW)Docker:$(NC) $$(docker --version 2>/dev/null || echo 'Not installed')"
	@echo "$(YELLOW)PostgreSQL:$(NC) $$(psql --version 2>/dev/null || echo 'Not installed')"
	@echo ""
	@echo "$(YELLOW)Project Root:$(NC) $$(pwd)"
	@echo "$(YELLOW)Frontend URL:$(NC) http://localhost:5173"
	@echo "$(YELLOW)Backend URL:$(NC) http://localhost:3001"
	@echo "$(YELLOW)Database:$(NC) postgresql://localhost:5432/drama_llm"
	@echo ""

urls: ## Show all service URLs
	@echo "$(BLUE)Service URLs$(NC)"
	@echo "=============="
	@echo ""
	@echo "$(YELLOW)Frontend (dev):$(NC)      http://localhost:5173"
	@echo "$(YELLOW)Frontend (preview):$(NC)  http://localhost:4173"
	@echo "$(YELLOW)Backend API:$(NC)         http://localhost:3001/api"
	@echo "$(YELLOW)Backend Health:$(NC)      http://localhost:3001/health"
	@echo "$(YELLOW)Ollama:$(NC)              http://localhost:11434"
	@echo "$(YELLOW)Database:$(NC)            postgresql://localhost:5432/drama_llm"
	@echo ""
