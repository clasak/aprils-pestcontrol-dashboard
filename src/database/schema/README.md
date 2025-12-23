# April's Pest Control Dashboard - Database Schema Design

## Overview

This document describes the complete PostgreSQL database schema architecture for the April's Pest Control Dashboard platform. The schema is organized into 10 distinct PostgreSQL schemas, each corresponding to a major functional module of the application.

## Architecture Philosophy

### Multi-Schema Approach

We use PostgreSQL schemas to logically organize tables by business domain:

```
PostgreSQL Database: aprils_pestcontrol
    |
    +-- core (authentication, authorization, audit)
    +-- sales (CRM, leads, deals, quotes, commissions)
    +-- ops (work orders, scheduling, routes, service reports)
    +-- hr (employees, time tracking, certifications, payroll)
    +-- finance (invoicing, payments, accounts, GL)
    +-- marketing (campaigns, automation, lead sources)
    +-- cs (customer service tickets, portal, knowledge base)
    +-- inventory (products, equipment, purchase orders)
    +-- compliance (EPA logs, OSHA, licenses, inspections)
    +-- mgmt (KPIs, dashboards, aggregated metrics)
```

### Benefits of Multi-Schema Design

1. **Logical Separation**: Each module's tables are grouped together
2. **Access Control**: Schema-level permissions for role-based access
3. **Maintainability**: Easier to understand and manage related tables
4. **Migration Safety**: Schema changes are isolated per module
5. **Future Scalability**: Can migrate schemas to separate databases if needed

## Design Principles

### 1. Single Source of Truth
- All business data flows through this database
- No duplicate data storage across modules
- Foreign keys enforce referential integrity

### 2. Audit Trail Support
- Every table has `created_at`, `updated_at` timestamps
- Soft deletes via `deleted_at` where appropriate
- Comprehensive audit logging in `core.audit_logs`
- 7-year data retention for EPA/OSHA compliance

### 3. Performance Optimization
- Strategic indexes on frequently queried columns
- Partial indexes for soft-deleted records
- JSONB for flexible custom fields
- UUID primary keys for distributed systems compatibility

### 4. Data Integrity
- Foreign key constraints on all relationships
- CHECK constraints for data validation
- NOT NULL constraints on required fields
- UNIQUE constraints to prevent duplicates

### 5. Extensibility
- JSONB `custom_fields` column on major entities
- `metadata` columns for integration data
- Enum types for controlled vocabularies
- Standardized status patterns

## Naming Conventions

### Tables
- Lowercase with underscores: `work_orders`, `quote_line_items`
- Plural nouns for entity tables: `contacts`, `employees`
- Descriptive join table names: `user_roles`, `deal_contacts`

### Columns
- Lowercase with underscores: `first_name`, `created_at`
- Foreign keys: `{table}_id` format: `user_id`, `contact_id`
- Timestamps: `*_at` suffix: `created_at`, `scheduled_at`
- Booleans: `is_*` or `has_*` prefix: `is_active`, `has_signature`
- Amounts/money: `*_amount` or `*_cents`: `total_amount`, `price_cents`

### Indexes
- Primary key: `{table}_pkey`
- Foreign key: `{table}_{column}_fkey`
- Unique: `{table}_{column}_key`
- Index: `{table}_{column}_idx`
- Composite: `{table}_{col1}_{col2}_idx`

### Constraints
- Check: `{table}_{column}_check`
- Unique: `{table}_{column}_key`

## Schema Dependencies

The schemas have the following dependency hierarchy:

```
Level 0 (Foundation):
    core -> (no dependencies)

Level 1 (Core Business):
    sales -> core
    hr -> core

Level 2 (Operations):
    ops -> core, sales, hr
    inventory -> core, hr

Level 3 (Support):
    finance -> core, sales, ops, hr
    compliance -> core, hr, inventory
    marketing -> core, sales
    cs -> core, sales, ops

Level 4 (Analytics):
    mgmt -> (reads from all schemas)
```

## Migration Order

Execute schema files in numerical order:

