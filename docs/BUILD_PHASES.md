# CompassIQ Build Phases
## Sprint-by-Sprint Execution Plan

**Version**: 2.0.0  
**Status**: Phase 0 - Product Spec  
**Last Updated**: December 23, 2025  
**Total Timeline**: 12-14 weeks to sellable v1

---

## ⚠️ Important: Preserve Existing UI Design

**The current UI design should NOT be changed.** All new features must match the existing look and feel:
- Use existing Material-UI theme (colors, typography, spacing)
- Follow existing component patterns
- Match existing visual style
- Build on what exists, don't redesign

---

## Table of Contents

1. [Phase 0: Product Spec & Data Model](#phase-0-product-spec--data-model)
2. [Phase 1: CRM Core](#phase-1-crm-core-system-of-record)
3. [Phase 2: Operating Layer](#phase-2-operating-layer-system-of-execution)
4. [Phase 3: Sellability Hardening](#phase-3-sellability-hardening)
5. [Phase 4: Expansion](#phase-4-expansion-after-paying-customers)
6. [Resource Plan](#resource-plan)
7. [Dependencies & Critical Path](#dependencies--critical-path)
8. [Risk Mitigation](#risk-mitigation)

---

## Phase 0: Product Spec & Data Model

**Duration**: 2-3 days  
**Team**: Product Lead + Engineering Lead  
**Status**: ✅ **COMPLETE**

### Deliverables

| Document | Status | Description |
|----------|--------|-------------|
| `PRODUCT_SPEC_V2.md` | ✅ Complete | Product boundary, MVP definition, technical decisions |
| `DATA_MODEL_V2.md` | ✅ Complete | Complete ERD, table specs, indexes, RLS policies |
| `STAGE_DEFINITIONS.md` | ✅ Complete | Opportunity stages with required fields and transitions |
| `KPI_DICTIONARY.md` | ✅ Complete | Exact SQL formulas for all operating metrics |
| `ROLES_PERMISSIONS.md` | ✅ Complete | Complete RBAC matrix for Admin/Manager/AE |
| `DEFINITION_OF_DONE.md` | ✅ Complete | Module completion checklist |
| `BUILD_PHASES.md` | ✅ Complete | This document - sprint-by-sprint plan |

### Acceptance Criteria
- [x] Engineering team reviewed and approved ERD
- [x] All KPIs have exact SQL formulas
- [x] All stage transitions documented
- [x] All permissions documented for 3 roles
- [x] Definition of Done agreed upon

---

## Phase 1: CRM Core (System of Record)

**Duration**: 4-6 weeks (8-12 sprints)  
**Team**: 2-3 full-stack developers + 1 QA  
**Goal**: Functional CRM platform replacing spreadsheets

### Sprint Breakdown

#### Sprint 1: Foundation (Week 1)

**Module 1.1: Supabase Setup & Auth**

**Backend Tasks**:
- [ ] Create Supabase project (US East region)
- [ ] Configure Supabase Auth (email + password)
- [ ] Create `organizations` table
- [ ] Create `users` table with RLS policies
- [ ] Create `roles` and `user_roles` tables
- [ ] Seed 3 system roles (admin, manager, ae)
- [ ] Create `permissions` and `role_permissions` tables
- [ ] Seed permissions for all resources
- [ ] Create `event_log` table for audit trail
- [ ] Write RLS helper functions (`get_user_org_id`, `has_role`, etc.)
- [ ] Test RLS policies (cross-org access blocked)

**Frontend Tasks**:
- [ ] Verify existing Vite + React + TypeScript setup
- [ ] **Preserve existing Material-UI theme** (colors, typography, spacing - do not change)
- [ ] Verify Redux Toolkit store setup
- [ ] Create Supabase client configuration
- [ ] Implement login page
- [ ] Implement signup flow (create org + first user)
- [ ] Implement password reset flow
- [ ] Create protected route wrapper
- [ ] Create AuthContext for user state
- [ ] Implement logout

**Acceptance Criteria**:
- User can sign up (creates org + admin user)
- User can log in
- User cannot access another org's data (RLS tested)
- Audit log captures all actions

---

#### Sprint 2: Accounts & Contacts (Week 1-2)

**Module 1.2: Accounts CRUD**

**Backend Tasks**:
- [ ] Create `accounts` table with RLS policies
- [ ] Create GET /accounts endpoint (list with pagination, filters, sort)
- [ ] Create POST /accounts endpoint (create)
- [ ] Create GET /accounts/:id endpoint (get by ID)
- [ ] Create PUT /accounts/:id endpoint (update)
- [ ] Create DELETE /accounts/:id endpoint (soft delete)
- [ ] Add full-text search on account name
- [ ] Add indexes for common queries

**Frontend Tasks**:
- [ ] Create Accounts list page (table with pagination)
- [ ] Create Account detail page
- [ ] Create Account create/edit form
- [ ] Create Account delete confirmation modal
- [ ] Add search bar (debounced)
- [ ] Add filters (account_type, owner)
- [ ] Add sort (name, created_at, last_activity_at)
- [ ] Create Redux slice for accounts
- [ ] Add loading/error/empty states

**Module 1.3: Contacts CRUD**

**Backend Tasks**:
- [ ] Create `contacts` table with RLS policies
- [ ] Create GET /contacts endpoint
- [ ] Create POST /contacts endpoint
- [ ] Create GET /contacts/:id endpoint
- [ ] Create PUT /contacts/:id endpoint
- [ ] Create DELETE /contacts/:id endpoint
- [ ] Add contact-account relationship queries
- [ ] Add duplicate detection (email + phone)

**Frontend Tasks**:
- [ ] Create Contacts list page
- [ ] Create Contact detail page
- [ ] Create Contact create/edit form
- [ ] Add "Link to Account" dropdown
- [ ] Show contacts on Account detail page
- [ ] Create Redux slice for contacts
- [ ] Add loading/error/empty states

**Acceptance Criteria**:
- CRUD operations work for Accounts
- CRUD operations work for Contacts
- Contacts linked to Accounts
- Search and filters work
- RLS policies tested (own vs all)

---

#### Sprint 3: Leads (Week 2)

**Module 1.4: Leads CRUD & Assignment**

**Backend Tasks**:
- [ ] Create `leads` table with RLS policies
- [ ] Create GET /leads endpoint (with filters: status, source, assigned_to)
- [ ] Create POST /leads endpoint
- [ ] Create PUT /leads/:id endpoint
- [ ] Create DELETE /leads/:id endpoint
- [ ] Create POST /leads/:id/assign endpoint (assign to user)
- [ ] Create POST /leads/bulk-assign endpoint (round-robin or specific user)
- [ ] Implement basic lead scoring (manual formula)

**Frontend Tasks**:
- [ ] Create Leads list page
- [ ] Create Lead detail page
- [ ] Create Lead create/edit form
- [ ] Add lead status workflow UI (status badges)
- [ ] Add "Assign to" dropdown
- [ ] Add bulk assign action
- [ ] Show lead score (badge)
- [ ] Create Redux slice for leads

**Module 1.5: Lead Conversion**

**Backend Tasks**:
- [ ] Create POST /leads/:id/convert endpoint
  - Creates Account (if company_name provided)
  - Creates Contact (from lead data)
  - Optionally creates Opportunity
  - Updates lead status to 'converted'
  - Links converted_contact_id and converted_opportunity_id

**Frontend Tasks**:
- [ ] Create "Convert Lead" modal
  - Option: "Create new account" or "Link to existing account"
  - Option: "Create opportunity" (checkbox)
  - Opportunity fields: name, amount, expected_close_date
- [ ] Show conversion status on Lead detail

**Acceptance Criteria**:
- Leads can be created, edited, deleted
- Leads can be assigned (single and bulk)
- Lead scoring works
- Lead conversion creates Account + Contact + Opportunity
- Converted leads cannot be edited

---

#### Sprint 4-5: Opportunities Part 1 (Week 3)

**Module 1.6: Opportunities CRUD**

**Backend Tasks**:
- [ ] Create `opportunities` table with RLS policies
- [ ] Create `opportunity_stage_history` table
- [ ] Create GET /opportunities endpoint (filters: stage, status, owner, forecast_category)
- [ ] Create POST /opportunities endpoint
- [ ] Create GET /opportunities/:id endpoint
- [ ] Create PUT /opportunities/:id endpoint
- [ ] Create DELETE /opportunities/:id endpoint
- [ ] Implement stage transition validation (check required fields)
- [ ] Create trigger to log stage changes to `opportunity_stage_history`
- [ ] Calculate `weighted_amount` (generated column)

**Frontend Tasks**:
- [ ] Create Opportunities list page (table view)
- [ ] Create Opportunity detail page
- [ ] Create Opportunity create/edit form
- [ ] Show stage as dropdown (with validation)
- [ ] Show next step and next step date (required fields)
- [ ] Link to Account and Contact
- [ ] Create Redux slice for opportunities

**Module 1.7: Pipeline Kanban Board**

**Frontend Tasks**:
- [ ] Create Pipeline Kanban page
- [ ] Show columns for each stage (Lead, Qualified, Quote Sent, etc.)
- [ ] Show opportunity cards (name, amount, next step date)
- [ ] Implement drag-and-drop (react-beautiful-dnd)
- [ ] Validate stage transition on drop
- [ ] Show validation errors (e.g., "Next step required")
- [ ] Show total pipeline value per stage (header)
- [ ] Add filters (owner, forecast_category, date range)

**Acceptance Criteria**:
- Opportunities can be created, edited, deleted
- Stage transitions enforce required fields
- Drag-and-drop changes stage
- Stage history tracked
- Kanban board shows pipeline

---

#### Sprint 6: Opportunities Part 2 (Week 4)

**Module 1.8: Opportunity Workflows**

**Backend Tasks**:
- [ ] Create POST /opportunities/:id/close-won endpoint (validates required fields)
- [ ] Create POST /opportunities/:id/close-lost endpoint (validates lost_reason)
- [ ] Create POST /opportunities/:id/reopen endpoint (admin only)
- [ ] Add validation: `next_step` required for stage >= "Qualified"
- [ ] Add validation: `expected_close_date` required for stage >= "Qualified"

**Frontend Tasks**:
- [ ] Create "Close Won" modal (close_reason input)
- [ ] Create "Close Lost" modal (lost_reason dropdown)
- [ ] Show celebration animation on close-won 🎉
- [ ] Disable editing for closed opportunities
- [ ] Show "Reopen" button (admin only)

**Module 1.9: Forecast Category**

**Frontend Tasks**:
- [ ] Add forecast_category dropdown (commit, best_case, pipeline)
- [ ] Show forecast category badge on opp card
- [ ] Filter by forecast category

**Acceptance Criteria**:
- Opportunities can be closed (won/lost)
- Required fields enforced
- Forecast category can be set
- Managers can override forecast category

---

#### Sprint 7: Activities (Week 4)

**Module 1.10: Activities CRUD**

**Backend Tasks**:
- [ ] Create `activities` table with RLS policies
- [ ] Create GET /activities endpoint (filter by related_to_type, related_to_id, owner)
- [ ] Create POST /activities endpoint
- [ ] Create PUT /activities/:id endpoint
- [ ] Create DELETE /activities/:id endpoint
- [ ] Create trigger to update `last_activity_at` on related entity
- [ ] Create trigger to increment `activity_count` on opportunity

**Frontend Tasks**:
- [ ] Create Activity feed/timeline component
- [ ] Show activity timeline on Account, Contact, Lead, Opportunity pages
- [ ] Create "Log Activity" modal (type, subject, description, date)
- [ ] Show activity type icons (call, email, meeting, task, note)
- [ ] Show "Mark Complete" checkbox for tasks
- [ ] Filter activities by type
- [ ] Create Redux slice for activities

**Module 1.11: Quick Log**

**Frontend Tasks**:
- [ ] Create floating "Quick Log" button (bottom-right corner)
- [ ] Quick log modal with minimal fields:
  - Type (call, email, meeting, task, note)
  - Subject (autocomplete from recent)
  - Related to (search accounts, contacts, leads, opps)
  - Notes (textarea)
- [ ] Auto-set activity_date to NOW
- [ ] Submit and close

**Acceptance Criteria**:
- Activities can be created, edited, deleted
- Activity timeline shows on all entities
- Last activity timestamp updates automatically
- Quick log from any page

---

#### Sprint 8: Notes & Attachments (Week 5)

**Module 1.12: Notes**

**Backend Tasks**:
- [ ] Create `notes` table with RLS policies
- [ ] Create GET /notes endpoint (filter by related_to_type, related_to_id)
- [ ] Create POST /notes endpoint
- [ ] Create PUT /notes/:id endpoint
- [ ] Create DELETE /notes/:id endpoint

**Frontend Tasks**:
- [ ] Create Notes component (list + create)
- [ ] Show notes on Account, Contact, Lead, Opportunity pages
- [ ] Rich text editor (Quill or TipTap)
- [ ] Pin note (star icon)
- [ ] Show pinned notes at top
- [ ] Create Redux slice for notes

**Module 1.13: Attachments**

**Backend Tasks**:
- [ ] Configure Supabase Storage bucket (`attachments`)
- [ ] Create `attachments` table with RLS policies
- [ ] Create POST /attachments endpoint (upload to Supabase Storage)
- [ ] Create GET /attachments endpoint
- [ ] Create DELETE /attachments/:id endpoint (delete from Storage + DB)

**Frontend Tasks**:
- [ ] Create file upload component (drag-and-drop)
- [ ] Show attachments list on entities
- [ ] Download file button
- [ ] Delete file button (with confirmation)
- [ ] File type icons (PDF, image, etc.)
- [ ] Image preview modal

**Acceptance Criteria**:
- Notes can be created, edited, deleted
- Rich text formatting works
- Pinned notes show at top
- Files can be uploaded, downloaded, deleted
- File size limit enforced (10MB)

---

#### Sprint 9: Search & Filters (Week 5)

**Module 1.14: Global Search**

**Backend Tasks**:
- [ ] Create GET /search endpoint (searches across accounts, contacts, leads, opportunities)
- [ ] Implement full-text search (PostgreSQL `tsvector`)
- [ ] Add search indexes
- [ ] Return results grouped by entity type

**Frontend Tasks**:
- [ ] Create global search bar (top navigation)
- [ ] Show search results dropdown (grouped by type)
- [ ] Highlight search term in results
- [ ] Navigate to detail page on click
- [ ] Show "View all results" link

**Module 1.15: Advanced Filters**

**Frontend Tasks**:
- [ ] Create filter panel (sidebar)
- [ ] Add filters: owner, status, date range, tags, custom fields
- [ ] Save filter presets (localStorage)
- [ ] Show active filters as chips (removable)
- [ ] "Clear all filters" button

**Acceptance Criteria**:
- Global search finds results across all entities
- Filters work on list views
- Filter presets can be saved and loaded

---

#### Sprint 10: CSV Import (Week 6)

**Module 1.16: CSV Import**

**Backend Tasks**:
- [ ] Create POST /accounts/import endpoint (CSV upload)
- [ ] Create POST /contacts/import endpoint
- [ ] Create POST /leads/import endpoint
- [ ] Create POST /opportunities/import endpoint
- [ ] Parse CSV (validate columns, data types)
- [ ] Show import preview (first 10 rows)
- [ ] Bulk insert (transaction)
- [ ] Return import summary (success count, error count, errors)

**Frontend Tasks**:
- [ ] Create "Import" button on list pages
- [ ] Create import modal:
  1. Upload CSV file
  2. Map CSV columns to fields
  3. Preview first 10 rows
  4. Confirm import
  5. Show progress (loading bar)
  6. Show summary (success, errors)
- [ ] Download error log (CSV of failed rows)

**Acceptance Criteria**:
- CSV import works for Accounts, Contacts, Leads, Opportunities
- Column mapping UI works
- Validation errors reported
- Large imports (1000+ rows) complete in <30s

---

#### Sprint 11: Performance & Polish (Week 6)

**Performance Optimization**:
- [ ] Run EXPLAIN ANALYZE on all queries
- [ ] Add missing indexes
- [ ] Optimize N+1 queries (use eager loading)
- [ ] Add Redis caching for read-heavy queries
- [ ] Add pagination to all list views
- [ ] Add virtual scrolling for large lists (1000+ items)
- [ ] Optimize bundle size (code splitting)
- [ ] Lazy load images

**UI Polish**:
- [ ] Add loading skeletons (no blank screens)
- [ ] Add empty states (friendly messages + CTA)
- [ ] Add error states (retry buttons)
- [ ] Add success toasts
- [ ] Add keyboard shortcuts (Cmd+K for search, etc.)
- [ ] Add tooltips for complex UI elements
- [ ] Mobile-responsive (tablet support)

**Testing**:
- [ ] Write unit tests for all services
- [ ] Write integration tests for all API endpoints
- [ ] Write E2E test for full user flow (lead → convert → opp → close won)
- [ ] Run accessibility audit (axe-core)
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

**Acceptance Criteria**:
- All API endpoints < 500ms (p95)
- All pages load < 2s
- No N+1 queries
- E2E test passes
- Accessibility audit passes (WCAG AA)

---

### Phase 1 Acceptance Criteria

✅ **All 6 modules complete**:
- Accounts ✅
- Contacts ✅
- Leads (with conversion) ✅
- Opportunities (with pipeline) ✅
- Activities ✅
- Notes + Attachments ✅

✅ **All workflows work**:
- Lead → Convert → Account/Contact + Opportunity ✅
- Opportunity stage transitions (with validation) ✅
- Activity logging + next step enforcement ✅

✅ **Performance targets met**:
- API response time <500ms (p95) ✅
- Page load time <2s ✅
- No N+1 queries ✅

✅ **Security validated**:
- RLS policies prevent cross-org access ✅
- Authentication required for all endpoints ✅
- Audit log captures all changes ✅

✅ **User acceptance**:
- AEs can run their day without spreadsheets ✅
- Sales Manager can review pipeline and enforce next steps ✅
- 10-minute demo works smoothly ✅

---

## Phase 2: Operating Layer (System of Execution)

**Duration**: 3-4 weeks (6-8 sprints)  
**Team**: 2 full-stack developers + 1 QA  
**Goal**: Dashboards, alerts, forecast cadence

### Sprint Breakdown

#### Sprint 12: KPI Materialization (Week 7)

**Module 2.1: KPI Infrastructure**

**Backend Tasks**:
- [ ] Create `kpi_definitions` table
- [ ] Create `kpi_values` table (materialized KPI cache)
- [ ] Seed KPI definitions (from KPI_DICTIONARY.md)
- [ ] Create POST /kpis/calculate endpoint (calculates KPI from SQL formula)
- [ ] Create Supabase Edge Function for background KPI refresh (runs every 5 min)
- [ ] Create GET /kpis endpoint (returns cached KPI values)
- [ ] Implement KPI refresh strategy (real-time vs batch)

**Acceptance Criteria**:
- KPI definitions seeded in database
- KPI values calculated correctly (compare SQL output to expected)
- Background job refreshes KPIs every 5 minutes
- KPI API returns cached values quickly (<100ms)

---

#### Sprint 13: Rep Dashboard (Week 7-8)

**Module 2.2: Rep Dashboard UI**

**Frontend Tasks**:
- [ ] Create Rep Dashboard page (route: `/dashboard/rep`)
- [ ] Widget 1: My Pipeline (bar chart by stage)
- [ ] Widget 2: Next Steps Due (table: today, this week)
- [ ] Widget 3: Activity Targets vs Actual (gauge chart)
- [ ] Widget 4: Stalled Deals (list: no activity in 7+ days)
- [ ] Widget 5: My Forecast (commit/best_case/pipeline totals)
- [ ] Widget 6: Quota Attainment (gauge: closed vs quota)
- [ ] Add date range selector (this week, this month, this quarter)
- [ ] Auto-refresh every 5 minutes
- [ ] Create Redux slice for dashboard data

**Backend Tasks**:
- [ ] Create GET /dashboards/rep endpoint (aggregates KPIs for current user)
- [ ] Optimize queries (use materialized KPIs where possible)

**Acceptance Criteria**:
- Rep dashboard loads <2s
- All widgets show correct data
- Dashboard auto-refreshes every 5 minutes
- Rep can view own dashboard (not team)

---

#### Sprint 14: Manager Dashboard (Week 8)

**Module 2.3: Manager Dashboard UI**

**Frontend Tasks**:
- [ ] Create Manager Dashboard page (route: `/dashboard/manager`)
- [ ] Widget 1: Pipeline by Stage (stacked bar chart: all reps)
- [ ] Widget 2: Pipeline Coverage Ratio (gauge + table by rep)
- [ ] Widget 3: Rep Activity Leaderboard (table: activities per week)
- [ ] Widget 4: Aging Report (table: opps by time in stage)
- [ ] Widget 5: Conversion Rates by Stage (funnel chart)
- [ ] Widget 6: Team Forecast Snapshot (table: commit/best_case/pipeline by rep)
- [ ] Add rep filter (view specific rep or all)
- [ ] Add date range selector
- [ ] Auto-refresh every 5 minutes

**Backend Tasks**:
- [ ] Create GET /dashboards/manager endpoint (team-level KPIs)

**Acceptance Criteria**:
- Manager dashboard loads <2s
- Shows data for all team members
- Can filter by specific rep
- Auto-refreshes every 5 minutes

---

#### Sprint 15: Exec Dashboard (Week 9)

**Module 2.4: Exec Dashboard UI**

**Frontend Tasks**:
- [ ] Create Exec Dashboard page (route: `/dashboard/exec`)
- [ ] Widget 1: Booked vs Target (gauge: closed won vs total quota)
- [ ] Widget 2: Pipeline vs Target (bar chart: pipeline by close month)
- [ ] Widget 3: Top 10 Deals (table: by amount, with stage)
- [ ] Widget 4: At-Risk Opportunities (list: high-value, stalled)
- [ ] Widget 5: Win Rate Trend (line chart: last 12 months)
- [ ] Widget 6: Pipeline Trend (area chart: last 12 months)
- [ ] Add fiscal quarter selector
- [ ] Export to PDF button

**Backend Tasks**:
- [ ] Create GET /dashboards/exec endpoint (org-level KPIs)
- [ ] Implement PDF export (Puppeteer or react-pdf)

**Acceptance Criteria**:
- Exec dashboard loads <2s
- Shows org-level metrics
- PDF export works
- Only admins and managers can access

---

#### Sprint 16: Alert Engine (Week 9-10)

**Module 2.5: Alert Definitions & Instances**

**Backend Tasks**:
- [ ] Create `alert_definitions` table
- [ ] Create `alert_instances` table
- [ ] Seed 5 alert definitions:
  1. No Next Step
  2. No Activity (7 days)
  3. Late-Stage Stalled (3 days)
  4. Low Pipeline Coverage (<3x)
  5. Large Deal At Risk (>$50k, 3 days no activity)
- [ ] Create Supabase Edge Function for alert checking (runs every 15 min)
- [ ] Create alert firing logic (execute condition_sql, create alert_instances)
- [ ] Implement suppression (don't alert again for X hours)
- [ ] Create POST /alerts/:id/acknowledge endpoint
- [ ] Create POST /alerts/:id/dismiss endpoint

**Frontend Tasks**:
- [ ] Create Alerts page (list of open alerts)
- [ ] Show alert badge in navigation (count of open alerts)
- [ ] Show alert notification (toast when new alert fires)
- [ ] Create alert detail modal (show opportunity, reason, actions)
- [ ] "Acknowledge" button (marks as seen)
- [ ] "Dismiss" button (with reason)
- [ ] Filter by severity, type, status
- [ ] Create Redux slice for alerts

**Backend Tasks (Email Notifications)**:
- [ ] Set up SendGrid account
- [ ] Create email templates (alert notification)
- [ ] Send email when alert fires (to recipients: owner + manager)
- [ ] Include direct link to opportunity

**Acceptance Criteria**:
- All 5 alert types fire correctly (tested with stale data)
- Alert notifications show in UI (badge + toast)
- Email notifications sent
- Alerts can be acknowledged/dismissed
- Suppression prevents spam

---

#### Sprint 17: Forecast Page (Week 10-11)

**Module 2.6: Forecast Submission**

**Backend Tasks**:
- [ ] Create `forecast_snapshots` table
- [ ] Create `forecast_entries` table
- [ ] Create GET /forecast/current endpoint (gets open opportunities with forecast data)
- [ ] Create POST /forecast/submit endpoint (rep submits forecast)
- [ ] Create POST /forecast/snapshot endpoint (creates weekly snapshot)
- [ ] Create Supabase Cron Job (runs every Monday at 8am) to create snapshot

**Frontend Tasks**:
- [ ] Create Forecast page (route: `/forecast`)
- [ ] Show opportunities table with columns:
  - Opportunity name
  - Stage
  - Amount
  - Expected close date
  - Forecast category (dropdown: commit/best_case/pipeline)
  - Rep forecast amount (editable)
  - Rep forecast close date (editable)
  - Manager override amount (editable, manager only)
  - Manager override close date (editable, manager only)
- [ ] Add summary totals (commit, best_case, pipeline)
- [ ] "Submit Forecast" button (saves forecast_entries)
- [ ] Show quota vs forecast (gauge)
- [ ] Filter: This quarter, Next quarter

**Module 2.7: Forecast History**

**Frontend Tasks**:
- [ ] Create "Forecast History" tab
- [ ] Show past snapshots (table: snapshot_date, commit, actual, variance)
- [ ] Show forecast accuracy chart (commit vs actual by week)
- [ ] Click snapshot to view detail (opportunities in that snapshot)

**Acceptance Criteria**:
- Rep can submit forecast (categorize opportunities)
- Manager can override rep forecast
- Weekly snapshot created automatically (Monday 8am)
- Forecast history shows past snapshots
- Forecast accuracy calculated correctly

---

### Phase 2 Acceptance Criteria

✅ **All 3 dashboards complete**:
- Rep Dashboard ✅
- Manager Dashboard ✅
- Exec Dashboard ✅

✅ **All KPIs work**:
- Pipeline metrics (value, weighted, coverage) ✅
- Conversion metrics (win rate, stage conversion) ✅
- Velocity metrics (sales cycle, time in stage) ✅
- Activity metrics (rate, stalled deals) ✅

✅ **Alert engine works**:
- All 5 alerts fire correctly ✅
- Email notifications sent ✅
- In-app notifications show ✅
- Suppression prevents spam ✅

✅ **Forecast cadence works**:
- Rep can submit forecast ✅
- Manager can override ✅
- Weekly snapshot created (Monday) ✅
- Forecast accuracy tracked ✅

✅ **Performance targets met**:
- Dashboard load <2s ✅
- KPI refresh every 5 minutes ✅

✅ **User acceptance**:
- Manager can run Monday forecast meeting in CompassIQ ✅
- Alerts generate action, not noise ✅

---

## Phase 3: Sellability Hardening

**Duration**: 2-3 weeks (4-6 sprints)  
**Team**: 2 developers + 1 QA + 1 Product  
**Goal**: Can onboard a client in <2 hours

### Sprint 18: Onboarding Flow (Week 12)

**Module 3.1: Signup Wizard**

**Frontend Tasks**:
- [ ] Multi-step signup wizard:
  1. Create account (email + password)
  2. Create organization (name, logo)
  3. Invite team (bulk invite by email)
  4. Import data (CSV or skip)
  5. Set up pipeline (use default or customize)
- [ ] Email invite flow (invite link with token)
- [ ] Accept invite page (set password, join org)

**Backend Tasks**:
- [ ] Create POST /organizations endpoint
- [ ] Create POST /invites endpoint (generates token, sends email)
- [ ] Create POST /invites/accept endpoint (creates user, assigns role)

**Acceptance Criteria**:
- User can sign up and create org
- User can invite team members
- Invitees can accept and join
- Onboarding takes <10 minutes

---

#### Sprint 19: Data Management (Week 12-13)

**Module 3.2: CSV Import (Advanced)**

**Backend Tasks**:
- [ ] Enhance CSV import with:
  - Duplicate detection (skip or update)
  - Relationship linking (match contacts to accounts by company name)
  - Data transformation (standardize phone format, etc.)
  - Validation rules (email format, required fields)
- [ ] Import preview with warnings/errors
- [ ] Async import (background job for large files >1000 rows)

**Frontend Tasks**:
- [ ] Enhanced import wizard:
  1. Upload CSV
  2. Map columns
  3. Configure options (skip duplicates, link relationships)
  4. Preview with warnings
  5. Confirm import
  6. Show progress (for async imports)
  7. Download error log

**Module 3.3: Bulk Operations**

**Backend Tasks**:
- [ ] Create POST /accounts/bulk-assign endpoint
- [ ] Create POST /contacts/bulk-assign endpoint
- [ ] Create POST /opportunities/bulk-update endpoint
- [ ] Create DELETE /opportunities/bulk-delete endpoint

**Frontend Tasks**:
- [ ] Add checkboxes to list views (multi-select)
- [ ] Bulk actions dropdown (assign, tag, delete)
- [ ] Confirmation modal for destructive actions
- [ ] Show progress bar for bulk operations

**Module 3.4: Merge Duplicates**

**Backend Tasks**:
- [ ] Create GET /contacts/duplicates endpoint (find by email, phone)
- [ ] Create POST /contacts/merge endpoint (merge 2 contacts, keep one)
- [ ] Handle related records (activities, opportunities)

**Frontend Tasks**:
- [ ] "Find Duplicates" button on Contacts page
- [ ] Show duplicate groups (side-by-side comparison)
- [ ] Select which fields to keep (from contact A or B)
- [ ] "Merge" button

**Acceptance Criteria**:
- CSV import handles 10,000+ rows in <2 min
- Duplicate detection works (email, phone)
- Bulk operations work (assign, tag, delete)
- Merge duplicates works (preserves data)

---

#### Sprint 20: System Health (Week 13)

**Module 3.5: Error Logging & Monitoring**

**Infrastructure Tasks**:
- [ ] Set up Sentry account
- [ ] Configure Sentry in frontend (React error boundary)
- [ ] Configure Sentry in backend (NestJS global exception filter)
- [ ] Add breadcrumbs (user actions before error)
- [ ] Add custom tags (org_id, user_id, role)
- [ ] Set up error alerts (Slack channel)

**Module 3.6: Performance Monitoring**

**Infrastructure Tasks**:
- [ ] Set up Vercel Analytics (frontend)
- [ ] Add custom performance metrics (API latency, page load)
- [ ] Set up uptime monitoring (UptimeRobot or Pingdom)
- [ ] Configure alerting (PagerDuty for critical errors)

**Acceptance Criteria**:
- All errors logged to Sentry
- Performance metrics tracked
- Uptime monitoring configured
- Alerts sent to Slack/PagerDuty

---

#### Sprint 21: Backups & Export (Week 14)

**Module 3.7: Data Export**

**Backend Tasks**:
- [ ] Create GET /export/accounts endpoint (CSV)
- [ ] Create GET /export/contacts endpoint (CSV)
- [ ] Create GET /export/opportunities endpoint (CSV)
- [ ] Create GET /export/full endpoint (JSON: all data)
- [ ] Add to audit log (who exported what)

**Frontend Tasks**:
- [ ] "Export" button on list pages
- [ ] Export modal (select columns, date range)
- [ ] Download CSV file

**Module 3.8: Backups**

**Infrastructure Tasks**:
- [ ] Configure Supabase daily backups (automatic)
- [ ] Test point-in-time recovery (restore to 7 days ago)
- [ ] Document backup/restore process

**Acceptance Criteria**:
- Export works for all entities
- Full data export (JSON) works
- Daily backups configured
- Point-in-time recovery tested

---

#### Sprint 22: Billing (Week 14)

**Module 3.9: Stripe Integration**

**Backend Tasks**:
- [ ] Set up Stripe account (test mode)
- [ ] Create `subscriptions` table
- [ ] Create POST /billing/create-subscription endpoint
- [ ] Create webhook for Stripe events (payment success, failure)
- [ ] Track user count (for billing)

**Frontend Tasks**:
- [ ] Create Billing page (show usage, invoices)
- [ ] "Upgrade Plan" button (opens Stripe Checkout)
- [ ] Show subscription status (active, past_due, canceled)
- [ ] Show invoice history

**Acceptance Criteria**:
- Stripe test payment successful
- User count tracked
- Subscription status shown
- Invoices shown

---

### Phase 3 Acceptance Criteria

✅ **Onboarding ready**:
- Signup wizard complete ✅
- Invite flow works ✅
- CSV import handles 10k rows ✅

✅ **Data management tools**:
- Bulk operations work ✅
- Merge duplicates works ✅
- Export to CSV works ✅

✅ **System health**:
- Error logging configured (Sentry) ✅
- Performance monitoring configured ✅
- Uptime monitoring configured ✅

✅ **Backups & export**:
- Daily backups configured ✅
- Point-in-time recovery tested ✅
- Full data export works ✅

✅ **Billing**:
- Stripe integration works (test mode) ✅
- User count tracked ✅
- Invoices shown ✅

✅ **User acceptance**:
- Can onboard a client in <2 hours ✅
- Can support system without heroics ✅

---

## Phase 4: Expansion (After Paying Customers)

**Duration**: Ongoing  
**Team**: Scale as needed  
**Goal**: Build features that customers are asking for

### Feature Prioritization Framework

Only build features that meet **at least 2 of these 3 criteria**:

1. **Revenue Impact**: Will this increase MRR by >10%?
2. **Churn Prevention**: Will this reduce churn by >20%?
3. **Customer Requests**: Have >30% of customers asked for this?

### Potential Features (Prioritize by Customer Demand)

| Feature | Description | Effort | Revenue Impact | Churn Prevention | Customer Requests |
|---------|-------------|--------|----------------|------------------|-------------------|
| Email Sync | Sync Gmail/Outlook emails to activities | Large | High | High | ? |
| Calendar Sync | Sync Google/Outlook calendar to activities | Medium | Medium | Medium | ? |
| Quote Builder | Generate quotes/proposals (PDF) | Large | High | Medium | ? |
| Commission Tracking | Calculate rep commissions | Medium | Medium | High (reps) | ? |
| Territory Rules | Auto-assign leads by ZIP code | Medium | Low | Low | ? |
| Advanced Lead Scoring | ML-based lead scoring | Large | Medium | Low | ? |
| Mobile App | React Native app (iOS/Android) | X-Large | Medium | Medium | ? |
| Integrations | HubSpot import, Salesforce import, QuickBooks sync | Large | High | High | ? |

**Build Order**:
1. Start with Phase 1 + 2 + 3
2. Get 10+ paying customers
3. Collect feature requests quarterly
4. Prioritize by framework above
5. Build top 1-2 features per quarter

---

## Resource Plan

### Phase 1 (Weeks 1-6)

| Role | FTE | Responsibilities |
|------|-----|------------------|
| **Full-Stack Developer 1** | 1.0 | Backend: API endpoints, RLS policies, database schema |
| **Full-Stack Developer 2** | 1.0 | Frontend: React components, Redux, UI polish |
| **Full-Stack Developer 3** | 0.5 | Support both (CSV import, search, performance) |
| **QA Engineer** | 0.5 | Manual testing, E2E tests, accessibility audit |
| **Product Manager** | 0.25 | Requirements clarification, acceptance testing, user docs |

**Total**: 3.25 FTE

### Phase 2 (Weeks 7-11)

| Role | FTE | Responsibilities |
|------|-----|------------------|
| **Full-Stack Developer 1** | 1.0 | Backend: KPI engine, alert engine, forecast logic |
| **Full-Stack Developer 2** | 1.0 | Frontend: Dashboards, charts, widgets |
| **QA Engineer** | 0.5 | Test KPI calculations, alerts, dashboards |
| **Product Manager** | 0.25 | KPI definitions, alert rules, dashboard specs |

**Total**: 2.75 FTE

### Phase 3 (Weeks 12-14)

| Role | FTE | Responsibilities |
|------|-----|------------------|
| **Full-Stack Developer 1** | 1.0 | Onboarding, import, export, billing |
| **Full-Stack Developer 2** | 1.0 | Bulk operations, merge duplicates, polish |
| **QA Engineer** | 1.0 | End-to-end testing, pilot customer support |
| **Product Manager** | 0.5 | Pilot customer onboarding, feedback collection |
| **DevOps/Infrastructure** | 0.25 | Monitoring, backups, performance optimization |

**Total**: 3.75 FTE

---

## Dependencies & Critical Path

### Critical Path (Must Be Sequential)

```
Phase 0 → Phase 1 → Phase 2 → Phase 3
  ↓         ↓         ↓         ↓
Spec → CRM Core → Dashboards → Sellable
```

### Phase 1 Dependencies

```
Auth Setup (Sprint 1)
  ↓
Accounts (Sprint 2) → Contacts (Sprint 2)
  ↓                      ↓
Leads (Sprint 3) ───────┘
  ↓
Opportunities (Sprint 4-5)
  ↓
Activities (Sprint 7)
  ↓
Notes + Attachments (Sprint 8)
```

### Phase 2 Dependencies

```
CRM Core Complete (Phase 1)
  ↓
KPI Infrastructure (Sprint 12)
  ↓
Dashboards (Sprint 13-15) ← Uses KPIs
  ↓
Alert Engine (Sprint 16) ← Uses KPIs
  ↓
Forecast (Sprint 17) ← Uses Opportunities + KPIs
```

### Parallel Work Opportunities

**Sprint 2-3**:
- Developer 1: Accounts backend
- Developer 2: Contacts backend
- Developer 3: Frontend for both

**Sprint 4-5**:
- Developer 1: Opportunities backend + stage logic
- Developer 2: Kanban board UI
- Developer 3: Opportunity form + detail page

**Sprint 13-15**:
- Developer 1: Rep Dashboard
- Developer 2: Manager Dashboard + Exec Dashboard

---

## Risk Mitigation

### Risk 1: Timeline Too Aggressive
**Probability**: Medium  
**Impact**: High  
**Mitigation**:
- Cut "nice-to-have" features (CSV import, merge duplicates)
- Reduce scope of Phase 3 (skip billing, launch with manual invoicing)
- Add 2 weeks buffer

### Risk 2: RLS Policies Complexity
**Probability**: Medium  
**Impact**: High (security issue)  
**Mitigation**:
- Test RLS policies thoroughly (automated tests)
- Peer review all RLS policies
- Security audit before launch

### Risk 3: Performance Issues
**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Run EXPLAIN ANALYZE on all queries weekly
- Load test with 1000 records per entity
- Add caching (Redis) if needed

### Risk 4: Alert Spam
**Probability**: High  
**Impact**: Medium (users disable alerts)  
**Mitigation**:
- Implement suppression (24-hour window)
- Allow users to configure alert thresholds
- Test with real data (not just test data)

### Risk 5: Forecast Adoption
**Probability**: Medium  
**Impact**: Medium (Phase 2 value not realized)  
**Mitigation**:
- Weekly forecast meeting with pilot customers (train them)
- Make forecast submission easy (one-click categorize)
- Show value (forecast accuracy report)

---

## Success Metrics by Phase

### Phase 1 Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Feature Completeness | 100% of MVP features | Checklist |
| Performance | <500ms API, <2s page | Automated test |
| Security | No RLS leaks | Automated test |
| User Satisfaction | >4/5 | User survey |
| Time to First Value | <1 hour | Onboarding time |

### Phase 2 Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dashboard Load Time | <2s | Performance test |
| KPI Accuracy | 100% match to SQL | Unit tests |
| Alert Precision | >80% actionable | User feedback |
| Forecast Adoption | >80% reps submit weekly | Usage data |

### Phase 3 Success

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding Time | <2 hours | Track setup time |
| Import Success Rate | >95% | Import logs |
| System Uptime | >99.9% | Uptime monitor |
| Support Tickets | <5 per week per customer | Ticket count |
| Customer Satisfaction | >4.5/5 | Weekly survey |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-12-23 | System | Complete sprint-by-sprint build plan |

---

**Next Steps**:
1. Review this plan with engineering team (estimate effort)
2. Create GitHub project board (tasks for Phase 1)
3. Set up Supabase project
4. Start Sprint 1 (Auth + Org Setup)

**Weekly Cadence**:
- Monday: Sprint planning (review tasks, assign work)
- Daily: Standup (15 min: progress, blockers, plan)
- Friday: Sprint demo (10-min demo of progress)
- Friday: Retrospective (15 min: what went well, what didn't)

