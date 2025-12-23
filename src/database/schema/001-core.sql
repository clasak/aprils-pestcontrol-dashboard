-- ============================================================================
-- April's Pest Control Dashboard - Core Schema
-- Version: 1.0.0
-- Description: Core tables for authentication, authorization, multi-tenancy,
--              and audit logging. This is the foundation schema that all other
--              schemas depend on.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create core schema
CREATE SCHEMA IF NOT EXISTS core;

-- Set search path for this script
SET search_path TO core, public;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- User status
CREATE TYPE core.user_status AS ENUM (
    'pending',      -- Invited but not yet activated
    'active',       -- Active user
    'suspended',    -- Temporarily suspended
    'deactivated'   -- Permanently deactivated
);

-- Permission action types
CREATE TYPE core.permission_action AS ENUM (
    'create',
    'read',
    'update',
    'delete',
    'manage',       -- Full CRUD + settings
    'export',       -- Export data
    'import'        -- Import data
);

-- Audit action types
CREATE TYPE core.audit_action AS ENUM (
    'create',
    'update',
    'delete',
    'restore',
    'login',
    'logout',
    'password_change',
    'permission_change',
    'export',
    'import',
    'view'
);

-- Notification channel types
CREATE TYPE core.notification_channel AS ENUM (
    'email',
    'sms',
    'push',
    'in_app'
);

-- ============================================================================
-- COMPANIES TABLE
-- ============================================================================
-- Multi-tenancy support (single company for MVP, designed for expansion)

CREATE TABLE core.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Company Information
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    dba_name VARCHAR(255),                          -- "Doing Business As" name

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    fax VARCHAR(50),
    website VARCHAR(255),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',

    -- Business Details
    tax_id VARCHAR(50),                             -- EIN/Tax ID
    business_license VARCHAR(100),
    pest_control_license VARCHAR(100),              -- State pest control license

    -- Branding
    logo_url VARCHAR(500),
    primary_color VARCHAR(7) DEFAULT '#1976D2',     -- Hex color
    secondary_color VARCHAR(7) DEFAULT '#424242',

    -- Settings
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
    currency VARCHAR(3) DEFAULT 'USD',
    fiscal_year_start_month INTEGER DEFAULT 1 CHECK (fiscal_year_start_month BETWEEN 1 AND 12),

    -- Feature Flags (JSONB for flexibility)
    features JSONB DEFAULT '{
        "sales_module": true,
        "operations_module": true,
        "hr_module": true,
        "finance_module": true,
        "marketing_module": true,
        "customer_service_module": true,
        "inventory_module": true,
        "compliance_module": true,
        "management_module": true
    }'::JSONB,

    -- Integration Settings
    integrations JSONB DEFAULT '{}'::JSONB,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT companies_email_format_check CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

COMMENT ON TABLE core.companies IS 'Company/tenant information for multi-tenancy support';
COMMENT ON COLUMN core.companies.features IS 'Feature flags controlling module access';
COMMENT ON COLUMN core.companies.integrations IS 'Third-party integration credentials and settings';

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Authentication
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),                     -- Null for SSO users

    -- Profile
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),                      -- Optional display name
    avatar_url VARCHAR(500),
    phone VARCHAR(50),
    mobile VARCHAR(50),

    -- Employment (link to HR if employee)
    employee_id UUID,                               -- FK to hr.employees (set after HR schema)

    -- Status
    status core.user_status NOT NULL DEFAULT 'pending',

    -- Email Verification
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMPTZ,

    -- Password Reset
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,

    -- Login Tracking
    last_login_at TIMESTAMPTZ,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,

    -- Session Management
    current_session_token VARCHAR(255),

    -- Preferences
    preferences JSONB DEFAULT '{
        "theme": "light",
        "notifications": {
            "email": true,
            "sms": false,
            "push": true
        },
        "dashboard_layout": "default",
        "default_module": "dashboard"
    }'::JSONB,

    -- Timezone (can override company setting)
    timezone VARCHAR(50),

    -- MFA
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    mfa_backup_codes TEXT[],

    -- API Access
    api_key VARCHAR(255),
    api_key_expires_at TIMESTAMPTZ,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,                                -- Self-referential after creation
    updated_by UUID,
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    -- Constraints
    CONSTRAINT users_email_unique UNIQUE (company_id, email),
    CONSTRAINT users_email_format_check CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT users_api_key_unique UNIQUE (api_key)
);

-- Add self-referential FKs after table creation
ALTER TABLE core.users
    ADD CONSTRAINT users_created_by_fkey FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT users_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES core.users(id);

COMMENT ON TABLE core.users IS 'User accounts for authentication and authorization';
COMMENT ON COLUMN core.users.employee_id IS 'Link to HR employee record if user is an employee';
COMMENT ON COLUMN core.users.preferences IS 'User-specific UI and notification preferences';

