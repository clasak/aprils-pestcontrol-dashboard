# CompassIQ Product Specification
## CRM Core + Operating Layer

**Version**: 2.0.0  
**Status**: Phase 0 - Product Definition  
**Last Updated**: December 23, 2025  
**Target Market**: Small to mid-size B2B sales teams (1 Manager + 2-10 AEs)

---

## Executive Summary

CompassIQ is a **transaction system (CRM)** and **analytics/operating system (Dashboards + Alerts)** designed to help sales teams run their business with discipline and predictability.

We are building a product company, not a one-off dashboard project. This document defines the product boundary, technical decisions, and build phases to reach a sellable v1.

---

## 1. Product Boundary

### CRM Core (System of Record)
**Purpose**: Captures truth. The source of record for all customer relationships and pipeline.

**Objects**:
- ✅ Accounts - Customer companies
- ✅ Contacts - People at accounts
- ✅ Leads - Pre-qualified prospects
- ✅ Opportunities - Pipeline items with stages
- ✅ Activities - Calls, emails, meetings, tasks
- ✅ Notes - Rich text notes on any object
- ✅ Attachments - File uploads on any object

**Capabilities**:
- Multi-tenant architecture (org isolation)
- Row Level Security (RLS) for data access
- Basic permissions (Admin / Manager / AE)
- Audit trail (who changed what, when)
- Lead → Convert → Account/Contact → Opportunity workflow
- Opportunity stages with required fields by stage
- Activity logging with next-step enforcement
- Search and filters

### Operating Layer (System of Execution)
**Purpose**: Drives behavior. Turns CRM data into action.

**Capabilities**:
- ✅ KPI definitions + scorecards
- ✅ Dashboards (Rep / Manager / Exec)
- ✅ Alerts (stalled deals, no activity, pipeline gaps)
- ✅ Weekly operating cadence (forecast + commits + action list)
- ✅ Forecast snapshots (commit/best case/pipeline)

**Rule**: CRM captures truth. Operating layer drives behavior. **Build CRM first.**

---

## 2. Sellable MVP Definition

### Target Customer
**Profile**: 1 Sales Manager + 2 AEs at a B2B company
**Pain**: Using spreadsheets, no pipeline visibility, deals fall through cracks
**Success**: Can run their sales operation 100% in CompassIQ

### MVP Objects (Must-Have)
```
Accounts ──┐
Contacts ──┼──> Opportunities ──> Activities
Leads ─────┘
Users/Roles
```

### MVP Workflows
1. **Lead Management**
   - Capture lead (web form, CSV import, manual)
   - Assign to AE
   - Log activities (calls, emails)
   - Convert → Account/Contact + Opportunity

2. **Opportunity Management**
   - Create opportunity with stage
   - Required fields enforcement per stage
   - Drag-and-drop stage changes
   - Next step required (what + when)
   - Activity timeline
   - Notes and attachments
   - Mark won/lost with reason

3. **Forecasting**
   - Opportunities in commit/best case/pipeline
   - Weekly snapshot (Monday forecast meeting)
   - Rep forecast + Manager override
   - Historical accuracy tracking

### MVP Dashboards

**Manager Dashboard**:
- Pipeline by stage (Kanban + bar chart)
- Pipeline coverage ratio (3x+ is healthy)
- Conversion rates by stage
- Rep activity leaderboard
- Aging report (opportunities stalled >7 days)
- Forecast snapshot (commit/best case/pipeline)

**Rep Dashboard**:
- My pipeline (stage, value, next step)
- Next steps due (today, this week)
- Activity targets vs actual
- Stalled deals (no activity in X days)
- My forecast

**Exec Dashboard**:
- Booked vs target (or pipeline vs target)
- Top 10 deals by value
- At-risk opportunities
- Win rate trend
- Pipeline trend

### MVP Alerts (Must-Have)
These alerts must exist or you don't have an operating system:

| Alert | Trigger | Recipient |
|-------|---------|-----------|
| No Next Step | Opportunity has blank next_step or past-due next_step_date | Owner + Manager |
| No Activity | Opportunity no activity in 7 days | Owner + Manager |
| Late-Stage Stalled | Opportunity in "Negotiation" or "Verbal Commitment" with no activity in 3 days | Owner + Manager |
| Pipeline Coverage Low | Rep weighted pipeline < 3x quota | Rep + Manager |
| Large Deal At Risk | Opportunity >$50k with no activity in 3 days | Owner + Manager + Exec |

