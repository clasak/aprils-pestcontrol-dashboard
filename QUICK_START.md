# Quick Start Guide

Get up and running with April's Pest Control Dashboard in minutes!

## Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

## One-Command Setup

### Development Server (Docker)

```bash
npm run deploy:dev
```

This single command will:
- ✅ Check and install dependencies
- ✅ Create `.env` file with defaults
- ✅ Start PostgreSQL database
- ✅ Start Redis cache
- ✅ Start Backend API (port 4000)
- ✅ Start Frontend (port 8080)
- ✅ Verify all services are healthy

**Access your application:**
- 🌐 Frontend: http://localhost:8080
- 🔌 Backend API: http://localhost:4000/api/v1
- 📚 API Docs: http://localhost:4000/api/docs

### Localhost Server (Local Services)

For faster development with hot reload:

```bash
npm run deploy:localhost
```

This runs services locally (database still uses Docker for convenience).

## First-Time Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aprils_pestcontrol_Dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Deploy**
   ```bash
   npm run deploy:dev
   ```

4. **Run database migrations** (in a new terminal)
   ```bash
   npm run db:migrate
   ```

5. **Seed initial data** (optional)
   ```bash
   npm run db:seed
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000
   - API Docs: http://localhost:4000/api/docs

## Common Commands

### Development
```bash
# Start dev server (Docker)
npm run deploy:dev

# Start localhost server
npm run deploy:localhost

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

### Database
```bash
# Run migrations
npm run db:migrate

# Seed data
npm run db:seed

# Database shell
npm run db:shell

# Reset database
npm run db:reset
```

### Management
```bash
# Check service status
npm run docker:ps

# Health check
npm run docker:health

# Restart services
npm run docker:restart
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 4000 are in use, update `.env`:
```env
FRONTEND_PORT=3001
BACKEND_PORT=4001
```

### Docker Not Running

Make sure Docker Desktop is running:
```bash
docker info
```

### Services Won't Start

1. Check logs: `npm run docker:logs`
2. Rebuild containers: `npm run docker:up:build`
3. Clean and restart: `npm run docker:down && npm run deploy:dev`

### Database Connection Issues

1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check database logs: `npm run docker:logs:db`
3. Verify `.env` has correct database credentials

## Next Steps

1. ✅ Services are running
2. ✅ Run migrations: `npm run db:migrate`
3. ✅ Seed data: `npm run db:seed`
4. ✅ Start developing!

## Need Help?

- 📖 Full documentation: See `DEPLOYMENT.md`
- 🐛 Issues: Check service logs
- 💬 Support: Review `docs/` directory

---

**Happy Coding! 🚀**

