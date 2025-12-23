-- Migration: Auth Trigger for New User Creation
-- Description: Automatically create user profile when new auth user signs up
-- Version: 20231223000004

-- ============================================================================
-- HANDLE NEW USER SIGNUP
-- ============================================================================

-- This function is called when a new user signs up via Supabase Auth
-- It creates the corresponding user profile in our users table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
    v_role_id UUID;
BEGIN
    -- Get org_id from metadata (set during signup)
    v_org_id := (NEW.raw_user_meta_data->>'org_id')::UUID;
    
    -- If no org_id provided, this is a new organization signup
    IF v_org_id IS NULL THEN
        -- Create a new organization
        INSERT INTO organizations (name)
        VALUES (COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Organization'))
        RETURNING id INTO v_org_id;
        
        -- Create default roles for the new org
        INSERT INTO roles (org_id, name, display_name, is_system_role) VALUES
            (v_org_id, 'admin', 'Administrator', TRUE),
            (v_org_id, 'manager', 'Sales Manager', TRUE),
            (v_org_id, 'ae', 'Account Executive', TRUE);
    END IF;
    
    -- Create the user profile
    INSERT INTO users (
        org_id,
        auth_user_id,
        email,
        first_name,
        last_name,
        status
    )
    VALUES (
        v_org_id,
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        'active'
    );
    
    -- If this is the first user (org creator), assign admin role
    SELECT id INTO v_role_id FROM roles WHERE org_id = v_org_id AND name = 'admin' LIMIT 1;
    
    IF v_role_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM user_roles ur 
        JOIN users u ON u.id = ur.user_id 
        WHERE u.org_id = v_org_id
    ) THEN
        INSERT INTO user_roles (user_id, role_id)
        SELECT u.id, v_role_id
        FROM users u
        WHERE u.auth_user_id = NEW.id;
    ELSE
        -- Assign default AE role for subsequent users
        SELECT id INTO v_role_id FROM roles WHERE org_id = v_org_id AND name = 'ae' LIMIT 1;
        IF v_role_id IS NOT NULL THEN
            INSERT INTO user_roles (user_id, role_id)
            SELECT u.id, v_role_id
            FROM users u
            WHERE u.auth_user_id = NEW.id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- HANDLE USER LOGIN
-- ============================================================================

CREATE OR REPLACE FUNCTION handle_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update last login timestamp
    UPDATE users
    SET last_login_at = NOW()
    WHERE auth_user_id = NEW.id;
    
    RETURN NEW;
END;
$$;

-- Note: This trigger would fire on auth session updates
-- For now, we'll update last_login_at from the frontend

-- ============================================================================
-- GET CURRENT USER'S FULL PROFILE
-- ============================================================================

CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE (
    id UUID,
    org_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    status TEXT,
    roles TEXT[],
    org_name TEXT,
    org_settings JSONB
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        u.id,
        u.org_id,
        u.email,
        u.first_name,
        u.last_name,
        u.phone,
        u.avatar_url,
        u.status,
        ARRAY_AGG(DISTINCT r.name) AS roles,
        o.name AS org_name,
        o.settings AS org_settings
    FROM users u
    JOIN organizations o ON o.id = u.org_id
    LEFT JOIN user_roles ur ON ur.user_id = u.id
    LEFT JOIN roles r ON r.id = ur.role_id
    WHERE u.auth_user_id = auth.uid()
    GROUP BY u.id, u.org_id, u.email, u.first_name, u.last_name, 
             u.phone, u.avatar_url, u.status, o.name, o.settings;
$$;

-- ============================================================================
-- INVITE USER TO ORGANIZATION
-- ============================================================================

CREATE OR REPLACE FUNCTION invite_user_to_org(
    p_email TEXT,
    p_first_name TEXT,
    p_last_name TEXT,
    p_role_name TEXT DEFAULT 'ae'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_org_id UUID;
    v_invite_code UUID;
BEGIN
    -- Get caller's org_id
    v_org_id := get_user_org_id(auth.uid());
    
    -- Verify caller is admin or manager
    IF NOT is_admin_or_manager(auth.uid()) THEN
        RAISE EXCEPTION 'Only admins and managers can invite users';
    END IF;
    
    -- Generate invite code
    v_invite_code := gen_random_uuid();
    
    -- Store pending invite (could use a separate invites table)
    -- For now, we'll use organization settings
    UPDATE organizations
    SET settings = settings || jsonb_build_object(
        'pending_invites', 
        COALESCE(settings->'pending_invites', '[]'::jsonb) || jsonb_build_array(
            jsonb_build_object(
                'code', v_invite_code,
                'email', p_email,
                'first_name', p_first_name,
                'last_name', p_last_name,
                'role', p_role_name,
                'invited_at', NOW(),
                'invited_by', get_user_id(auth.uid())
            )
        )
    )
    WHERE id = v_org_id;
    
    RETURN v_invite_code;
END;
$$;

