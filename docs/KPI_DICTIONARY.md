# CompassIQ KPI Dictionary
## Exact SQL Formulas for All Operating Layer Metrics

**Version**: 2.0.0  
**Status**: Phase 0 - Product Spec  
**Last Updated**: December 23, 2025  

---

## Table of Contents

1. [Pipeline Metrics](#pipeline-metrics)
2. [Conversion Metrics](#conversion-metrics)
3. [Velocity Metrics](#velocity-metrics)
4. [Activity Metrics](#activity-metrics)
5. [Forecast Metrics](#forecast-metrics)
6. [Rep Performance Metrics](#rep-performance-metrics)
7. [Alert Metrics](#alert-metrics)

---

## Pipeline Metrics

### 1.1 Total Pipeline Value

**Definition**: Sum of all open opportunities  
**Dashboard**: Manager, Exec  
**Format**: Currency  

```sql
SELECT 
  SUM(amount) as pipeline_value,
  COUNT(*) as opp_count
FROM opportunities
WHERE org_id = :org_id
  AND status = 'open';
```

**Target**: 3x quota (minimum)

---

### 1.2 Weighted Pipeline

**Definition**: Pipeline adjusted by probability of close  
**Dashboard**: Manager, Exec  
**Format**: Currency  

```sql
SELECT 
  SUM(weighted_amount) as weighted_pipeline,
  SUM(amount) as total_pipeline,
  ROUND(SUM(weighted_amount) / NULLIF(SUM(amount), 0) * 100, 1) as avg_probability
FROM opportunities
WHERE org_id = :org_id
  AND status = 'open';
```

**Weighted Amount Calculation** (stored as generated column):
```sql
weighted_amount = amount * probability / 100.0
```

**Target**: 2x quota for commit + best_case

---

### 1.3 Pipeline Coverage Ratio

**Definition**: Weighted pipeline divided by quota for period  
**Dashboard**: Manager, Rep  
**Format**: Decimal (e.g., 3.5x)  

```sql
SELECT 
  u.id as user_id,
  u.first_name || ' ' || u.last_name as rep_name,
  u.quota as period_quota,
  SUM(o.weighted_amount) as weighted_pipeline,
  ROUND(
    SUM(o.weighted_amount) / NULLIF(u.quota, 0), 
    2
  ) as coverage_ratio
FROM users u
LEFT JOIN opportunities o ON o.owner_id = u.id 
  AND o.status = 'open'
  AND o.expected_close_date BETWEEN :period_start AND :period_end
WHERE u.org_id = :org_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id AND r.name = 'ae'
  )
GROUP BY u.id, u.first_name, u.last_name, u.quota
ORDER BY coverage_ratio ASC;
```

**Interpretation**:
- < 2x: 🔴 Critical - Pipeline too small
- 2-3x: 🟡 Warning - Below target
- 3-5x: 🟢 Healthy
- \> 5x: 🔵 Excellent

---

### 1.4 Pipeline by Stage

**Definition**: Breakdown of pipeline value and count by stage  
**Dashboard**: Manager  
**Format**: Table + Bar Chart  

```sql
SELECT 
  stage,
  COUNT(*) as opp_count,
  SUM(amount) as total_value,
  SUM(weighted_amount) as weighted_value,
  ROUND(AVG(amount), 0) as avg_deal_size,
  ROUND(AVG(probability), 0) as avg_probability
FROM opportunities
WHERE org_id = :org_id
  AND status = 'open'
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

**Visualization**: Horizontal bar chart showing count and value by stage

---

### 1.5 Pipeline by Rep

**Definition**: Pipeline breakdown by account executive  
**Dashboard**: Manager  
**Format**: Table + Leaderboard  

```sql
SELECT 
  u.id as user_id,
  u.first_name || ' ' || u.last_name as rep_name,
  COUNT(o.id) as opp_count,
  SUM(o.amount) as total_pipeline,
  SUM(o.weighted_amount) as weighted_pipeline,
  ROUND(AVG(o.probability), 0) as avg_probability,
  ROUND(AVG(o.amount), 0) as avg_deal_size
FROM users u
LEFT JOIN opportunities o ON o.owner_id = u.id AND o.status = 'open'
WHERE u.org_id = :org_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id AND r.name = 'ae'
  )
GROUP BY u.id, u.first_name, u.last_name
ORDER BY weighted_pipeline DESC;
```

---

### 1.6 Pipeline by Close Date

**Definition**: Pipeline grouped by expected close month  
**Dashboard**: Manager, Exec  
**Format**: Table + Line Chart  

```sql
SELECT 
  DATE_TRUNC('month', expected_close_date) as close_month,
  COUNT(*) as opp_count,
  SUM(amount) as total_value,
  SUM(weighted_amount) as weighted_value
FROM opportunities
WHERE org_id = :org_id
  AND status = 'open'
  AND expected_close_date IS NOT NULL
  AND expected_close_date BETWEEN :start_date AND :end_date
GROUP BY close_month
ORDER BY close_month;
```

---

## Conversion Metrics

### 2.1 Overall Win Rate

**Definition**: Percentage of closed opportunities that were won  
**Dashboard**: Manager, Exec  
**Format**: Percentage  

```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'won') as won_count,
  COUNT(*) FILTER (WHERE status = 'lost') as lost_count,
  COUNT(*) as total_closed,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'won') * 100.0 / 
    NULLIF(COUNT(*), 0), 
    1
  ) as win_rate
FROM opportunities
WHERE org_id = :org_id
  AND status IN ('won', 'lost')
  AND actual_close_date BETWEEN :start_date AND :end_date;
```

**Target**: > 30%

---

### 2.2 Win Rate by Stage

**Definition**: Win rate for opportunities that reached each stage  
**Dashboard**: Manager  
**Format**: Table  

```sql
WITH stage_reached AS (
  SELECT DISTINCT
    o.id,
    o.status,
    h.to_stage
  FROM opportunities o
  JOIN opportunity_stage_history h ON h.opportunity_id = o.id
  WHERE o.org_id = :org_id
    AND o.status IN ('won', 'lost')
    AND o.actual_close_date BETWEEN :start_date AND :end_date
)
SELECT 
  to_stage as stage,
  COUNT(*) FILTER (WHERE status = 'won') as won_count,
  COUNT(*) as total_count,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'won') * 100.0 / 
    NULLIF(COUNT(*), 0),
    1
  ) as win_rate
FROM stage_reached
GROUP BY to_stage
ORDER BY 
  CASE to_stage
    WHEN 'lead' THEN 1
    WHEN 'qualified' THEN 2
    WHEN 'quote_sent' THEN 3
    WHEN 'negotiation' THEN 4
    WHEN 'verbal_commitment' THEN 5
  END;
```

**Expected Results**:
- Lead → Qualified: ~40-50%
- Qualified → Quote Sent: ~60-70%
- Quote Sent → Negotiation: ~50-60%
- Negotiation → Verbal: ~70-80%
- Verbal → Closed Won: ~90%+

---

### 2.3 Stage Conversion Rate

**Definition**: Percentage moving from one stage to the next  
**Dashboard**: Manager  
**Format**: Funnel Chart  

```sql
SELECT 
  from_stage,
  to_stage,
  COUNT(*) as transitions,
  ROUND(
    COUNT(*) * 100.0 / 
    SUM(COUNT(*)) OVER (PARTITION BY from_stage),
    1
  ) as conversion_rate
FROM opportunity_stage_history
WHERE created_at BETWEEN :start_date AND :end_date
GROUP BY from_stage, to_stage
ORDER BY from_stage, to_stage;
```

---

### 2.4 Lead Conversion Rate

**Definition**: Percentage of leads converted to opportunities  
**Dashboard**: Manager, Rep  
**Format**: Percentage  

```sql
SELECT 
  COUNT(*) FILTER (WHERE status = 'converted') as converted_count,
  COUNT(*) as total_leads,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'converted') * 100.0 / 
    NULLIF(COUNT(*), 0),
    1
  ) as conversion_rate
