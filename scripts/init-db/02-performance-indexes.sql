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
