-- Migration: Create RLS Policies
-- Description: Row Level Security policies for multi-tenant data isolation
-- Version: 20231223000003

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunity_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forecast_snapshots ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ORGANIZATIONS POLICIES
-- ============================================================================

-- Users can only view their own organization
CREATE POLICY "Users can view own organization"
ON organizations FOR SELECT
TO authenticated
USING (id = get_user_org_id(auth.uid()));

-- Only system admins can update organization (via service role)
CREATE POLICY "Admins can update organization"
ON organizations FOR UPDATE
TO authenticated
USING (id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
WITH CHECK (id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- ============================================================================
-- USERS POLICIES
-- ============================================================================

-- Users can view all users in their organization
CREATE POLICY "Users can view org users"
ON users FOR SELECT
TO authenticated
USING (org_id = get_user_org_id(auth.uid()));

-- Admins can create users in their organization
CREATE POLICY "Admins can create users"
ON users FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Admins can update users in their organization
CREATE POLICY "Admins can update users"
ON users FOR UPDATE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
WITH CHECK (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- ============================================================================
-- ROLES POLICIES
-- ============================================================================

-- Users can view roles in their organization
CREATE POLICY "Users can view org roles"
ON roles FOR SELECT
TO authenticated
USING (org_id = get_user_org_id(auth.uid()));

-- Admins can manage roles
CREATE POLICY "Admins can manage roles"
ON roles FOR ALL
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'))
WITH CHECK (org_id = get_user_org_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- ============================================================================
-- USER_ROLES POLICIES
-- ============================================================================

-- Users can view role assignments in their org
CREATE POLICY "Users can view org user_roles"
ON user_roles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = user_roles.user_id 
        AND u.org_id = get_user_org_id(auth.uid())
    )
);

-- Admins can manage role assignments
CREATE POLICY "Admins can manage user_roles"
ON user_roles FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = user_roles.user_id 
        AND u.org_id = get_user_org_id(auth.uid())
    ) 
    AND has_role(auth.uid(), 'admin')
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = user_roles.user_id 
        AND u.org_id = get_user_org_id(auth.uid())
    ) 
    AND has_role(auth.uid(), 'admin')
);

-- ============================================================================
-- EVENT_LOG POLICIES
-- ============================================================================

-- Admins and managers can view audit logs
CREATE POLICY "Admins and managers can view event_log"
ON event_log FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid()) 
    AND is_admin_or_manager(auth.uid())
);

-- System can insert event logs (all authenticated users can log events)
CREATE POLICY "System can insert event_log"
ON event_log FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- ============================================================================
-- NOTIFICATIONS POLICIES
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (user_id = get_user_id(auth.uid()));

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (user_id = get_user_id(auth.uid()))
WITH CHECK (user_id = get_user_id(auth.uid()));

-- System can create notifications for any user in org
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- ============================================================================
-- ACCOUNTS POLICIES
-- ============================================================================

-- Admins and managers can view all accounts
CREATE POLICY "Admins and managers view all accounts"
ON accounts FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND is_admin_or_manager(auth.uid())
);

-- AEs can view accounts they own
CREATE POLICY "AEs view own accounts"
ON accounts FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- All users can create accounts in their org
CREATE POLICY "Users can create accounts"
ON accounts FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Admins and managers can update any account
CREATE POLICY "Admins and managers update any account"
ON accounts FOR UPDATE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()))
WITH CHECK (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()));

-- AEs can update accounts they own
CREATE POLICY "AEs update own accounts"
ON accounts FOR UPDATE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
)
WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- Admins and managers can delete accounts
CREATE POLICY "Admins and managers delete accounts"
ON accounts FOR DELETE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()));

-- ============================================================================
-- CONTACTS POLICIES
-- ============================================================================

-- Admins and managers can view all contacts
CREATE POLICY "Admins and managers view all contacts"
ON contacts FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND is_admin_or_manager(auth.uid())
);

-- AEs can view contacts they own
CREATE POLICY "AEs view own contacts"
ON contacts FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- All users can create contacts
CREATE POLICY "Users can create contacts"
ON contacts FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Admins and managers can update any contact
CREATE POLICY "Admins and managers update any contact"
ON contacts FOR UPDATE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()))
WITH CHECK (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()));

-- AEs can update contacts they own
CREATE POLICY "AEs update own contacts"
ON contacts FOR UPDATE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
)
WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- Admins and managers can delete contacts
CREATE POLICY "Admins and managers delete contacts"
ON contacts FOR DELETE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()));

-- ============================================================================
-- LEADS POLICIES
-- ============================================================================

-- Admins and managers can view all leads
CREATE POLICY "Admins and managers view all leads"
ON leads FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND is_admin_or_manager(auth.uid())
);

-- AEs can view leads assigned to them
CREATE POLICY "AEs view assigned leads"
ON leads FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND assigned_to = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- All users can create leads
CREATE POLICY "Users can create leads"
ON leads FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Admins and managers can update any lead
CREATE POLICY "Admins and managers update any lead"
ON leads FOR UPDATE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()))
WITH CHECK (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()));

-- AEs can update leads assigned to them
CREATE POLICY "AEs update assigned leads"
ON leads FOR UPDATE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND assigned_to = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
)
WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND assigned_to = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- Admins and managers can delete leads
CREATE POLICY "Admins and managers delete leads"
ON leads FOR DELETE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()));

