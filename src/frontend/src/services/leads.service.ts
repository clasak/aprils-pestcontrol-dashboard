/**
 * Leads Service
 * 
 * Supabase-based service for managing leads.
 * Supports mock data mode for development/demo purposes.
 */

import { supabase } from '../lib/supabase';
import { mockLeadsApi } from '../modules/sales/mocks/mockSalesApi';
import type { Lead, LeadInsert, LeadUpdate, LeadStatus } from '../lib/database.types';

// Use mock data for development/demo - matches opportunitiesService
const USE_MOCK_DATA = true;

export interface LeadFilters {
  search?: string;
  status?: LeadStatus;
  assignedTo?: string;
  leadSource?: string;
  urgency?: string;
  minScore?: number;
  maxScore?: number;
  page?: number;
  limit?: number;
}

export interface LeadsResponse {
  data: Lead[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadStatistics {
  total: number;
  byStatus: Record<LeadStatus, number>;
  conversionRate: number;
  averageScore: number;
}

export const leadsService = {
  /**
   * Get all leads with optional filtering
   */
  async getAll(filters?: LeadFilters): Promise<LeadsResponse> {
    // Use mock data for consistent demo experience
    if (USE_MOCK_DATA) {
      const mockResponse = await mockLeadsApi.getAll({
        search: filters?.search,
        status: filters?.status as any,
        minScore: filters?.minScore,
        maxScore: filters?.maxScore,
        page: filters?.page,
        limit: filters?.limit,
      });
      // Transform mock data from camelCase to snake_case to match database types
      const transformedData = mockResponse.data.map((lead: any) => ({
        id: lead.id,
        org_id: lead.companyId,
        first_name: lead.contact?.firstName || '',
        last_name: lead.contact?.lastName || '',
        email: lead.contact?.email || '',
        phone: lead.contact?.phone || null,
        company_name: lead.contact?.companyName || '',
        job_title: lead.contact?.jobTitle || null,
        lead_source: lead.leadSource || 'website',
        status: lead.status,
        lead_score: lead.leadScore || 0,
        assigned_to: lead.assignedTo || null,
        notes: lead.notes || null,
        created_at: lead.createdAt,
        updated_at: lead.updatedAt,
      }));
      return {
        data: transformedData as Lead[],
        count: mockResponse.pagination.total,
        page: mockResponse.pagination.page,
        limit: mockResponse.pagination.limit,
        totalPages: mockResponse.pagination.totalPages,
      };
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('leads')
      .select(`
        *,
        assigned_user:users!leads_assigned_to_fkey(id, first_name, last_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.assignedTo) {
      query = query.eq('assigned_to', filters.assignedTo);
    }

    if (filters?.leadSource) {
      query = query.eq('lead_source', filters.leadSource);
    }

    if (filters?.urgency) {
      query = query.eq('urgency', filters.urgency);
    }

    if (filters?.minScore !== undefined) {
      query = query.gte('lead_score', filters.minScore);
    }

    if (filters?.maxScore !== undefined) {
      query = query.lte('lead_score', filters.maxScore);
    }

    // Apply pagination and ordering
    query = query
      .order('lead_score', { ascending: false })
      .order('created_at', { ascending: false })
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
   * Get a single lead by ID
   */
  async getById(id: string): Promise<Lead | null> {
    const { data, error } = await supabase
      .from('leads')
      .select(`
        *,
        assigned_user:users!leads_assigned_to_fkey(id, first_name, last_name, email),
        converted_contact:contacts(id, first_name, last_name, email),
        converted_opportunity:opportunities(id, name, stage, amount),
        activities(id, activity_type, subject, activity_date, is_completed)
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
   * Create a new lead
   */
  async create(lead: LeadInsert): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing lead
   */
  async update(id: string, updates: LeadUpdate): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a lead
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Assign a lead to a user
   */
  async assign(id: string, userId: string): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update({
        assigned_to: userId,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update lead status
   */
  async updateStatus(id: string, status: LeadStatus, reason?: string): Promise<Lead> {
    const updates: LeadUpdate = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'lost' && reason) {
      updates.lost_reason = reason;
      updates.lost_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Qualify or disqualify a lead
   */
  async qualify(id: string, isQualified: boolean): Promise<Lead> {
    const status: LeadStatus = isQualified ? 'qualified' : 'unqualified';
    return this.updateStatus(id, status);
  },

  /**
   * Convert lead to opportunity
   * This is a complex operation handled by the lead-conversion service
   */
  async markConverted(
    id: string,
    contactId: string,
    opportunityId: string,
    convertedBy: string
  ): Promise<Lead> {
    const { data, error } = await supabase
      .from('leads')
      .update({
        status: 'converted',
        converted_contact_id: contactId,
        converted_opportunity_id: opportunityId,
        converted_at: new Date().toISOString(),
        converted_by: convertedBy,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Get leads requiring follow-up
   */
  async getRequiringFollowUp(userId?: string): Promise<Lead[]> {
    let query = supabase
      .from('leads')
      .select('*')
      .in('status', ['new', 'contacted', 'qualified', 'nurturing'])
      .lte('next_follow_up_date', new Date().toISOString().split('T')[0])
      .order('next_follow_up_date');

    if (userId) {
      query = query.eq('assigned_to', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get lead statistics
   */
  async getStatistics(): Promise<LeadStatistics> {
    // Use mock data for consistent demo experience
    if (USE_MOCK_DATA) {
      const mockStats = await mockLeadsApi.getStatistics();
      return {
        total: mockStats.data.total,
        byStatus: mockStats.data.byStatus as Record<LeadStatus, number>,
        conversionRate: mockStats.data.conversionRate,
        averageScore: mockStats.data.averageScore,
      };
    }

    const { data, error } = await supabase
      .from('leads')
      .select('status, lead_score');

    if (error) throw error;

    const stats: LeadStatistics = {
      total: data?.length || 0,
      byStatus: {
        new: 0,
        contacted: 0,
        qualified: 0,
        unqualified: 0,
        nurturing: 0,
        converted: 0,
        lost: 0,
      },
      conversionRate: 0,
      averageScore: 0,
    };

    let totalScore = 0;
    let closedCount = 0;

    data?.forEach((lead) => {
      stats.byStatus[lead.status as LeadStatus]++;
      totalScore += lead.lead_score || 0;
      if (lead.status === 'converted' || lead.status === 'lost') {
        closedCount++;
      }
    });

    stats.averageScore = stats.total > 0 ? Math.round(totalScore / stats.total) : 0;
    stats.conversionRate = closedCount > 0 
      ? Math.round((stats.byStatus.converted / closedCount) * 100) 
      : 0;

    return stats;
  },

  /**
   * Search leads
   */
  async search(query: string, limit = 10): Promise<Lead[]> {
    const { data, error } = await supabase
      .from('leads')
      .select('id, first_name, last_name, email, phone, company_name, status, lead_score')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,company_name.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },
};

export default leadsService;

