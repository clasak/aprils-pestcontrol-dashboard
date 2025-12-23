# Product Roadmap - April's Pest Control Dashboard

**Version**: 1.0
**Last Updated**: December 22, 2025
**Planning Horizon**: 24 months

---

## Table of Contents

1. [Roadmap Overview](#roadmap-overview)
2. [Phase 1: MVP (Months 1-3)](#phase-1-mvp-months-1-3)
3. [Phase 2: Growth Features (Months 4-6)](#phase-2-growth-features-months-4-6)
4. [Phase 3: Enterprise Features (Months 7-12)](#phase-3-enterprise-features-months-7-12)
5. [Phase 4: Vision (Year 2+)](#phase-4-vision-year-2)
6. [Feature Dependencies](#feature-dependencies)
7. [Strategic Rationale](#strategic-rationale)

---

## Roadmap Overview

### Strategic Themes

**Phase 1 (Months 1-3)**: Foundation & Core Workflows
- Build essential CRM, scheduling, and service management
- Establish single source of truth architecture
- Achieve feature parity with basic CRM systems
- **Goal**: Replace spreadsheets, operational in 3 months

**Phase 2 (Months 4-6)**: Competitive Differentiation
- Add pest control-specific features (chemical tracking, EPA compliance)
- Enable customer self-service
- Automate revenue operations (commission, billing)
- **Goal**: Beat Salesforce for pest control industry

**Phase 3 (Months 7-12)**: Intelligence & Scale
- Implement AI/ML (churn prediction, lead scoring, forecasting)
- Advanced integrations (accounting, marketing automation)
- Multi-location management (franchise support)
- **Goal**: Scale to enterprise customers (50-500 employees)

**Phase 4 (Year 2+)**: Innovation & Market Leadership
- Native mobile apps (React Native)
- Voice interfaces and AR tools
- IoT device integration (smart traps)
- International expansion
- **Goal**: Industry-leading platform, 1000+ customers

### Success Metrics by Phase

| Phase | Customers | MRR Target | User Satisfaction | Key Milestone |
|-------|-----------|------------|-------------------|---------------|
| Phase 1 (MVP) | 5-10 | $2,500 | >4.0/5 | April's team fully operational |
| Phase 2 | 25-50 | $12,500 | >4.5/5 | EPA compliance certified |
| Phase 3 | 100-200 | $50,000 | >4.5/5 | AI features live, enterprise customers |
| Phase 4 | 500-1000 | $250,000 | >4.7/5 | Market leader, franchise platform |

---

## Phase 1: MVP (Months 1-3)

**Timeline**: January 2025 - March 2025
**Status**: Active Development
**Primary Goal**: Functional CRM platform replacing spreadsheets

### Core Features (Detailed in PRD_MVP.md)

**CRM Core** (2 weeks)
- Contact and company management
- Lead capture and basic scoring
- Deal pipeline with drag-drop visualization
- Activity tracking and reminders
- CSV import

**Quote & Proposal** (2 weeks)
- Quote builder with pest control templates
- Service pricing calculator (property size, frequency, pest type)
- E-signature integration (DocuSign or native)
- Quote tracking and follow-up automation
- Professional PDF generation

**Scheduling & Dispatch** (2 weeks)
- Calendar-based appointment scheduling (week/day/technician views)
- Recurring service automation (monthly, quarterly, annual)
- Basic route optimization (geographic clustering, nearest-neighbor)
- Technician assignment (territory, skill, workload)
- Automated customer reminders (SMS/email: 48hr, 24hr, day-of)

**Service Management** (1.5 weeks)
- Digital service reports with photos and signatures
- Treatment protocol workflows (pest-specific checklists)
- Service history tracking
- Product usage logging (EPA compliance ready)
- Follow-up automation (bed bugs, termites)

**Mobile App (Technician)** (2 weeks)
- Progressive Web App (iOS/Android)
- Daily schedule view with navigation
- Offline functionality (IndexedDB, service workers)
- Service completion forms (inspection, treatment, photos, signature)
- Customer history access

**Reporting & Analytics** (1 week)
- Pre-built dashboards: Executive, Sales, Operations
- Key KPIs: MRR, pipeline value, conversion rate, utilization, satisfaction
- Revenue forecasting (recurring + pipeline weighted)
- Export to CSV/PDF

**User Management** (1 week)
- Role-based access control (7 predefined roles)
- Territory assignment
- Basic audit logging (7-year retention)
- User profiles and authentication

### Phase 1 Deliverables

**Week 12 (End of Phase 1)**:
- All 8 core features operational
- Performance targets met (<2s page load, <3s mobile, 99.9% uptime)
- Security audit passed (no critical vulnerabilities)
- User documentation complete
- 3 pilot customers onboarded (April's team + 2 beta customers)
- Data migration from spreadsheets successful

### Out of Scope (Deferred to Phase 2)

- Chemical inventory management
- EPA compliance reporting automation
- Customer self-service portal
- Commission tracking and payouts
- Advanced route optimization (traffic integration)
- Custom report builder
- Two-factor authentication (2FA)
- Advanced lead scoring (ML-based)

---

## Phase 2: Growth Features (Months 4-6)

**Timeline**: April 2025 - June 2025
**Primary Goal**: Differentiate from Salesforce with pest control-specific features

### Features

#### 2.1 Chemical Inventory Management (4 weeks)

**Business Value**: Regulatory compliance, cost control, operational efficiency

**Features**:
- Inventory tracking by warehouse and vehicle
- Product catalog with EPA registration numbers and MSDS
- Usage logging per service (auto-populate from service reports)
- Par level management with auto-reorder alerts
- Expiration monitoring and reorder triggers
- Lot/batch tracking for recalls
- Waste disposal documentation

**Technical Requirements**:
- Database schema: products, inventory_locations, inventory_transactions, usage_logs
- Barcode scanning (mobile camera)
- Integration with service reports (auto-deduct inventory on completion)
- Alerts: Low stock, expiring products, recall notices

**Success Metrics**:
- 100% product usage tracked (EPA compliance)
- Stockouts reduced by 50% (vs manual tracking)
- Inventory accuracy >95%

---

#### 2.2 EPA Compliance Reporting (3 weeks)

**Business Value**: Legal compliance, audit readiness, risk mitigation

**Features**:
- Automated compliance reports (federal and state-specific)
- Required data capture: Product name, EPA reg number, quantity, date, location, applicator
- Technician certification tracking and renewal alerts
- MSDS library (searchable, auto-linked to products)
- Audit trail with 7-year retention
- One-click report generation for inspections

**Reports**:
- Pesticide Application Records (PAR)
- Product usage by customer/location
- Technician application logs
- Restricted Use Pesticide (RUP) tracking

**Technical Requirements**:
- Compliance database schema (separate from operational DB for security)
- Immutable storage (append-only logs)
- Encrypted backups (7-year retention)
- State-specific templates (50 states + federal)

**Success Metrics**:
- 100% compliance with EPA/FIFRA requirements
- Zero audit failures
- Report generation time <30 seconds

---

#### 2.3 Customer Self-Service Portal (4 weeks)

**Business Value**: Reduce customer service workload, improve customer satisfaction, enable 24/7 self-service

**Features**:
- Customer login (email/password or magic link)
- View service history (reports, photos, invoices)
- View upcoming appointments
- Reschedule appointments (within constraints)
- Request service or callback
- Pay invoices online (Stripe integration)
- Update contact info and preferences
- Manage recurring service (pause, resume, update frequency)

**Technical Requirements**:
- Customer-facing React app (separate from internal app)
- Secure customer authentication (Auth0 or Cognito)
- API endpoints for customer actions
- Stripe payment integration
- Email notifications (password reset, appointment changes)

**Success Metrics**:
- Customer adoption >30% within 3 months
- Reschedule requests handled via portal: >50%
- Customer service call volume reduced by 25%

---

#### 2.4 Commission Tracking (3 weeks)

**Business Value**: Motivate sales team, automate payouts, transparency

**Features**:
- Commission plan configuration:
  - Tiered structures (volume-based rates)
  - Residual commissions for recurring revenue
  - Bonus accelerators for quota overachievement
  - Different rates for new vs renewal
  - Team vs individual splits
- Real-time commission dashboards for sales reps
- Monthly/quarterly payout projections
- Deal-level commission calculations
- Commission reports for finance team
- Export to payroll system

**Technical Requirements**:
- Commission rules engine (configurable in admin panel)
- Database schema: commission_plans, commission_transactions
- Integration with deals and invoices
- Automated calculations on deal close

**Success Metrics**:
- Sales rep satisfaction with transparency: >4.5/5
- Commission calculation accuracy: 100%
- Payout processing time reduced by 75% (vs manual)

---

#### 2.5 Territory Management (2 weeks)

**Business Value**: Optimize sales coverage, prevent conflicts, track regional performance

**Features**:
- Define territories by ZIP code, county, or account
- Assign sales reps and technicians to territories
- Territory-based lead assignment
- Overlap rules (allow/prevent multiple reps in same territory)
- Territory performance analytics:
  - Revenue by territory
  - Conversion rate by territory
  - Market penetration (customers / total addresses)
  - Growth trends YoY

**Visual Map**:
- Interactive map showing territory boundaries
- Color-coded by performance (revenue, growth)
- Click territory to drill down into details

**Technical Requirements**:
- GeoJSON territory definitions
- ZIP code to territory mapping table
- Map visualization library (Mapbox or Google Maps)

**Success Metrics**:
- Zero territory conflicts (lead assignment errors)
- Territory coverage: 100% of service area
- Revenue variance by territory <20%

---

#### 2.6 Advanced Route Optimization (3 weeks)

**Business Value**: Further reduce drive time (target 30-40% vs manual), improve on-time arrivals

**Enhancements over MVP**:
- Real-time traffic integration (Google Maps Traffic API)
- Historical traffic patterns (predict rush hour delays)
- Weather-based rescheduling (heavy rain delays outdoor service)
- Multi-technician optimization (balance workload across team)
- Dynamic re-routing (adjust for delays, cancellations, emergencies)
- Travelling Salesman Problem (TSP) solver (Google OR-Tools)

**Technical Requirements**:
- Google Maps Directions API (with traffic)
- OR-Tools library (Python or C++)
- Weather API (OpenWeatherMap)
- Microservice for route calculation (async job queue)

**Success Metrics**:
- Drive time reduction: 30-40% (vs manual planning)
- On-time arrival rate: >90% (within 30-min window)
- Fuel cost savings: $15,000+/year per 5 technicians

---

#### 2.7 Custom Report Builder (2 weeks)

**Business Value**: Empower users to create custom reports without developer assistance

**Features**:
- Drag-and-drop report builder
- Select data sources (customers, deals, appointments, invoices)
- Choose fields to include (columns)
- Apply filters (date range, status, territory)
- Group by and aggregate (sum, average, count)
- Sort and format
- Save and schedule reports (email daily/weekly/monthly)
- Share reports with team

**Technical Requirements**:
- Query builder interface (similar to Google Data Studio)
- Backend query generator (SQL safe, prevent injection)
- Report template storage (database)
- Scheduled job runner (cron)

**Success Metrics**:
- User-created reports: >20 per month
- Reduction in custom report requests to dev team: 75%

---

### Phase 2 Summary

**Total Duration**: 3 months (April - June 2025)
**Total Features**: 7 major features
**Team Size**: 6-8 developers (frontend, backend, mobile, QA)

**Key Milestones**:
- Month 4: Chemical inventory + EPA compliance live (regulatory requirement met)
- Month 5: Customer portal + commission tracking live (customer experience + sales motivation)
- Month 6: Territory management + advanced routing + custom reports live (operational efficiency)

**Success Criteria**:
- All Phase 2 features operational
- EPA compliance audit passed (third-party validation)
- Customer portal adoption >30%
- Advanced routing saves 30%+ drive time

---

## Phase 3: Enterprise Features (Months 7-12)

**Timeline**: July 2025 - December 2025
**Primary Goal**: AI-powered features, enterprise scalability, advanced integrations

### Features

#### 3.1 AI Churn Prediction (4 weeks)

**Business Value**: Reduce customer churn from 2% to 1.5% monthly (=$30k/year MRR saved for 100 customers)

**Features**:
- Machine learning model trained on historical churn data
- Input features:
  - Service frequency decline (missed appointments)
  - Payment delays (late invoices)
  - Low satisfaction scores (surveys)
  - Reduced engagement (no portal logins)
  - Competitor activity (lost deals to same competitor)
- Churn risk score (0-100) for each customer
- At-risk customer dashboard (sorted by risk score)
- Automated retention actions:
  - Send discount offer (10% off next service)
  - Assign account manager for high-value customers
  - Trigger check-in call
- Measure effectiveness (did intervention reduce churn?)

**Technical Requirements**:
- ML model: Logistic regression or random forest (Python scikit-learn)
- Training data: 12+ months of customer history
- Feature engineering pipeline
- Model retraining: Monthly (or on-demand)
- API endpoint for predictions

**Success Metrics**:
- Churn rate reduction: 2.0% → 1.5% monthly
- Model accuracy: >75% (true positive rate for at-risk customers)
- Retention intervention success rate: >40%

---

#### 3.2 AI-Powered Lead Scoring (3 weeks)

**Business Value**: Improve lead conversion from 25% to 35%+ (more accurate prioritization)

**Enhancements over MVP**:
- ML model trained on historical lead conversion data
- Replace rule-based scoring with predictive model
- Input features (50+ variables):
  - All demographic, engagement, and source data (from MVP)
  - Time-based patterns (best time to call, email open times)
  - Lookalike modeling (similar to past converters)
  - External data (property value, neighborhood demographics)
- Output: Conversion probability (0-100%)
- Recommended next action (call, email, wait)
- A/B test: ML scoring vs rule-based scoring

**Technical Requirements**:
- Same ML stack as churn prediction
- Real-time scoring API (latency <100ms)
- Model explainability (why this score? feature importance)

**Success Metrics**:
- Lead conversion rate: 25% → 35%
- Sales rep close rate: +20% (on high-scoring leads)
- ML model outperforms rule-based scoring by >10%

---

#### 3.3 Automated Billing & Payment Retry (4 weeks)

**Business Value**: Reduce Days Sales Outstanding (DSO) from 45 to 20 days, improve cash flow

**Features**:
- Auto-generate invoices on service completion
- Recurring billing for monthly/quarterly/annual contracts
- Payment retry logic (failed payment → retry in 3 days → retry in 7 days → escalate)
- Automated payment reminders (email/SMS)
- Dunning management (suspend service after 30 days overdue)
- Payment methods: Credit card (Stripe), ACH, check
- Customer payment portal (pay online, auto-pay setup)
- Reconciliation with accounting system (QuickBooks integration)

**Technical Requirements**:
- Stripe subscription management
- Billing engine (calculate amounts, apply discounts, handle proration)
- Payment webhook handlers (success, failure, dispute)
- Email/SMS notification templates
- Integration with QuickBooks API

**Success Metrics**:
- DSO reduction: 45 → 20 days
- Payment success rate: >95% (first attempt)
- Manual invoicing reduced by 90%

---

#### 3.4 Advanced Integrations (6 weeks)

**Business Value**: Unified data across business systems, eliminate double-entry

**Integrations**:

**QuickBooks Online** (2 weeks):
- Bi-directional sync: Customers, invoices, payments
- Auto-create invoices in QuickBooks on service completion
- Sync payments back to CRM
- Chart of accounts mapping

**Mailchimp** (1 week):
- Sync customer email lists
- Trigger campaigns based on CRM events (new customer, service completed)
- Track email engagement in CRM

**Google Calendar** (1 week):
- Sync appointments to Google Calendar (for technicians and dispatchers)
- Two-way sync (changes in Google Calendar update CRM)

**Zapier** (1 week):
- Pre-built Zapier integrations for 1000+ apps
- Common zaps: Slack notifications, Google Sheets export, Trello task creation

**Webhooks** (1 week):
- Generic webhook support for custom integrations
- Event types: Deal won, service completed, payment received, customer churned
- Webhook configuration UI (URL, secret, events)

**Technical Requirements**:
- OAuth 2.0 authentication for third-party apps
- Webhook delivery with retry logic
- Rate limiting and error handling
- Integration monitoring dashboard

**Success Metrics**:
- QuickBooks sync accuracy: 100%
- Mailchimp campaign engagement: +30% (vs manual campaigns)
- Integration uptime: >99.5%

---

#### 3.5 Multi-Location Management (4 weeks)

**Business Value**: Support franchise and multi-branch businesses (TAM expansion)

**Features**:
- Hierarchical organization structure:
  - Corporate → Region → Branch → Technicians
- Location-specific settings:
  - Branding (logo, colors)
  - Pricing (regional pricing)
  - Service area (ZIP codes)
  - Inventory (per-location stock)
- Cross-location reporting (roll-up metrics to corporate)
- Location-based permissions (manager sees only their branch)
- Inter-location transfers (move inventory, reassign customers)

**Technical Requirements**:
- Multi-tenancy database architecture (shared schema, row-level security)
- Location hierarchy table
- Data scoping (all queries filter by location)
- Corporate admin dashboard (view all locations)

**Success Metrics**:
- Support 10+ location customers
- Cross-location reporting accuracy: 100%
- Performance: <3s load time with 50 locations

---

#### 3.6 Predictive Inventory Forecasting (3 weeks)

**Business Value**: Reduce stockouts by 80%, minimize excess inventory

**Features**:
- ML model predicts product usage by week/month
- Input features:
  - Historical usage patterns (seasonal trends)
  - Upcoming appointments (scheduled services)
  - Pest type trends (ant season, termite season)
  - Weather forecasts (rain = more indoor pests)
- Recommend reorder quantities and timing
- Auto-generate purchase orders
- Integrate with supplier ordering systems (email PO or API)

**Technical Requirements**:
- Time-series forecasting model (ARIMA or LSTM)
- Inventory forecasting engine
- Integration with inventory management (Phase 2)

**Success Metrics**:
- Stockouts reduced by 80%
- Excess inventory reduced by 50%
- Forecast accuracy: >85%

---

### Phase 3 Summary

**Total Duration**: 6 months (July - December 2025)
**Total Features**: 6 major features
**Team Size**: 8-10 developers + 1-2 data scientists

**Key Milestones**:
- Month 9: AI churn prediction + lead scoring live (AI differentiation)
- Month 10: Automated billing + QuickBooks integration live (revenue operations automated)
- Month 12: Multi-location + predictive inventory live (enterprise-ready)

**Success Criteria**:
- Churn rate <1.5% monthly
- Lead conversion rate >35%
- DSO <20 days
- 10+ enterprise customers (50-500 employees)

---

## Phase 4: Vision (Year 2+)

**Timeline**: January 2026 - December 2026+
**Primary Goal**: Innovation, market leadership, international expansion

### Features (Prioritized)

#### 4.1 Native Mobile Apps (React Native) (8 weeks)

**Why Now**: PWA is functional, but native apps offer:
- Faster performance (native rendering)
- Better offline experience
- Push notifications (more reliable)
- App Store presence (discoverability)
- Advanced features (biometric auth, background GPS)

**Features**:
- iOS and Android apps (shared codebase)
- All PWA functionality + native enhancements
- App Store optimization (ASO) for discovery

---

#### 4.2 Voice-to-Text Service Notes (4 weeks)

**Business Value**: Save technicians 5 minutes per service (dictate notes instead of typing)

**Features**:
- Voice recording during service
- AI transcription (Google Speech-to-Text or Whisper)
- Auto-populate service notes
- Edit transcription before submitting

---

#### 4.3 Augmented Reality (AR) Service Documentation (12 weeks)

**Business Value**: Improve service quality, customer trust (visual proof)

**Features**:
- AR markup on photos (circle pest evidence, mark treatment areas)
- 3D property mapping (LiDAR scan of property)
- Before/after AR overlays (show treatment effectiveness)
- Customer view in portal (interactive 3D tour)

**Technical Requirements**:
- ARKit (iOS) / ARCore (Android)
- 3D modeling and rendering
- Cloud storage for 3D models

---

#### 4.4 IoT Device Integration (16 weeks)

**Business Value**: Proactive pest monitoring, upsell opportunity

**Features**:
- Smart pest traps (sensors detect pest activity)
- Real-time alerts (trap triggered → notify technician)
- Auto-schedule service (trap activity → create appointment)
- Dashboard: IoT device status, battery levels
- Integration with major IoT platforms (AWS IoT, Google Cloud IoT)

**Devices**:
- Smart rodent traps
- Termite detection sensors
- Environmental monitors (temperature, humidity)

---

#### 4.5 Franchise Management Platform (20 weeks)

**Business Value**: Enable franchise model, recurring royalty revenue

**Features**:
- Franchise onboarding (territory assignment, branding)
- Royalty tracking and payments
- Corporate compliance monitoring
- Franchise performance benchmarking
- Lead distribution (corporate sends leads to franchisees)
- White-label customer portal (franchise branding)

---

#### 4.6 International Expansion (24 weeks)

**Business Value**: TAM expansion (global pest control market = $20B)

**Features**:
- Multi-language support (Spanish, French, Mandarin, etc.)
- Multi-currency (USD, EUR, GBP, etc.)
- Localized compliance (GDPR, country-specific regulations)
- Regional pricing and service catalogs
- International payment gateways (Stripe International, PayPal)

**Target Markets**:
- Phase 4a: Canada, UK, Australia (English-speaking, similar regulations)
- Phase 4b: Europe (GDPR compliance, multi-language)
- Phase 4c: Latin America, Asia (localization heavy)

---

### Phase 4 Summary

**Total Duration**: 12+ months (Year 2 and beyond)
**Total Features**: 6+ transformational features
**Team Size**: 15-20 developers + data scientists

**Success Metrics**:
- 1000+ customers
- $250k+ MRR
- Market leader in pest control CRM (>30% market share in US)
- International expansion: 3+ countries

---

## Feature Dependencies

### Dependency Map

**Foundation** (Phase 1 - Required for all):
- Database architecture (PostgreSQL, TimescaleDB)
- Authentication system (Auth0/Cognito)
- API infrastructure (REST, GraphQL)
- Frontend framework (React, Redux)
- Mobile PWA (service workers, IndexedDB)

**Phase 2 Dependencies**:
- **Chemical Inventory** depends on: Service management (Phase 1)
- **EPA Compliance** depends on: Chemical inventory, Service management
- **Customer Portal** depends on: Authentication, Scheduling, Invoicing (Phase 3)
- **Commission Tracking** depends on: Deal pipeline (Phase 1)
- **Territory Management** depends on: User management, Lead assignment (Phase 1)
- **Advanced Routing** depends on: Basic routing (Phase 1), Chemical inventory (know product availability)

**Phase 3 Dependencies**:
- **AI Churn Prediction** depends on: 12+ months of customer data (wait until Phase 2 complete)
- **AI Lead Scoring** depends on: 6+ months of lead conversion data (Phase 1 data)
- **Automated Billing** depends on: Service management, Customer portal (Phase 2)
- **QuickBooks Integration** depends on: Automated billing
- **Multi-Location** depends on: All core features (Phase 1-2)
- **Predictive Inventory** depends on: Chemical inventory (Phase 2), 12+ months usage data

**Phase 4 Dependencies**:
- **Native Mobile Apps** depends on: PWA feature parity (Phase 1)
- **Voice-to-Text** depends on: Mobile app (native speech APIs)
- **AR Documentation** depends on: Native mobile apps (ARKit/ARCore)
- **IoT Integration** depends on: Scheduling automation (Phase 1-2)
- **Franchise Platform** depends on: Multi-location (Phase 3)
- **International** depends on: All features (Phase 1-3 complete)

---

## Strategic Rationale

### Why This Phasing?

**Phase 1 (MVP)**: Foundation First
- Must have operational system before adding advanced features
- Validate core workflows with real users (April's team)
- Establish product-market fit before scaling
- Learn from early customers to inform Phase 2 priorities

**Phase 2 (Growth)**: Differentiation
- Chemical inventory and EPA compliance are **table-stakes** for pest control (legal requirement)
- Customer portal and commission tracking improve user experience (reduce churn, motivate sales)
- These features differentiate from generic CRMs (Salesforce requires expensive customization)
- Build these before AI (simpler, higher ROI in short-term)

**Phase 3 (Enterprise)**: Intelligence
- AI features require data (need 6-12 months of Phase 1-2 usage)
- Billing automation enables scaling (can't manually invoice 100+ customers)
- Integrations reduce friction (customers demand QuickBooks sync)
- Multi-location unlocks enterprise deals (franchises need this)

**Phase 4 (Vision)**: Innovation
- Native apps are nice-to-have (PWA works, but native is better UX)
- AR and IoT are differentiators, but not essential (early adopter features)
- Franchise and international are growth plays (expand TAM after US market proven)

### Alternative Phasing Considered

**Option A: Build AI in Phase 2**
- Pros: Differentiation earlier, marketing appeal
- Cons: Insufficient data to train models, delayed core features (inventory, compliance)
- **Decision: Rejected** - Need operational data first

**Option B: Build Native Apps in Phase 2**
- Pros: Better mobile UX sooner
- Cons: Delays pest control-specific features (inventory, compliance)
- **Decision: Rejected** - PWA is sufficient for MVP/Phase 2, native apps can wait

**Option C: Delay Customer Portal to Phase 3**
- Pros: Focus on internal tools first
- Cons: Poor customer experience, high customer service costs
- **Decision: Rejected** - Portal is critical for scaling (can't manually handle 50+ customer calls/day)

### Pivot Points (Where We Might Change Course)

**After Phase 1**:
- If customers strongly request native apps → Move to Phase 2
- If EPA compliance audit is urgent → Move to Phase 2 (already planned)
- If no demand for custom reports → Defer to Phase 3

**After Phase 2**:
- If churn is low (<1% monthly) → Defer AI churn prediction to Phase 4
- If QuickBooks integration is critical → Move to Phase 2
- If franchise customers emerge → Accelerate multi-location to Phase 2

**After Phase 3**:
- If international demand is high → Accelerate internationalization
- If IoT technology is mature → Pilot IoT integration in Phase 3

---

## Summary

This roadmap balances **speed to market** (3-month MVP) with **long-term vision** (24+ months to market leadership).

**Key Principles**:
1. Foundation first (Phase 1 = operational CRM)
2. Differentiation second (Phase 2 = pest control-specific features)
3. Intelligence third (Phase 3 = AI/ML, automation)
4. Innovation fourth (Phase 4 = AR, IoT, international)

**Success Metrics**:
- Phase 1: 10 customers, $2.5k MRR
- Phase 2: 50 customers, $12.5k MRR
- Phase 3: 200 customers, $50k MRR
- Phase 4: 1000 customers, $250k MRR

**Next Steps**:
1. Finalize Phase 1 scope with CEO (confirm must-haves)
2. Begin Phase 1 development (Month 1)
3. Review Phase 2 priorities mid-Phase 1 (based on customer feedback)
4. Continuously re-prioritize based on market feedback

---

**Document Status**: Draft for Review
**Approval**:
- [ ] CEO/Co-Founder (Strategic alignment)
- [ ] Product Manager (Feature prioritization)
- [ ] Technical Lead (Technical feasibility)
- [ ] Software Architect (Architectural dependencies)