-- ============================================================================
-- OPPORTUNITIES POLICIES
-- ============================================================================

-- Admins and managers can view all opportunities
CREATE POLICY "Admins and managers view all opportunities"
ON opportunities FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND is_admin_or_manager(auth.uid())
);

-- AEs can view opportunities they own
CREATE POLICY "AEs view own opportunities"
ON opportunities FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- All users can create opportunities
CREATE POLICY "Users can create opportunities"
ON opportunities FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Admins and managers can update any opportunity
CREATE POLICY "Admins and managers update any opportunity"
ON opportunities FOR UPDATE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()))
WITH CHECK (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()));

-- AEs can update opportunities they own
CREATE POLICY "AEs update own opportunities"
ON opportunities FOR UPDATE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
)
WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND owner_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- Admins and managers can delete opportunities
CREATE POLICY "Admins and managers delete opportunities"
ON opportunities FOR DELETE
TO authenticated
USING (org_id = get_user_org_id(auth.uid()) AND is_admin_or_manager(auth.uid()));

-- ============================================================================
-- OPPORTUNITY_STAGE_HISTORY POLICIES
-- ============================================================================

-- Users can view stage history for opportunities they can see
CREATE POLICY "Users view opportunity stage history"
ON opportunity_stage_history FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = opportunity_stage_history.opportunity_id
        AND o.org_id = get_user_org_id(auth.uid())
        AND (
            is_admin_or_manager(auth.uid())
            OR o.owner_id = get_user_id(auth.uid())
        )
    )
);

-- System can insert stage history
CREATE POLICY "System insert stage history"
ON opportunity_stage_history FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM opportunities o
        WHERE o.id = opportunity_stage_history.opportunity_id
        AND o.org_id = get_user_org_id(auth.uid())
    )
);

-- ============================================================================
-- ACTIVITIES POLICIES
-- ============================================================================

-- Admins and managers can view all activities
CREATE POLICY "Admins and managers view all activities"
ON activities FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND is_admin_or_manager(auth.uid())
);

-- AEs can view activities they own or on their records
CREATE POLICY "AEs view own activities"
ON activities FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
    AND (
        owner_id = get_user_id(auth.uid())
        OR created_by = get_user_id(auth.uid())
    )
);

-- All users can create activities
CREATE POLICY "Users can create activities"
ON activities FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Users can update their own activities
CREATE POLICY "Users update own activities"
ON activities FOR UPDATE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND (owner_id = get_user_id(auth.uid()) OR is_admin_or_manager(auth.uid()))
)
WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND (owner_id = get_user_id(auth.uid()) OR is_admin_or_manager(auth.uid()))
);

-- Users can delete their own activities
CREATE POLICY "Users delete own activities"
ON activities FOR DELETE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND (owner_id = get_user_id(auth.uid()) OR is_admin_or_manager(auth.uid()))
);

-- ============================================================================
-- NOTES POLICIES
-- ============================================================================

-- Users can view notes on records they can access
CREATE POLICY "Users view notes"
ON notes FOR SELECT
TO authenticated
USING (org_id = get_user_org_id(auth.uid()));

-- Users can create notes
CREATE POLICY "Users create notes"
ON notes FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Users can update their own notes
CREATE POLICY "Users update own notes"
ON notes FOR UPDATE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND created_by = get_user_id(auth.uid())
)
WITH CHECK (
    org_id = get_user_org_id(auth.uid())
    AND created_by = get_user_id(auth.uid())
);

-- Users can delete their own notes
CREATE POLICY "Users delete own notes"
ON notes FOR DELETE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND (created_by = get_user_id(auth.uid()) OR is_admin_or_manager(auth.uid()))
);

-- ============================================================================
-- ATTACHMENTS POLICIES
-- ============================================================================

-- Users can view attachments in their org
CREATE POLICY "Users view attachments"
ON attachments FOR SELECT
TO authenticated
USING (org_id = get_user_org_id(auth.uid()));

-- Users can upload attachments
CREATE POLICY "Users create attachments"
ON attachments FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

-- Users can delete their own attachments
CREATE POLICY "Users delete own attachments"
ON attachments FOR DELETE
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND (uploaded_by = get_user_id(auth.uid()) OR is_admin_or_manager(auth.uid()))
);

-- ============================================================================
-- FORECAST_SNAPSHOTS POLICIES
-- ============================================================================

-- Admins and managers can view all forecast snapshots
CREATE POLICY "Admins and managers view all forecasts"
ON forecast_snapshots FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND is_admin_or_manager(auth.uid())
);

-- AEs can view their own forecast snapshots
CREATE POLICY "AEs view own forecasts"
ON forecast_snapshots FOR SELECT
TO authenticated
USING (
    org_id = get_user_org_id(auth.uid())
    AND user_id = get_user_id(auth.uid())
    AND NOT is_admin_or_manager(auth.uid())
);

-- System can create forecast snapshots
CREATE POLICY "System create forecasts"
ON forecast_snapshots FOR INSERT
TO authenticated
WITH CHECK (org_id = get_user_org_id(auth.uid()));

