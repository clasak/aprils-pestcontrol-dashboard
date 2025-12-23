# Database Setup Guide

## Initial Setup for Developers

This guide will help you set up the PostgreSQL database infrastructure for local development.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ and npm 10+ installed
- Git (for version control)

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# If you haven't already, clone the repository and install dependencies
cd /Users/codylytle/aprils_pestcontrol_Dashboard
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env if you need custom database credentials
# The defaults should work for local development
```

### 3. Start Database Services

```bash
# Start PostgreSQL and Redis with Docker
npm run docker:db

# Wait for services to be healthy (about 30 seconds)
# You can check status with:
npm run docker:ps
```

### 4. Initialize Database

```bash
# Create the database
npm run db:create

# Run migrations to create tables
npm run db:migrate

# Seed with test data
npm run db:seed
```

### 5. Verify Setup

```bash
# Check database status
npm run db:status
```

You should see output showing:
- Database connection successful
- PostgreSQL version
- Created schemas (core, sales, operations, etc.)
- Migration status
- Active connections

## Quick Reset (Development)

If you need to start fresh:

```bash
# This will drop, create, migrate, and seed the database
npm run db:reset
```

Note: This command will ask for confirmation before destroying data.

## Optional: Database Management Tools

### PgAdmin (PostgreSQL GUI)

```bash
# Start PgAdmin
npm run docker:tools

# Access at http://localhost:5050
# Email: admin@aprilspestcontrol.com
# Password: admin
```

The database server is pre-configured and will appear automatically.

### Redis Commander (Redis GUI)

```bash
# Already started with docker:tools
# Access at http://localhost:8081
```

## Test Users

After seeding, you can log in with these test accounts:

| Email | Password | Role |
|-------|----------|------|
| admin@aprilspestcontrol.com | password123 | Admin |
| manager@aprilspestcontrol.com | password123 | Manager |
| salesrep@aprilspestcontrol.com | password123 | Sales Rep |
| technician@aprilspestcontrol.com | password123 | Technician |
| dispatcher@aprilspestcontrol.com | password123 | Dispatcher |

## Database Schema Organization

The database uses multiple schemas for logical separation:

```
pestcontrol_dev/
├── public/           # System tables, audit logs
├── core/             # Users, organizations, branches
├── sales/            # Leads, accounts, quotes
├── operations/       # Routes, appointments, services
├── hr/               # Employees, payroll
├── finance/          # Invoices, payments
├── compliance/       # Licenses, certifications
├── analytics/        # Reporting tables
└── integration/      # API logs, sync status
```

## Common Commands

```bash
# Database Management
npm run db:create           # Create database
npm run db:status           # Check database status
npm run db:drop             # Drop database (with confirmation)
npm run db:reset            # Full reset (drop, create, migrate, seed)
npm run db:shell            # Open psql shell

# Migrations
npm run db:migrate          # Run pending migrations
npm run db:migrate:revert   # Revert last migration
npm run db:migrate:show     # Show migration status

# Seeds
npm run db:seed             # Seed test data

# Docker
npm run docker:db           # Start database services
npm run docker:tools        # Start with PgAdmin/Redis Commander
npm run docker:logs:db      # View database logs
npm run docker:down         # Stop all services
```

## Troubleshooting

### Database connection refused

```bash
# Make sure Docker services are running
npm run docker:db

# Check if containers are healthy
npm run docker:ps

# View logs for errors
npm run docker:logs:db
```

### Port already in use

If port 5432 or 6379 is already in use:

```bash
# Stop any local PostgreSQL/Redis instances
# Or change ports in docker-compose.yml:
# - "5433:5432" for PostgreSQL
# - "6380:6379" for Redis
# Then update DATABASE_URL and REDIS_URL in .env
```

### Migration errors

```bash
# Check what migrations have run
npm run db:migrate:show

# If stuck, reset the database
npm run db:reset
```

### Permission denied errors

```bash
# Make sure scripts are executable
chmod +x scripts/*.js

# Or run with node explicitly
node scripts/db-create.js
```

## Next Steps for Development

1. **Wait for Schema Design**: The @software-architect will provide the complete database schema design
2. **Create Migrations**: Once schema is ready, create migrations for all tables
3. **Build Entities**: Create TypeORM entity classes matching the schema
4. **Implement Repositories**: Add repository patterns for data access
5. **Add Business Logic**: Implement services and controllers

## Working with Migrations

### Creating a New Migration

```bash
# For a new table or schema change
npm run db:migration:create --name=AddAccountsTable

# This creates a file in src/backend/src/database/migrations/
# Edit the file to add your SQL
```

### Migration Template

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAccountsTable1703001000000 implements MigrationInterface {
  name = 'AddAccountsTable1703001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE sales.accounts (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        -- Add more columns
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS sales.accounts CASCADE`);
  }
}
```

### Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Verify migrations ran
npm run db:migrate:show
```

## Database Best Practices

1. **Always use migrations** - Never modify the database schema manually
2. **Test migrations** - Run up, test, run down, run up again
3. **Keep migrations atomic** - One logical change per migration
4. **Add indexes** - Include indexes in migrations for foreign keys and common queries
5. **Use transactions** - Migrations run in transactions for safety
6. **Document changes** - Add comments explaining complex migrations

## Production Deployment

For production deployment:

1. Review and test all migrations in staging
2. Backup database before running migrations
3. Run migrations during maintenance window
4. Monitor application logs for errors
5. Have rollback plan ready

```bash
# Production migration command (on server)
NODE_ENV=production npm run db:migrate
```

## Additional Resources

- [Database Documentation](/Users/codylytle/aprils_pestcontrol_Dashboard/docs/DATABASE.md)
- [TypeORM Migration Guide](https://typeorm.io/migrations)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
