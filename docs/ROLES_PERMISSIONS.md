# CompassIQ Roles & Permissions Matrix
## Complete RBAC Specification

**Version**: 2.0.0  
**Status**: Phase 0 - Product Spec  
**Last Updated**: December 23, 2025  

---

## Table of Contents

1. [Role Definitions](#role-definitions)
2. [Permission Categories](#permission-categories)
3. [Complete Permissions Matrix](#complete-permissions-matrix)
4. [Permission Implementation](#permission-implementation)
5. [RLS Policy Examples](#rls-policy-examples)

---

## Role Definitions

### Three Core Roles

| Role Code | Display Name | Description | Typical User Count |
|-----------|--------------|-------------|-------------------|
| `admin` | Administrator | Full system access. Manages users, settings, and configurations. | 1-2 per org |
| `manager` | Sales Manager | Views all team data. Manages pipeline, forecasts, and team performance. | 1-3 per org |
| `ae` | Account Executive | Manages own leads, opportunities, and activities. Limited visibility to team. | 2-10 per org |

### Role Hierarchy

```
admin (highest privileges)
  ↓
manager (team-wide visibility)
  ↓
ae (own data only)
```

---

## Permission Categories

### 1. CRM Core
Resources: `accounts`, `contacts`, `leads`, `opportunities`, `activities`, `notes`, `attachments`

### 2. Operating Layer
Resources: `dashboards`, `forecasts`, `alerts`, `kpis`

### 3. Administration
Resources: `users`, `roles`, `settings`, `audit_logs`

---

## Complete Permissions Matrix

### Legend
- ✅ **Full Access** - Create, read, update, delete
- 👁️ **View Only** - Read only, no modifications
- 🔒 **Own Only** - Only their own records
- 🏢 **Team** - Their team's records
- ❌ **No Access**

---

### CRM Core: Accounts

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View All Accounts** | ✅ | ✅ | 🔒 Own only |
| **Create Accounts** | ✅ | ✅ | ✅ |
| **Edit Any Account** | ✅ | ✅ | 🔒 Own only |
| **Delete Accounts** | ✅ | ✅ | ❌ |
| **Reassign Account Owner** | ✅ | ✅ | ❌ |
| **Export Accounts** | ✅ | ✅ | 🔒 Own only |
| **Import Accounts** | ✅ | ✅ | ❌ |

**Business Rules**:
- **Own Only**: Account where `owner_id = current_user_id`
- AEs can view accounts they own OR accounts linked to their opportunities/contacts
- Deleting account moves to "archived" state (soft delete), not permanent deletion

---

### CRM Core: Contacts

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View All Contacts** | ✅ | ✅ | 🔒 Own only |
| **Create Contacts** | ✅ | ✅ | ✅ |
| **Edit Any Contact** | ✅ | ✅ | 🔒 Own only |
| **Delete Contacts** | ✅ | ✅ | ❌ |
| **Reassign Contact Owner** | ✅ | ✅ | ❌ |
| **Export Contacts** | ✅ | ✅ | 🔒 Own only |
| **Import Contacts** | ✅ | ✅ | ❌ |
| **Merge Duplicates** | ✅ | ✅ | ❌ |

**Business Rules**:
- **Own Only**: Contact where `owner_id = current_user_id` OR contact linked to own account/opportunity
- Managers can view all contacts in their org to facilitate team collaboration

---

### CRM Core: Leads

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View All Leads** | ✅ | ✅ | 🔒 Assigned only |
| **Create Leads** | ✅ | ✅ | ✅ |
| **Edit Any Lead** | ✅ | ✅ | 🔒 Assigned only |
| **Delete Leads** | ✅ | ✅ | ❌ |
| **Assign Leads** | ✅ | ✅ | ❌ |
| **Convert Leads** | ✅ | ✅ | ✅ (own only) |
| **Import Leads** | ✅ | ✅ | ❌ |
| **Export Leads** | ✅ | ✅ | 🔒 Assigned only |

**Business Rules**:
- **Assigned Only**: Lead where `assigned_to = current_user_id`
- AEs cannot see unassigned leads (lead pool visible only to managers/admins)
- Converting a lead creates account, contact, and opportunity owned by current user

---

### CRM Core: Opportunities

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View All Opportunities** | ✅ | ✅ | 🔒 Own only |
| **Create Opportunities** | ✅ | ✅ | ✅ |
| **Edit Any Opportunity** | ✅ | ✅ | 🔒 Own only |
| **Delete Opportunities** | ✅ | ✅ | ❌ |
| **Change Stage** | ✅ | ✅ | ✅ (own only) |
| **Mark Won/Lost** | ✅ | ✅ | ✅ (own only) |
| **Reopen Closed Opportunity** | ✅ | ✅ | ❌ |
| **Reassign Owner** | ✅ | ✅ | ❌ |
| **Edit Forecast Category** | ✅ | ✅ | ✅ (own only) |
| **Export Opportunities** | ✅ | ✅ | 🔒 Own only |

**Business Rules**:
- **Own Only**: Opportunity where `owner_id = current_user_id`
- Managers can reassign opportunities between team members
- Managers can override forecast category (rep says "best_case", manager moves to "pipeline")
- Stage changes must follow stage transition rules (see STAGE_DEFINITIONS.md)

---

### CRM Core: Activities

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View All Activities** | ✅ | ✅ | 🔒 Own/Related |
| **Create Activities** | ✅ | ✅ | ✅ |
| **Edit Any Activity** | ✅ | ✅ | 🔒 Own only |
| **Delete Activities** | ✅ | ✅ | 🔒 Own only |
| **Complete Tasks** | ✅ | ✅ | ✅ (own only) |
| **Export Activities** | ✅ | ✅ | 🔒 Own only |

**Business Rules**:
- **Own Only**: Activity where `owner_id = current_user_id`
- **Related**: Activity where `related_to_id` is an account/contact/opportunity/lead owned by current user
- AEs can view activities on their own records (leads, opps, contacts, accounts)

---

### CRM Core: Notes & Attachments

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View All Notes** | ✅ | ✅ | 🔒 Related only |
| **Create Notes** | ✅ | ✅ | ✅ |
| **Edit Own Notes** | ✅ | ✅ | ✅ |
| **Delete Own Notes** | ✅ | ✅ | ✅ |
| **Delete Any Notes** | ✅ | ✅ | ❌ |
| **Upload Attachments** | ✅ | ✅ | ✅ |
| **Delete Own Attachments** | ✅ | ✅ | ✅ |
| **Delete Any Attachments** | ✅ | ✅ | ❌ |

**Business Rules**:
- **Related Only**: Note/attachment on a record the user owns
- Pin note: All roles can pin on their own records
- Managers can pin/unpin on any record

---

## Operating Layer Permissions

### Dashboards

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View Executive Dashboard** | ✅ | ✅ | ❌ |
| **View Manager Dashboard** | ✅ | ✅ | ❌ |
| **View Rep Dashboard** | ✅ | ✅ | ✅ |
| **Export Dashboard Data** | ✅ | ✅ | 🔒 Own data only |
| **Configure Dashboards** | ✅ | ❌ | ❌ |

**Dashboard Visibility**:
- **Executive Dashboard**: Pipeline vs target, top deals, at-risk opportunities, win rate trends
- **Manager Dashboard**: Team pipeline by stage, rep leaderboard, aging, forecast snapshot, coverage ratio
- **Rep Dashboard**: My pipeline, next steps due, activity targets, stalled deals, my forecast

---

### Forecasts

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View Team Forecast** | ✅ | ✅ | ❌ |
| **View Own Forecast** | ✅ | ✅ | ✅ |
| **Submit Rep Forecast** | ✅ | ✅ | ✅ |
| **Override Rep Forecast** | ✅ | ✅ | ❌ |
| **Create Forecast Snapshot** | ✅ | ✅ | ❌ |
| **View Forecast Accuracy** | ✅ | ✅ | 👁️ Own only |
| **Export Forecast** | ✅ | ✅ | 🔒 Own only |

**Business Rules**:
- AEs submit their own forecast (commit/best_case/pipeline by opportunity)
- Managers can override rep forecasts (with reason documented)
- Forecast snapshots created every Monday (automated)

---

### Alerts

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View Own Alerts** | ✅ | ✅ | ✅ |
| **View Team Alerts** | ✅ | ✅ | ❌ |
| **Acknowledge Alerts** | ✅ | ✅ | ✅ (own only) |
| **Dismiss Alerts** | ✅ | ✅ | ✅ (own only) |
| **Configure Alert Definitions** | ✅ | ✅ | ❌ |
| **Suppress Alerts** | ✅ | ✅ | ❌ |

**Business Rules**:
- Alert recipients: `owner` (opportunity owner), `manager` (all managers), `exec` (admins)
- AEs only see alerts for their own opportunities
- Managers see all team alerts

---

### KPIs & Reports

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View Team KPIs** | ✅ | ✅ | ❌ |
| **View Own KPIs** | ✅ | ✅ | ✅ |
| **Export Reports** | ✅ | ✅ | 🔒 Own data only |
| **Configure KPIs** | ✅ | ❌ | ❌ |
| **View Win/Loss Analysis** | ✅ | ✅ | 🔒 Own deals only |
| **View Pipeline Reports** | ✅ | ✅ | 🔒 Own pipeline only |

**KPI Visibility**:
- **Team KPIs**: Pipeline value, win rate, coverage ratio, activity rates, forecast accuracy
- **Personal KPIs**: My pipeline, my win rate, my quota attainment, my activity count

---

## Administration Permissions

### User Management

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View All Users** | ✅ | ✅ | 👁️ Team list only |
| **Create Users** | ✅ | ❌ | ❌ |
| **Edit Users** | ✅ | ❌ | 🔒 Own profile only |
| **Deactivate Users** | ✅ | ❌ | ❌ |
| **Assign Roles** | ✅ | ❌ | ❌ |
| **Set Quotas** | ✅ | ❌ | ❌ |
| **Reset Passwords** | ✅ | ❌ | 🔒 Own only |

**Business Rules**:
- Only admins can create/deactivate users
- All users can edit their own profile (name, email, phone, avatar)
- AEs can view list of team members (for assignment, mentions, etc.)

---

### Roles & Permissions

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View Roles** | ✅ | 👁️ | 👁️ |
| **Create Custom Roles** | ✅ | ❌ | ❌ |
| **Edit Roles** | ✅ | ❌ | ❌ |
| **Delete Custom Roles** | ✅ | ❌ | ❌ |
| **View Permissions** | ✅ | 👁️ | 👁️ |

**Business Rules**:
- System roles (`admin`, `manager`, `ae`) cannot be deleted
- Custom roles can be created in Phase 4 (expansion)

---

### Settings & Configuration

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **Edit Organization Settings** | ✅ | ❌ | ❌ |
| **Configure Pipeline Stages** | ✅ | ✅ | 👁️ |
| **Configure Lead Sources** | ✅ | ✅ | ❌ |
| **Configure Forecast Settings** | ✅ | ✅ | ❌ |
| **Manage Integrations** | ✅ | ❌ | ❌ |
| **View Billing** | ✅ | ❌ | ❌ |

**Business Rules**:
- Managers can propose stage changes, but only admins can implement
- Fiscal year start, timezone, currency controlled by admins

---

### Audit Logs

| Permission | Admin | Manager | AE |
|------------|-------|---------|-----|
| **View All Audit Logs** | ✅ | ✅ | 🔒 Own actions only |
| **Export Audit Logs** | ✅ | ✅ | ❌ |
| **Filter Audit Logs** | ✅ | ✅ | 🔒 Own actions only |

**Business Rules**:
- Audit logs are immutable (cannot be deleted or edited)
- Retention: 7 years (compliance requirement)
- AEs can see their own login/logout and data changes

---

## Permission Implementation

### Permission Naming Convention

```
{resource}:{action}:{scope}
```

**Examples**:
- `opportunities:read:all` - View all opportunities
- `opportunities:read:own` - View own opportunities
- `opportunities:update:own` - Update own opportunities
- `opportunities:update:all` - Update any opportunity
- `opportunities:delete:all` - Delete any opportunity
- `users:create:all` - Create users
- `dashboards:view:team` - View team dashboard
- `forecast:override:all` - Override any forecast

### Permission Storage

**Database**:
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  module TEXT NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  scope TEXT NOT NULL,
  description TEXT
);
```

**Seeded Permissions** (Phase 1):
```sql
INSERT INTO permissions (name, module, resource, action, scope, description) VALUES
  -- Opportunities
  ('opportunities:read:all', 'sales', 'opportunities', 'read', 'all', 'View all opportunities'),
  ('opportunities:read:own', 'sales', 'opportunities', 'read', 'own', 'View own opportunities'),
  ('opportunities:create:all', 'sales', 'opportunities', 'create', 'all', 'Create opportunities'),
  ('opportunities:update:all', 'sales', 'opportunities', 'update', 'all', 'Update any opportunity'),
  ('opportunities:update:own', 'sales', 'opportunities', 'update', 'own', 'Update own opportunities'),
  ('opportunities:delete:all', 'sales', 'opportunities', 'delete', 'all', 'Delete any opportunity'),
  
  -- Leads
  ('leads:read:all', 'sales', 'leads', 'read', 'all', 'View all leads'),
  ('leads:read:own', 'sales', 'leads', 'read', 'own', 'View assigned leads'),
  ('leads:assign:all', 'sales', 'leads', 'assign', 'all', 'Assign leads to users'),
  
  -- Dashboards
  ('dashboards:view:exec', 'reports', 'dashboards', 'view', 'exec', 'View executive dashboard'),
  ('dashboards:view:manager', 'reports', 'dashboards', 'view', 'manager', 'View manager dashboard'),
  ('dashboards:view:rep', 'reports', 'dashboards', 'view', 'rep', 'View rep dashboard'),
  
  -- Users
  ('users:create:all', 'admin', 'users', 'create', 'all', 'Create users'),
  ('users:update:all', 'admin', 'users', 'update', 'all', 'Update any user'),
  ('users:update:own', 'admin', 'users', 'update', 'own', 'Update own profile'),
  ('users:deactivate:all', 'admin', 'users', 'deactivate', 'all', 'Deactivate users');
  
  -- ... (add all permissions)
```

**Role-Permission Assignments**:
```sql
-- Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'admin' AND org_id = :org_id),
  id
FROM permissions;

-- Manager permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'manager' AND org_id = :org_id),
  id
FROM permissions
WHERE name IN (
  'opportunities:read:all',
  'opportunities:create:all',
  'opportunities:update:all',
  'leads:read:all',
  'leads:assign:all',
  'dashboards:view:manager',
  'forecast:override:all',
  -- ... etc
);

-- AE permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'ae' AND org_id = :org_id),
  id
FROM permissions
WHERE name IN (
  'opportunities:read:own',
  'opportunities:create:all',
  'opportunities:update:own',
  'leads:read:own',
  'dashboards:view:rep',
  -- ... etc
);
```

---

## RLS Policy Examples

### Opportunities Table

```sql
-- Enable RLS
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- Helper function: Get user's organization
CREATE OR REPLACE FUNCTION get_user_org_id(auth_user_id UUID)
RETURNS UUID AS $$
  SELECT org_id FROM users WHERE auth_user_id = $1 LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function: Check if user has role
CREATE OR REPLACE FUNCTION has_role(auth_user_id UUID, role_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    WHERE u.auth_user_id = $1 AND r.name = $2
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Helper function: Get user's internal ID
CREATE OR REPLACE FUNCTION get_user_id(auth_user_id UUID)
RETURNS UUID AS $$
  SELECT id FROM users WHERE auth_user_id = $1 LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- Policy 1: Admins and Managers can SELECT all opportunities in their org
CREATE POLICY "admins_managers_select_all"
ON opportunities FOR SELECT
TO authenticated
USING (
  org_id = get_user_org_id(auth.uid())
  AND (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  )
);

-- Policy 2: AEs can SELECT only their own opportunities
CREATE POLICY "aes_select_own"
ON opportunities FOR SELECT
TO authenticated
USING (
  org_id = get_user_org_id(auth.uid())
  AND owner_id = get_user_id(auth.uid())
  AND has_role(auth.uid(), 'ae')
);

-- Policy 3: Users can INSERT opportunities in their org
CREATE POLICY "users_insert"
ON opportunities FOR INSERT
TO authenticated
WITH CHECK (
  org_id = get_user_org_id(auth.uid())
);

-- Policy 4: Admins and Managers can UPDATE any opportunity
CREATE POLICY "admins_managers_update_all"
ON opportunities FOR UPDATE
TO authenticated
USING (
  org_id = get_user_org_id(auth.uid())
  AND (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'manager')
  )
);

-- Policy 5: AEs can UPDATE only their own opportunities
CREATE POLICY "aes_update_own"
ON opportunities FOR UPDATE
TO authenticated
USING (
  org_id = get_user_org_id(auth.uid())
  AND owner_id = get_user_id(auth.uid())
  AND has_role(auth.uid(), 'ae')
);

-- Policy 6: Only Admins can DELETE opportunities
CREATE POLICY "admins_delete"
ON opportunities FOR DELETE
TO authenticated
USING (
  org_id = get_user_org_id(auth.uid())
  AND has_role(auth.uid(), 'admin')
);
```

### Apply Similar Policies to All Tables

All tables with `org_id` and `owner_id` or `assigned_to` fields must have RLS policies following this pattern:
1. Admins/Managers: ALL access in their org
2. AEs: OWN records only
3. All users: Can INSERT in their org (ownership assigned on insert)
4. Only Admins: Can DELETE

---

## Permission Check Functions

### Check Permission in API Layer

```typescript
// src/shared/guards/permission.guard.ts

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler()
    );
    
    if (!requiredPermissions) {
      return true; // No permissions required
    }
    
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Set by AuthGuard
    
    // Check if user has at least one of the required permissions
    return requiredPermissions.some(permission => 
      user.permissions.includes(permission)
    );
  }
}

// Usage in controller:
@Get('/opportunities')
@Permissions('opportunities:read:all', 'opportunities:read:own')
async getOpportunities() {
  // ...
}
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-12-23 | System | Complete RBAC specification |

---

**Next Document**: `DEFINITION_OF_DONE.md` - Module completion checklist

