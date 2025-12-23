# Database Migrations

This directory contains TypeORM migrations for the pest control CRM database.

## Migration Naming Convention

Migrations follow this naming pattern:
```
{timestamp}-{descriptive-name}.ts
```

Examples:
- `1703001000000-CreateCoreSchema.ts`
- `1703002000000-CreateSalesSchema.ts`
- `1703003000000-AddIndexesToAccounts.ts`

## Creating a New Migration

```bash
# Generate a migration based on entity changes
npm run migration:generate --name=MigrationName

# Create an empty migration
npm run migration:create --name=MigrationName
```

## Running Migrations

```bash
# Run all pending migrations
npm run db:migrate

# Revert the last migration
npm run db:migrate:revert

# Show migration status
npm run db:migrate:show
```

## Migration Best Practices

1. **Always test migrations locally first**
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

4. **Use transactions**
   - Wrap DDL statements in transactions when possible
   - Ensure migrations are all-or-nothing

5. **Include indexes**
   - Add indexes for foreign keys
   - Add indexes for commonly queried columns
   - Consider partial indexes for filtered queries

6. **Data migrations**
   - Separate schema changes from data migrations
   - Use SQL for bulk operations (faster than ORM)
   - Include progress logging for large datasets

## Migration Structure

Each migration should have:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigrationName1703001000000 implements MigrationInterface {
  name = 'MigrationName1703001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Forward migration
    await queryRunner.query(`
      -- SQL statements here
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Rollback migration
    await queryRunner.query(`
      -- Reverse SQL statements here
    `);
  }
}
```

## Schema Organization

Migrations are organized by schema:

- **Core Schema**: Users, organizations, branches, roles
- **Sales Schema**: Leads, opportunities, accounts, quotes
- **Operations Schema**: Routes, appointments, technicians, services
- **HR Schema**: Employees, payroll, time tracking
- **Finance Schema**: Invoices, payments, billing
- **Compliance Schema**: Licenses, certifications, chemical usage
- **Analytics Schema**: Reporting and analytics tables
- **Integration Schema**: Google Sheets sync, API logs

## Waiting for Schema Design

The initial migrations will be created once @software-architect provides the database schema design. This directory is set up and ready for those migrations.
