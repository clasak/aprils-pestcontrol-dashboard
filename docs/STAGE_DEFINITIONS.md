# CompassIQ Stage Definitions
## Opportunity Pipeline Stages & Required Fields

**Version**: 2.0.0  
**Status**: Phase 0 - Product Spec  
**Last Updated**: December 23, 2025  

---

## Overview

The opportunity pipeline has **7 stages**: 5 open stages, 1 won, 1 lost.

Each stage has:
- **Default probability** (auto-set when entering stage)
- **Required fields** (must be filled to progress)
- **Exit criteria** (when to move to next stage)
- **Automatic actions** (triggered on stage entry)

---

## Stage 1: Lead

**Purpose**: Initial qualification. Determine if this is a real opportunity.

| Attribute | Value |
|-----------|-------|
| **Code** | `lead` |
| **Probability** | 10% |
| **Order** | 1 |
| **Typical Duration** | 3-7 days |

### Required Fields
- ✅ `name` - Opportunity name
- ✅ `contact_id` - Primary contact
- ✅ `amount` - Estimated deal value
- ✅ `owner_id` - Account Executive assigned

### Optional (Recommended) Fields
- `expected_close_date` - Target close date
- `description` - What they need, pain points
- `next_step` - Next action (call, demo, etc.)
- `next_step_date` - When next step will happen

### Entry Actions
- Set `probability = 10`
- Set `stage_entered_at = NOW()`
- Create activity: "New opportunity created"
- Send notification to owner

### Exit Criteria (Move to "Qualified")
- Contact confirmed interest
- Budget range confirmed
- Decision timeline identified
- Decision maker identified

### Validation on Exit
- ❌ Cannot skip to "Quote Sent" without going through "Qualified"
- ❌ Cannot mark won/lost directly from this stage (use "Closed Lost" for disqualifications)

---

## Stage 2: Qualified

**Purpose**: Opportunity is qualified. Budget, authority, need, timeline confirmed (BANT).

| Attribute | Value |
|-----------|-------|
| **Code** | `qualified` |
| **Probability** | 25% |
| **Order** | 2 |
| **Typical Duration** | 7-14 days |

### Required Fields (Added to previous)
- ✅ `next_step` - Must have a clear next action
- ✅ `next_step_date` - Must be future-dated
- ✅ `expected_close_date` - Must be set

### Qualifying Questions (Not DB fields, but must be answered)
- **Budget**: Does the prospect have budget allocated? (Yes/Needs approval)
- **Authority**: Have we spoken to the decision maker? (Yes/No/In process)
- **Need**: Do they have a clear pain point we solve? (Yes/Somewhat/No)
- **Timeline**: When do they need this implemented? (< 30 days / 30-90 days / > 90 days)

Store answers in `custom_fields` JSONB:
```json
{
  "bant_budget": "yes",
  "bant_authority": "yes",
  "bant_need": "yes",
  "bant_timeline": "30-90 days"
}
```

### Entry Actions
- Set `probability = 25`
- Set `stage_entered_at = NOW()`
- Create task: "Schedule discovery call" (due in 3 days)
- Send notification to manager

### Exit Criteria (Move to "Quote Sent")
- Discovery call completed
- Requirements documented
- Pricing discussed
- Proposal/quote sent to prospect

### Validation on Exit
- ✅ `next_step` must be filled
- ✅ `next_step_date` must be >= TODAY
- ✅ `expected_close_date` must be >= TODAY

---

## Stage 3: Quote Sent

**Purpose**: Formal proposal/quote delivered. Waiting for review/feedback.

| Attribute | Value |
|-----------|-------|
| **Code** | `quote_sent` |
| **Probability** | 50% |
| **Order** | 3 |
| **Typical Duration** | 7-14 days |

### Required Fields (Added to previous)
- ✅ Must have a linked quote record (future: `quotes` table)
- ✅ `next_step` - e.g., "Follow up on quote" or "Proposal presentation"
- ✅ `next_step_date` - When to follow up