-- Indexes for users
CREATE INDEX users_company_id_idx ON core.users(company_id);
CREATE INDEX users_email_idx ON core.users(email);
CREATE INDEX users_status_idx ON core.users(status) WHERE deleted_at IS NULL;
CREATE INDEX users_employee_id_idx ON core.users(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX users_api_key_idx ON core.users(api_key) WHERE api_key IS NOT NULL;
CREATE INDEX users_last_login_idx ON core.users(last_login_at DESC NULLS LAST);

-- ============================================================================
-- ROLES TABLE
-- ============================================================================

CREATE TABLE core.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Role Definition
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Role Type
    is_system_role BOOLEAN DEFAULT FALSE,           -- Cannot be deleted if true
    is_default BOOLEAN DEFAULT FALSE,               -- Assigned to new users by default

    -- Role Hierarchy
    parent_role_id UUID REFERENCES core.roles(id),  -- For role inheritance
    priority INTEGER DEFAULT 0,                      -- Higher = more priority in conflicts

    -- Permissions (summary for quick checks)
    permissions_summary JSONB DEFAULT '{}'::JSONB,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT roles_name_unique UNIQUE (company_id, name)
);

COMMENT ON TABLE core.roles IS 'Role definitions for RBAC';
COMMENT ON COLUMN core.roles.is_system_role IS 'System roles cannot be deleted (Admin, etc.)';
COMMENT ON COLUMN core.roles.parent_role_id IS 'Parent role for permission inheritance';

-- Indexes for roles
CREATE INDEX roles_company_id_idx ON core.roles(company_id);
CREATE INDEX roles_parent_role_id_idx ON core.roles(parent_role_id) WHERE parent_role_id IS NOT NULL;

-- ============================================================================
-- PERMISSIONS TABLE
-- ============================================================================
-- Granular permissions for RBAC

CREATE TABLE core.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Permission Definition
    name VARCHAR(100) NOT NULL UNIQUE,              -- e.g., "sales.contacts.create"
    display_name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Module/Resource
    module VARCHAR(50) NOT NULL,                    -- e.g., "sales", "operations"
    resource VARCHAR(100) NOT NULL,                 -- e.g., "contacts", "work_orders"
    action core.permission_action NOT NULL,         -- e.g., "create", "read"

    -- Permission Type
    is_system_permission BOOLEAN DEFAULT FALSE,     -- Cannot be deleted

    -- Field-Level (optional)
    field_restrictions JSONB DEFAULT NULL,          -- Restrict access to specific fields

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT permissions_module_resource_action_unique
        UNIQUE (module, resource, action)
);

COMMENT ON TABLE core.permissions IS 'Granular permission definitions';
COMMENT ON COLUMN core.permissions.name IS 'Permission identifier: module.resource.action';
COMMENT ON COLUMN core.permissions.field_restrictions IS 'JSON list of allowed/denied fields';

-- Index for permissions
CREATE INDEX permissions_module_idx ON core.permissions(module);
CREATE INDEX permissions_resource_idx ON core.permissions(resource);

-- ============================================================================
-- ROLE_PERMISSIONS TABLE
-- ============================================================================
-- Many-to-many relationship between roles and permissions

CREATE TABLE core.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES core.permissions(id) ON DELETE CASCADE,

    -- Conditions (optional, for conditional permissions)
    conditions JSONB DEFAULT NULL,                  -- e.g., {"territory_id": "user.territory_id"}

    -- Record-Level Access
    record_filter JSONB DEFAULT NULL,               -- e.g., {"owner_id": "{{user_id}}"}

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),

    CONSTRAINT role_permissions_unique UNIQUE (role_id, permission_id)
);

COMMENT ON TABLE core.role_permissions IS 'Association between roles and permissions';
COMMENT ON COLUMN core.role_permissions.conditions IS 'Conditional permissions based on context';
COMMENT ON COLUMN core.role_permissions.record_filter IS 'Filter for record-level access control';

-- Indexes for role_permissions
CREATE INDEX role_permissions_role_id_idx ON core.role_permissions(role_id);
CREATE INDEX role_permissions_permission_id_idx ON core.role_permissions(permission_id);

-- ============================================================================
-- USER_ROLES TABLE
-- ============================================================================
-- Many-to-many relationship between users and roles

CREATE TABLE core.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,

    -- Territory/Scope (optional)
    territory_id UUID,                              -- Limit role to specific territory

    -- Effective Dates
    effective_from TIMESTAMPTZ DEFAULT NOW(),
    effective_until TIMESTAMPTZ,                    -- Null = indefinite

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),

    CONSTRAINT user_roles_unique UNIQUE (user_id, role_id, territory_id)
);

COMMENT ON TABLE core.user_roles IS 'Association between users and roles';
COMMENT ON COLUMN core.user_roles.territory_id IS 'Scope role to specific territory';