### Demo Readiness Test
**Can you demo these end-to-end in under 10 minutes?**

1. Create lead → convert → account/contact + opportunity
2. Move opportunity through stages (show required fields)
3. Log activity + set next step
4. Dashboard updates in real-time
5. Alert triggers (simulate stalled deal)
6. Forecast page with commit/best case/pipeline
7. Weekly snapshot

If you can't demo this cleanly, **you're not MVP-ready**.

---

## 3. Non-Negotiable Technical Decisions

### Architecture Principles
1. **Multi-tenant from day 1**
   - Every record has `org_id`
   - RLS policies enforce tenant isolation
   - No cross-tenant data leakage

2. **Auditability from day 1**
   - Every record has: `created_by`, `created_at`, `updated_at`, `last_activity_at`
   - Every update writes an audit row (`event_log` table)
   - Immutable audit log (append-only)

3. **Permissions at database level**
   - Row Level Security (RLS) policies
   - Not "in the UI" - enforced at data layer
   - Roles: Admin, Manager, AE

4. **Performance & Scale**
   - Support 100 concurrent users
   - Support 100k+ records (contacts, opps, activities)
   - API response time <500ms (p95)
   - Dashboard load <2s

### Technology Stack

**Frontend**:
- ✅ React 18 with TypeScript
- ✅ Material-UI (MUI) v5
- ✅ Redux Toolkit for state management
- ✅ React Router v6
- ✅ Recharts for visualizations
- ✅ Vite for build tooling

**Important**: The existing UI design and visual style should be **preserved**. All new features should match the current look and feel. The design system documentation codifies what already exists, not what should change.

**Backend**:
- ✅ Supabase (PostgreSQL + Auth + RLS)
- ✅ Supabase Edge Functions for background jobs
- ✅ Supabase Realtime for live updates
- ✅ PostgreSQL 15+ with TimescaleDB extension

**Infrastructure**:
- ✅ Supabase Cloud (hosted PostgreSQL + Auth)
- ✅ Vercel for frontend hosting
- ✅ Supabase Cron for scheduled jobs (alerts, KPI refresh)
- ✅ Supabase Storage for attachments

**Authentication**:
- ✅ Supabase Auth (JWT tokens)
- ✅ Row Level Security (RLS) policies
- ✅ Role-based access control (RBAC)

### Database Schema Requirements

**Every table must have**:
```sql
org_id UUID NOT NULL,
created_by UUID NOT NULL,
created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
last_activity_at TIMESTAMPTZ, -- for related objects
```