1. `001-core.sql` - Core tables (users, roles, permissions, companies, audit)
2. `002-sales.sql` - Sales module (contacts, leads, deals, quotes, commissions)
3. `003-operations.sql` - Operations module (work orders, schedules, routes)
4. `004-hr.sql` - HR module (employees, time entries, certifications)
5. `005-finance.sql` - Finance module (invoices, payments, accounts)
6. `006-marketing.sql` - Marketing module (campaigns, automation, sources)
7. `007-customer-service.sql` - Customer service (tickets, portal, surveys)
8. `008-inventory.sql` - Inventory module (products, equipment, POs)
9. `009-compliance.sql` - Compliance module (EPA logs, OSHA, licenses)
10. `010-management.sql` - Management dashboards (KPIs, metrics, widgets)

## Key Relationships

### Core Entity Relationships

```
                    +------------------+
                    |   core.company   |
                    +--------+---------+
                             |
         +-------------------+-------------------+
         |                   |                   |
+--------v--------+  +-------v-------+  +--------v--------+
|   core.users    |  | sales.contacts|  |  hr.employees   |
+--------+--------+  +-------+-------+  +--------+--------+
         |                   |                   |
         v                   v                   v
   (authenticates)     (manages deals)    (performs work)
```

### Work Order Flow

```
sales.deals (won)
    -> ops.work_orders
        -> ops.schedules
            -> ops.service_reports
                -> finance.invoices
```

### Chemical Usage Flow

```
inventory.products
    -> inventory.transactions (usage)
        -> compliance.chemical_usage_logs
            -> compliance.epa_reports
```

## Estimated Table Counts

| Schema | Tables | Description |
|--------|--------|-------------|
| core | 8 | Users, roles, permissions, audit |
| sales | 15 | Contacts, leads, deals, quotes |
| ops | 12 | Work orders, schedules, routes |
| hr | 10 | Employees, time, certifications |
| finance | 14 | Invoices, payments, accounts |
| marketing | 10 | Campaigns, automation, sources |
| cs | 10 | Tickets, portal, knowledge base |
| inventory | 12 | Products, equipment, POs |
| compliance | 12 | EPA, OSHA, licenses, inspections |
| mgmt | 8 | KPIs, dashboards, metrics |
| **Total** | **~111** | |

## Common Patterns

### Soft Deletes
```sql
deleted_at TIMESTAMPTZ DEFAULT NULL,
-- Query active records:
WHERE deleted_at IS NULL
```

### Audit Timestamps
```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
created_by UUID REFERENCES core.users(id),
updated_by UUID REFERENCES core.users(id)
```

### Status Enums
```sql
CREATE TYPE sales.deal_status AS ENUM (
    'open', 'won', 'lost', 'cancelled'
);
```

### Custom Fields
```sql
custom_fields JSONB DEFAULT '{}'::JSONB
-- Store: {"property_size": "large", "pest_types": ["ants", "roaches"]}
```

### Money Handling
```sql
-- Store as integer cents to avoid floating point issues
amount_cents INTEGER NOT NULL DEFAULT 0,
-- Or use NUMERIC for precise calculations
amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00
```

## Performance Considerations

### Indexes
- All foreign keys are indexed
- Frequently filtered columns (status, type, date ranges)
- Partial indexes exclude soft-deleted records
- GIN indexes on JSONB columns for queries

### Partitioning (Future)
- `core.audit_logs` - by month
- `compliance.chemical_usage_logs` - by year
- `finance.transactions` - by fiscal year

### Materialized Views
- `mgmt.daily_kpi_rollups` - refreshed nightly
- `mgmt.monthly_metrics` - refreshed on demand

## Security Considerations

### Row-Level Security (RLS)
- Enable RLS on tables with sensitive data
- Policies based on user roles and territories
- Example: Sales reps see only their territory contacts

### Column Encryption
- PII fields can use pgcrypto for encryption
- Payment data stored encrypted (PCI compliance)

### Audit Compliance
- All changes logged with user, timestamp, IP
- 7-year retention for EPA/OSHA compliance
- Immutable audit records (no updates/deletes)

## Extension Requirements

The following PostgreSQL extensions are required:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "btree_gist";   -- Exclusion constraints
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Text search
```

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-22 | Software Architect | Initial schema design |

## Contact

For schema questions or changes, contact:
- **Software Architect**: Architecture decisions
- **Database Engineer**: Implementation details
- **Technical Lead**: Development coordination