FROM leads
WHERE org_id = :org_id
  AND created_at BETWEEN :start_date AND :end_date;
```

**Target**: > 25%

---

### 2.5 Lead-to-Close Rate

**Definition**: Percentage of leads that eventually become closed-won deals  
**Dashboard**: Manager  
**Format**: Percentage  

```sql
SELECT 
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT l.id) FILTER (
    WHERE l.converted_opportunity_id IS NOT NULL
    AND o.status = 'won'
  ) as closed_won_count,
  ROUND(
    COUNT(DISTINCT l.id) FILTER (
      WHERE l.converted_opportunity_id IS NOT NULL
      AND o.status = 'won'
    ) * 100.0 / NULLIF(COUNT(DISTINCT l.id), 0),
    1
  ) as lead_to_close_rate
FROM leads l
LEFT JOIN opportunities o ON o.id = l.converted_opportunity_id
WHERE l.org_id = :org_id
  AND l.created_at BETWEEN :start_date AND :end_date;
```

**Target**: > 10%

---

## Velocity Metrics

### 3.1 Average Sales Cycle Length

**Definition**: Average days from opportunity creation to close  
**Dashboard**: Manager, Exec  
**Format**: Days  

```sql
SELECT 
  ROUND(
    AVG(
      EXTRACT(DAY FROM (actual_close_date - created_at::date))
    ),
    0
  ) as avg_sales_cycle_days,
  ROUND(
    PERCENTILE_CONT(0.5) WITHIN GROUP (
      ORDER BY EXTRACT(DAY FROM (actual_close_date - created_at::date))
    ),
    0
  ) as median_sales_cycle_days,
  MIN(EXTRACT(DAY FROM (actual_close_date - created_at::date))) as min_days,
  MAX(EXTRACT(DAY FROM (actual_close_date - created_at::date))) as max_days
