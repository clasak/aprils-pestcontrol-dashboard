# CompassIQ Pilot Contract Template
## Statement of Work (SOW) for Pilot Customers

**Version**: 1.0.0  
**Last Updated**: December 23, 2025  
**Purpose**: Template for first 3-5 pilot customer engagements

---

## Contract Structure

### Implementation Fee: $5,000 - $10,000 (One-Time)
**Covers**:
- Custom setup (configure pipeline stages, import data)
- Data migration (CSV import from existing system)
- User training (2-hour onboarding session)
- 3 months of priority support
- Weekly check-in calls (30 minutes)

### Monthly Platform Fee: $100/user/month
**Covers**:
- Hosting and infrastructure
- Software maintenance and updates
- Standard support (email response within 24 hours)
- Iteration capacity (bug fixes, minor feature requests)

### Minimum Commitment: 3 months
**Terms**:
- Pilot period: 3 months
- Cancel anytime after pilot period (30-day notice)
- Refund policy: Full refund if not satisfied within first 30 days

---

## Scope Definition

### In-Scope (Included in Implementation Fee)

**Core CRM**:
- ✅ Accounts, Contacts, Leads, Opportunities
- ✅ Activities (Calls, Emails, Meetings, Tasks)
- ✅ Notes and Attachments
- ✅ Lead conversion workflow
- ✅ Opportunity pipeline management
- ✅ User management (Admin, Manager, AE roles)

**Operating Layer**:
- ✅ Rep Dashboard (personal pipeline, next steps, activity targets)
- ✅ Manager Dashboard (team pipeline, coverage ratio, aging report)
- ✅ Exec Dashboard (booked vs target, top deals, win rate)
- ✅ 5 Core Alerts:
  1. Opportunity has no next step
  2. Opportunity has no activity in 7 days
  3. Late-stage opportunity stalled (3 days)
  4. Pipeline coverage below 3x (weekly)
  5. Large deal at risk (>$50k, 3 days no activity)
- ✅ Weekly forecast page (commit/best_case/pipeline)

**Implementation Services**:
- ✅ Data import from CSV (Accounts, Contacts, Leads, Opportunities)
- ✅ Pipeline stage configuration (customize stages if needed)
- ✅ User account setup (create users, assign roles)
- ✅ 2-hour training session (live demo + Q&A)
- ✅ 3 months of weekly check-in calls (30 minutes)

**Scope Caps** (Written in SOW):
- **User Limit**: 3-10 users (1 manager + 2-9 AEs)
- **Pipeline Limit**: 1 sales pipeline (not multiple product lines)
- **Dashboard Limit**: 3 dashboards (Rep, Manager, Exec)
- **Alert Limit**: 5 alert types (as listed above)
- **Data Volume**: Up to 10,000 records per entity (Accounts, Contacts, Leads, Opportunities)

### Out-of-Scope (Not Included)

**Phase 2+ Features** (Available in future, additional cost):
- ❌ Email sync (Gmail, Outlook)
- ❌ Calendar sync
- ❌ Quote/proposal builder (PDF generation)
- ❌ Commission tracking
- ❌ Territory management
- ❌ Custom report builder
- ❌ Advanced integrations (HubSpot, Salesforce, QuickBooks)
- ❌ Mobile app (native iOS/Android)
- ❌ Custom fields (more than 5 per entity)
- ❌ Workflow automation (custom triggers/actions)

**Services Not Included**:
- ❌ Data cleanup (duplicate removal, data normalization)
- ❌ Custom development (beyond scope defined above)
- ❌ Integration with other systems (beyond CSV import)
- ❌ On-site training (remote training only)
- ❌ 24/7 support (standard business hours only: M-F, 9am-5pm ET)

---

## Pilot Success Criteria

### Objective Metrics (Tracked Weekly)

**Pipeline Hygiene**:
- [ ] 100% of opportunities have next step and next step date
- [ ] 100% of opportunities have expected close date
- [ ] 100% of opportunities have stage appropriate for their status
- [ ] <5% of opportunities stalled (no activity in 7+ days)

