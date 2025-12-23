/**
 * Supabase Edge Function: Check Alerts
 * 
 * Runs periodically to check for:
 * - Stalled opportunities (no activity in X days)
 * - Opportunities without next steps
 * - Low pipeline coverage
 * 
 * Creates notifications for users who need to take action.
 * 
 * Schedule: Run every hour via Supabase cron
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const STALLED_DAYS = 7;
const LATE_STAGE_STALLED_DAYS = 3;
const COVERAGE_THRESHOLD = 3.0; // 3x coverage recommended

interface AlertConfig {
  stalledDays: number;
  lateStageStallDays: number;
  coverageThreshold: number;
}

interface UserAlert {
  userId: string;
  orgId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  relatedToType?: string;
  relatedToId?: string;
}

Deno.serve(async (req: Request) => {
  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const alerts: UserAlert[] = [];

    // 1. Check for opportunities without next steps
    const noNextStepAlerts = await checkNoNextStep(supabase);
    alerts.push(...noNextStepAlerts);

    // 2. Check for stalled opportunities (no activity in 7+ days)
    const stalledAlerts = await checkStalledOpportunities(supabase, STALLED_DAYS);
    alerts.push(...stalledAlerts);

    // 3. Check for late-stage stalled (negotiation+ with no activity 3+ days)
    const lateStageAlerts = await checkLateStageStalledOpportunities(supabase, LATE_STAGE_STALLED_DAYS);
    alerts.push(...lateStageAlerts);

    // 4. Check for low pipeline coverage
    const coverageAlerts = await checkPipelineCoverage(supabase, COVERAGE_THRESHOLD);
    alerts.push(...coverageAlerts);

    // Create notifications for each alert
    const notificationsCreated = await createNotifications(supabase, alerts);

    return new Response(
      JSON.stringify({
        success: true,
        alertsGenerated: alerts.length,
        notificationsCreated,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in check-alerts function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});

/**
 * Check for opportunities without next steps
 */
async function checkNoNextStep(supabase: any): Promise<UserAlert[]> {
  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('id, name, owner_id, org_id')
    .eq('status', 'open')
    .or('next_step.is.null,next_step.eq.,next_step_date.is.null');

  if (error) {
    console.error('Error checking no next step:', error);
    return [];
  }

  return opportunities.map((opp: any) => ({
    userId: opp.owner_id,
    orgId: opp.org_id,
    title: 'Missing Next Step',
    message: `Opportunity "${opp.name}" has no next step defined. Set a next step to keep this deal moving.`,
    type: 'error' as const,
    relatedToType: 'opportunity',
    relatedToId: opp.id,
  }));
}

/**
 * Check for stalled opportunities
 */
async function checkStalledOpportunities(supabase: any, days: number): Promise<UserAlert[]> {
  const stalledDate = new Date();
  stalledDate.setDate(stalledDate.getDate() - days);

  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('id, name, owner_id, org_id, last_activity_at')
    .eq('status', 'open')
    .or(`last_activity_at.is.null,last_activity_at.lt.${stalledDate.toISOString()}`);

  if (error) {
    console.error('Error checking stalled opportunities:', error);
    return [];
  }

  return opportunities.map((opp: any) => ({
    userId: opp.owner_id,
    orgId: opp.org_id,
    title: 'Stalled Opportunity',
    message: `Opportunity "${opp.name}" has had no activity in ${days}+ days. Follow up to keep this deal alive.`,
    type: 'warning' as const,
    relatedToType: 'opportunity',
    relatedToId: opp.id,
  }));
}

/**
 * Check for late-stage stalled opportunities
 */
async function checkLateStageStalledOpportunities(supabase: any, days: number): Promise<UserAlert[]> {
  const stalledDate = new Date();
  stalledDate.setDate(stalledDate.getDate() - days);

  const lateStages = ['negotiation', 'verbal_commitment'];

  const { data: opportunities, error } = await supabase
    .from('opportunities')
    .select('id, name, owner_id, org_id, stage, amount')
    .eq('status', 'open')
    .in('stage', lateStages)
    .or(`last_activity_at.is.null,last_activity_at.lt.${stalledDate.toISOString()}`);

  if (error) {
    console.error('Error checking late-stage stalled:', error);
    return [];
  }

  return opportunities.map((opp: any) => ({
    userId: opp.owner_id,
    orgId: opp.org_id,
    title: 'Late-Stage Deal Stalling',
    message: `High-value opportunity "${opp.name}" ($${opp.amount.toLocaleString()}) in ${opp.stage} has stalled. This is critical - follow up immediately!`,
    type: 'error' as const,
    relatedToType: 'opportunity',
    relatedToId: opp.id,
  }));
}

/**
 * Check for low pipeline coverage
 */
async function checkPipelineCoverage(supabase: any, threshold: number): Promise<UserAlert[]> {
  // Get all users with quota
  // For now, assume a $100k monthly quota per rep
  const defaultQuota = 100000;

  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, org_id, first_name, last_name')
    .eq('status', 'active');

  if (usersError) {
    console.error('Error getting users:', usersError);
    return [];
  }

  const alerts: UserAlert[] = [];

  for (const user of users) {
    // Get weighted pipeline for this user
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('weighted_amount')
      .eq('owner_id', user.id)
      .eq('status', 'open');

    if (oppError) continue;

    const weightedPipeline = opportunities.reduce(
      (sum: number, opp: any) => sum + (opp.weighted_amount || 0),
      0
    );

    const coverage = weightedPipeline / defaultQuota;

    if (coverage < threshold) {
      alerts.push({
        userId: user.id,
        orgId: user.org_id,
        title: 'Low Pipeline Coverage',
        message: `Your pipeline coverage is ${(coverage * 100).toFixed(0)}% (${coverage.toFixed(1)}x). You need ${threshold}x coverage ($${(defaultQuota * threshold / 1000).toFixed(0)}k weighted) to hit quota.`,
        type: 'warning' as const,
      });
    }
  }

  return alerts;
}

/**
 * Create notifications for alerts
 */
async function createNotifications(supabase: any, alerts: UserAlert[]): Promise<number> {
  if (alerts.length === 0) return 0;

  // Deduplicate - don't create multiple notifications for the same issue
  const existingNotifications = await supabase
    .from('notifications')
    .select('related_to_id, title, user_id')
    .eq('is_read', false)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()); // Last 24 hours

  const existingSet = new Set(
    existingNotifications.data?.map(
      (n: any) => `${n.user_id}-${n.title}-${n.related_to_id || 'none'}`
    ) || []
  );

  const newAlerts = alerts.filter(
    (a) => !existingSet.has(`${a.userId}-${a.title}-${a.relatedToId || 'none'}`)
  );

  if (newAlerts.length === 0) return 0;

  const notifications = newAlerts.map((alert) => ({
    org_id: alert.orgId,
    user_id: alert.userId,
    title: alert.title,
    message: alert.message,
    type: alert.type,
    related_to_type: alert.relatedToType || null,
    related_to_id: alert.relatedToId || null,
    is_read: false,
  }));

  const { error } = await supabase.from('notifications').insert(notifications);

  if (error) {
    console.error('Error creating notifications:', error);
    return 0;
  }

  return notifications.length;
}