FROM opportunities
WHERE org_id = :org_id
  AND status IN ('won', 'lost')
  AND actual_close_date BETWEEN :start_date AND :end_date;
```

**Target**: < 45 days (varies by industry)

---

### 3.2 Average Time in Stage

**Definition**: Average days opportunities spend in each stage  
**Dashboard**: Manager  
**Format**: Table  

```sql
SELECT 
  to_stage as stage,
  ROUND(AVG(time_in_stage_seconds) / 86400.0, 1) as avg_days,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_in_stage_seconds) / 86400.0, 1) as median_days,
  COUNT(*) as sample_size
FROM opportunity_stage_history
WHERE created_at BETWEEN :start_date AND :end_date
GROUP BY to_stage
ORDER BY 
  CASE to_stage
    WHEN 'lead' THEN 1
    WHEN 'qualified' THEN 2
    WHEN 'quote_sent' THEN 3
    WHEN 'negotiation' THEN 4
    WHEN 'verbal_commitment' THEN 5
  END;
```

---

### 3.3 Pipeline Velocity

**Definition**: Rate at which deals move through pipeline ($ / day)  
**Dashboard**: Exec  
**Format**: Currency / day  

```sql
WITH pipeline_changes AS (
  SELECT 
    SUM(amount) FILTER (WHERE status = 'won') as won_amount,
    SUM(amount) FILTER (WHERE status = 'lost') as lost_amount,
    MAX(actual_close_date) - MIN(created_at::date) as days_in_period
  FROM opportunities
  WHERE org_id = :org_id
    AND actual_close_date BETWEEN :start_date AND :end_date
)
SELECT 
  won_amount,
  lost_amount,
  days_in_period,
  ROUND(
    (won_amount + lost_amount) / NULLIF(days_in_period, 0),
    0
  ) as pipeline_velocity_per_day
FROM pipeline_changes;
```

---

## Activity Metrics

### 4.1 Activity Rate (Per Rep)

**Definition**: Average activities per rep per week  
**Dashboard**: Manager, Rep  
**Format**: Count  

```sql
SELECT 
  u.id as user_id,
  u.first_name || ' ' || u.last_name as rep_name,
  COUNT(a.id) as total_activities,
  ROUND(
    COUNT(a.id) * 7.0 / 
    NULLIF(EXTRACT(DAY FROM (:end_date - :start_date)), 0),
    1
  ) as activities_per_week
FROM users u
LEFT JOIN activities a ON a.owner_id = u.id 
  AND a.activity_date BETWEEN :start_date AND :end_date
WHERE u.org_id = :org_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id AND r.name = 'ae'
  )
GROUP BY u.id, u.first_name, u.last_name
ORDER BY activities_per_week DESC;
```

**Target**: > 20 activities per week per rep

---

### 4.2 Activity Mix

**Definition**: Breakdown of activities by type  
**Dashboard**: Manager  
**Format**: Pie Chart  

```sql
SELECT 
  activity_type,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 1) as percentage
FROM activities
WHERE org_id = :org_id
  AND activity_date BETWEEN :start_date AND :end_date
