/**
 * Opportunities Service
 * 
 * Supabase-based service for managing opportunities (deals).
 */

import { supabase } from '../lib/supabase';
import type { 
  Opportunity, 
  OpportunityInsert, 
  OpportunityUpdate, 
  OpportunityStage, 
  OpportunityStatus,
  ForecastCategory 
} from '../lib/database.types';

export interface OpportunityFilters {
  search?: string;
  stage?: OpportunityStage;
  status?: OpportunityStatus;
  ownerId?: string;
  accountId?: string;
  contactId?: string;
  forecastCategory?: ForecastCategory;
  minAmount?: number;
  maxAmount?: number;
  expectedCloseDateFrom?: string;
  expectedCloseDateTo?: string;
  page?: number;
  limit?: number;
}

export interface OpportunitiesResponse {
  data: Opportunity[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PipelineSummary {
  stage: OpportunityStage;
  count: number;
  totalValue: number;
  weightedValue: number;
}

export interface OpportunityStatistics {
  totalOpen: number;
  totalValue: number;
  weightedValue: number;
  wonThisMonth: number;
  wonValueThisMonth: number;
  lostThisMonth: number;
  winRate: number;
  avgDealSize: number;
  avgSalesCycle: number;
}

export const opportunitiesService = {
  /**
   * Get all opportunities with optional filtering
   */
  async getAll(filters?: OpportunityFilters): Promise<OpportunitiesResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('opportunities')
      .select(`
        *,
        account:accounts(id, name),
        contact:contacts(id, first_name, last_name, email),
        owner:users!opportunities_owner_id_fkey(id, first_name, last_name)
      `, { count: 'exact' });

    // Apply filters
    if (filters?.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    if (filters?.stage) {
      query = query.eq('stage', filters.stage);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }

    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    if (filters?.contactId) {
      query = query.eq('contact_id', filters.contactId);
    }

    if (filters?.forecastCategory) {
      query = query.eq('forecast_category', filters.forecastCategory);
    }

    if (filters?.minAmount !== undefined) {
      query = query.gte('amount', filters.minAmount);
    }

    if (filters?.maxAmount !== undefined) {
      query = query.lte('amount', filters.maxAmount);
    }

    if (filters?.expectedCloseDateFrom) {
      query = query.gte('expected_close_date', filters.expectedCloseDateFrom);
    }

    if (filters?.expectedCloseDateTo) {
      query = query.lte('expected_close_date', filters.expectedCloseDateTo);
    }

    // Apply pagination and ordering
    query = query
      .order('expected_close_date', { ascending: true, nullsFirst: false })
      .order('amount', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data || [],
      count: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  },

  /**
   * Get open opportunities (for pipeline view)
   */
  async getOpen(ownerId?: string): Promise<Opportunity[]> {
    let query = supabase
      .from('opportunities')
      .select(`
        *,
        account:accounts(id, name),
        contact:contacts(id, first_name, last_name),
        owner:users!opportunities_owner_id_fkey(id, first_name, last_name)
      `)
      .eq('status', 'open')
      .order('expected_close_date', { ascending: true, nullsFirst: false });

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single opportunity by ID
   */
  async getById(id: string): Promise<Opportunity | null> {
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        account:accounts(id, name, industry, phone, website),
        contact:contacts(id, first_name, last_name, email, phone, job_title),
        lead:leads(id, first_name, last_name, lead_source),
        owner:users!opportunities_owner_id_fkey(id, first_name, last_name, email),
        activities(id, activity_type, subject, activity_date, is_completed, description),
        notes(id, content, is_pinned, created_at, created_by)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return data;
  },

  /**
   * Create a new opportunity
   */
  async create(opportunity: OpportunityInsert): Promise<Opportunity> {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunity)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing opportunity
   */
  async update(id: string, updates: OpportunityUpdate): Promise<Opportunity> {
    const { data, error } = await supabase
      .from('opportunities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an opportunity
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Update opportunity stage
   */
  async updateStage(id: string, stage: OpportunityStage, reason?: string): Promise<Opportunity> {
    const updates: OpportunityUpdate = { stage };

    // Handle closed stages
    if (stage === 'closed_won') {
      updates.status = 'won';
      updates.actual_close_date = new Date().toISOString().split('T')[0];
      if (reason) updates.close_reason = reason;
    } else if (stage === 'closed_lost') {
      updates.status = 'lost';
      updates.actual_close_date = new Date().toISOString().split('T')[0];
      if (reason) updates.lost_reason = reason;
    }

    return this.update(id, updates);
  },

  /**
   * Update next step
   */
  async updateNextStep(id: string, nextStep: string, nextStepDate: string): Promise<Opportunity> {
    return this.update(id, {
      next_step: nextStep,
      next_step_date: nextStepDate,
    });
  },

  /**
   * Update forecast category
   */
  async updateForecastCategory(id: string, category: ForecastCategory): Promise<Opportunity> {
    return this.update(id, { forecast_category: category });
  },

  /**
   * Get pipeline summary by stage
   */
  async getPipelineSummary(ownerId?: string): Promise<PipelineSummary[]> {
    let query = supabase
      .from('opportunities')
      .select('stage, amount, weighted_amount')
      .eq('status', 'open');

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Group by stage
    const stages: OpportunityStage[] = ['lead', 'qualified', 'quote_sent', 'negotiation', 'verbal_commitment'];
    const summary: PipelineSummary[] = stages.map((stage) => {
      const stageOpps = data?.filter((o) => o.stage === stage) || [];
      return {
        stage,
        count: stageOpps.length,
        totalValue: stageOpps.reduce((sum, o) => sum + (o.amount || 0), 0),
        weightedValue: stageOpps.reduce((sum, o) => sum + (o.weighted_amount || 0), 0),
      };
    });

    return summary;
  },

  /**
   * Get opportunities without next step
   */
  async getWithoutNextStep(ownerId?: string): Promise<Opportunity[]> {
    let query = supabase
      .from('opportunities')
      .select(`
        *,
        account:accounts(id, name),
        owner:users!opportunities_owner_id_fkey(id, first_name, last_name)
      `)
      .eq('status', 'open')
      .or('next_step.is.null,next_step.eq.,next_step_date.is.null,next_step_date.lt.' + new Date().toISOString().split('T')[0]);

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get stalled opportunities (no activity in X days)
   */
  async getStalled(days = 7, ownerId?: string): Promise<Opportunity[]> {
    const stalledDate = new Date();
    stalledDate.setDate(stalledDate.getDate() - days);

    let query = supabase
      .from('opportunities')
      .select(`
        *,
        account:accounts(id, name),
        owner:users!opportunities_owner_id_fkey(id, first_name, last_name)
      `)
      .eq('status', 'open')
      .or(`last_activity_at.is.null,last_activity_at.lt.${stalledDate.toISOString()}`);

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get opportunity statistics
   */
  async getStatistics(ownerId?: string): Promise<OpportunityStatistics> {
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);

    let query = supabase
      .from('opportunities')
      .select('status, stage, amount, weighted_amount, actual_close_date, created_at');

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats: OpportunityStatistics = {
      totalOpen: 0,
      totalValue: 0,
      weightedValue: 0,
      wonThisMonth: 0,
      wonValueThisMonth: 0,
      lostThisMonth: 0,
      winRate: 0,
      avgDealSize: 0,
      avgSalesCycle: 0,
    };

    let totalWon = 0;
    let totalLost = 0;
    let wonAmounts: number[] = [];
    let salesCycles: number[] = [];

    data?.forEach((opp) => {
      if (opp.status === 'open') {
        stats.totalOpen++;
        stats.totalValue += opp.amount || 0;
        stats.weightedValue += opp.weighted_amount || 0;
      } else if (opp.status === 'won') {
        totalWon++;
        wonAmounts.push(opp.amount || 0);
        
        if (opp.actual_close_date && new Date(opp.actual_close_date) >= firstOfMonth) {
          stats.wonThisMonth++;
          stats.wonValueThisMonth += opp.amount || 0;
        }

        // Calculate sales cycle
        if (opp.actual_close_date && opp.created_at) {
          const created = new Date(opp.created_at);
          const closed = new Date(opp.actual_close_date);
          const days = Math.floor((closed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
          salesCycles.push(days);
        }
      } else if (opp.status === 'lost') {
        totalLost++;
        
        if (opp.actual_close_date && new Date(opp.actual_close_date) >= firstOfMonth) {
          stats.lostThisMonth++;
        }
      }
    });

    // Calculate win rate
    const totalClosed = totalWon + totalLost;
    stats.winRate = totalClosed > 0 ? Math.round((totalWon / totalClosed) * 100) : 0;

    // Calculate average deal size
    stats.avgDealSize = wonAmounts.length > 0
      ? Math.round(wonAmounts.reduce((a, b) => a + b, 0) / wonAmounts.length)
      : 0;

    // Calculate average sales cycle
    stats.avgSalesCycle = salesCycles.length > 0
      ? Math.round(salesCycles.reduce((a, b) => a + b, 0) / salesCycles.length)
      : 0;

    return stats;
  },

  /**
   * Get forecast data
   */
  async getForecast(periodStart: string, periodEnd: string, ownerId?: string): Promise<{
    commit: number;
    bestCase: number;
    pipeline: number;
    quota?: number;
  }> {
    let query = supabase
      .from('opportunities')
      .select('amount, forecast_category')
      .eq('status', 'open')
      .gte('expected_close_date', periodStart)
      .lte('expected_close_date', periodEnd);

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const forecast = {
      commit: 0,
      bestCase: 0,
      pipeline: 0,
    };

    data?.forEach((opp) => {
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
          forecast.pipeline += amount;
          break;
      }
    });

    return forecast;
  },

  /**
   * Search opportunities
   */
  async search(query: string, limit = 10): Promise<Opportunity[]> {
    const { data, error } = await supabase
      .from('opportunities')
      .select('id, name, stage, status, amount, account:accounts(id, name)')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

export default opportunitiesService;