-- Indexes for user_roles
CREATE INDEX user_roles_user_id_idx ON core.user_roles(user_id);
CREATE INDEX user_roles_role_id_idx ON core.user_roles(role_id);
CREATE INDEX user_roles_territory_id_idx ON core.user_roles(territory_id) WHERE territory_id IS NOT NULL;
CREATE INDEX user_roles_effective_idx ON core.user_roles(effective_from, effective_until);

-- ============================================================================
-- TERRITORIES TABLE
-- ============================================================================
-- Geographic or account-based territories for access control

CREATE TABLE core.territories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Territory Definition
    name VARCHAR(100) NOT NULL,
    description TEXT,
    code VARCHAR(20),                               -- Short code for display

    -- Geographic Boundaries
    zip_codes TEXT[],                               -- Array of ZIP codes
    cities TEXT[],                                  -- Array of cities
    counties TEXT[],                                -- Array of counties
    states TEXT[],                                  -- Array of states

    -- GeoJSON boundary (for map display)
    boundary JSONB,

    -- Hierarchy
    parent_territory_id UUID REFERENCES core.territories(id),

    -- Assignment
    manager_user_id UUID REFERENCES core.users(id),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Performance Targets
    revenue_target NUMERIC(12, 2),
    quota_target NUMERIC(12, 2),

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT territories_name_unique UNIQUE (company_id, name),
    CONSTRAINT territories_code_unique UNIQUE (company_id, code)
);

COMMENT ON TABLE core.territories IS 'Sales/service territories for geographic access control';
COMMENT ON COLUMN core.territories.boundary IS 'GeoJSON polygon for map visualization';

-- Indexes for territories
CREATE INDEX territories_company_id_idx ON core.territories(company_id);
CREATE INDEX territories_parent_territory_id_idx ON core.territories(parent_territory_id);
CREATE INDEX territories_manager_user_id_idx ON core.territories(manager_user_id);
CREATE INDEX territories_zip_codes_idx ON core.territories USING GIN(zip_codes);
CREATE INDEX territories_is_active_idx ON core.territories(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- AUDIT_LOGS TABLE
-- ============================================================================
-- Comprehensive audit trail for all changes (7-year retention for compliance)

CREATE TABLE core.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Who
    user_id UUID REFERENCES core.users(id),
    user_email VARCHAR(255),                        -- Denormalized for historical reference
    user_name VARCHAR(200),                         -- Denormalized for historical reference

    -- What
    action core.audit_action NOT NULL,

    -- Where
    module VARCHAR(50) NOT NULL,                    -- e.g., "sales", "operations"
    resource VARCHAR(100) NOT NULL,                 -- e.g., "contacts", "work_orders"
    resource_id UUID,                               -- ID of the affected record
    resource_identifier VARCHAR(255),               -- Human-readable identifier

    -- Details
    description TEXT,
    changes JSONB,                                  -- Before/after for updates
    old_values JSONB,                               -- Previous values
    new_values JSONB,                               -- New values

    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    request_id VARCHAR(255),                        -- Correlation ID

    -- API Context
    api_endpoint VARCHAR(500),
    api_method VARCHAR(10),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Partition key (for future partitioning)
    partition_key DATE GENERATED ALWAYS AS (DATE(created_at)) STORED
);

COMMENT ON TABLE core.audit_logs IS 'Immutable audit trail for all system changes';
COMMENT ON COLUMN core.audit_logs.changes IS 'JSON diff showing what changed';
COMMENT ON COLUMN core.audit_logs.partition_key IS 'For table partitioning by date';

-- Indexes for audit_logs (optimized for compliance queries)
CREATE INDEX audit_logs_company_id_idx ON core.audit_logs(company_id);
CREATE INDEX audit_logs_user_id_idx ON core.audit_logs(user_id);
CREATE INDEX audit_logs_created_at_idx ON core.audit_logs(created_at DESC);
CREATE INDEX audit_logs_module_resource_idx ON core.audit_logs(module, resource);
CREATE INDEX audit_logs_resource_id_idx ON core.audit_logs(resource_id) WHERE resource_id IS NOT NULL;
CREATE INDEX audit_logs_action_idx ON core.audit_logs(action);
CREATE INDEX audit_logs_partition_key_idx ON core.audit_logs(partition_key);

-- ============================================================================
-- SESSIONS TABLE
-- ============================================================================
-- User session management

CREATE TABLE core.sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,

    -- Session Token
    token VARCHAR(255) NOT NULL UNIQUE,
    refresh_token VARCHAR(255),

    -- Device Info
    device_type VARCHAR(50),                        -- desktop, mobile, tablet
    device_name VARCHAR(100),
    browser VARCHAR(100),
    os VARCHAR(100),

    -- Location
    ip_address INET,
    location_city VARCHAR(100),
    location_country VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    revoked_at TIMESTAMPTZ,
    revoked_reason VARCHAR(255)
);