GROUP BY activity_type
ORDER BY count DESC;
```

---

### 4.3 Activities Per Opportunity

**Definition**: Average number of activities per open opportunity  
**Dashboard**: Manager  
**Format**: Count  

```sql
SELECT 
  COUNT(a.id) as total_activities,
  COUNT(DISTINCT o.id) as total_opportunities,
  ROUND(
    COUNT(a.id)::numeric / NULLIF(COUNT(DISTINCT o.id), 0),
    1
  ) as activities_per_opp
FROM opportunities o
LEFT JOIN activities a ON a.related_to_type = 'opportunity' 
  AND a.related_to_id = o.id
  AND a.activity_date BETWEEN :start_date AND :end_date
WHERE o.org_id = :org_id
  AND o.status = 'open';
```

**Target**: > 5 activities per opportunity

---

### 4.4 Opportunities Without Next Step

**Definition**: Count and list of opportunities missing next step  
**Dashboard**: Manager, Rep  
**Format**: Count + List  

```sql
SELECT 
  o.id,
  o.name,
  o.stage,
  o.amount,
  o.owner_id,
  u.first_name || ' ' || u.last_name as owner_name,
  o.last_activity_at,
  o.next_step,
  o.next_step_date
FROM opportunities o
JOIN users u ON u.id = o.owner_id
WHERE o.org_id = :org_id
  AND o.status = 'open'
  AND (
    o.next_step IS NULL OR 
    o.next_step = '' OR
    o.next_step_date IS NULL OR
    o.next_step_date < CURRENT_DATE
  )
ORDER BY o.amount DESC;
```

**Target**: 0 opportunities without next step

---

### 4.5 Stalled Opportunities

**Definition**: Open opportunities with no activity in X days  
**Dashboard**: Manager, Rep  
**Format**: Count + List  

```sql
SELECT 
  o.id,
  o.name,
  o.stage,
  o.amount,
  o.owner_id,
  u.first_name || ' ' || u.last_name as owner_name,
  o.last_activity_at,
  EXTRACT(DAY FROM (NOW() - o.last_activity_at)) as days_since_activity,
  o.next_step,
  o.next_step_date
FROM opportunities o
JOIN users u ON u.id = o.owner_id
WHERE o.org_id = :org_id
  AND o.status = 'open'
  AND (
    o.last_activity_at IS NULL OR
    o.last_activity_at < NOW() - INTERVAL ':stale_days days'
  )
ORDER BY o.amount DESC, days_since_activity DESC;
```

**Parameters**:
- `stale_days` = 7 (default)
- `stale_days` = 3 for "Negotiation" or "Verbal Commitment" stages

**Target**: < 5% of pipeline stalled

---

## Forecast Metrics

### 5.1 Forecast Summary by Category

**Definition**: Current forecast breakdown by commit/best case/pipeline  
**Dashboard**: Manager, Exec  
**Format**: Table + Gauge Chart  

```sql
SELECT 
  forecast_category,
  COUNT(*) as opp_count,
  SUM(amount) as total_value,
  SUM(weighted_amount) as weighted_value
FROM opportunities
WHERE org_id = :org_id
  AND status = 'open'
  AND expected_close_date BETWEEN :period_start AND :period_end
GROUP BY forecast_category
ORDER BY 
  CASE forecast_category
    WHEN 'commit' THEN 1
    WHEN 'best_case' THEN 2
    WHEN 'pipeline' THEN 3
  END;
```

---

### 5.2 Forecast by Rep

**Definition**: Forecast breakdown by account executive  
**Dashboard**: Manager  
**Format**: Table  

```sql
SELECT 
  u.id as user_id,
  u.first_name || ' ' || u.last_name as rep_name,
  u.quota,
  COUNT(o.id) FILTER (WHERE o.forecast_category = 'commit') as commit_count,
  SUM(o.amount) FILTER (WHERE o.forecast_category = 'commit') as commit_value,
  COUNT(o.id) FILTER (WHERE o.forecast_category = 'best_case') as best_case_count,
  SUM(o.amount) FILTER (WHERE o.forecast_category = 'best_case') as best_case_value,
  COUNT(o.id) FILTER (WHERE o.forecast_category = 'pipeline') as pipeline_count,
  SUM(o.amount) FILTER (WHERE o.forecast_category = 'pipeline') as pipeline_value,
  SUM(o.amount) as total_forecast,
  ROUND(SUM(o.amount) / NULLIF(u.quota, 0) * 100, 0) as attainment_pct
