# Deployment Guide

This guide explains how to deploy the April's Pest Control Dashboard in different environments.

## Quick Start

### Development Server (Docker)

Deploy all services using Docker containers:

```bash
npm run deploy:dev
```

Or manually:

```bash
./scripts/deploy-dev.sh
```

This will:
- Start PostgreSQL database
- Start Redis cache
- Start Backend API (NestJS) on port 4000
- Start Frontend (React) on port 8080
- Enable hot reload for development

**Access Points:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api/v1
- API Documentation: http://localhost:4000/api/docs
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Localhost Server (Local Services)

Deploy services locally without Docker (faster for development):

```bash
npm run deploy:localhost
```

Or manually:

```bash
./scripts/deploy-localhost.sh
```

This will:
- Start PostgreSQL and Redis in Docker (if not already running)
- Start Backend API locally on port 4000
- Start Frontend locally on port 8080
- Enable hot reload for both services

**Note:** This requires Node.js 20+ to be installed locally.

**Access Points:**
- Frontend: http://localhost:8080
- Backend API: http://localhost:4000/api/v1
- API Documentation: http://localhost:4000/api/docs

## Prerequisites

### For Docker Deployment

1. **Docker & Docker Compose**
   - Install Docker Desktop (Mac/Windows) or Docker Engine (Linux)
   - Verify: `docker --version` and `docker-compose --version`

2. **Environment Variables**
   - Copy `.env.example` to `.env` (if not exists)
   - Update configuration as needed

### For Localhost Deployment

1. **Node.js 20+**
   - Install from https://nodejs.org/
   - Verify: `node --version`

2. **PostgreSQL & Redis**
   - Option 1: Install locally
   - Option 2: Use Docker for database only: `npm run docker:db`

3. **Environment Variables**
   - Copy `.env.example` to `.env` (if not exists)
   - Update configuration as needed

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# Application Environment
NODE_ENV=development
BUILD_TARGET=development

# Database Configuration
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=pestcontrol_dev
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:password@localhost:5432/pestcontrol_dev

# Redis Configuration
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URL=redis://localhost:6379

# Application Ports
BACKEND_PORT=4000
FRONTEND_PORT=8080

# Backend API Configuration
PORT=4000
CORS_ORIGINS=http://localhost:8080
ENABLE_API_DOCS=true

# Frontend Configuration
VITE_API_URL=http://localhost:4000
VITE_WS_URL=ws://localhost:4000

# JWT Authentication
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Third-party Services (Optional)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
SENDGRID_API_KEY=
STRIPE_SECRET_KEY=
AWS_ACCESS_KEY_ID=
GOOGLE_MAPS_API_KEY=
```

## Database Setup

After deploying, run database migrations and seeds:

```bash
# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## Management Commands

### Docker Deployment

```bash
# View logs
npm run docker:logs

# View specific service logs
npm run docker:logs:backend
npm run docker:logs:frontend
npm run docker:logs:db

# Stop services
npm run docker:down

# Restart services
npm run docker:restart

# Check service status
npm run docker:ps

# Health check
npm run docker:health
```

### Localhost Deployment

Press `Ctrl+C` to stop all services.

## Development Tools

### pgAdmin (Database Management)

```bash
npm run docker:tools
```

Access at: http://localhost:5050
- Email: admin@aprilspestcontrol.com
- Password: admin

### Redis Commander (Redis Management)

```bash
npm run docker:tools
```

Access at: http://localhost:8081

## Troubleshooting

### Port Already in Use

If ports 3000 or 4000 are already in use:

1. **Change ports in `.env`:**
   ```env
   FRONTEND_PORT=8080
   BACKEND_PORT=4001
   ```

2. **Update frontend proxy in `src/frontend/vite.config.ts`**

### Database Connection Issues

1. **Check if PostgreSQL is running:**
   ```bash
   docker-compose ps postgres
   ```

2. **Check database logs:**
   ```bash
   npm run docker:logs:db
   ```

3. **Verify connection string in `.env`**

### Services Not Starting

1. **Check Docker is running:**
   ```bash
   docker info
   ```

2. **Check service logs:**
   ```bash
   npm run docker:logs
   ```

3. **Rebuild containers:**
   ```bash
   npm run docker:up:build
   ```

### Hot Reload Not Working

1. **Docker:** Ensure volumes are mounted correctly in `docker-compose.yml`
2. **Localhost:** Ensure you're using `npm run dev` (not `npm start`)

## Production Deployment

For production deployment, use:

```bash
npm run docker:prod:build
```

This uses `docker-compose.prod.yml` with production-optimized settings.

**Important:** Update all environment variables with production values before deploying.

## Next Steps

1. **Run Migrations:** `npm run db:migrate`
2. **Seed Data:** `npm run db:seed`
3. **Access Frontend:** http://localhost:3001
4. **View API Docs:** http://localhost:4000/api/docs
5. **Start Development:** Make changes and see hot reload in action!

## Support

For issues or questions:
- Check logs: `npm run docker:logs`
- Review documentation: `docs/` directory
- Check service health: `npm run docker:health`

