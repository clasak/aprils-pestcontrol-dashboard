# CompassIQ - Sales CRM & Operating System

**Version**: 2.0.0  
**Status**: Phase 0 Complete - Ready for Development  
**Last Updated**: December 23, 2025

---

## 🎯 What is CompassIQ?

CompassIQ is a **CRM Core (system of record)** + **Operating Layer (system of execution)** designed to help sales teams run their business with discipline and predictability.

**Target Market**: Small to mid-size B2B sales teams (1 Sales Manager + 2-10 AEs)

**Value Proposition**:
- Replace spreadsheets with a single source of truth
- Enforce pipeline hygiene (next steps, stage transitions)
- Run your business on dashboards, alerts, and weekly forecast
- Sellable v1 in 12-14 weeks

---

## 📚 Phase 0 Complete: Product Specification Package

This repository contains a complete product specification for CompassIQ v1, ready for development.

**Total Deliverables**: 8 comprehensive documents (177 pages)

### 📖 Start Here

**New to this project?** Start with the summary:
👉 **[`docs/PHASE_0_SUMMARY.md`](./docs/PHASE_0_SUMMARY.md)** - Complete overview (15 min read)

---

## 📋 Document Index

| # | Document | Purpose | Pages | Status |
|---|----------|---------|-------|--------|
| 1 | **[Product Spec](./docs/PRODUCT_SPEC_V2.md)** | Product boundary, MVP definition, technical decisions | 25 | ✅ |
| 2 | **[Data Model](./docs/DATA_MODEL_V2.md)** | Complete ERD, 23 tables, indexes, RLS policies | 35 | ✅ |
| 3 | **[Stage Definitions](./docs/STAGE_DEFINITIONS.md)** | 7 opportunity stages with required fields | 15 | ✅ |
| 4 | **[KPI Dictionary](./docs/KPI_DICTIONARY.md)** | 50+ KPIs with exact SQL formulas | 20 | ✅ |
| 5 | **[Roles & Permissions](./docs/ROLES_PERMISSIONS.md)** | Complete RBAC matrix (Admin/Manager/AE) | 18 | ✅ |
| 6 | **[Definition of Done](./docs/DEFINITION_OF_DONE.md)** | Module completion checklist | 12 | ✅ |
| 7 | **[Build Phases](./docs/BUILD_PHASES.md)** | Sprint-by-sprint execution plan (22 sprints) | 40 | ✅ |
| 8 | **[Pilot Contract](./docs/PILOT_CONTRACT_TEMPLATE.md)** | SOW template for first customers | 12 | ✅ |

---

## 🎯 Quick Navigation

### For Product/Business Stakeholders
1. **Start**: [`PHASE_0_SUMMARY.md`](./docs/PHASE_0_SUMMARY.md) - Executive overview
2. **Scope**: [`PRODUCT_SPEC_V2.md`](./docs/PRODUCT_SPEC_V2.md) - What we're building
3. **Go-to-Market**: [`PILOT_CONTRACT_TEMPLATE.md`](./docs/PILOT_CONTRACT_TEMPLATE.md) - How we'll sell it
4. **Timeline**: [`BUILD_PHASES.md`](./docs/BUILD_PHASES.md) - When it'll be ready

### For Engineering Stakeholders
1. **Start**: [`PHASE_0_SUMMARY.md`](./docs/PHASE_0_SUMMARY.md) - Technical overview
2. **Architecture**: [`PRODUCT_SPEC_V2.md`](./docs/PRODUCT_SPEC_V2.md) - Tech stack & decisions
3. **Database**: [`DATA_MODEL_V2.md`](./docs/DATA_MODEL_V2.md) - Complete schema
4. **Business Logic**: [`STAGE_DEFINITIONS.md`](./docs/STAGE_DEFINITIONS.md) - Opportunity workflow
5. **Metrics**: [`KPI_DICTIONARY.md`](./docs/KPI_DICTIONARY.md) - Dashboard calculations
6. **Security**: [`ROLES_PERMISSIONS.md`](./docs/ROLES_PERMISSIONS.md) - RBAC implementation
7. **Execution**: [`BUILD_PHASES.md`](./docs/BUILD_PHASES.md) - Sprint tasks
8. **Quality**: [`DEFINITION_OF_DONE.md`](./docs/DEFINITION_OF_DONE.md) - Acceptance criteria

### For QA/Testing Stakeholders
1. **Test Criteria**: [`DEFINITION_OF_DONE.md`](./docs/DEFINITION_OF_DONE.md)
2. **Stage Logic**: [`STAGE_DEFINITIONS.md`](./docs/STAGE_DEFINITIONS.md)
3. **KPI Validation**: [`KPI_DICTIONARY.md`](./docs/KPI_DICTIONARY.md)
4. **Permissions**: [`ROLES_PERMISSIONS.md`](./docs/ROLES_PERMISSIONS.md)

---

## 🏗️ What We're Building

### CRM Core (System of Record)

**7 Objects**:
- Accounts, Contacts, Leads, Opportunities
- Activities (Calls, Emails, Meetings, Tasks)
- Notes, Attachments

**Key Workflows**:
- Lead → Convert → Account/Contact + Opportunity
- Opportunity stage transitions (7 stages with validation)
- Activity logging with next step enforcement

### Operating Layer (System of Execution)

**3 Dashboards**:
- Rep Dashboard (my pipeline, next steps, stalled deals)
- Manager Dashboard (team pipeline, coverage, aging, forecast)
- Exec Dashboard (booked vs target, top deals, win rate)

