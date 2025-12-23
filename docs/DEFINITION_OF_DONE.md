# CompassIQ Definition of Done
## Module Completion Checklist

**Version**: 2.0.0  
**Status**: Phase 0 - Product Spec  
**Last Updated**: December 23, 2025  

---

## Purpose

This document defines what "Done" means for each module, feature, and release. A module is **not shippable** until all criteria in this checklist are met.

---

## Table of Contents

1. [General Criteria (All Modules)](#general-criteria-all-modules)
2. [Database Schema Criteria](#database-schema-criteria)
3. [API Endpoint Criteria](#api-endpoint-criteria)
4. [Frontend Component Criteria](#frontend-component-criteria)
5. [Integration Criteria](#integration-criteria)
6. [Phase Completion Criteria](#phase-completion-criteria)
7. [Release Readiness Criteria](#release-readiness-criteria)

---

## General Criteria (All Modules)

### Functionality ✅
- [ ] All acceptance criteria from requirements met
- [ ] All CRUD operations work (Create, Read, Update, Delete)
- [ ] All validations implemented and tested
- [ ] All business rules enforced
- [ ] All error cases handled gracefully
- [ ] All edge cases tested

### Performance ⚡
- [ ] API response time < 500ms (p95)
- [ ] Page load time < 2s
- [ ] No N+1 query problems
- [ ] Database queries optimized (EXPLAIN ANALYZE reviewed)
- [ ] Proper indexing in place
- [ ] Large lists paginated (max 100 items per page)

### Security 🔒
- [ ] RLS policies tested (no cross-org data leakage)
- [ ] Authentication required for all endpoints
- [ ] Authorization checks implemented (RBAC)
- [ ] Input sanitization (XSS prevention)
- [ ] SQL injection prevention (parameterized queries)
- [ ] Sensitive data not logged
- [ ] HTTPS only (no HTTP)

### Reliability 🛡️
- [ ] Zero data loss in error scenarios
- [ ] Graceful degradation (fallback UI when API fails)
- [ ] Proper error messages (user-friendly)
- [ ] All errors logged with context (Sentry)
- [ ] Transaction rollback on failure
- [ ] Idempotent operations (can safely retry)

### Usability 🎨
- [ ] 10-minute demo works smoothly
- [ ] No confusing UI states
- [ ] Loading states implemented (spinners, skeletons)
- [ ] Empty states implemented (no blank screens)
- [ ] Error states implemented (retry button)
- [ ] Mobile-responsive (works on tablet)
- [ ] Keyboard navigation works
- [ ] No user questions on "how do I...?"

### Code Quality 💎
- [ ] TypeScript types defined (no `any`)
- [ ] Code follows project conventions
- [ ] Functions < 50 lines
- [ ] Components < 300 lines
- [ ] No commented-out code
- [ ] No `console.log` statements
- [ ] No `TODO` comments (create ticket instead)

### Testing 🧪
- [ ] Unit tests for business logic (>80% coverage)
- [ ] Integration tests for API endpoints
- [ ] E2E test for critical path (smoke test)
- [ ] Manual QA pass (all user flows tested)
- [ ] Cross-browser tested (Chrome, Safari, Firefox)
- [ ] Mobile tested (iOS Safari, Android Chrome)

### Documentation 📚
- [ ] Feature documented in user guide
- [ ] API endpoints documented (OpenAPI/Swagger)
- [ ] Database schema documented (comments on tables)
- [ ] Known issues documented
- [ ] Setup instructions updated (if needed)
- [ ] Changelog updated

### Accessibility ♿
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)
- [ ] Form labels associated with inputs
- [ ] ARIA attributes on interactive elements
- [ ] Alt text on images
- [ ] Keyboard navigation tested

---

## Database Schema Criteria

### Table Definition ✅
- [ ] Table created with proper naming convention (plural, snake_case)
- [ ] All columns have correct data types
- [ ] All constraints defined (NOT NULL, UNIQUE, CHECK)
- [ ] Primary key defined (UUID with `gen_random_uuid()`)
- [ ] Foreign keys defined with proper ON DELETE behavior
- [ ] Audit columns present (`created_at`, `updated_at`, `created_by`)
- [ ] Multi-tenant column present (`org_id`)

### Indexes ⚡
- [ ] Primary key index exists
- [ ] Foreign key indexes exist
- [ ] Common query indexes exist (e.g., `org_id`, `owner_id`, `status`)
- [ ] Composite indexes for multi-column queries
- [ ] Partial indexes for filtered queries (e.g., `WHERE status = 'open'`)
- [ ] GIN indexes for JSONB/array columns
- [ ] Index size reviewed (<10% of table size)

### RLS Policies 🔒
- [ ] RLS enabled on table
- [ ] SELECT policy for admins/managers (all records in org)
- [ ] SELECT policy for AEs (own records only)
- [ ] INSERT policy (org_id matches user's org)
- [ ] UPDATE policy (role-based)
- [ ] DELETE policy (admin only)
- [ ] Policies tested with different roles

### Triggers & Functions ⚙️
- [ ] `updated_at` trigger implemented
- [ ] Audit log trigger implemented (if applicable)
- [ ] Custom business logic triggers implemented
- [ ] Triggers tested (update, delete scenarios)

### Migration ✅
- [ ] Migration file created with timestamp name
- [ ] Up migration creates schema
- [ ] Down migration reverts schema
- [ ] Migration tested (up + down)
- [ ] Seed data created (if applicable)

### Validation ✅
- [ ] CHECK constraints for enums
- [ ] Length limits on TEXT fields
- [ ] Range checks on numeric fields
- [ ] Date validation (e.g., `created_at <= updated_at`)

---

## API Endpoint Criteria

### Endpoint Implementation ✅
- [ ] RESTful naming convention (e.g., `GET /opportunities`, `POST /opportunities`)
- [ ] HTTP method correct (GET, POST, PUT/PATCH, DELETE)
- [ ] Request body validated (DTO with class-validator)
- [ ] Response format consistent (success/error structure)
- [ ] Status codes correct (200, 201, 400, 401, 403, 404, 500)
- [ ] Pagination implemented (for list endpoints)
- [ ] Filtering implemented (query params)
- [ ] Sorting implemented (query params)

### Authentication & Authorization 🔒
- [ ] JWT authentication required
- [ ] User extracted from token
- [ ] Organization extracted from user
- [ ] RBAC permission check implemented
- [ ] Rate limiting applied (if public endpoint)

### Error Handling 🛡️
- [ ] Validation errors return 400 with details
- [ ] Not found errors return 404
- [ ] Unauthorized errors return 401
- [ ] Forbidden errors return 403
- [ ] Server errors return 500 (logged)
- [ ] Error messages user-friendly (no stack traces)

### Performance ⚡
- [ ] Response time < 500ms (p95)
- [ ] Query optimized (EXPLAIN ANALYZE reviewed)
- [ ] Eager loading used (no N+1)
- [ ] Caching implemented (if read-heavy)
- [ ] Batch operations supported (if applicable)

### Testing 🧪
- [ ] Unit test for controller
- [ ] Unit test for service
- [ ] Integration test with database
- [ ] E2E test for happy path
- [ ] Error case tests (400, 404, 403)
- [ ] Performance test (load test with 100 concurrent requests)

### Documentation 📚
- [ ] OpenAPI/Swagger annotations
- [ ] Request body example
- [ ] Response body example
- [ ] Error responses documented
- [ ] Query parameters documented

---

## Frontend Component Criteria

### Component Implementation ✅
- [ ] Component follows design system
- [ ] Props typed with TypeScript interface
- [ ] Default props defined (if applicable)
- [ ] Component state managed correctly (local vs global)
- [ ] Side effects in `useEffect` (not in render)
- [ ] Event handlers named consistently (`handleClick`, `handleChange`)

### State Management 📦
- [ ] Redux slice created (if global state)
- [ ] Actions defined
- [ ] Reducers tested
- [ ] Selectors created (memoized)
- [ ] Loading state tracked
- [ ] Error state tracked

### API Integration ✅
- [ ] API call in service layer (not in component)
- [ ] Loading state shown during API call
- [ ] Error state shown on failure
- [ ] Success state shown on success
- [ ] Retry mechanism on failure
- [ ] Optimistic updates (if applicable)

### User Experience 🎨
- [ ] Loading spinner/skeleton shown
- [ ] Empty state shown (no data)
- [ ] Error state shown (with retry button)
- [ ] Success message/toast shown
- [ ] Form validation errors shown
- [ ] Confirmation modal before destructive actions

### Styling 🎨
- [ ] Material-UI components used
- [ ] `sx` prop used for styling (not inline styles)
- [ ] Theme values used (no hardcoded colors)
- [ ] Responsive breakpoints used (xs, sm, md, lg, xl)
- [ ] Spacing consistent (theme.spacing multiples)
- [ ] Typography variants used (h1-h6, body1, body2)

### Accessibility ♿
- [ ] ARIA labels on buttons/inputs
- [ ] Keyboard navigation works
- [ ] Focus visible on interactive elements
- [ ] Color contrast meets WCAG AA
- [ ] Form labels associated with inputs

### Testing 🧪
- [ ] Unit test for component logic
- [ ] Integration test with Redux
- [ ] E2E test for user flow
- [ ] Accessibility test (axe-core)

### Performance ⚡
- [ ] Component memoized (if expensive)
- [ ] Callbacks memoized (`useCallback`)
- [ ] Values memoized (`useMemo`)
- [ ] Large lists virtualized
- [ ] Images lazy loaded

---

## Integration Criteria

### Feature Integration ✅
- [ ] Frontend calls correct API endpoint
- [ ] API returns expected data structure
- [ ] Frontend handles all response cases (success, error, empty)
- [ ] Real-time updates work (if applicable)
- [ ] Navigation works (routing)
- [ ] State persists across navigation (if needed)

### Cross-Module Integration ✅
- [ ] Related entities linked (e.g., Contact → Account)
- [ ] Navigation between modules works
- [ ] Permissions consistent across modules
- [ ] Data consistency maintained

### End-to-End Flow ✅
- [ ] User can complete full workflow without errors
- [ ] 10-minute demo works smoothly
- [ ] No broken links
- [ ] No console errors
- [ ] No network errors (except expected 404s)

---

## Phase Completion Criteria

### Phase 1: CRM Core ✅
- [ ] All 6 modules complete (Accounts, Contacts, Leads, Opportunities, Activities, Notes)
- [ ] All CRUD operations work
- [ ] Lead conversion workflow works
- [ ] Opportunity stage transitions work
- [ ] Activity timeline shows on all entities
- [ ] Search and filters work
- [ ] CSV import works (basic)
- [ ] RLS policies tested (no cross-org access)
- [ ] 10-minute demo works
- [ ] Performance targets met (<500ms API, <2s page load)
- [ ] User acceptance criteria met

### Phase 2: Operating Layer ✅
- [ ] All 3 dashboards complete (Rep, Manager, Exec)
- [ ] All KPIs calculated correctly (SQL formulas tested)
- [ ] All 5 alerts implemented and tested
- [ ] Forecast page works (commit/best_case/pipeline)
- [ ] Weekly snapshot created automatically
- [ ] Dashboard data refreshes every 5 minutes
- [ ] Alerts fire correctly (tested with stale data)
- [ ] Alert notifications sent (email + in-app)
- [ ] Manager can run Monday forecast meeting in system
- [ ] Performance targets met (<2s dashboard load)

### Phase 3: Sellability Hardening ✅
- [ ] Onboarding flow complete (create org, invite users, import data)
- [ ] CSV import works (Accounts, Contacts, Leads, Opportunities)
- [ ] Data validation on import
- [ ] Export to CSV works (all list views)
- [ ] Bulk operations work (assign, tag, delete)
- [ ] Merge duplicates works (contacts, accounts)
- [ ] Error logging configured (Sentry)
- [ ] Performance monitoring configured
- [ ] Uptime monitoring configured
- [ ] Automated backups configured
- [ ] Billing hooks implemented (Stripe test mode)
- [ ] Can onboard a client in <2 hours

---

## Release Readiness Criteria

### Technical Readiness ✅
- [ ] All Phase 1 + 2 + 3 criteria met
- [ ] Zero critical bugs (P0)
- [ ] < 5 high-priority bugs (P1)
- [ ] Performance targets met (API <500ms, page <2s, uptime >99.9%)
- [ ] Security audit passed (no critical vulnerabilities)
- [ ] Load testing passed (100 concurrent users)
- [ ] Data backup tested (restore successful)
- [ ] Monitoring configured (Datadog/New Relic)
- [ ] Alerting configured (PagerDuty for critical errors)
- [ ] SSL certificate configured
- [ ] Domain configured (compassiq.com)

### Operational Readiness ✅
- [ ] User documentation complete (user guide)
- [ ] Training materials prepared (videos, guides)
- [ ] Support process defined (email, weekly call)
- [ ] Support email configured (support@compassiq.com)
- [ ] Data migration plan tested
- [ ] Rollback plan documented
- [ ] Incident response plan documented
- [ ] SLA defined (critical bugs fixed in 24 hours)

### Business Readiness ✅
- [ ] Pricing finalized ($100/user/month + setup fee)
- [ ] Customer contracts prepared (SOW template)
- [ ] Pilot success criteria defined
- [ ] Success metrics baseline established
- [ ] Launch communication plan ready
- [ ] Customer feedback process defined
- [ ] Referral incentive program defined

### Go/No-Go Decision ✅

**GO Criteria** (all must be true):
- [ ] All must-have features complete
- [ ] Zero critical bugs (P0)
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] Data migration successful (test)
- [ ] 3 pilot customers onboarded and satisfied
- [ ] Support process tested
- [ ] Monitoring configured and tested

**NO-GO Criteria** (any one triggers delay):
- [ ] Critical bugs unresolved
- [ ] Performance below targets
- [ ] Security vulnerabilities (high/critical)
- [ ] Data loss risk identified
- [ ] Pilot customers dissatisfied (<4/5 rating)
- [ ] Support process not ready

---

## Sprint Definition of Done

### Each Sprint Must Produce:

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

### Sprint Demo (Every Friday)

**Demo the buyer's day-to-day** (10 minutes or less):
1. Create lead → convert → open opp
2. Log meeting → set next step
3. Dashboard updates (show real-time refresh)
4. Alert triggers (simulate stalled deal)
5. Forecast snapshot (show weekly commit)

If demo takes >10 minutes, UX is too complex.

---

## Pull Request Checklist

### Before Opening PR:
- [ ] All tests pass locally
- [ ] Linter passes (no warnings)
- [ ] TypeScript compiles (no errors)
- [ ] Code formatted (Prettier)
- [ ] No `console.log` statements
- [ ] No commented-out code
- [ ] No merge conflicts

### PR Description Must Include:
- [ ] Link to GitHub issue/ticket
- [ ] Summary of changes (what + why)
- [ ] Screenshots (if UI change)
- [ ] Testing instructions (how to test)
- [ ] Migration instructions (if database change)
- [ ] Breaking changes documented (if any)

### Code Review Checklist:
- [ ] Code follows project conventions
- [ ] No obvious bugs
- [ ] Edge cases handled
- [ ] Tests cover new code
- [ ] Performance acceptable
- [ ] Security concerns addressed
- [ ] Documentation updated

### Before Merging:
- [ ] All review comments addressed
- [ ] CI/CD pipeline passes (all checks green)
- [ ] At least 1 approval from team member
- [ ] Squash commits (clean history)
- [ ] Update CHANGELOG.md

---

## Definition of Done Summary

**A module is DONE when:**

✅ **It works** (all acceptance criteria met)  
⚡ **It's fast** (<500ms API, <2s page load)  
🔒 **It's secure** (RLS policies, auth, no XSS/SQL injection)  
🛡️ **It's reliable** (zero data loss, graceful errors)  
🎨 **It's usable** (10-min demo, no user confusion)  
💎 **Code quality** (TypeScript, <50 line functions, no TODOs)  
🧪 **It's tested** (unit + integration + E2E)  
📚 **It's documented** (user guide + API docs)  
♿ **It's accessible** (WCAG AA, keyboard nav)  

**If any criterion is missing, it's NOT DONE.**

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-12-23 | System | Complete Definition of Done for all phases |

---

**Next Steps**: Review this checklist with the team and get alignment on what "Done" means before starting Phase 1.