FROM users u
LEFT JOIN opportunities o ON o.owner_id = u.id 
  AND o.status = 'open'
  AND o.expected_close_date BETWEEN :period_start AND :period_end
WHERE u.org_id = :org_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id AND r.name = 'ae'
  )
GROUP BY u.id, u.first_name, u.last_name, u.quota
ORDER BY total_forecast DESC;
```

---

### 5.3 Forecast Accuracy

**Definition**: How accurate were past forecasts vs actual results?  
**Dashboard**: Manager  
**Format**: Table  

```sql
WITH forecast_vs_actual AS (
  SELECT 
    fs.snapshot_date,
    fs.fiscal_quarter,
    SUM(fe.rep_forecast_amount) FILTER (WHERE fe.forecast_category = 'commit') as forecast_commit,
    SUM(fe.actual_amount) FILTER (WHERE fe.forecast_category = 'commit') as actual_commit,
    SUM(fe.rep_forecast_amount) FILTER (WHERE fe.forecast_category = 'best_case') as forecast_best_case,
    SUM(fe.actual_amount) FILTER (WHERE fe.forecast_category = 'best_case') as actual_best_case
  FROM forecast_snapshots fs
  JOIN forecast_entries fe ON fe.forecast_snapshot_id = fs.id
  WHERE fs.org_id = :org_id
    AND fs.snapshot_date >= NOW() - INTERVAL '3 months'
  GROUP BY fs.snapshot_date, fs.fiscal_quarter
)
SELECT 
  snapshot_date,
  fiscal_quarter,
  forecast_commit,
  actual_commit,
  ROUND(
    (actual_commit - forecast_commit) / NULLIF(forecast_commit, 0) * 100,
    1
  ) as commit_accuracy_pct,
  forecast_best_case,
  actual_best_case,
  ROUND(
    (actual_best_case - forecast_best_case) / NULLIF(forecast_best_case, 0) * 100,
    1
  ) as best_case_accuracy_pct
FROM forecast_vs_actual
ORDER BY snapshot_date DESC;
```

**Interpretation**:
- **Commit accuracy** should be within ±10%
- **Best case accuracy** should be within ±20%

---

### 5.4 Closed This Period vs Target

**Definition**: Actual closed revenue vs quota for period  
**Dashboard**: Exec  
**Format**: Gauge Chart  

```sql
WITH period_target AS (
  SELECT SUM(quota) as total_quota
  FROM users
  WHERE org_id = :org_id
    AND EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = users.id AND r.name = 'ae'
    )
)
SELECT 
  (SELECT total_quota FROM period_target) as quota,
  SUM(o.amount) FILTER (WHERE o.status = 'won') as closed_won,
  COUNT(*) FILTER (WHERE o.status = 'won') as deals_won,
  ROUND(
    SUM(o.amount) FILTER (WHERE o.status = 'won') / 
    NULLIF((SELECT total_quota FROM period_target), 0) * 100,
    0
  ) as attainment_pct
FROM opportunities o
WHERE o.org_id = :org_id
  AND o.actual_close_date BETWEEN :period_start AND :period_end;
```

---

## Rep Performance Metrics

### 6.1 Rep Leaderboard

**Definition**: Ranking of reps by key metrics  
**Dashboard**: Manager  
**Format**: Leaderboard Table  

```sql
SELECT 
  u.id as user_id,
  u.first_name || ' ' || u.last_name as rep_name,
  u.quota,
  
  -- Closed won this period
  COUNT(o.id) FILTER (
    WHERE o.status = 'won' 
    AND o.actual_close_date BETWEEN :period_start AND :period_end
  ) as deals_won,
  SUM(o.amount) FILTER (
    WHERE o.status = 'won' 
    AND o.actual_close_date BETWEEN :period_start AND :period_end
  ) as revenue_closed,
  
  -- Open pipeline
  SUM(o.amount) FILTER (WHERE o.status = 'open') as pipeline_value,
  SUM(o.weighted_amount) FILTER (WHERE o.status = 'open') as weighted_pipeline,
  
  -- Activity
  COUNT(a.id) as activity_count,
  
  -- Win rate
  ROUND(
    COUNT(o.id) FILTER (WHERE o.status = 'won') * 100.0 /
    NULLIF(COUNT(o.id) FILTER (WHERE o.status IN ('won', 'lost')), 0),
    1
  ) as win_rate,
  
  -- Quota attainment
  ROUND(
    SUM(o.amount) FILTER (
      WHERE o.status = 'won' 
      AND o.actual_close_date BETWEEN :period_start AND :period_end
    ) / NULLIF(u.quota, 0) * 100,
    0
  ) as attainment_pct
  