COMMENT ON TABLE core.sessions IS 'Active user sessions for token management';

-- Indexes for sessions
CREATE INDEX sessions_user_id_idx ON core.sessions(user_id);
CREATE INDEX sessions_token_idx ON core.sessions(token);
CREATE INDEX sessions_expires_at_idx ON core.sessions(expires_at);
CREATE INDEX sessions_is_active_idx ON core.sessions(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================
-- User notifications (in-app, email, SMS, push)

CREATE TABLE core.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,

    -- Notification Content
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,

    -- Classification
    category VARCHAR(50) NOT NULL,                  -- e.g., "alert", "reminder", "update"
    priority VARCHAR(20) DEFAULT 'normal',          -- low, normal, high, urgent

    -- Channel
    channel core.notification_channel NOT NULL DEFAULT 'in_app',

    -- Link/Action
    action_url VARCHAR(500),
    action_label VARCHAR(100),

    -- Related Entity
    related_module VARCHAR(50),
    related_resource VARCHAR(100),
    related_id UUID,

    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,

    -- Delivery Status (for email/SMS)
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,

    -- Data
    data JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

COMMENT ON TABLE core.notifications IS 'User notifications across all channels';

-- Indexes for notifications
CREATE INDEX notifications_user_id_idx ON core.notifications(user_id);
CREATE INDEX notifications_is_read_idx ON core.notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX notifications_created_at_idx ON core.notifications(created_at DESC);
CREATE INDEX notifications_category_idx ON core.notifications(category);

-- ============================================================================
-- SYSTEM_SETTINGS TABLE
-- ============================================================================
-- Key-value store for system configuration

CREATE TABLE core.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES core.companies(id) ON DELETE CASCADE,  -- NULL = global

    -- Setting Definition
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,

    -- Metadata
    description TEXT,
    is_sensitive BOOLEAN DEFAULT FALSE,             -- Hide value in logs
    is_readonly BOOLEAN DEFAULT FALSE,              -- Cannot be changed via UI

    -- Validation
    value_type VARCHAR(50) DEFAULT 'string',        -- string, number, boolean, json
    validation_schema JSONB,                        -- JSON Schema for validation

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES core.users(id),

    CONSTRAINT system_settings_key_unique UNIQUE (company_id, key)
);

COMMENT ON TABLE core.system_settings IS 'System configuration key-value store';
COMMENT ON COLUMN core.system_settings.company_id IS 'NULL for global settings, company_id for per-company';

-- Index for system_settings
CREATE INDEX system_settings_company_id_idx ON core.system_settings(company_id);
CREATE INDEX system_settings_key_idx ON core.system_settings(key);

-- ============================================================================
-- WEBHOOKS TABLE
-- ============================================================================
-- Webhook configuration for external integrations

CREATE TABLE core.webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Webhook Definition
    name VARCHAR(100) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,

    -- Authentication
    auth_type VARCHAR(20) DEFAULT 'none',           -- none, basic, bearer, hmac
    auth_config JSONB,                              -- Encrypted credentials

    -- Events
    events TEXT[] NOT NULL,                         -- Array of event types

    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    retry_count INTEGER DEFAULT 3,
    retry_delay_seconds INTEGER DEFAULT 60,
    timeout_seconds INTEGER DEFAULT 30,

    -- Headers
    custom_headers JSONB DEFAULT '{}'::JSONB,

    -- Secret for HMAC signing
    secret VARCHAR(255),

    -- Status
    last_triggered_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    consecutive_failures INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

COMMENT ON TABLE core.webhooks IS 'Webhook configurations for external system integration';

-- Indexes for webhooks
CREATE INDEX webhooks_company_id_idx ON core.webhooks(company_id);
CREATE INDEX webhooks_is_active_idx ON core.webhooks(is_active) WHERE is_active = TRUE;
CREATE INDEX webhooks_events_idx ON core.webhooks USING GIN(events);

-- ============================================================================
-- WEBHOOK_LOGS TABLE
-- ============================================================================
-- Log of webhook deliveries

CREATE TABLE core.webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID NOT NULL REFERENCES core.webhooks(id) ON DELETE CASCADE,

    -- Event
    event_type VARCHAR(100) NOT NULL,
    event_id UUID,

    -- Request
    request_url VARCHAR(500) NOT NULL,
    request_headers JSONB,
    request_body JSONB,

    -- Response
    response_status INTEGER,
    response_headers JSONB,
    response_body TEXT,

    -- Timing
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    response_time_ms INTEGER,

    -- Status
    is_success BOOLEAN,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ
);

COMMENT ON TABLE core.webhook_logs IS 'Webhook delivery log for debugging';

