/**
 * Accounts Service
 * 
 * Supabase-based service for managing accounts (customer companies).
 */

import { supabase } from '../lib/supabase';
import type { Account, AccountInsert, AccountUpdate } from '../lib/database.types';

export interface AccountFilters {
  search?: string;
  accountType?: string;
  ownerId?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface AccountsResponse {
  data: Account[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const accountsService = {
  /**
   * Get all accounts with optional filtering
   */
  async getAll(filters?: AccountFilters): Promise<AccountsResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('accounts')
      .select(`
        *,
        owner:users!accounts_owner_id_fkey(id, first_name, last_name, email)
      `, { count: 'exact' });

    // Apply filters
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
    }

    if (filters?.accountType) {
      query = query.eq('account_type', filters.accountType);
    }

    if (filters?.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }

    if (filters?.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    // Apply pagination and ordering
    query = query
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
   * Get a single account by ID
   */
  async getById(id: string): Promise<Account | null> {
    const { data, error } = await supabase
      .from('accounts')
      .select(`
        *,
        owner:users!accounts_owner_id_fkey(id, first_name, last_name, email),
        contacts(id, first_name, last_name, email, job_title, is_primary),
        opportunities(id, name, stage, status, amount, expected_close_date)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  },

  /**
   * Create a new account
   */
  async create(account: AccountInsert): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .insert(account)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing account
   */
  async update(id: string, updates: AccountUpdate): Promise<Account> {
    const { data, error } = await supabase
      .from('accounts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete an account
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Search accounts by name
   */
  async search(query: string, limit = 10): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('id, name, industry, phone, account_type')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get accounts by owner
   */
  async getByOwner(ownerId: string): Promise<Account[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('owner_id', ownerId)
      .order('name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Get account statistics
   */
  async getStatistics(): Promise<{
    total: number;
    prospects: number;
    customers: number;
    churned: number;
  }> {
    const { data, error } = await supabase
      .from('accounts')
      .select('account_type');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      prospects: 0,
      customers: 0,
      churned: 0,
    };

    data?.forEach((account) => {
      if (account.account_type === 'prospect') stats.prospects++;
      else if (account.account_type === 'customer') stats.customers++;
      else if (account.account_type === 'churned') stats.churned++;
    });

    return stats;
  },
};

export default accountsService;