**Forecast Discipline**:
- [ ] Weekly forecast submitted by 100% of reps every Monday
- [ ] Forecast snapshot created every Monday (automated)
- [ ] Forecast accuracy >70% within 20% (after 4 weeks)

**User Adoption**:
- [ ] >90% of users log in daily (5 days per week)
- [ ] >50 activities logged per user per week (calls, emails, meetings)
- [ ] >80% of new leads created in CompassIQ (not spreadsheet)
- [ ] >80% of new opportunities created in CompassIQ

**Manager Execution**:
- [ ] Manager runs pipeline review inside CompassIQ (not spreadsheet)
- [ ] Manager runs Monday forecast meeting inside CompassIQ
- [ ] Manager can answer "where is this deal?" in <30 seconds

### Subjective Metrics (Measured via Survey)

**User Satisfaction** (Weekly survey, 1-5 scale):
- [ ] Ease of use: >4/5
- [ ] Performance (speed): >4/5
- [ ] Feature completeness: >4/5
- [ ] Support responsiveness: >4.5/5
- [ ] Overall satisfaction: >4.5/5

**Business Impact** (End of pilot survey):
- [ ] Time spent on pipeline management reduced by >50%
- [ ] Time to find deal information reduced by >80%
- [ ] Confidence in forecast accuracy improved (subjective)
- [ ] Would recommend to peer: Yes

---

## Implementation Timeline

### Week 1: Onboarding

**Day 1-2: Data Migration**:
- Customer provides CSV exports (Accounts, Contacts, Leads, Opportunities)
- CompassIQ team reviews data (validate columns, identify issues)
- Customer provides clarifications if needed

**Day 3: Data Import**:
- CompassIQ team imports data
- Validate import (check counts, relationships, data quality)
- Customer reviews imported data (spot check 10-20 records)
- Fix any import issues

**Day 4: Configuration**:
- Configure pipeline stages (use default or customize)
- Create user accounts (assign roles: Admin, Manager, AE)
- Set quotas for AEs
- Configure alert thresholds (stale days, coverage target)

**Day 5: Training**:
- 2-hour live training session (via Zoom)
  - System overview (15 min)
  - Lead management (15 min)
  - Opportunity pipeline (20 min)
  - Activity logging (10 min)
  - Dashboards (20 min)
  - Alerts and forecast (20 min)
  - Q&A (20 min)
- Share training recording
- Share user guide (PDF)

**Acceptance**: All users can log in, see their data, create a lead, log an activity.

---

### Week 2-4: Active Use + Observation

**Customer Responsibilities**:
- Use CompassIQ for all sales activities (leads, opps, activities)
- Submit weekly forecast every Monday
- Respond to alerts (acknowledge or dismiss)
- Provide feedback on weekly call

**CompassIQ Responsibilities**:
- Monitor usage (logins, activities logged, forecast submissions)
- Monitor system health (errors, performance, uptime)
- Weekly check-in call (30 min):
  - Review usage metrics
  - Discuss issues/blockers
  - Collect feature requests
  - Prioritize bug fixes
- Fix critical bugs within 24 hours
- Fix high-priority bugs within 1 week

**Acceptance**: Users are actively using the system. Manager can run pipeline review in CompassIQ.

---

### Week 5-8: Iteration + Feedback

**Customer Responsibilities**:
- Continue using CompassIQ
- Document pain points (what's hard, what's confusing)
- Suggest improvements
- Participate in weekly calls

**CompassIQ Responsibilities**:
- Implement 1-2 requested features (if Tier 1 or Tier 2 priority)
- Improve performance/UX based on feedback
- Add sample reports if requested
- Weekly check-in call (30 min)

**Acceptance**: Major pain points addressed. Users are comfortable with system.

---

### Week 9-12: Expansion + Referrals

**Customer Responsibilities**:
- Consider expanding to more users (AEs)
- Provide referrals (if satisfied)
- Write testimonial or case study (if willing)
- Decide on continuing post-pilot

