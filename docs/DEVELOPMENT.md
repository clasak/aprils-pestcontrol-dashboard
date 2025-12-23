# Development Guide

Complete guide for setting up and developing the April's Pest Control CRM platform.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Workflows](#development-workflows)
- [Docker Usage](#docker-usage)
- [Database Management](#database-management)
- [Running Tests](#running-tests)
- [Debugging](#debugging-tips)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Docker** >= 24.0.0
- **Docker Compose** >= 2.20.0
- **Git** >= 2.40.0

### Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - Docker
  - GitLens
  - REST Client
- **PostgreSQL Client** (psql or pgAdmin)
- **Postman** or **Insomnia** for API testing

### Verify Installation

```bash
node --version  # Should be >= v20.0.0
npm --version   # Should be >= 10.0.0
docker --version
docker-compose --version
```

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/aprils-pestcontrol/dashboard.git
cd aprils_pestcontrol_Dashboard
```

### 2. Setup Environment

```bash
# Copy environment variables and edit as needed
cp .env.example .env

# Install dependencies and start Docker services
npm run setup
```

This command will:
- Copy `.env.example` to `.env`
- Install all npm dependencies
- Build and start all Docker containers
- Run database migrations

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api/docs
- **pgAdmin**: http://localhost:5050 (use `--profile tools`)
- **Redis Commander**: http://localhost:8081 (use `--profile tools`)

---

## Development Workflows

### Local Development (Docker)

Start all services with Docker (recommended):

```bash
# Start all services
npm run docker:up

# Watch logs from all services
npm run docker:logs

# Or watch specific service logs
npm run docker:logs:backend
npm run docker:logs:frontend
```

The Docker setup includes hot-reload for both frontend and backend.

### Local Development (Native)

Run services directly on your machine:

```bash
# Terminal 1: Start database services only
npm run docker:db

# Terminal 2: Start backend
npm run dev:backend

# Terminal 3: Start frontend
npm run dev:frontend
```

### Development Scripts

```bash
# Start all services in Docker
npm run dev:local

# Run backend and frontend concurrently (native)
npm run dev

# Build all projects
npm run build

# Build specific project
npm run build:backend
npm run build:frontend

# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration

# Lint all code
npm run lint

# Format all code
npm run format

# Type check all code
npm run typecheck

# Run all validations (lint + type + test)
npm run validate
```

---

## Docker Usage

### Basic Commands

```bash
# Start all services
npm run docker:up

# Start with rebuild
npm run docker:up:build

# Stop all services
npm run docker:down

# Stop and remove volumes (CAUTION: deletes data)
npm run docker:down:volumes

# View running containers
npm run docker:ps

# Restart all services
npm run docker:restart

# Restart specific service
npm run docker:restart:backend
npm run docker:restart:frontend
```

### Service-Specific Commands

```bash
# Start only database services
npm run docker:db

# Start development tools (pgAdmin, Redis Commander)
npm run docker:tools

# View logs
npm run docker:logs
npm run docker:logs:backend
npm run docker:logs:frontend
npm run docker:logs:db
```

### Docker Health Check

```bash
# Check if all services are healthy
npm run docker:health
```

### Production Docker Build

```bash
# Build and start production containers
npm run docker:prod:build

# Start production containers
npm run docker:prod

# Stop production containers
npm run docker:prod:down
```

### Cleanup

```bash
# Remove containers, volumes, and prune system
npm run docker:clean

# Full cleanup (including node_modules)
npm run clean
```

---

## Database Management

### Migrations

```bash
# Run pending migrations
npm run db:migrate

# Revert last migration
npm run db:migrate:revert

# Show migration status
npm run db:migrate:show

# Create new migration
npm run db:migration:create -- --name=AddUserRoles

# Generate migration from entities (TypeORM)
npm run db:migration:generate -- --name=UpdateUserSchema
```

### Seeding

```bash
# Seed database with sample data
npm run db:seed

# Reset database (drop + migrate + seed)
npm run db:reset
```

### Database Access

```bash
# Access PostgreSQL shell (Docker)
npm run db:shell

# Or directly
docker-compose exec postgres psql -U postgres -d pestcontrol_dev

# Check database status
npm run db:status
```

### pgAdmin Access

1. Start pgAdmin:
   ```bash
   npm run docker:tools
   ```

2. Open http://localhost:5050

3. Login:
   - Email: `admin@aprilspestcontrol.com`
   - Password: `admin`

4. Add server:
   - Host: `postgres`
   - Port: `5432`
   - Database: `pestcontrol_dev`
   - Username: `postgres`
   - Password: `password`

---

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run backend tests only
npm run test --workspace=src/backend

# Run frontend tests only
npm run test --workspace=src/frontend
```

### Integration Tests

```bash
# Run backend integration tests
npm run test:integration
```

Integration tests require running database services:
```bash
npm run docker:db
npm run test:integration
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e
```

### Test Coverage

Coverage reports are generated in:
- Backend: `src/backend/coverage/`
- Frontend: `src/frontend/coverage/`

View coverage:
```bash
# Backend
open src/backend/coverage/lcov-report/index.html

# Frontend
open src/frontend/coverage/lcov-report/index.html
```

---

## Debugging Tips

### Backend Debugging (VS Code)

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "attach",
      "name": "Attach to Backend",
      "port": 9229,
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

Start backend with debugging:
```bash
cd src/backend
node --inspect=0.0.0.0:9229 -r ts-node/register src/main.ts
```

### Frontend Debugging

Use React DevTools browser extension:
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Firefox: [React DevTools](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Docker Debugging

```bash
# Execute commands in running container
docker-compose exec backend sh
docker-compose exec frontend sh

# View container logs
docker-compose logs backend --tail=100 --follow

# Inspect container
docker inspect pestcontrol-backend

# Check container resource usage
docker stats
```

### Database Debugging

```bash
# View active connections
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"

# View slow queries
docker-compose exec postgres psql -U postgres -c "SELECT * FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Check database size
docker-compose exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('pestcontrol_dev'));"
```

### Redis Debugging

```bash
# Access Redis CLI
docker-compose exec redis redis-cli

# Monitor all commands
docker-compose exec redis redis-cli MONITOR

# Check memory usage
docker-compose exec redis redis-cli INFO memory

# List all keys
docker-compose exec redis redis-cli KEYS '*'
```

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :4000  # Backend
lsof -i :5432  # PostgreSQL

# Kill process
kill -9 <PID>

# Or change port in .env
FRONTEND_PORT=3001
BACKEND_PORT=4001
```

### Docker Issues

```bash
# Restart Docker daemon
# macOS: Docker Desktop > Restart

# Remove all containers and volumes
npm run docker:clean

# Rebuild everything from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors

```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Reset database
npm run db:reset
```

### Hot Reload Not Working

```bash
# Restart containers
npm run docker:restart

# Rebuild with fresh volumes
npm run docker:down:volumes
npm run docker:up:build

# For native development, ensure node_modules are installed
npm install
```

### Permission Errors (Linux)

```bash
# Fix ownership of files
sudo chown -R $USER:$USER .

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Out of Memory Errors

```bash
# Increase Docker memory limit
# Docker Desktop > Settings > Resources > Memory

# Clear Docker build cache
docker builder prune -a

# Remove unused images
docker image prune -a
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf src/backend/dist
rm -rf src/frontend/dist

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Not Loading

```bash
# Ensure .env file exists
cp .env.example .env

# Restart services after changing .env
npm run docker:restart

# Verify environment variables in container
docker-compose exec backend env | grep DATABASE_URL
```

---

## VS Code Configuration

Recommended `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "files.exclude": {
    "**/.git": true,
    "**/.DS_Store": true,
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/build": true,
    "**/coverage": true
  }
}
```

---

## Git Workflow

### Pre-commit Hooks

We use Husky and lint-staged for pre-commit checks:

```bash
# Install Git hooks
npm run prepare

# Hooks will automatically:
# - Lint changed files
# - Format code with Prettier
# - Run type checks
```

### Commit Messages

Follow conventional commits:

```
feat: Add customer portal authentication
fix: Resolve route optimization bug
docs: Update API documentation
chore: Update dependencies
test: Add unit tests for service scheduling
refactor: Improve database query performance
```

---

## Additional Resources

- [API Documentation](./API.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Contributing Guidelines](../CONTRIBUTING.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Project Status](../PROJECT_STATUS.md)

---

## Getting Help

- **Slack**: #dev-support
- **Email**: dev-team@aprilspestcontrol.com
- **Issues**: [GitHub Issues](https://github.com/aprils-pestcontrol/dashboard/issues)

---

**Happy Coding!**