**Audit log table**:
```sql
CREATE TABLE event_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL, -- create, update, delete
  entity_type TEXT NOT NULL, -- table name
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 4. Build Phases

### Phase 0: Product Spec and Data Model (CURRENT)
**Duration**: 2-3 days  
**Team**: Product + Engineering leads  

**Deliverables**:
- ✅ Data model ERD (tables + relationships) - `DATA_MODEL_V2.md`
- ✅ Stage definitions + required fields by stage - `STAGE_DEFINITIONS.md`
- ✅ KPI dictionary (exact formulas) - `KPI_DICTIONARY.md`
- ✅ Roles + permissions matrix - `ROLES_PERMISSIONS.md`
- ✅ "Definition of Done" checklist for each module - `DEFINITION_OF_DONE.md`

**Acceptance Criteria**:
- [ ] Engineering team reviewed and approved ERD
- [ ] All KPIs have exact SQL formulas
- [ ] All stage transitions documented with required fields
- [ ] All permissions documented for 3 roles
- [ ] Definition of Done agreed upon

---

### Phase 1: CRM Core v1 (System of Record)
**Duration**: 4-6 weeks  
**Team**: 2-3 full-stack developers + 1 QA  

**Module 1.1: Auth + Org Setup (Week 1)**
- Supabase Auth integration
- Organization creation
- User management (invite, roles, deactivate)
- RLS policies for all tables
- Basic admin panel

**Module 1.2: Accounts + Contacts (Week 1-2)**
- CRUD for Accounts
- CRUD for Contacts (linked to Accounts)
- Search and filters
- List views with pagination
- CSV import (basic)

**Module 1.3: Leads (Week 2)**
- CRUD for Leads
- Lead assignment (round-robin or territory)
- Lead status workflow (new → contacted → qualified → converted/lost)
- Basic lead scoring (manual formula)
- Convert lead → Account/Contact + Opportunity

**Module 1.4: Opportunities (Week 3)**
- CRUD for Opportunities
- Pipeline stages (7 stages defined in STAGE_DEFINITIONS.md)
- Stage transition validation (required fields)
- Drag-and-drop stage changes
- Next step enforcement (required for stage progression)
- Activity timeline view
- Mark won/lost with required reasons

**Module 1.5: Activities (Week 3-4)**
- CRUD for Activities (Call, Email, Meeting, Task, Note)
- Link to Account, Contact, Lead, or Opportunity
- Activity feed/timeline
- Task reminders (due dates)
- Quick log from any page

**Module 1.6: Notes + Attachments (Week 4)**
- Rich text notes on any object
- File attachments (Supabase Storage)
- Pin important notes

**Acceptance Criteria**:
- ✅ AEs can run their day without spreadsheets
- ✅ Sales Manager can review pipeline and enforce next steps
- ✅ All CRUD operations <500ms
- ✅ RLS policies prevent cross-org access
- ✅ Audit log captures all changes

---

### Phase 2: Operating Layer v1 (Dashboards + Cadence)
**Duration**: 3-4 weeks  
**Team**: 2 full-stack developers + 1 QA  

**Module 2.1: KPI Materialization (Week 1)**
- Create materialized views or cached tables for KPIs
- Refresh strategy (real-time vs scheduled)
- Background jobs for KPI calculation
- API endpoints for dashboard data

**Module 2.2: Rep Dashboard (Week 1)**
- My Pipeline (stage breakdown)
- Next Steps Due (today, this week)
- Activity Targets vs Actual
- Stalled Deals (no activity in 7+ days)
- My Forecast (commit/best case/pipeline)

**Module 2.3: Manager Dashboard (Week 2)**
- Pipeline by Stage (Kanban + bar chart)
- Pipeline Coverage Ratio
- Rep Activity Leaderboard
- Aging Report (opportunities by time in stage)
- Conversion Rates by Stage
- Team Forecast Snapshot

**Module 2.4: Exec Dashboard (Week 2)**
- Booked vs Target (or Pipeline vs Target)
- Top 10 Deals
- At-Risk Opportunities
- Win Rate Trend (last 12 months)
- Pipeline Trend (last 12 months)

**Module 2.5: Alert Engine (Week 3)**
- Alert definitions (see MVP Alerts table)
- Notification delivery (email, in-app)
- Alert suppression (don't spam)
- Alert configuration (per user or org)
- Alert history/audit trail

**Module 2.6: Forecast Page (Week 3-4)**
- Weekly forecast input (commit/best case/pipeline by opp)
- Manager override
- Snapshot on Monday (weekly cadence)
- Historical snapshots (compare week-over-week)
- Forecast accuracy report

**Acceptance Criteria**:
- ✅ Monday forecast meeting can be run directly from CompassIQ
- ✅ Alerts generate action, not noise
- ✅ Dashboards load <2s
- ✅ KPIs update every 5 minutes (or real-time)

---

### Phase 3: Sellability Hardening
**Duration**: 2-3 weeks  
**Team**: 2 developers + 1 QA + 1 Product  

**Module 3.1: Onboarding Flow (Week 1)**
- Create org wizard
- Invite users (bulk invite)
- CSV import (Accounts, Contacts, Leads, Opportunities)
- Data validation on import
- Sample data generator (for demo/test)

**Module 3.2: Data Management (Week 1-2)**
- Export to CSV (any list view)
- Bulk operations (assign, tag, delete)
- Merge duplicates (contacts, accounts)
- Archive/restore records

**Module 3.3: System Health (Week 2)**
- Error logging (Sentry or similar)
- Performance monitoring (API response times)
- Uptime monitoring (external service)
- Alerting for system issues (PagerDuty)

**Module 3.4: Backups + Export (Week 2)**
- Automated daily backups (Supabase built-in)
- Point-in-time recovery (Supabase built-in)
- Full data export (JSON or CSV)

**Module 3.5: Billing Hooks (Week 3)**
- User count tracking
- Stripe integration (basic)
- Billing page (view usage, invoices)
- Manual invoicing workflow

**Acceptance Criteria**:
- ✅ Can onboard a client in 2 hours (not weeks)
- ✅ Can support the system without heroics
- ✅ Zero data loss in backup/restore test
- ✅ Stripe test payment successful

---

### Phase 4: Expansion (After Paying Customers)
**Duration**: Ongoing  
**Team**: Scale as needed  

**Possible Add-Ons** (prioritized by customer demand):
1. Email/calendar sync (Gmail, Outlook)
2. Quote/proposal builder
3. Commission tracking
4. Territory rules and assignment
5. Advanced lead scoring (ML)
6. Integrations (HubSpot import, Salesforce import, QuickBooks sync)
7. Mobile app (React Native)
8. Advanced reporting (custom report builder)
9. Workflow automation (if X then Y)
10. AI insights (deal risk scoring, next best action)

**Prioritization**: Only build what paying customers are asking for.

---

## 5. Ruthless Prioritization Framework

### Tier 1: Must-Have to Sell
Cannot launch without these. If missing, no one will buy.

- Pipeline + stages + required fields
- Activities + next step enforcement
- Dashboards + forecast cadence
- Alerts (no next step, no activity, stalled)
- Multi-tenant security (RLS)
- User management + RBAC

### Tier 2: Makes It Sticky
Not required for initial sale, but prevents churn.

- CSV import/export
- File attachments
- In-app notes + mentions
- Search (fast, accurate)
- Mobile-responsive UI
- Email notifications

### Tier 3: Nice-to-Have, Avoid Early
Will slow down launch. Defer to Phase 4.

- Fully configurable objects (custom fields)
- Complex automation builder (Zapier-style)
- "AI everything" features
- Deep integrations (QuickBooks, Mailchimp)
- Advanced reporting (custom SQL queries)

**Decision Rule**: If it's not Tier 1, defer until we have 10+ paying customers asking for it.

---

## 6. Pilot Customer Strategy

### Pilot Contract Structure

**Implementation Fee**: $5,000 - $10,000 (one-time)
- Covers build + onboarding + 3 months support
- Includes custom setup (import data, configure stages, train team)

**Monthly Platform Fee**: $100/user/month
- Covers hosting + support + iteration capacity

**Scope Cap** (written in SOW):
- Sales team only (no operations, no finance, etc.)
- 1 pipeline (not multiple product lines)
- 3 users (1 manager + 2 AEs)
- 3 dashboards (Rep, Manager, Exec)
- 8 alerts (the MVP alerts)

**Pilot Success Criteria** (in SOW):
- 100% of opportunities have next step and stage hygiene
- Forecast produced weekly in system
- Manager can run pipeline review inside CompassIQ
- Reduction in "where is this deal?" time by 80%

### How to Run Pilot

**Week 1: Onboarding**
- Data import (accounts, contacts, opportunities)
- Configure pipeline stages
- Set up users and roles
- Train team (2-hour session)

**Week 2-4: Observation**
- Monitor daily usage
- Weekly check-in (what's working, what's not)
- Fix critical bugs within 24 hours
- Collect feature requests (prioritize ruthlessly)

**Week 5-8: Iteration**
- Add 1-2 requested features (if Tier 1 or 2)
- Improve performance/UX based on feedback
- Add sample reports

**Week 9-12: Expansion**
- Upsell to 5-10 users if successful
- Get referrals
- Write case study

---

## 7. Weekly Execution Plan

### Every Week You Should Produce:

1. **One Shippable Module Improvement** (visible value)
   - Example: Add bulk assign to leads page
   - Example: Add "stalled deals" widget to manager dashboard

2. **One Reliability Improvement** (logs, tests, performance)
   - Example: Add error logging to all API calls
   - Example: Add unit tests for forecast calculation
   - Example: Optimize slow dashboard query

3. **One Onboarding Improvement** (import, templates, setup)
   - Example: Add CSV import validation
   - Example: Create pipeline stage templates
   - Example: Add sample data generator

### Every Sprint Ends with a Demo

**Demo the buyer's day-to-day:**
- Create lead → convert → open opp → log meeting → next step → dashboard updates → alert triggers → forecast snapshot

This demo should take **10 minutes or less**. If it takes longer, your UX is too complex.

---

## 8. Success Metrics

### MVP Success (Phase 1 + 2 Complete)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Data entry time | <2 min per record | Timed user test |
| Pipeline visibility | 100% (all deals tracked) | Audit report |
| Forecast accuracy | >70% within 20% | Weekly snapshot comparison |
| Alert response rate | >80% (alerts acted on) | Alert history analysis |
| User adoption | >90% within 30 days | Daily active users |
| Time to insight | <30s (find answer to question) | User test |

### Pilot Success (Phase 3 Complete)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Onboarding time | <2 hours | Track setup time |
| Data import success | >95% accuracy | Post-import validation |
| System uptime | >99.9% | Monitoring service |
| Support tickets | <5 per week per customer | Ticket count |
| Customer satisfaction | >4.5/5 | Weekly survey |

### Business Success (Phase 4+)

| Metric | Target | Measurement |
|--------|--------|-------------|
| Paying customers | 10+ in 6 months | Contract count |
| Monthly Recurring Revenue | $10k+ in 6 months | Stripe dashboard |
| Churn rate | <5% monthly | Cancellation rate |
| Net Promoter Score | >50 | Quarterly survey |
| Revenue per customer | $500+/month | Average contract value |

---

## 9. Definition of "Shippable"

A module is shippable when:

### Functionality
- ✅ All CRUD operations work
- ✅ All validations work (required fields, data types)
- ✅ All permissions work (RLS policies tested)
- ✅ All workflows work (lead convert, opp close)
- ✅ All calculations are correct (KPIs, forecasts)

### Performance
- ✅ API response time <500ms (p95)
- ✅ Dashboard load <2s
- ✅ Search results <500ms for 10k records
- ✅ No N+1 queries (use database profiler)

### Reliability
- ✅ Zero data loss in error scenarios
- ✅ All errors logged (Sentry)
- ✅ Graceful error handling (user-friendly messages)
- ✅ Audit log captures all changes

### Security
- ✅ RLS policies prevent cross-org access (tested)
- ✅ No SQL injection vulnerabilities
- ✅ No XSS vulnerabilities
- ✅ Authentication required (no public endpoints)

### Usability
- ✅ 10-minute demo works smoothly
- ✅ No user questions on "how do I...?"
- ✅ Mobile-responsive (works on tablet)
- ✅ Loading states (no blank screens)

### Documentation
- ✅ Feature documented (user guide)
- ✅ API documented (if applicable)
- ✅ Known issues documented

---

## 10. Next Steps

### Immediate (This Week)
1. ✅ Create `DATA_MODEL_V2.md` - Complete ERD with all tables
2. ✅ Create `STAGE_DEFINITIONS.md` - Pipeline stages with required fields
3. ✅ Create `KPI_DICTIONARY.md` - Exact SQL formulas for all metrics
4. ✅ Create `ROLES_PERMISSIONS.md` - Permissions matrix
5. ✅ Create `DEFINITION_OF_DONE.md` - Module completion checklist

### Phase 1 Kickoff (Next Week)
1. Review all Phase 0 documents with engineering team
2. Create GitHub project board (tasks for Phase 1)
3. Set up Supabase project
4. Set up Vercel project
5. Initialize repositories (frontend, docs)
6. Start Module 1.1: Auth + Org Setup

### Ongoing
1. Weekly sprint planning (prioritize tasks)
2. Weekly demo (Friday, 10-minute demo of progress)
3. Weekly retrospective (what went well, what didn't)
4. Weekly customer check-in (pilot customers)

---

## 11. Questions to Answer Before Phase 1

### Product Questions
- [ ] What is the minimum number of pipeline stages? (Recommendation: 5-7)
- [ ] What is the default forecast categorization? (Recommendation: commit, best_case, pipeline)
- [ ] What is the definition of "stalled" deal? (Recommendation: no activity in 7 days)
- [ ] What is the default lead scoring formula? (Defer to basic manual scoring)

### Technical Questions
- [ ] What is the Supabase project name and region? (Choose: US East 1 for best performance)
- [ ] What is the Vercel project name? (Choose: compassiq-app)
- [ ] What is the authentication strategy? (Recommendation: Email + password, magic link optional)
- [ ] What is the file storage strategy? (Recommendation: Supabase Storage)

### Business Questions
- [ ] What is the pricing model? (Recommendation: $100/user/month + $5-10k setup fee)
- [ ] What is the pilot customer selection criteria? (Recommendation: 1-10 AEs, B2B company)
- [ ] What is the support model? (Recommendation: Email + weekly check-in call)
- [ ] What is the SLA for pilots? (Recommendation: Critical bugs fixed in 24 hours)

---

**Document Status**: ✅ Phase 0 Complete - Ready for Review  
**Next Document**: `DATA_MODEL_V2.md` - Complete database schema  

**Approval**:
- [ ] Product Lead
- [ ] Engineering Lead
- [ ] CEO/Founder