**CompassIQ Responsibilities**:
- Prepare case study (if customer agrees)
- Offer expansion pricing (discount for pilot customers)
- Offer referral incentive (1 month free per referral)
- Final pilot review meeting (60 min):
  - Review success criteria (objective + subjective)
  - Discuss future roadmap
  - Discuss pricing for post-pilot
  - Collect final feedback

**Acceptance**: Customer is satisfied (>4.5/5 overall). Customer continues or provides referral.

---

## Support Terms

### Response Time SLA

| Severity | Definition | Response Time | Resolution Target |
|----------|------------|---------------|-------------------|
| **P0: Critical** | System down, data loss, security breach | 2 hours | 24 hours |
| **P1: High** | Major feature broken, blocking work | 4 hours | 3 business days |
| **P2: Medium** | Minor feature broken, workaround exists | 24 hours | 1 week |
| **P3: Low** | Cosmetic issue, feature request | 48 hours | Best effort |

### Support Channels

**Primary**: Email (support@compassiq.com)
- Available: M-F, 9am-5pm ET
- After-hours: P0 only (emergency contact provided)

**Secondary**: Weekly check-in call (30 min)
- Scheduled: Every Monday, 10am ET (or agreed time)
- Agenda: Usage review, Q&A, feedback, issue triage

**Emergency**: Phone (provided separately for P0 issues)
- Available: 24/7 for P0 issues only

### What's Included in Support

✅ **Included**:
- Bug fixes (all severities)
- Performance optimization (if <500ms API or <2s page load)
- Security patches
- User training (up to 2 additional 1-hour sessions)
- Configuration changes (pipeline stages, alert thresholds)
- Minor feature requests (if <4 hours of work and Tier 1/2 priority)

❌ **Not Included** (Additional Cost):
- Custom development (new features not in scope)
- Data cleanup or migration from other systems
- Integration with other systems (API, webhook setup)
- On-site visits
- After-hours support (except P0)

---

## Pricing Examples

### Example 1: Small Team
- **Users**: 3 (1 Manager + 2 AEs)
- **Implementation Fee**: $5,000
- **Monthly Fee**: $300/month ($100 x 3 users)
- **3-Month Pilot Total**: $5,900 ($5,000 + $300 x 3)

### Example 2: Mid-Size Team
- **Users**: 10 (1 Manager + 9 AEs)
- **Implementation Fee**: $8,000 (more data, more training)
- **Monthly Fee**: $1,000/month ($100 x 10 users)
- **3-Month Pilot Total**: $11,000 ($8,000 + $1,000 x 3)

### Example 3: Custom Scope
- **Users**: 5 (1 Manager + 4 AEs)
- **Custom Feature**: Quote builder (PDF generation) - $5,000
- **Implementation Fee**: $6,000
- **Monthly Fee**: $500/month ($100 x 5 users)
- **3-Month Pilot Total**: $12,500 ($6,000 + $5,000 + $500 x 3)

---

## Payment Terms

### Implementation Fee
- **Due**: 50% on contract signature, 50% on completion of Week 1 (onboarding)
- **Payment Method**: ACH, wire transfer, or check
- **Invoice**: Sent on contract signature

### Monthly Platform Fee
- **Due**: 1st of each month (beginning Month 1 of pilot)
- **Payment Method**: ACH, credit card (Stripe), or check
- **Invoice**: Auto-generated on 1st of month

### Refund Policy
- **First 30 Days**: Full refund of implementation fee if not satisfied (monthly fees non-refundable)
- **After 30 Days**: No refund (but can cancel with 30-day notice)

---

## Legal Terms (Summary)

### Data Ownership
- **Customer Data**: Customer owns all data (accounts, contacts, leads, opportunities, activities, notes, attachments)
- **Export Rights**: Customer can export all data at any time (CSV or JSON)
- **Data Deletion**: Customer can request data deletion upon contract termination (within 30 days)

### Intellectual Property
- **Software**: CompassIQ retains all rights to the software
- **Customer Data**: Customer retains all rights to their data
- **Feedback**: Customer grants CompassIQ non-exclusive right to use feedback for product improvement

### Confidentiality
- **Mutual NDA**: Both parties agree to keep confidential information private
- **Customer Data**: CompassIQ will not share customer data with third parties (except as required by law or for hosting/support)

