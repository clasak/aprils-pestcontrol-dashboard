/**
 * Activities Service
 * 
 * Supabase-based service for managing activities (calls, emails, meetings, tasks).
 * Supports mock data mode for development/demo purposes.
 */

import { supabase } from '../lib/supabase';
import type { Activity, ActivityInsert, ActivityUpdate, ActivityType } from '../lib/database.types';

// Use mock data for development/demo - matches opportunitiesService
const USE_MOCK_DATA = true;

export interface ActivityFilters {
  search?: string;
  activityType?: ActivityType;
  relatedToType?: string;
  relatedToId?: string;
  ownerId?: string;
  isCompleted?: boolean;
  dueDateFrom?: string;
  dueDateTo?: string;
  page?: number;
  limit?: number;
}

export interface ActivitiesResponse {
  data: Activity[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityStatistics {
  total: number;
  byType: Record<ActivityType, number>;
  completed: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
}

export const activitiesService = {
  /**
   * Get all activities with optional filtering
   */
  async getAll(filters?: ActivityFilters): Promise<ActivitiesResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('activities')
      .select(`
        *,
        owner:users!activities_owner_id_fkey(id, first_name, last_name),
        creator:users!activities_created_by_fkey(id, first_name, last_name)
      `, { count: 'exact' });

    // Apply filters
    if (filters?.search) {
      query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters?.activityType) {
      query = query.eq('activity_type', filters.activityType);
    }

    if (filters?.relatedToType) {
      query = query.eq('related_to_type', filters.relatedToType);
    }

    if (filters?.relatedToId) {
      query = query.eq('related_to_id', filters.relatedToId);
    }

    if (filters?.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }

    if (filters?.isCompleted !== undefined) {
      query = query.eq('is_completed', filters.isCompleted);
    }

    if (filters?.dueDateFrom) {
      query = query.gte('due_date', filters.dueDateFrom);
    }

    if (filters?.dueDateTo) {
      query = query.lte('due_date', filters.dueDateTo);
    }

    // Apply pagination and ordering
    query = query
      .order('activity_date', { ascending: false })
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
   * Get activities for a specific entity
   */
  async getForEntity(
    relatedToType: 'account' | 'contact' | 'lead' | 'opportunity',
    relatedToId: string
  ): Promise<Activity[]> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        owner:users!activities_owner_id_fkey(id, first_name, last_name),
        creator:users!activities_created_by_fkey(id, first_name, last_name)
      `)
      .eq('related_to_type', relatedToType)
      .eq('related_to_id', relatedToId)
      .order('activity_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Get a single activity by ID
   */
  async getById(id: string): Promise<Activity | null> {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        owner:users!activities_owner_id_fkey(id, first_name, last_name, email),
        creator:users!activities_created_by_fkey(id, first_name, last_name)
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
   * Create a new activity
   */
  async create(activity: ActivityInsert): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .insert(activity)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing activity
   */
  async update(id: string, updates: ActivityUpdate): Promise<Activity> {
    const { data, error } = await supabase
      .from('activities')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an activity
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Mark activity as completed
   */
  async complete(id: string, outcome?: string): Promise<Activity> {
    return this.update(id, {
      is_completed: true,
      completed_at: new Date().toISOString(),
      outcome,
    });
  },

  /**
   * Mark activity as incomplete
   */
  async uncomplete(id: string): Promise<Activity> {
    return this.update(id, {
      is_completed: false,
      completed_at: undefined,
    });
  },

  /**
   * Get overdue activities
   */
  async getOverdue(ownerId?: string): Promise<Activity[]> {
    const today = new Date().toISOString();

    let query = supabase
      .from('activities')
      .select(`
        *,
        owner:users!activities_owner_id_fkey(id, first_name, last_name)
      `)
      .eq('is_completed', false)
      .lt('due_date', today)
      .order('due_date');

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get activities due today
   */
  async getDueToday(ownerId?: string): Promise<Activity[]> {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    let query = supabase
      .from('activities')
      .select(`
        *,
        owner:users!activities_owner_id_fkey(id, first_name, last_name)
      `)
      .eq('is_completed', false)
      .gte('due_date', today)
      .lt('due_date', tomorrow)
      .order('due_date');

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get activities due this week
   */
  async getDueThisWeek(ownerId?: string): Promise<Activity[]> {
    const today = new Date();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    let query = supabase
      .from('activities')
      .select(`
        *,
        owner:users!activities_owner_id_fkey(id, first_name, last_name)
      `)
      .eq('is_completed', false)
      .gte('due_date', today.toISOString())
      .lte('due_date', endOfWeek.toISOString())
      .order('due_date');

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Get activity statistics
   */
  async getStatistics(ownerId?: string): Promise<ActivityStatistics> {
    // Use mock data for consistent demo experience
    if (USE_MOCK_DATA) {
      return {
        total: 42,
        byType: {
          call: 15,
          email: 12,
          meeting: 8,
          task: 5,
          note: 2,
        },
        completed: 28,
        overdue: 3,
        dueToday: 4,
        dueThisWeek: 7,
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));

    let query = supabase
      .from('activities')
      .select('activity_type, is_completed, due_date');

    if (ownerId) {
      query = query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const stats: ActivityStatistics = {
      total: data?.length || 0,
      byType: {
        call: 0,
        email: 0,
        meeting: 0,
        task: 0,
        note: 0,
      },
      completed: 0,
      overdue: 0,
      dueToday: 0,
      dueThisWeek: 0,
    };

    data?.forEach((activity) => {
      stats.byType[activity.activity_type as ActivityType]++;
      
      if (activity.is_completed) {
        stats.completed++;
      } else if (activity.due_date) {
        const dueDate = activity.due_date.split('T')[0];
        
        if (dueDate < today) {
          stats.overdue++;
        } else if (dueDate === today) {
          stats.dueToday++;
        } else if (new Date(dueDate) <= endOfWeek) {
          stats.dueThisWeek++;
        }
      }
    });

    return stats;
  },

  /**
   * Log a quick call
   */
  async logCall(
    relatedToType: 'account' | 'contact' | 'lead' | 'opportunity',
    relatedToId: string,
    subject: string,
    description?: string,
    outcome?: string,
    durationMinutes?: number
  ): Promise<Activity> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data: profile } = await supabase
      .from('users')
      .select('id, org_id')
      .eq('auth_user_id', userData.user?.id)
      .single();

    if (!profile) throw new Error('User profile not found');

    return this.create({
      org_id: profile.org_id,
      activity_type: 'call',
      subject,
      description,
      outcome,
      duration_minutes: durationMinutes,
      related_to_type: relatedToType,
      related_to_id: relatedToId,
      owner_id: profile.id,
      created_by: profile.id,
      is_completed: true,
      completed_at: new Date().toISOString(),
    });
  },

  /**
   * Create a task (follow-up)
   */
  async createTask(
    relatedToType: 'account' | 'contact' | 'lead' | 'opportunity',
    relatedToId: string,
    subject: string,
    dueDate: string,
    description?: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
  ): Promise<Activity> {
    const { data: userData } = await supabase.auth.getUser();
    
    const { data: profile } = await supabase
      .from('users')
      .select('id, org_id')
      .eq('auth_user_id', userData.user?.id)
      .single();

    if (!profile) throw new Error('User profile not found');

    return this.create({
      org_id: profile.org_id,
      activity_type: 'task',
      subject,
      description,
      due_date: dueDate,
      priority,
      related_to_type: relatedToType,
      related_to_id: relatedToId,
      owner_id: profile.id,
      created_by: profile.id,
      is_completed: false,
    });
  },
};

export default activitiesService;