**5 Alerts**:
1. No Next Step
2. No Activity (7 days)
3. Late-Stage Stalled (3 days)
4. Low Coverage (<3x quota)
5. Large Deal At Risk (>$50k, 3 days no activity)

**1 Forecast Page**:
- Categorize opportunities (commit/best_case/pipeline)
- Submit weekly forecast (Monday cadence)
- Track forecast accuracy

---

## 🛠️ Technology Stack

**Frontend**:
- React 18 + TypeScript
- Material-UI (MUI) v5 **(existing UI design preserved)**
- Redux Toolkit
- Vite

**Important**: The current UI design and visual style are approved and should be preserved. All new features must match the existing look and feel.

**Backend**:
- Supabase (PostgreSQL + Auth + RLS + Storage)
- Supabase Edge Functions (background jobs)
- PostgreSQL 15+ with TimescaleDB

**Infrastructure**:
- Supabase Cloud (hosted database)
- Vercel (frontend hosting)
- Supabase Cron (alerts, KPI refresh, forecast snapshots)

---

## 📅 Timeline

**Phase 1: CRM Core** (6 weeks)
- Auth, Accounts, Contacts, Leads, Opportunities, Activities, Notes

**Phase 2: Operating Layer** (4 weeks)
- Dashboards, KPIs, Alerts, Forecast

**Phase 3: Sellability Hardening** (3 weeks)
- Onboarding, Data Management, System Health, Backups, Billing

**Total**: 12-14 weeks to sellable v1

---

## 💰 Go-to-Market Strategy

**Target**: 3-5 pilot customers

**Pricing**:
- Implementation Fee: $5,000 - $10,000 (one-time)
- Monthly Platform Fee: $100/user/month
- Minimum Commitment: 3 months

**Success Criteria**:
- 100% of opportunities have next step
- >90% of users log in daily
- Weekly forecast submitted by 100% of reps
- Manager can run pipeline review in CompassIQ
- User satisfaction >4.5/5

---

## ✅ Phase 0 Checklist

### Completed
- [x] Product boundary defined (CRM Core vs Operating Layer)
- [x] MVP scope defined (sellable in 12-14 weeks)
- [x] Data model complete (23 tables, ERD, RLS policies)
- [x] Stage definitions documented (7 stages with validation)
- [x] KPI dictionary complete (50+ KPIs with SQL)
- [x] Roles & permissions defined (Admin/Manager/AE)
- [x] Definition of Done documented
- [x] Build phases planned (22 sprints)
- [x] Pilot contract template created

### Next Steps (Requires Approval)
- [ ] Product Lead review & approval
- [ ] Engineering Lead review & approval
- [ ] CEO/Founder review & approval
- [ ] Green light to proceed to Phase 1

---

## 🚀 Phase 1 Kickoff (Next Steps)

Once Phase 0 is approved:

1. **Set up Infrastructure**:
   - [ ] Create Supabase project (US East region)
   - [ ] Create Vercel project (compassiq-app)
   - [ ] Set up Sentry (error logging)
   - [ ] Create GitHub project board

2. **Team Onboarding**:
   - [ ] Review all Phase 0 docs with team
   - [ ] Assign Sprint 1 tasks
   - [ ] Set up development environment

3. **Start Sprint 1** (Week 1):
   - [ ] Auth + Org Setup
   - [ ] Database schema (core tables)
   - [ ] RLS policies
   - [ ] Audit trail

---

## 📊 Success Metrics

### Phase 1 Success (CRM Core)
- Feature completeness: 100%
- Performance: <500ms API, <2s page load
- Security: No RLS leaks
- User satisfaction: >4/5

### Phase 2 Success (Operating Layer)
- Dashboard load time: <2s
- KPI accuracy: 100%
- Alert precision: >80% actionable
- Forecast adoption: >80% reps submit weekly

### Phase 3 Success (Sellability)
- Onboarding time: <2 hours
- System uptime: >99.9%
- Customer satisfaction: >4.5/5

### Business Success (6 Months)
- Paying customers: 10+
- Monthly Recurring Revenue: $10k+
- Churn rate: <5% monthly
- Net Promoter Score: >50

---

## 🎓 Key Principles

### Product Principles
1. **CRM captures truth. Operating layer drives behavior.**
2. **Build CRM first. Operating layer second.**
3. **Only build Phase 2+ features when customers ask for them.**

### Technical Principles
1. **Multi-tenant from day 1** (org_id on every record)
2. **Auditability from day 1** (event_log table)
3. **Permissions at database level** (RLS policies, not UI)
4. **Performance from day 1** (<500ms API, <2s page)

### Build Principles
1. **Every week, ship**: 1 feature + 1 reliability improvement + 1 onboarding improvement
2. **Every sprint, demo**: 10-minute demo of buyer's day-to-day
3. **Every module, checklist**: Definition of Done before merge

---

## 📞 Contact & Support

**Questions About This Package**:
- Product Questions: [Product Lead]
- Technical Questions: [Engineering Lead]
- Business Questions: [CEO/Founder]

**Weekly Meetings**:
- Monday: Sprint Planning
- Friday: Sprint Demo + Retrospective

---

## 📜 Document History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-12-23 | Phase 0 complete - ready for development |
| 1.0.0 | 2025-12-20 | Initial version (April's Pest Control Dashboard) |

---

## 🎉 Status: Phase 0 Complete!

**All planning documents are ready.**  
**Next milestone**: Phase 1 Sprint 1 Kickoff

👉 **Start here**: [`docs/PHASE_0_SUMMARY.md`](./docs/PHASE_0_SUMMARY.md)

---

## License

Proprietary - All rights reserved

---

**Built with a product company mindset. Designed to be sellable, not just a dashboard.**
