# Database Infrastructure Documentation

## Overview

The pest control CRM uses PostgreSQL 15 as the primary database with TypeORM for migrations and entity management. Redis 7 is used for caching and session management.

## Architecture

### Database Schemas

The database is organized into logical schemas for better organization and security:

- **core**: Core entities (users, organizations, branches, roles)
- **sales**: Sales cycle management (leads, opportunities, accounts, quotes)
- **operations**: Field operations (routes, appointments, technicians, services)
- **hr**: Human resources (employees, payroll, time tracking)
- **finance**: Finance and billing (invoices, payments, subscriptions)
- **compliance**: Compliance tracking (licenses, certifications, chemical usage)
- **analytics**: Analytics and reporting tables
- **integration**: Third-party integrations (Google Sheets sync, API logs)

### Technology Stack

- **PostgreSQL 15**: Primary relational database
- **TypeORM**: ORM and migration management
- **Redis 7**: Caching and session storage
- **PostGIS**: Geospatial queries for route optimization
- **PgAdmin**: Database management UI (optional)

## Quick Start

### 1. Start Database Services

```bash
# Start PostgreSQL and Redis
npm run docker:db

# Or start all services including PgAdmin
npm run docker:tools
```

### 2. Create Database

```bash
npm run db:create
```

### 3. Run Migrations

```bash
npm run db:migrate
```

### 4. Seed Test Data

```bash
npm run db:seed
```

### 5. All-in-One Reset

```bash
# Drop, create, migrate, and seed in one command
npm run db:reset
```

## Available Commands

### Database Management

```bash
# Create database
npm run db:create

# Check database status
npm run db:status

# Drop database (caution!)
npm run db:drop

# Reset database (drop, create, migrate, seed)
npm run db:reset

# Open PostgreSQL shell
npm run db:shell
```

### Migration Management

```bash
# Run pending migrations
npm run db:migrate

# Revert last migration
npm run db:migrate:revert

# Show migration status
npm run db:migrate:show

# Create empty migration
npm run db:migration:create --name=MigrationName

# Generate migration from entity changes
npm run db:migration:generate --name=MigrationName
```

### Seeding

```bash
# Seed test data
npm run db:seed
```

### Docker Commands

```bash
# Start database services only
npm run docker:db

# Start with management tools (PgAdmin, Redis Commander)
npm run docker:tools

# View database logs
npm run docker:logs:db

# Restart database
docker-compose restart postgres
```

## Connection Details

### PostgreSQL

```
Host: localhost
Port: 5432
Database: pestcontrol_dev
Username: postgres
Password: password
```

Connection URL:
```
postgresql://postgres:password@localhost:5432/pestcontrol_dev
```

### Redis

```
Host: localhost
Port: 6379
```

Connection URL:
```
redis://localhost:6379
```

### PgAdmin (Optional)

Access PgAdmin at: http://localhost:5050

```
Email: admin@aprilspestcontrol.com
Password: admin
```

The database server is pre-configured and will appear in the PgAdmin UI.

### Redis Commander (Optional)

Access Redis Commander at: http://localhost:8081

## Configuration

### Environment Variables

See `.env.example` for all available configuration options:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/pestcontrol_dev
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10

# Redis
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=
```

### Performance Tuning

The PostgreSQL instance is pre-configured with optimized settings:

- **max_connections**: 100
- **shared_buffers**: 256MB
- **effective_cache_size**: 1GB
- **work_mem**: 2.6MB
- **maintenance_work_mem**: 64MB

These settings are optimized for development. Production settings should be tuned based on your server specifications.

## Migrations

### Migration Structure

Migrations are located in `/Users/codylytle/aprils_pestcontrol_Dashboard/src/backend/src/database/migrations/`

Each migration follows this structure:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1703001000000 implements MigrationInterface {
  name = 'MigrationName1703001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forward migration
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback migration
  }
}
```