-- Indexes for webhook_logs
CREATE INDEX webhook_logs_webhook_id_idx ON core.webhook_logs(webhook_id);
CREATE INDEX webhook_logs_sent_at_idx ON core.webhook_logs(sent_at DESC);
CREATE INDEX webhook_logs_is_success_idx ON core.webhook_logs(is_success);

-- ============================================================================
-- API_KEYS TABLE
-- ============================================================================
-- API key management for external integrations

CREATE TABLE core.api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES core.users(id),         -- Optional owner

    -- Key
    name VARCHAR(100) NOT NULL,
    description TEXT,
    key_prefix VARCHAR(10) NOT NULL,                -- First 10 chars for identification
    key_hash VARCHAR(255) NOT NULL,                 -- Hashed full key

    -- Permissions
    scopes TEXT[],                                  -- Array of permission scopes
    rate_limit INTEGER DEFAULT 1000,                -- Requests per hour

    -- IP Restrictions
    allowed_ips INET[],

    -- Expiration
    expires_at TIMESTAMPTZ,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    last_used_at TIMESTAMPTZ,
    use_count INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    revoked_at TIMESTAMPTZ,
    revoked_by UUID REFERENCES core.users(id)
);

COMMENT ON TABLE core.api_keys IS 'API keys for programmatic access';
COMMENT ON COLUMN core.api_keys.key_prefix IS 'Visible prefix for key identification';
COMMENT ON COLUMN core.api_keys.key_hash IS 'Bcrypt hash of full API key';

