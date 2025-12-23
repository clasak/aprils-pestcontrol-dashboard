-- Database Initialization Script for April's Pest Control CRM
-- This script creates the database schemas and sets up proper permissions

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- For fuzzy text search
CREATE EXTENSION IF NOT EXISTS "postgis";  -- For geospatial queries
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";  -- For query performance monitoring

-- Create schemas for logical separation of concerns
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS sales;
CREATE SCHEMA IF NOT EXISTS operations;
CREATE SCHEMA IF NOT EXISTS hr;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS compliance;
CREATE SCHEMA IF NOT EXISTS analytics;
CREATE SCHEMA IF NOT EXISTS integration;

-- Set default search path
ALTER DATABASE pestcontrol_dev SET search_path TO public, core, sales, operations, hr, finance, compliance, analytics, integration;

-- Create read-only role for analytics/reporting
CREATE ROLE pestcontrol_readonly;
GRANT CONNECT ON DATABASE pestcontrol_dev TO pestcontrol_readonly;
GRANT USAGE ON SCHEMA core, sales, operations, hr, finance, compliance, analytics, integration TO pestcontrol_readonly;

-- Create read-write role for application
CREATE ROLE pestcontrol_app;
GRANT CONNECT ON DATABASE pestcontrol_dev TO pestcontrol_app;
GRANT USAGE, CREATE ON SCHEMA core, sales, operations, hr, finance, compliance, analytics, integration TO pestcontrol_app;

-- Create admin role for migrations
CREATE ROLE pestcontrol_admin;
GRANT ALL PRIVILEGES ON DATABASE pestcontrol_dev TO pestcontrol_admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA core, sales, operations, hr, finance, compliance, analytics, integration TO pestcontrol_admin;

-- Grant the main postgres user to these roles
GRANT pestcontrol_readonly TO postgres;
GRANT pestcontrol_app TO postgres;
GRANT pestcontrol_admin TO postgres;

-- Create audit log table in public schema (for cross-schema auditing)
CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    schema_name VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    user_id UUID,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_table ON public.audit_log(schema_name, table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON public.audit_log(changed_at);

-- Create a function to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (schema_name, table_name, operation, new_data)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, 'INSERT', row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (schema_name, table_name, operation, old_data, new_data)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (schema_name, table_name, operation, old_data)
        VALUES (TG_TABLE_SCHEMA, TG_TABLE_NAME, 'DELETE', row_to_json(OLD)::jsonb);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Log initialization
INSERT INTO public.audit_log (schema_name, table_name, operation, new_data)
VALUES ('public', 'database', 'INIT', '{"message": "Database schemas initialized successfully"}'::jsonb);

COMMENT ON SCHEMA core IS 'Core entities: users, organizations, branches, roles';
COMMENT ON SCHEMA sales IS 'Sales cycle: leads, opportunities, accounts, quotes';
COMMENT ON SCHEMA operations IS 'Field operations: routes, appointments, technicians, services';
COMMENT ON SCHEMA hr IS 'Human resources: employees, payroll, time tracking';
COMMENT ON SCHEMA finance IS 'Finance: invoices, payments, billing';
COMMENT ON SCHEMA compliance IS 'Compliance tracking: licenses, certifications, chemical usage';
COMMENT ON SCHEMA analytics IS 'Analytics and reporting tables';
COMMENT ON SCHEMA integration IS 'Third-party integrations: Google Sheets sync, API logs';
-- Performance Optimization Indexes and Configuration
-- This script will be extended by migrations as tables are created

-- Configure PostgreSQL for better performance with our workload
-- These settings are optimized for a CRM with frequent reads and moderate writes

-- Enable parallel query execution for better performance on large datasets
ALTER SYSTEM SET max_parallel_workers_per_gather = 4;
ALTER SYSTEM SET max_parallel_workers = 8;

-- Optimize for mixed OLTP/OLAP workload
ALTER SYSTEM SET random_page_cost = 1.1;  -- Assuming SSD storage
ALTER SYSTEM SET effective_io_concurrency = 200;

-- Connection pooling optimization
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';

-- Logging for slow queries (helpful for optimization)
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries slower than 1 second
ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- Enable auto vacuum for better performance
ALTER SYSTEM SET autovacuum = on;
ALTER SYSTEM SET autovacuum_max_workers = 3;

-- Reload configuration (would normally need pg_ctl reload, but docker will handle on next restart)
SELECT pg_reload_conf();

-- Log performance configuration
INSERT INTO public.audit_log (schema_name, table_name, operation, new_data)
VALUES ('public', 'database', 'CONFIG', '{"message": "Performance indexes and configuration applied"}'::jsonb);