FROM users u
LEFT JOIN opportunities o ON o.owner_id = u.id
LEFT JOIN activities a ON a.owner_id = u.id 
  AND a.activity_date BETWEEN :period_start AND :period_end
WHERE u.org_id = :org_id
  AND EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = u.id AND r.name = 'ae'
  )
GROUP BY u.id, u.first_name, u.last_name, u.quota
ORDER BY revenue_closed DESC;
```

---

### 6.2 Quota Attainment

**Definition**: Percentage of quota achieved by rep  
**Dashboard**: Rep  
**Format**: Gauge Chart  

```sql
SELECT 
  u.id as user_id,
  u.quota,
  SUM(o.amount) FILTER (WHERE o.status = 'won') as closed_revenue,
  ROUND(
    SUM(o.amount) FILTER (WHERE o.status = 'won') / 
    NULLIF(u.quota, 0) * 100,
    0
  ) as attainment_pct
FROM users u
LEFT JOIN opportunities o ON o.owner_id = u.id 
  AND o.actual_close_date BETWEEN :period_start AND :period_end
WHERE u.id = :user_id;
```

---

## Alert Metrics

### 7.1 Open Alerts by Type

**Definition**: Count of open alerts by alert type  
**Dashboard**: Manager  
**Format**: Table  

```sql
SELECT 
  ad.name,
  ad.alert_type,
  ad.severity,
  COUNT(ai.id) as open_count,
  COUNT(ai.id) FILTER (WHERE ai.created_at >= NOW() - INTERVAL '24 hours') as new_last_24h
FROM alert_definitions ad
LEFT JOIN alert_instances ai ON ai.alert_definition_id = ad.id 
  AND ai.status = 'open'
WHERE ad.org_id = :org_id
  AND ad.is_active = TRUE
GROUP BY ad.id, ad.name, ad.alert_type, ad.severity
ORDER BY 
  CASE ad.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  open_count DESC;
```

---

### 7.2 Alert Response Rate

**Definition**: Percentage of alerts acknowledged/resolved within 24 hours  
**Dashboard**: Manager  
**Format**: Percentage  

```sql
SELECT 
  COUNT(*) as total_alerts,
  COUNT(*) FILTER (
    WHERE acknowledged_at IS NOT NULL 
    AND acknowledged_at < created_at + INTERVAL '24 hours'
  ) as acknowledged_24h,
  COUNT(*) FILTER (
    WHERE resolved_at IS NOT NULL 
    AND resolved_at < created_at + INTERVAL '24 hours'
  ) as resolved_24h,
  ROUND(
    COUNT(*) FILTER (
      WHERE acknowledged_at IS NOT NULL 
      AND acknowledged_at < created_at + INTERVAL '24 hours'
    ) * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) as ack_rate_24h,
  ROUND(
    COUNT(*) FILTER (
      WHERE resolved_at IS NOT NULL 
      AND resolved_at < created_at + INTERVAL '24 hours'
    ) * 100.0 / NULLIF(COUNT(*), 0),
    1
  ) as resolution_rate_24h
FROM alert_instances
WHERE org_id = :org_id
  AND created_at BETWEEN :start_date AND :end_date;
```

**Target**: > 80% acknowledged within 24 hours

---

## KPI Refresh Strategy

### Real-Time KPIs (Updated on write)
- Total Pipeline Value
- Opportunities Without Next Step
- Stalled Opportunities
- Open Alerts

### Near Real-Time (Refresh every 5 minutes)
- Weighted Pipeline
- Pipeline by Stage
- Pipeline Coverage Ratio
- Forecast Summary

### Batch (Refresh hourly or daily)
- Win Rate
- Average Sales Cycle
- Forecast Accuracy
- Alert Response Rate

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-12-23 | System | Complete KPI dictionary with exact SQL |

---

**Next Document**: `ROLES_PERMISSIONS.md` - Complete permissions matrix