### Liability
- **Limitation**: CompassIQ liability limited to fees paid in previous 12 months
- **Exclusions**: No liability for indirect, incidental, or consequential damages
- **Data Loss**: CompassIQ maintains daily backups but recommends customer also exports data regularly

### Termination
- **By Customer**: 30-day written notice after 3-month pilot
- **By CompassIQ**: 30-day written notice (with full refund of prepaid fees)
- **For Cause**: Either party can terminate immediately for material breach (with 15-day cure period)

### Governing Law
- **Jurisdiction**: [State where CompassIQ is incorporated]
- **Dispute Resolution**: Mediation first, then arbitration (not litigation)

---

## Appendix A: Success Metrics Tracking

### Weekly Scorecard (Shared with Customer)

| Metric | Target | Week 1 | Week 2 | Week 3 | Week 4 | Week 8 | Week 12 |
|--------|--------|--------|--------|--------|--------|--------|---------|
| **Daily Active Users** | >90% | | | | | | |
| **Activities/User/Week** | >50 | | | | | | |
| **Opps w/ Next Step** | 100% | | | | | | |
| **Stalled Deals** | <5% | | | | | | |
| **Forecast Submitted** | 100% | | | | | | |
| **User Satisfaction** | >4.5/5 | | | | | | |

### End-of-Pilot Review Template

**Objective Metrics**:
- [ ] Pipeline hygiene: ___% opps with next step (target: 100%)
- [ ] Forecast discipline: ___% reps submit weekly (target: 100%)
- [ ] User adoption: ___% daily active users (target: >90%)
- [ ] Manager execution: Can run meetings in CompassIQ? (Yes/No)

**Subjective Feedback**:
- What's working well? _______________
- What needs improvement? _______________
- What features are you missing? _______________
- Would you recommend CompassIQ to a peer? (Yes/No/Maybe)

**Business Decision**:
- [ ] Continue with CompassIQ (move to standard contract)
- [ ] Expand to more users (how many? ___)
- [ ] Need more time (extend pilot by ___ weeks)
- [ ] Not a fit (feedback: _______________)

---

## Appendix B: Customer Responsibilities Checklist

**Before Contract Signature**:
- [ ] Review and approve scope (in-scope vs out-of-scope)
- [ ] Identify 1-2 internal champions (manager + 1 AE)
- [ ] Confirm user count (how many Admin, Manager, AE)
- [ ] Confirm implementation budget ($5-10k)

**Week 1 (Onboarding)**:
- [ ] Export data from existing system (CSV: accounts, contacts, leads, opportunities)
- [ ] Provide data dictionaries (column definitions, data types)
- [ ] Review imported data (spot check 10-20 records)
- [ ] Attend 2-hour training session (all users)
- [ ] Designate internal "super user" (point of contact)

**Week 2-12 (Pilot)**:
- [ ] Use CompassIQ daily (all sales activities)
- [ ] Submit weekly forecast every Monday
- [ ] Respond to alerts (acknowledge or dismiss)
- [ ] Attend weekly check-in call (30 min)
- [ ] Provide feedback (what's working, what's not)
- [ ] Test new features (when released)

**End of Pilot**:
- [ ] Complete end-of-pilot survey
- [ ] Participate in final review meeting (60 min)
- [ ] Decide on continuation (Yes/No)
- [ ] Provide referrals (if satisfied)
- [ ] Write testimonial (if willing)

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-12-23 | System | Initial pilot contract template |

---

**Usage Notes**:
1. Customize this template for each pilot customer (adjust scope, pricing, timeline)
2. Have customer review and approve before contract signature
3. Use this as appendix to standard MSA (Master Service Agreement)
4. Track success metrics weekly (share with customer)
5. Conduct end-of-pilot review (use Appendix A template)

**Next Steps After Phase 0 Complete**:
1. Finalize pricing model (review market rates)
2. Draft standard MSA (work with legal)
3. Create customer-facing proposal template (sales deck)
4. Identify 3-5 pilot customer prospects
5. Begin outreach (pilot customer recruitment)