-- Indexes for api_keys
CREATE INDEX api_keys_company_id_idx ON core.api_keys(company_id);
CREATE INDEX api_keys_key_prefix_idx ON core.api_keys(key_prefix);
CREATE INDEX api_keys_is_active_idx ON core.api_keys(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- FILE_UPLOADS TABLE
-- ============================================================================
-- Track all file uploads across the system

CREATE TABLE core.file_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES core.users(id),

    -- File Info
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_url VARCHAR(500),

    -- Metadata
    content_type VARCHAR(100),
    file_size_bytes BIGINT,
    file_hash VARCHAR(64),                          -- SHA-256 hash

    -- Classification
    category VARCHAR(50),                           -- document, image, report, etc.

    -- Related Entity
    related_module VARCHAR(50),
    related_resource VARCHAR(100),
    related_id UUID,

    -- Storage
    storage_provider VARCHAR(50) DEFAULT 's3',
    storage_bucket VARCHAR(100),

    -- Status
    is_public BOOLEAN DEFAULT FALSE,
    is_temporary BOOLEAN DEFAULT FALSE,

    -- Virus Scan
    scanned_at TIMESTAMPTZ,
    scan_result VARCHAR(50),                        -- clean, infected, error

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE core.file_uploads IS 'Centralized file upload tracking';

-- Indexes for file_uploads
CREATE INDEX file_uploads_company_id_idx ON core.file_uploads(company_id);
CREATE INDEX file_uploads_uploaded_by_idx ON core.file_uploads(uploaded_by);
CREATE INDEX file_uploads_related_idx ON core.file_uploads(related_module, related_resource, related_id);
CREATE INDEX file_uploads_category_idx ON core.file_uploads(category);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION core.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log changes to audit_logs
CREATE OR REPLACE FUNCTION core.log_audit_trail()
RETURNS TRIGGER AS $$
DECLARE
    action_type core.audit_action;
    old_values JSONB;
    new_values JSONB;
    changes JSONB;
    resource_identifier TEXT;
BEGIN
    -- Determine action type
    IF TG_OP = 'INSERT' THEN
        action_type := 'create';
        new_values := to_jsonb(NEW);
        old_values := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        action_type := 'update';
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        -- Calculate changes
        changes := jsonb_build_object(
            'before', old_values,
            'after', new_values
        );
    ELSIF TG_OP = 'DELETE' THEN
        action_type := 'delete';
        old_values := to_jsonb(OLD);
        new_values := NULL;
    END IF;

    -- Try to get a meaningful identifier
    IF TG_OP = 'DELETE' THEN
        resource_identifier := COALESCE(
            OLD.name::TEXT,
            OLD.email::TEXT,
            OLD.id::TEXT
        );
    ELSE
        resource_identifier := COALESCE(
            NEW.name::TEXT,
            NEW.email::TEXT,
            NEW.id::TEXT
        );
    END IF;

    -- Insert audit log
    INSERT INTO core.audit_logs (
        company_id,
        user_id,
        action,
        module,
        resource,
        resource_id,
        resource_identifier,
        old_values,
        new_values,
        changes
    )
    SELECT
        COALESCE(NEW.company_id, OLD.company_id),
        current_setting('app.current_user_id', TRUE)::UUID,
        action_type,
        TG_TABLE_SCHEMA,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        resource_identifier,
        old_values,
        new_values,
        changes;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- APPLY TRIGGERS TO CORE TABLES
-- ============================================================================

-- Update timestamp triggers
CREATE TRIGGER companies_updated_at
    BEFORE UPDATE ON core.companies
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON core.users
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER roles_updated_at
    BEFORE UPDATE ON core.roles
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER territories_updated_at
    BEFORE UPDATE ON core.territories
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER system_settings_updated_at
    BEFORE UPDATE ON core.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER webhooks_updated_at
    BEFORE UPDATE ON core.webhooks
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER api_keys_updated_at
    BEFORE UPDATE ON core.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

-- ============================================================================
-- SEED DATA - Default Permissions
-- ============================================================================

-- Insert system permissions for all modules
INSERT INTO core.permissions (name, display_name, description, module, resource, action, is_system_permission) VALUES
-- Sales Module
('sales.contacts.create', 'Create Contacts', 'Create new contacts', 'sales', 'contacts', 'create', TRUE),
('sales.contacts.read', 'View Contacts', 'View contact information', 'sales', 'contacts', 'read', TRUE),
('sales.contacts.update', 'Edit Contacts', 'Edit contact information', 'sales', 'contacts', 'update', TRUE),
('sales.contacts.delete', 'Delete Contacts', 'Delete contacts', 'sales', 'contacts', 'delete', TRUE),
('sales.contacts.export', 'Export Contacts', 'Export contact data', 'sales', 'contacts', 'export', TRUE),
('sales.contacts.import', 'Import Contacts', 'Import contact data', 'sales', 'contacts', 'import', TRUE),

('sales.leads.create', 'Create Leads', 'Create new leads', 'sales', 'leads', 'create', TRUE),
('sales.leads.read', 'View Leads', 'View lead information', 'sales', 'leads', 'read', TRUE),
('sales.leads.update', 'Edit Leads', 'Edit lead information', 'sales', 'leads', 'update', TRUE),
('sales.leads.delete', 'Delete Leads', 'Delete leads', 'sales', 'leads', 'delete', TRUE),
('sales.leads.manage', 'Manage Leads', 'Full lead management', 'sales', 'leads', 'manage', TRUE),

('sales.deals.create', 'Create Deals', 'Create new deals', 'sales', 'deals', 'create', TRUE),
('sales.deals.read', 'View Deals', 'View deal information', 'sales', 'deals', 'read', TRUE),
('sales.deals.update', 'Edit Deals', 'Edit deal information', 'sales', 'deals', 'update', TRUE),
('sales.deals.delete', 'Delete Deals', 'Delete deals', 'sales', 'deals', 'delete', TRUE),
('sales.deals.manage', 'Manage Deals', 'Full deal management', 'sales', 'deals', 'manage', TRUE),

('sales.quotes.create', 'Create Quotes', 'Create new quotes', 'sales', 'quotes', 'create', TRUE),
('sales.quotes.read', 'View Quotes', 'View quote information', 'sales', 'quotes', 'read', TRUE),
('sales.quotes.update', 'Edit Quotes', 'Edit quote information', 'sales', 'quotes', 'update', TRUE),
('sales.quotes.delete', 'Delete Quotes', 'Delete quotes', 'sales', 'quotes', 'delete', TRUE),
('sales.quotes.manage', 'Manage Quotes', 'Full quote management', 'sales', 'quotes', 'manage', TRUE),

-- Operations Module
('operations.work_orders.create', 'Create Work Orders', 'Create new work orders', 'operations', 'work_orders', 'create', TRUE),
('operations.work_orders.read', 'View Work Orders', 'View work order information', 'operations', 'work_orders', 'read', TRUE),
('operations.work_orders.update', 'Edit Work Orders', 'Edit work order information', 'operations', 'work_orders', 'update', TRUE),
('operations.work_orders.delete', 'Delete Work Orders', 'Delete work orders', 'operations', 'work_orders', 'delete', TRUE),
('operations.work_orders.manage', 'Manage Work Orders', 'Full work order management', 'operations', 'work_orders', 'manage', TRUE),

('operations.schedules.create', 'Create Schedules', 'Create new schedules', 'operations', 'schedules', 'create', TRUE),
('operations.schedules.read', 'View Schedules', 'View schedule information', 'operations', 'schedules', 'read', TRUE),
('operations.schedules.update', 'Edit Schedules', 'Edit schedule information', 'operations', 'schedules', 'update', TRUE),
('operations.schedules.delete', 'Delete Schedules', 'Delete schedules', 'operations', 'schedules', 'delete', TRUE),

('operations.routes.read', 'View Routes', 'View route information', 'operations', 'routes', 'read', TRUE),
('operations.routes.manage', 'Manage Routes', 'Full route management', 'operations', 'routes', 'manage', TRUE),

-- HR Module
('hr.employees.create', 'Create Employees', 'Create new employees', 'hr', 'employees', 'create', TRUE),
('hr.employees.read', 'View Employees', 'View employee information', 'hr', 'employees', 'read', TRUE),
('hr.employees.update', 'Edit Employees', 'Edit employee information', 'hr', 'employees', 'update', TRUE),
('hr.employees.delete', 'Delete Employees', 'Delete employees', 'hr', 'employees', 'delete', TRUE),
('hr.employees.manage', 'Manage Employees', 'Full employee management', 'hr', 'employees', 'manage', TRUE),

('hr.time_entries.create', 'Create Time Entries', 'Create time entries', 'hr', 'time_entries', 'create', TRUE),
('hr.time_entries.read', 'View Time Entries', 'View time entries', 'hr', 'time_entries', 'read', TRUE),
('hr.time_entries.update', 'Edit Time Entries', 'Edit time entries', 'hr', 'time_entries', 'update', TRUE),
('hr.time_entries.manage', 'Manage Time Entries', 'Full time entry management', 'hr', 'time_entries', 'manage', TRUE),

('hr.payroll.read', 'View Payroll', 'View payroll information', 'hr', 'payroll', 'read', TRUE),
('hr.payroll.manage', 'Manage Payroll', 'Full payroll management', 'hr', 'payroll', 'manage', TRUE),

-- Finance Module
('finance.invoices.create', 'Create Invoices', 'Create new invoices', 'finance', 'invoices', 'create', TRUE),
('finance.invoices.read', 'View Invoices', 'View invoice information', 'finance', 'invoices', 'read', TRUE),
('finance.invoices.update', 'Edit Invoices', 'Edit invoice information', 'finance', 'invoices', 'update', TRUE),
('finance.invoices.delete', 'Delete Invoices', 'Delete invoices', 'finance', 'invoices', 'delete', TRUE),
('finance.invoices.manage', 'Manage Invoices', 'Full invoice management', 'finance', 'invoices', 'manage', TRUE),

('finance.payments.create', 'Record Payments', 'Record new payments', 'finance', 'payments', 'create', TRUE),
('finance.payments.read', 'View Payments', 'View payment information', 'finance', 'payments', 'read', TRUE),
('finance.payments.manage', 'Manage Payments', 'Full payment management', 'finance', 'payments', 'manage', TRUE),

('finance.reports.read', 'View Financial Reports', 'View financial reports', 'finance', 'reports', 'read', TRUE),
('finance.reports.export', 'Export Financial Reports', 'Export financial reports', 'finance', 'reports', 'export', TRUE),

-- Inventory Module
('inventory.products.create', 'Create Products', 'Create new products', 'inventory', 'products', 'create', TRUE),
('inventory.products.read', 'View Products', 'View product information', 'inventory', 'products', 'read', TRUE),
('inventory.products.update', 'Edit Products', 'Edit product information', 'inventory', 'products', 'update', TRUE),
('inventory.products.delete', 'Delete Products', 'Delete products', 'inventory', 'products', 'delete', TRUE),
('inventory.products.manage', 'Manage Products', 'Full product management', 'inventory', 'products', 'manage', TRUE),

('inventory.transactions.create', 'Create Inventory Transactions', 'Create inventory transactions', 'inventory', 'transactions', 'create', TRUE),
('inventory.transactions.read', 'View Inventory Transactions', 'View inventory transactions', 'inventory', 'transactions', 'read', TRUE),

-- Compliance Module
('compliance.epa_logs.create', 'Create EPA Logs', 'Create EPA compliance logs', 'compliance', 'epa_logs', 'create', TRUE),
('compliance.epa_logs.read', 'View EPA Logs', 'View EPA compliance logs', 'compliance', 'epa_logs', 'read', TRUE),
('compliance.epa_logs.export', 'Export EPA Logs', 'Export EPA compliance logs', 'compliance', 'epa_logs', 'export', TRUE),

('compliance.licenses.create', 'Create Licenses', 'Create license records', 'compliance', 'licenses', 'create', TRUE),
('compliance.licenses.read', 'View Licenses', 'View license information', 'compliance', 'licenses', 'read', TRUE),
('compliance.licenses.update', 'Edit Licenses', 'Edit license information', 'compliance', 'licenses', 'update', TRUE),
('compliance.licenses.manage', 'Manage Licenses', 'Full license management', 'compliance', 'licenses', 'manage', TRUE),

-- Marketing Module
('marketing.campaigns.create', 'Create Campaigns', 'Create marketing campaigns', 'marketing', 'campaigns', 'create', TRUE),
('marketing.campaigns.read', 'View Campaigns', 'View marketing campaigns', 'marketing', 'campaigns', 'read', TRUE),
('marketing.campaigns.update', 'Edit Campaigns', 'Edit marketing campaigns', 'marketing', 'campaigns', 'update', TRUE),
('marketing.campaigns.delete', 'Delete Campaigns', 'Delete marketing campaigns', 'marketing', 'campaigns', 'delete', TRUE),
('marketing.campaigns.manage', 'Manage Campaigns', 'Full campaign management', 'marketing', 'campaigns', 'manage', TRUE),

-- Customer Service Module
('customer_service.tickets.create', 'Create Tickets', 'Create support tickets', 'customer_service', 'tickets', 'create', TRUE),
('customer_service.tickets.read', 'View Tickets', 'View support tickets', 'customer_service', 'tickets', 'read', TRUE),
('customer_service.tickets.update', 'Edit Tickets', 'Edit support tickets', 'customer_service', 'tickets', 'update', TRUE),
('customer_service.tickets.delete', 'Delete Tickets', 'Delete support tickets', 'customer_service', 'tickets', 'delete', TRUE),
('customer_service.tickets.manage', 'Manage Tickets', 'Full ticket management', 'customer_service', 'tickets', 'manage', TRUE),

-- Admin Module
('admin.users.create', 'Create Users', 'Create new users', 'admin', 'users', 'create', TRUE),
('admin.users.read', 'View Users', 'View user information', 'admin', 'users', 'read', TRUE),
('admin.users.update', 'Edit Users', 'Edit user information', 'admin', 'users', 'update', TRUE),
('admin.users.delete', 'Delete Users', 'Delete users', 'admin', 'users', 'delete', TRUE),
('admin.users.manage', 'Manage Users', 'Full user management', 'admin', 'users', 'manage', TRUE),

('admin.roles.read', 'View Roles', 'View role information', 'admin', 'roles', 'read', TRUE),
('admin.roles.manage', 'Manage Roles', 'Full role management', 'admin', 'roles', 'manage', TRUE),

('admin.settings.read', 'View Settings', 'View system settings', 'admin', 'settings', 'read', TRUE),
('admin.settings.manage', 'Manage Settings', 'Manage system settings', 'admin', 'settings', 'manage', TRUE),

('admin.audit_logs.read', 'View Audit Logs', 'View audit logs', 'admin', 'audit_logs', 'read', TRUE),
('admin.audit_logs.export', 'Export Audit Logs', 'Export audit logs', 'admin', 'audit_logs', 'export', TRUE),

-- Dashboard Module
('dashboard.executive.read', 'View Executive Dashboard', 'View executive dashboard', 'dashboard', 'executive', 'read', TRUE),
('dashboard.sales.read', 'View Sales Dashboard', 'View sales dashboard', 'dashboard', 'sales', 'read', TRUE),
('dashboard.operations.read', 'View Operations Dashboard', 'View operations dashboard', 'dashboard', 'operations', 'read', TRUE),
('dashboard.finance.read', 'View Finance Dashboard', 'View finance dashboard', 'dashboard', 'finance', 'read', TRUE),
('dashboard.hr.read', 'View HR Dashboard', 'View HR dashboard', 'dashboard', 'hr', 'read', TRUE);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- View for active users with roles
CREATE OR REPLACE VIEW core.v_users_with_roles AS
SELECT
    u.id,
    u.company_id,
    u.email,
    u.first_name,
    u.last_name,
    u.display_name,
    u.status,
    u.last_login_at,
    ARRAY_AGG(DISTINCT r.name) FILTER (WHERE r.name IS NOT NULL) AS role_names,
    ARRAY_AGG(DISTINCT r.id) FILTER (WHERE r.id IS NOT NULL) AS role_ids
FROM core.users u
LEFT JOIN core.user_roles ur ON u.id = ur.user_id
    AND (ur.effective_until IS NULL OR ur.effective_until > NOW())
LEFT JOIN core.roles r ON ur.role_id = r.id AND r.deleted_at IS NULL
WHERE u.deleted_at IS NULL
GROUP BY u.id;

COMMENT ON VIEW core.v_users_with_roles IS 'Users with their assigned roles';

-- View for user permissions (flattened)
CREATE OR REPLACE VIEW core.v_user_permissions AS
SELECT DISTINCT
    u.id AS user_id,
    u.company_id,
    p.name AS permission_name,
    p.module,
    p.resource,
    p.action,
    rp.conditions,
    rp.record_filter
FROM core.users u
JOIN core.user_roles ur ON u.id = ur.user_id
    AND (ur.effective_until IS NULL OR ur.effective_until > NOW())
JOIN core.roles r ON ur.role_id = r.id AND r.deleted_at IS NULL
JOIN core.role_permissions rp ON r.id = rp.role_id
JOIN core.permissions p ON rp.permission_id = p.id
WHERE u.deleted_at IS NULL;

COMMENT ON VIEW core.v_user_permissions IS 'Flattened view of user permissions';

-- ============================================================================
-- END OF CORE SCHEMA
-- ============================================================================
