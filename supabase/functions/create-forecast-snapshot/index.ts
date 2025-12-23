/**
 * Supabase Edge Function: Create Forecast Snapshot
 * 
 * Runs weekly to capture forecast snapshots for tracking.
 * Creates snapshots for each user and the organization.
 * 
 * Schedule: Run every Monday at 6am via Supabase cron
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

interface ForecastData {
  commit: number;
  bestCase: number;
  pipeline: number;
}

Deno.serve(async (req: Request) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current month period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const snapshotDate = now.toISOString().split('T')[0];

    // Get all organizations
    const { data: organizations, error: orgError } = await supabase
      .from('organizations')
      .select('id');

    if (orgError) throw orgError;

    let snapshotsCreated = 0;

    for (const org of organizations) {
      // Get all users in this org
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id')
        .eq('org_id', org.id)
        .eq('status', 'active');

      if (usersError) continue;

      // Create snapshot for each user
      for (const user of users) {
        const forecast = await getForecastData(
          supabase,
          periodStart.toISOString().split('T')[0],
          periodEnd.toISOString().split('T')[0],
          user.id
        );

        await createSnapshot(
          supabase,
          org.id,
          user.id,
          snapshotDate,
          periodStart.toISOString().split('T')[0],
          periodEnd.toISOString().split('T')[0],
          forecast
        );
        snapshotsCreated++;
      }

      // Create org-level snapshot (null user_id)
      const orgForecast = await getForecastData(
        supabase,
        periodStart.toISOString().split('T')[0],
        periodEnd.toISOString().split('T')[0]
      );

      await createSnapshot(
        supabase,
        org.id,
        null,
        snapshotDate,
        periodStart.toISOString().split('T')[0],
        periodEnd.toISOString().split('T')[0],
        orgForecast
      );
      snapshotsCreated++;
    }

    return new Response(
      JSON.stringify({
        success: true,
        snapshotsCreated,
        snapshotDate,
        periodStart: periodStart.toISOString().split('T')[0],
        periodEnd: periodEnd.toISOString().split('T')[0],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in create-forecast-snapshot:', error);
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
 * Get forecast data for a user or organization
 */
async function getForecastData(
  supabase: any,
  periodStart: string,
  periodEnd: string,
  userId?: string
): Promise<ForecastData> {
  let query = supabase
    .from('opportunities')
    .select('amount, forecast_category')
    .eq('status', 'open')
    .gte('expected_close_date', periodStart)
    .lte('expected_close_date', periodEnd);

  if (userId) {
    query = query.eq('owner_id', userId);
  }

  const { data: opportunities, error } = await query;

  if (error) {
    console.error('Error getting forecast data:', error);
    return { commit: 0, bestCase: 0, pipeline: 0 };
  }

  const forecast: ForecastData = {
    commit: 0,
    bestCase: 0,
    pipeline: 0,
  };

  opportunities?.forEach((opp: any) => {
    const amount = opp.amount || 0;

    switch (opp.forecast_category) {
      case 'commit':
        forecast.commit += amount;
        forecast.bestCase += amount;
        forecast.pipeline += amount;
        break;
      case 'best_case':
        forecast.bestCase += amount;
        forecast.pipeline += amount;
        break;
      case 'pipeline':
      default:
        forecast.pipeline += amount;
        break;
    }
  });

  return forecast;
}

/**
 * Create a forecast snapshot record
 */
async function createSnapshot(
  supabase: any,
  orgId: string,
  userId: string | null,
  snapshotDate: string,
  periodStart: string,
  periodEnd: string,
  forecast: ForecastData
): Promise<void> {
  // Check if snapshot already exists for this date
  const { data: existing } = await supabase
    .from('forecast_snapshots')
    .select('id')
    .eq('org_id', orgId)
    .eq('snapshot_date', snapshotDate)
    .eq('period_start', periodStart)
    .is('user_id', userId);

  if (existing && existing.length > 0) {
    // Update existing snapshot
    await supabase
      .from('forecast_snapshots')
      .update({
        commit_amount: forecast.commit,
        best_case_amount: forecast.bestCase,
        pipeline_amount: forecast.pipeline,
      })
      .eq('id', existing[0].id);
  } else {
    // Create new snapshot
    await supabase.from('forecast_snapshots').insert({
      org_id: orgId,
      user_id: userId,
      snapshot_date: snapshotDate,
      period_start: periodStart,
      period_end: periodEnd,
      commit_amount: forecast.commit,
      best_case_amount: forecast.bestCase,
      pipeline_amount: forecast.pipeline,
    });
  }
}

