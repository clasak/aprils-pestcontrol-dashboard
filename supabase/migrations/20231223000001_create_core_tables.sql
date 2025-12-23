-- Migration: Create Core Tables
-- Description: Organizations, Users, Roles, Permissions for CRM Core
-- Version: 20231223000001

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    legal_name TEXT,
    logo_url TEXT,
    timezone TEXT DEFAULT 'America/New_York',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE organizations IS 'Tenant organizations for multi-tenancy';

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    auth_user_id UUID UNIQUE NOT NULL,  -- Links to auth.users
    email TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deactivated')),
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE INDEX idx_users_org_id ON users(org_id);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);
CREATE INDEX idx_users_email ON users(email);

COMMENT ON TABLE users IS 'Application users linked to Supabase Auth';

-- ============================================================================
-- ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    is_system_role BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(org_id, name)
);

CREATE INDEX idx_roles_org_id ON roles(org_id);

COMMENT ON TABLE roles IS 'Role definitions for RBAC';

-- ============================================================================
-- USER_ROLES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, role_id)
);

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

COMMENT ON TABLE user_roles IS 'User to role assignments';

-- ============================================================================
-- PERMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    module TEXT NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'manage')),
    description TEXT,
    
    UNIQUE(module, resource, action)
);

COMMENT ON TABLE permissions IS 'Granular permission definitions';

-- ============================================================================
-- ROLE_PERMISSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    
    UNIQUE(role_id, permission_id)
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);

COMMENT ON TABLE role_permissions IS 'Role to permission assignments';

-- ============================================================================
-- EVENT_LOG TABLE (Audit Trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS event_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_log_org_id ON event_log(org_id);
CREATE INDEX idx_event_log_entity ON event_log(entity_type, entity_id);
CREATE INDEX idx_event_log_created_at ON event_log(created_at DESC);

COMMENT ON TABLE event_log IS 'Immutable audit trail for all changes';

-- ============================================================================
-- NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    related_to_type TEXT,
    related_to_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

COMMENT ON TABLE notifications IS 'User notifications for alerts and updates';

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get the org_id for the current authenticated user
CREATE OR REPLACE FUNCTION get_user_org_id(auth_uid UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT org_id FROM users WHERE auth_user_id = auth_uid LIMIT 1;
$$;

-- Get the user.id for the current authenticated user
CREATE OR REPLACE FUNCTION get_user_id(auth_uid UUID)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT id FROM users WHERE auth_user_id = auth_uid LIMIT 1;
$$;

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION has_role(auth_uid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id
        WHERE u.auth_user_id = auth_uid
        AND r.name = role_name
    );
$$;

-- Check if user is admin or manager
CREATE OR REPLACE FUNCTION is_admin_or_manager(auth_uid UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT has_role(auth_uid, 'admin') OR has_role(auth_uid, 'manager');
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DEFAULT PERMISSIONS
-- ============================================================================

INSERT INTO permissions (name, module, resource, action, description) VALUES
-- Accounts
('accounts.create', 'sales', 'accounts', 'create', 'Create new accounts'),
('accounts.read', 'sales', 'accounts', 'read', 'View accounts'),
('accounts.update', 'sales', 'accounts', 'update', 'Edit accounts'),
('accounts.delete', 'sales', 'accounts', 'delete', 'Delete accounts'),
-- Contacts
('contacts.create', 'sales', 'contacts', 'create', 'Create new contacts'),
('contacts.read', 'sales', 'contacts', 'read', 'View contacts'),
('contacts.update', 'sales', 'contacts', 'update', 'Edit contacts'),
('contacts.delete', 'sales', 'contacts', 'delete', 'Delete contacts'),
-- Leads
('leads.create', 'sales', 'leads', 'create', 'Create new leads'),
('leads.read', 'sales', 'leads', 'read', 'View leads'),
('leads.update', 'sales', 'leads', 'update', 'Edit leads'),
('leads.delete', 'sales', 'leads', 'delete', 'Delete leads'),
('leads.manage', 'sales', 'leads', 'manage', 'Full lead management including assignment'),
-- Opportunities
('opportunities.create', 'sales', 'opportunities', 'create', 'Create new opportunities'),
('opportunities.read', 'sales', 'opportunities', 'read', 'View opportunities'),
('opportunities.update', 'sales', 'opportunities', 'update', 'Edit opportunities'),
('opportunities.delete', 'sales', 'opportunities', 'delete', 'Delete opportunities'),
('opportunities.manage', 'sales', 'opportunities', 'manage', 'Full opportunity management'),
-- Activities
('activities.create', 'sales', 'activities', 'create', 'Create activities'),
('activities.read', 'sales', 'activities', 'read', 'View activities'),
('activities.update', 'sales', 'activities', 'update', 'Edit activities'),
('activities.delete', 'sales', 'activities', 'delete', 'Delete activities'),
-- Dashboards
('dashboards.executive', 'reports', 'dashboards', 'read', 'View executive dashboard'),
('dashboards.team', 'reports', 'dashboards', 'read', 'View team dashboard'),
('dashboards.personal', 'reports', 'dashboards', 'read', 'View personal dashboard'),
-- Admin
('users.manage', 'admin', 'users', 'manage', 'Manage users'),
('roles.manage', 'admin', 'roles', 'manage', 'Manage roles'),
('settings.manage', 'admin', 'settings', 'manage', 'Manage system settings')
ON CONFLICT (name) DO NOTHING;