### Creating Migrations

```bash
# Create empty migration
npm run db:migration:create --name=AddUserTable

# Generate migration from entity changes
npm run db:migration:generate --name=UpdateUserEntity
```

### Best Practices

1. **Always test migrations locally**
   - Run migration
   - Test application
   - Run rollback
   - Run migration again

2. **Keep migrations atomic**
   - One logical change per migration
   - Migrations should be reversible

3. **Never modify existing migrations**
   - Once deployed, migrations are immutable
   - Create new migrations to fix issues

4. **Include indexes**
   - Add indexes for foreign keys
   - Add indexes for commonly queried columns

## Seeding

Seed files are located in `/Users/codylytle/aprils_pestcontrol_Dashboard/src/backend/src/database/seeds/`

Seeds run in order:
1. Organizations
2. Branches
3. Users
4. (More seeds will be added as schema is developed)

### Test Users

After seeding, these test users are available:

- **admin@aprilspestcontrol.com** / password123 (Admin)
- **manager@aprilspestcontrol.com** / password123 (Manager)
- **salesrep@aprilspestcontrol.com** / password123 (Sales Rep)
- **technician@aprilspestcontrol.com** / password123 (Technician)
- **dispatcher@aprilspestcontrol.com** / password123 (Dispatcher)

## Database Features

### Audit Logging

All tables have automatic audit logging through triggers:

```sql
CREATE TRIGGER audit_<table_name>
  AFTER INSERT OR UPDATE OR DELETE ON <schema>.<table>
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_trigger_func();
```

Audit logs are stored in `public.audit_log` table.

### Soft Deletes

All entities support soft deletes through the `deleted_at` timestamp column.

### Automatic Timestamps

Tables include automatic timestamp management:

- `created_at`: Set on insert
- `updated_at`: Updated on every change
- `deleted_at`: Set on soft delete

### Geospatial Support

PostGIS is enabled for geospatial queries:

```sql
-- Find branches within radius
SELECT * FROM core.branches
WHERE ll_to_earth(latitude, longitude) <@>
      ll_to_earth(25.7617, -80.1918) < 10000; -- 10km
```

## Backup and Restore

### Backup

```bash
# Backup entire database
docker-compose exec postgres pg_dump -U postgres pestcontrol_dev > backup.sql

# Backup specific schema
docker-compose exec postgres pg_dump -U postgres -n core pestcontrol_dev > core_backup.sql
```

### Restore

```bash
# Restore database
docker-compose exec -T postgres psql -U postgres pestcontrol_dev < backup.sql
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
npm run db:status

# Start PostgreSQL
npm run docker:db

# View logs
npm run docker:logs:db
```

### Migration Issues

```bash
# Check migration status
npm run db:migrate:show

# Revert last migration
npm run db:migrate:revert

# Reset database (last resort)
npm run db:reset
```

### Permission Issues

```bash
# Grant all permissions to postgres user
docker-compose exec postgres psql -U postgres -d pestcontrol_dev -c "
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA core, sales, operations, hr, finance TO postgres;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA core, sales, operations, hr, finance TO postgres;
"
```

## Production Considerations

### Security

1. Change default passwords
2. Use environment variables for credentials
3. Enable SSL/TLS connections
4. Restrict network access
5. Regular security audits

### Performance

1. Monitor slow queries via `pg_stat_statements`
2. Regular VACUUM and ANALYZE
3. Index optimization based on query patterns
4. Connection pooling (PgBouncer)
5. Read replicas for scaling

### Backup Strategy

1. Daily automated backups
2. Point-in-time recovery enabled
3. Offsite backup storage
4. Regular restore testing

## Next Steps

1. Wait for schema design from @software-architect
2. Implement migrations based on schema
3. Create entity classes for TypeORM
4. Set up repository patterns
5. Add validation and business logic

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/15/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [Redis Documentation](https://redis.io/documentation)
