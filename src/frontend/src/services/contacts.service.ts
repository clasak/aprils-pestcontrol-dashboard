/**
 * Contacts Service
 * 
 * Supabase-based service for managing contacts.
 */

import { supabase } from '../lib/supabase';
import type { Contact, ContactInsert, ContactUpdate } from '../lib/database.types';

export interface ContactFilters {
  search?: string;
  accountId?: string;
  ownerId?: string;
  isPrimary?: boolean;
  isDecisionMaker?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface ContactsResponse {
  data: Contact[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const contactsService = {
  /**
   * Get all contacts with optional filtering
   */
  async getAll(filters?: ContactFilters): Promise<ContactsResponse> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 25;
    const offset = (page - 1) * limit;

    let query = supabase
      .from('contacts')
      .select(`
        *,
        account:accounts(id, name),
        owner:users!contacts_owner_id_fkey(id, first_name, last_name)
      `, { count: 'exact' });

    // Apply filters
    if (filters?.search) {
      query = query.or(
        `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
      );
    }

    if (filters?.accountId) {
      query = query.eq('account_id', filters.accountId);
    }

    if (filters?.ownerId) {
      query = query.eq('owner_id', filters.ownerId);
    }

    if (filters?.isPrimary !== undefined) {
      query = query.eq('is_primary', filters.isPrimary);
    }

    if (filters?.isDecisionMaker !== undefined) {
      query = query.eq('is_decision_maker', filters.isDecisionMaker);
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
   * Get a single contact by ID
   */
  async getById(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select(`
        *,
        account:accounts(id, name, industry, phone),
        owner:users!contacts_owner_id_fkey(id, first_name, last_name, email),
        activities(id, activity_type, subject, activity_date, is_completed),
        opportunities(id, name, stage, status, amount)
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
   * Create a new contact
   */
  async create(contact: ContactInsert): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Update an existing contact
   */
  async update(id: string, updates: ContactUpdate): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Delete a contact
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Search contacts
   */
  async search(query: string, limit = 10): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('id, first_name, last_name, email, phone, job_title, account:accounts(id, name)')
      .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  /**
   * Get contacts by account
   */
  async getByAccount(accountId: string): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('account_id', accountId)
      .order('is_primary', { ascending: false })
      .order('last_name');

    if (error) throw error;
    return data || [];
  },

  /**
   * Set primary contact for an account
   */
  async setPrimary(contactId: string, accountId: string): Promise<void> {
    // First, unset any existing primary contact
    await supabase
      .from('contacts')
      .update({ is_primary: false })
      .eq('account_id', accountId)
      .eq('is_primary', true);

    // Set the new primary contact
    const { error } = await supabase
      .from('contacts')
      .update({ is_primary: true })
      .eq('id', contactId);

    if (error) throw error;
  },

  /**
   * Get contact statistics
   */
  async getStatistics(): Promise<{
    total: number;
    withEmail: number;
    withPhone: number;
    decisionMakers: number;
  }> {
    const { data, error } = await supabase
      .from('contacts')
      .select('email, phone, is_decision_maker');

    if (error) throw error;

    const stats = {
      total: data?.length || 0,
      withEmail: 0,
      withPhone: 0,
      decisionMakers: 0,
    };

    data?.forEach((contact) => {
      if (contact.email) stats.withEmail++;
      if (contact.phone) stats.withPhone++;
      if (contact.is_decision_maker) stats.decisionMakers++;
    });

    return stats;
  },
};

export default contactsService;