### Recommended Actions
- Log activity: "Quote sent via email"
- Set follow-up task: "Check if they received quote" (due in 2 days)
- Set follow-up task: "Proposal review meeting" (due in 7 days)

### Entry Actions
- Set `probability = 50`
- Set `stage_entered_at = NOW()`
- Send notification to manager (high-value deals >$50k)
- Add to weekly forecast (category: `best_case`)

### Exit Criteria (Move to "Negotiation")
- Prospect reviewed quote
- Prospect has questions/objections
- Price negotiation started
- Terms under discussion

### Exit Criteria (Move to "Closed Lost")
- Prospect went with competitor
- Prospect decided not to buy
- No response after 3+ follow-ups (30 days)

### Validation on Exit
- ⚠️ Alert if no activity in 7 days (stalled deal)
- ⚠️ Alert if no next step set

---

## Stage 4: Negotiation

**Purpose**: Terms, pricing, or implementation details under discussion.

| Attribute | Value |
|-----------|-------|
| **Code** | `negotiation` |
| **Probability** | 75% |
| **Order** | 4 |
| **Typical Duration** | 7-21 days |

### Required Fields (Added to previous)
- ✅ `next_step` - Must be specific action (e.g., "Send revised quote" or "Legal review")
- ✅ `next_step_date` - Must be within 7 days (negotiations shouldn't drag)

### Recommended Fields
- `competitor` - Who are we competing against? (if applicable)
- `close_reason` - What will make them say yes?

### Common Next Steps
- "Send revised pricing"
- "Schedule call with decision maker"
- "Send contract for legal review"
- "Arrange product demo for stakeholders"
- "Provide references/case studies"

### Entry Actions
- Set `probability = 75`
- Set `stage_entered_at = NOW()`
- Alert manager (deal at risk if no activity in 3 days)
- Add to weekly forecast (category: `best_case` or `commit` based on confidence)

### Exit Criteria (Move to "Verbal Commitment")
- Prospect verbally agreed to terms
- Waiting for contract signature
- Legal review in progress
- PO number requested

### Exit Criteria (Move to "Closed Lost")
- Lost to competitor
- Prospect went with in-house solution
- Budget cut/project cancelled

### Validation on Exit
- ⚠️ **Critical Alert** if no activity in 3 days (high-priority deals)
- ⚠️ Alert if in this stage for >21 days (likely stalled)

---

## Stage 5: Verbal Commitment

**Purpose**: Customer verbally agreed. Waiting for signature or final approval.

| Attribute | Value |
|-----------|-------|
| **Code** | `verbal_commitment` |
| **Probability** | 90% |
| **Order** | 5 |
| **Typical Duration** | 3-7 days |

### Required Fields (Added to previous)
- ✅ `next_step` - Must be "Contract signature" or "Waiting for PO"
- ✅ `next_step_date` - Expected signature date
- ✅ `expected_close_date` - Must match next_step_date

### Common Blockers (Document in `notes`)
- Legal review taking longer than expected
- Waiting for executive signature
- Procurement process delays
- Budget reallocation approval needed

### Entry Actions
- Set `probability = 90`
- Set `stage_entered_at = NOW()`
- Alert manager (celebrate!)
- Add to weekly forecast (category: `commit`)
- Send congratulations message to rep

### Exit Criteria (Move to "Closed Won")
- Contract signed
- PO received
- Payment received (if required)
- Implementation kickoff scheduled

### Exit Criteria (Move to "Closed Lost")
- Deal fell through at last minute
- Competitor swooped in
- Executive vetoed decision

### Validation on Exit
- ⚠️ **Critical Alert** if in this stage for >7 days (something's wrong)
- ⚠️ Alert if no activity in 2 days

---

## Stage 6: Closed Won

**Purpose**: Deal successfully closed. Customer signed and committed.

| Attribute | Value |
|-----------|-------|
| **Code** | `closed_won` |
| **Probability** | 100% |
| **Order** | 6 |
| **Status** | `won` |

### Required Fields (Added to previous)
- ✅ `actual_close_date` - Date contract was signed
- ✅ `close_reason` - Why did we win? (for learning)
- ✅ `amount` - Final deal value (update if changed from original)
- ✅ `status = 'won'`

### Close Reasons (Recommended)
- "Best value proposition"
- "Superior features/functionality"
- "Existing relationship"
- "Faster implementation"
- "Better support/service"
- "Pricing"
- "Referral/recommendation"
- "Other" (specify in notes)

### Entry Actions
- Set `probability = 100`
- Set `status = 'won'`
- Set `actual_close_date = TODAY` (if not set)
- Create activity: "Deal closed - won!"
- Send notification to manager + exec
- Trigger celebration message/animation 🎉
- Update forecast snapshot (mark as closed)
- Add to monthly revenue report
- Calculate commission (if applicable)

### Subsequent Steps (Post-Close)
- Create onboarding task
- Assign account manager
- Schedule kickoff call
- Set up recurring revenue tracking

### Validation
- ✅ Cannot change stage after marked "Closed Won" (must reopen)
- ✅ `actual_close_date` cannot be in future

---

## Stage 7: Closed Lost

**Purpose**: Deal lost. Competitor won, no decision, or disqualified.

| Attribute | Value |
|-----------|-------|
| **Code** | `closed_lost` |
| **Probability** | 0% |
| **Order** | 7 |
| **Status** | `lost` |

### Required Fields (Added to previous)
- ✅ `actual_close_date` - Date we learned we lost
- ✅ `lost_reason` - Why did we lose? (REQUIRED for learning)
- ✅ `status = 'lost'`

### Lost Reasons (Dropdown)
- "Lost to competitor" → Specify competitor in `lost_to_competitor`
- "No decision / no budget"
- "Timing not right"
- "Went with in-house solution"
- "Pricing too high"
- "Missing features/functionality"
- "Unresponsive / ghosted"
- "Disqualified (not a fit)"
- "Other" (specify in notes)

### Entry Actions
- Set `probability = 0`
- Set `status = 'lost'`
- Set `actual_close_date = TODAY` (if not set)
- Create activity: "Deal closed - lost"
- Send notification to manager
- Update forecast snapshot (mark as closed)
- Log loss reason for analysis

### Post-Mortem (Recommended)
- What went wrong?
- What could we have done differently?
- Was this a qualified lead? (If no, improve qualification)
- Should we stay in touch? (Add to nurture campaign)

### Validation
- ✅ Cannot change stage after marked "Closed Lost" without "Reopening"
- ✅ `lost_reason` must be selected from list (cannot be empty)

---

## Stage Transition Rules

### Valid Transitions

```
lead → qualified → quote_sent → negotiation → verbal_commitment → closed_won
   ↓        ↓            ↓             ↓               ↓
closed_lost (can exit at any stage)
```

### Cannot Skip Stages
- ❌ `lead` → `quote_sent` (must go through `qualified`)
- ❌ `qualified` → `negotiation` (must send quote first)
- ❌ `quote_sent` → `verbal_commitment` (must negotiate first)

**Exception**: Can skip stages if moving backwards (e.g., `negotiation` → `qualified` if deal regresses)

### Cannot Move From Closed
- ❌ Cannot move from `closed_won` or `closed_lost` without "Reopening"
- ✅ Admin can "Reopen" opportunity (creates audit log)

---

## Stage Validation Logic

### On Stage Change (Trigger)

```javascript
function validateStageChange(opportunity, oldStage, newStage) {
  const stageOrder = {
    'lead': 1,
    'qualified': 2,
    'quote_sent': 3,
    'negotiation': 4,
    'verbal_commitment': 5,
    'closed_won': 6,
    'closed_lost': 7
  };
  
  const requiredFields = {
    'qualified': ['next_step', 'next_step_date', 'expected_close_date'],
    'quote_sent': ['next_step', 'next_step_date'],
    'negotiation': ['next_step', 'next_step_date'],
    'verbal_commitment': ['next_step', 'next_step_date', 'expected_close_date'],
    'closed_won': ['actual_close_date', 'close_reason'],
    'closed_lost': ['actual_close_date', 'lost_reason']
  };
  
  // Check if skipping stages (forward only)
  if (stageOrder[newStage] > stageOrder[oldStage] + 1 && 
      newStage !== 'closed_lost') {
    throw new Error(`Cannot skip from ${oldStage} to ${newStage}. Must progress through stages.`);
  }
  
  // Check required fields
  const required = requiredFields[newStage] || [];
  for (const field of required) {
    if (!opportunity[field]) {
      throw new Error(`${field} is required to move to ${newStage} stage.`);
    }
  }
  
  // Check next_step_date is not in past
  if (opportunity.next_step_date && new Date(opportunity.next_step_date) < new Date()) {
    throw new Error('next_step_date cannot be in the past.');
  }
  
  return true;
}
```

---

## Stage Duration Benchmarks

**Goal**: Understand typical velocity and identify stalled deals.

| Stage | Target Duration | Acceptable Range | Alert Threshold |
|-------|-----------------|------------------|-----------------|
| Lead | 3-7 days | 1-14 days | >14 days |
| Qualified | 7-14 days | 3-21 days | >21 days |
| Quote Sent | 7-14 days | 3-21 days | >21 days |
| Negotiation | 7-21 days | 3-30 days | >30 days |
| Verbal Commitment | 3-7 days | 1-14 days | >14 days |

**Note**: Durations are highly dependent on industry and deal size. Adjust based on historical data.

---

## Stage Hygiene Rules

### Next Step Enforcement
- ❌ Cannot progress past "Qualified" without `next_step` and `next_step_date`
- ⚠️ Alert if `next_step_date` is in the past (overdue)
- ⚠️ Alert if `next_step` is vague (e.g., "Follow up" instead of "Call to discuss pricing")

### Activity Hygiene
- ⚠️ Alert if opportunity has no activity in 7 days (stalled)
- ⚠️ **Critical alert** if opportunity in "Negotiation" or "Verbal Commitment" has no activity in 3 days

### Forecast Hygiene
- All opportunities in "Negotiation" or "Verbal Commitment" must be in forecast
- Opportunities in "Qualified" or "Quote Sent" should be in forecast if `expected_close_date` is within current quarter

---

## Reporting by Stage

### Pipeline by Stage (Count & Value)
```sql
SELECT 
  stage,
  COUNT(*) as opp_count,
  SUM(amount) as total_value,
  SUM(weighted_amount) as weighted_value,
  AVG(amount) as avg_deal_size
FROM opportunities
WHERE org_id = :org_id AND status = 'open'
GROUP BY stage
ORDER BY 
  CASE stage
    WHEN 'lead' THEN 1
    WHEN 'qualified' THEN 2
    WHEN 'quote_sent' THEN 3
    WHEN 'negotiation' THEN 4
    WHEN 'verbal_commitment' THEN 5
  END;
```

### Stage Conversion Rates
```sql
SELECT 
  from_stage,
  to_stage,
  COUNT(*) as transitions,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY from_stage), 2) as conversion_rate
FROM opportunity_stage_history
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY from_stage, to_stage
ORDER BY from_stage, to_stage;
```

### Average Time in Stage
```sql
SELECT 
  to_stage as stage,
  ROUND(AVG(time_in_stage_seconds) / 86400.0, 1) as avg_days_in_stage,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_in_stage_seconds) / 86400.0, 1) as median_days
FROM opportunity_stage_history
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY to_stage;
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-12-23 | System | Complete stage definitions for CRM Core |

---

**Next Document**: `KPI_DICTIONARY.md` - Exact SQL formulas for all metrics

