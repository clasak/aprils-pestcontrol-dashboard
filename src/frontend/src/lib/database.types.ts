/**
 * Database Types for Supabase
 * 
 * This file contains TypeScript types that match the database schema.
 * In production, this should be generated using:
 *   npx supabase gen types typescript --project-id <project-id> > src/lib/database.types.ts
 * 
 * For now, these are manually defined to match the CRM_DATA_MODEL.md specification.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          legal_name: string | null;
          logo_url: string | null;
          timezone: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          legal_name?: string | null;
          logo_url?: string | null;
          timezone?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          legal_name?: string | null;
          logo_url?: string | null;
          timezone?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      users: {
        Row: {
          id: string;
          org_id: string;
          auth_user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          avatar_url: string | null;
          status: 'active' | 'suspended' | 'deactivated';
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          auth_user_id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          status?: 'active' | 'suspended' | 'deactivated';
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          auth_user_id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          status?: 'active' | 'suspended' | 'deactivated';
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          display_name: string;
          is_system_role: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          display_name: string;
          is_system_role?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          display_name?: string;
          is_system_role?: boolean;
          created_at?: string;
        };
      };
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          created_at?: string;
        };
      };
      accounts: {
        Row: {
          id: string;
          org_id: string;
          name: string;
          industry: string | null;
          website: string | null;
          phone: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string;
          owner_id: string | null;
          annual_revenue: number | null;
          employee_count: number | null;
          account_type: 'prospect' | 'customer' | 'churned';
          last_activity_at: string | null;
          tags: string[] | null;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          name: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          owner_id?: string | null;
          annual_revenue?: number | null;
          employee_count?: number | null;
          account_type?: 'prospect' | 'customer' | 'churned';
          last_activity_at?: string | null;
          tags?: string[] | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          name?: string;
          industry?: string | null;
          website?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          owner_id?: string | null;
          annual_revenue?: number | null;
          employee_count?: number | null;
          account_type?: 'prospect' | 'customer' | 'churned';
          last_activity_at?: string | null;
          tags?: string[] | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      contacts: {
        Row: {
          id: string;
          org_id: string;
          account_id: string | null;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          mobile: string | null;
          job_title: string | null;
          department: string | null;
          is_primary: boolean;
          is_decision_maker: boolean;
          address_line1: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          owner_id: string | null;
          lead_source: string | null;
          last_activity_at: string | null;
          do_not_call: boolean;
          do_not_email: boolean;
          tags: string[] | null;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          account_id?: string | null;
          first_name: string;
          last_name: string;
          email?: string | null;
          phone?: string | null;
          mobile?: string | null;
          job_title?: string | null;
          department?: string | null;
          is_primary?: boolean;
          is_decision_maker?: boolean;
          address_line1?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          owner_id?: string | null;
          lead_source?: string | null;
          last_activity_at?: string | null;
          do_not_call?: boolean;
          do_not_email?: boolean;
          tags?: string[] | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          account_id?: string | null;
          first_name?: string;
          last_name?: string;
          email?: string | null;
          phone?: string | null;
          mobile?: string | null;
          job_title?: string | null;
          department?: string | null;
          is_primary?: boolean;
          is_decision_maker?: boolean;
          address_line1?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          owner_id?: string | null;
          lead_source?: string | null;
          last_activity_at?: string | null;
          do_not_call?: boolean;
          do_not_email?: boolean;
          tags?: string[] | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      leads: {
        Row: {
          id: string;
          org_id: string;
          first_name: string | null;
          last_name: string | null;
          email: string | null;
          phone: string | null;
          company_name: string | null;
          job_title: string | null;
          lead_source: string;
          lead_source_detail: string | null;
          status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurturing' | 'converted' | 'lost';
          lead_score: number;
          score_factors: Json;
          assigned_to: string | null;
          assigned_at: string | null;
          address_line1: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          property_type: string | null;
          property_size_sqft: number | null;
          pest_types: string[] | null;
          urgency: 'low' | 'normal' | 'high' | 'urgent';
          estimated_value: number | null;
          next_follow_up_date: string | null;
          last_contacted_at: string | null;
          contact_attempts: number;
          converted_contact_id: string | null;
          converted_opportunity_id: string | null;
          converted_at: string | null;
          converted_by: string | null;
          lost_reason: string | null;
          lost_at: string | null;
          notes: string | null;
          tags: string[] | null;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          lead_source: string;
          lead_source_detail?: string | null;
          status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurturing' | 'converted' | 'lost';
          lead_score?: number;
          score_factors?: Json;
          assigned_to?: string | null;
          assigned_at?: string | null;
          address_line1?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          property_type?: string | null;
          property_size_sqft?: number | null;
          pest_types?: string[] | null;
          urgency?: 'low' | 'normal' | 'high' | 'urgent';
          estimated_value?: number | null;
          next_follow_up_date?: string | null;
          last_contacted_at?: string | null;
          contact_attempts?: number;
          converted_contact_id?: string | null;
          converted_opportunity_id?: string | null;
          converted_at?: string | null;
          converted_by?: string | null;
          lost_reason?: string | null;
          lost_at?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          email?: string | null;
          phone?: string | null;
          company_name?: string | null;
          job_title?: string | null;
          lead_source?: string;
          lead_source_detail?: string | null;
          status?: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurturing' | 'converted' | 'lost';
          lead_score?: number;
          score_factors?: Json;
          assigned_to?: string | null;
          assigned_at?: string | null;
          address_line1?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          property_type?: string | null;
          property_size_sqft?: number | null;
          pest_types?: string[] | null;
          urgency?: 'low' | 'normal' | 'high' | 'urgent';
          estimated_value?: number | null;
          next_follow_up_date?: string | null;
          last_contacted_at?: string | null;
          contact_attempts?: number;
          converted_contact_id?: string | null;
          converted_opportunity_id?: string | null;
          converted_at?: string | null;
          converted_by?: string | null;
          lost_reason?: string | null;
          lost_at?: string | null;
          notes?: string | null;
          tags?: string[] | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      opportunities: {
        Row: {
          id: string;
          org_id: string;
          account_id: string | null;
          contact_id: string | null;
          lead_id: string | null;
          name: string;
          description: string | null;
          stage: 'lead' | 'qualified' | 'quote_sent' | 'negotiation' | 'verbal_commitment' | 'closed_won' | 'closed_lost';
          status: 'open' | 'won' | 'lost';
          amount: number;
          probability: number;
          weighted_amount: number | null;
          expected_close_date: string | null;
          actual_close_date: string | null;
          next_step: string | null;
          next_step_date: string | null;
          owner_id: string;
          service_type: string | null;
          service_frequency: string | null;
          contract_length_months: number | null;
          competitor: string | null;
          close_reason: string | null;
          lost_reason: string | null;
          lost_to_competitor: string | null;
          forecast_category: 'commit' | 'best_case' | 'pipeline';
          stage_entered_at: string;
          last_activity_at: string | null;
          activity_count: number;
          tags: string[] | null;
          custom_fields: Json;
          created_at: string;
          updated_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          org_id: string;
          account_id?: string | null;
          contact_id?: string | null;
          lead_id?: string | null;
          name: string;
          description?: string | null;
          stage?: 'lead' | 'qualified' | 'quote_sent' | 'negotiation' | 'verbal_commitment' | 'closed_won' | 'closed_lost';
          status?: 'open' | 'won' | 'lost';
          amount?: number;
          probability?: number;
          expected_close_date?: string | null;
          actual_close_date?: string | null;
          next_step?: string | null;
          next_step_date?: string | null;
          owner_id: string;
          service_type?: string | null;
          service_frequency?: string | null;
          contract_length_months?: number | null;
          competitor?: string | null;
          close_reason?: string | null;
          lost_reason?: string | null;
          lost_to_competitor?: string | null;
          forecast_category?: 'commit' | 'best_case' | 'pipeline';
          stage_entered_at?: string;
          last_activity_at?: string | null;
          activity_count?: number;
          tags?: string[] | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          org_id?: string;
          account_id?: string | null;
          contact_id?: string | null;
          lead_id?: string | null;
          name?: string;
          description?: string | null;
          stage?: 'lead' | 'qualified' | 'quote_sent' | 'negotiation' | 'verbal_commitment' | 'closed_won' | 'closed_lost';
          status?: 'open' | 'won' | 'lost';
          amount?: number;
          probability?: number;
          expected_close_date?: string | null;
          actual_close_date?: string | null;
          next_step?: string | null;
          next_step_date?: string | null;
          owner_id?: string;
          service_type?: string | null;
          service_frequency?: string | null;
          contract_length_months?: number | null;
          competitor?: string | null;
          close_reason?: string | null;
          lost_reason?: string | null;
          lost_to_competitor?: string | null;
          forecast_category?: 'commit' | 'best_case' | 'pipeline';
          stage_entered_at?: string;
          last_activity_at?: string | null;
          activity_count?: number;
          tags?: string[] | null;
          custom_fields?: Json;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
        };
      };
      opportunity_stage_history: {
        Row: {
          id: string;
          opportunity_id: string;
          from_stage: string | null;
          to_stage: string;
          changed_by: string | null;
          time_in_stage_seconds: number | null;
          change_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          opportunity_id: string;
          from_stage?: string | null;
          to_stage: string;
          changed_by?: string | null;
          time_in_stage_seconds?: number | null;
          change_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          opportunity_id?: string;
          from_stage?: string | null;
          to_stage?: string;
          changed_by?: string | null;
          time_in_stage_seconds?: number | null;
          change_reason?: string | null;
          created_at?: string;
        };
      };
      activities: {
        Row: {
          id: string;
          org_id: string;
          activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note';
          subject: string;
          description: string | null;
          related_to_type: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id: string;
          activity_date: string;
          duration_minutes: number | null;
          due_date: string | null;
          is_completed: boolean;
          completed_at: string | null;
          priority: 'low' | 'normal' | 'high' | 'urgent';
          outcome: string | null;
          owner_id: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          activity_type: 'call' | 'email' | 'meeting' | 'task' | 'note';
          subject: string;
          description?: string | null;
          related_to_type: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id: string;
          activity_date?: string;
          duration_minutes?: number | null;
          due_date?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          outcome?: string | null;
          owner_id: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          activity_type?: 'call' | 'email' | 'meeting' | 'task' | 'note';
          subject?: string;
          description?: string | null;
          related_to_type?: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id?: string;
          activity_date?: string;
          duration_minutes?: number | null;
          due_date?: string | null;
          is_completed?: boolean;
          completed_at?: string | null;
          priority?: 'low' | 'normal' | 'high' | 'urgent';
          outcome?: string | null;
          owner_id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          org_id: string;
          related_to_type: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id: string;
          content: string;
          is_pinned: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          related_to_type: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id: string;
          content: string;
          is_pinned?: boolean;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          related_to_type?: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id?: string;
          content?: string;
          is_pinned?: boolean;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      attachments: {
        Row: {
          id: string;
          org_id: string;
          related_to_type: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id: string;
          file_name: string;
          file_path: string;
          file_size_bytes: number | null;
          content_type: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          related_to_type: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id: string;
          file_name: string;
          file_path: string;
          file_size_bytes?: number | null;
          content_type?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          related_to_type?: 'account' | 'contact' | 'lead' | 'opportunity';
          related_to_id?: string;
          file_name?: string;
          file_path?: string;
          file_size_bytes?: number | null;
          content_type?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      event_log: {
        Row: {
          id: string;
          org_id: string;
          user_id: string | null;
          action: 'create' | 'update' | 'delete';
          entity_type: string;
          entity_id: string;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id?: string | null;
          action: 'create' | 'update' | 'delete';
          entity_type: string;
          entity_id: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string | null;
          action?: 'create' | 'update' | 'delete';
          entity_type?: string;
          entity_id?: string;
          old_values?: Json | null;
          new_values?: Json | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          org_id: string;
          user_id: string;
          title: string;
          message: string;
          type: 'info' | 'warning' | 'error' | 'success';
          related_to_type: string | null;
          related_to_id: string | null;
          is_read: boolean;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id: string;
          title: string;
          message: string;
          type?: 'info' | 'warning' | 'error' | 'success';
          related_to_type?: string | null;
          related_to_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: 'info' | 'warning' | 'error' | 'success';
          related_to_type?: string | null;
          related_to_id?: string | null;
          is_read?: boolean;
          read_at?: string | null;
          created_at?: string;
        };
      };
      forecast_snapshots: {
        Row: {
          id: string;
          org_id: string;
          user_id: string | null;
          snapshot_date: string;
          period_start: string;
          period_end: string;
          commit_amount: number;
          best_case_amount: number;
          pipeline_amount: number;
          quota: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          org_id: string;
          user_id?: string | null;
          snapshot_date: string;
          period_start: string;
          period_end: string;
          commit_amount?: number;
          best_case_amount?: number;
          pipeline_amount?: number;
          quota?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          org_id?: string;
          user_id?: string | null;
          snapshot_date?: string;
          period_start?: string;
          period_end?: string;
          commit_amount?: number;
          best_case_amount?: number;
          pipeline_amount?: number;
          quota?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_org_id: {
        Args: { auth_uid: string };
        Returns: string;
      };
      get_user_id: {
        Args: { auth_uid: string };
        Returns: string;
      };
      has_role: {
        Args: { auth_uid: string; role_name: string };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Convenience types for common use
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type User = Database['public']['Tables']['users']['Row'];
export type Role = Database['public']['Tables']['roles']['Row'];
export type Account = Database['public']['Tables']['accounts']['Row'];
export type Contact = Database['public']['Tables']['contacts']['Row'];
export type Lead = Database['public']['Tables']['leads']['Row'];
export type Opportunity = Database['public']['Tables']['opportunities']['Row'];
export type Activity = Database['public']['Tables']['activities']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];
export type Attachment = Database['public']['Tables']['attachments']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type ForecastSnapshot = Database['public']['Tables']['forecast_snapshots']['Row'];

// Insert types
export type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type AccountInsert = Database['public']['Tables']['accounts']['Insert'];
export type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert'];
export type ActivityInsert = Database['public']['Tables']['activities']['Insert'];

// Update types
export type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
export type AccountUpdate = Database['public']['Tables']['accounts']['Update'];
export type ContactUpdate = Database['public']['Tables']['contacts']['Update'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];
export type OpportunityUpdate = Database['public']['Tables']['opportunities']['Update'];
export type ActivityUpdate = Database['public']['Tables']['activities']['Update'];

// Stage types
export type OpportunityStage = 'lead' | 'qualified' | 'quote_sent' | 'negotiation' | 'verbal_commitment' | 'closed_won' | 'closed_lost';
export type OpportunityStatus = 'open' | 'won' | 'lost';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurturing' | 'converted' | 'lost';
export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note';
export type ForecastCategory = 'commit' | 'best_case' | 'pipeline';

