/**
 * E2E Tests: Lead to Deal Workflow
 * 
 * Tests the complete lifecycle: Lead → Opportunity → Won Deal
 * 
 * To run these tests:
 *   npx vitest run tests/e2e/lead-to-deal.spec.ts
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../src/frontend/src/lib/database.types';

// Test configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

// Test user credentials
const TEST_USER = {
  email: 'test.sales@aprilspestcontrol.com',
  password: 'TestPassword123!',
};

describe('Lead to Deal Workflow E2E', () => {
  let supabase: SupabaseClient<Database>;
  let adminSupabase: SupabaseClient<Database>;
  let testUserId: string;
  let testOrgId: string;
  let testLeadId: string;
  let testContactId: string;
  let testOpportunityId: string;

  beforeAll(async () => {
    // Initialize Supabase clients
    adminSupabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);

    // Get test organization
    const { data: orgs } = await adminSupabase
      .from('organizations')
      .select('id')
      .eq('name', "April's Pest Control")
      .limit(1);

    if (orgs && orgs.length > 0) {
      testOrgId = orgs[0].id;
    } else {
      // Create test organization if it doesn't exist
      const { data: newOrg, error } = await adminSupabase
        .from('organizations')
        .insert({
          name: "April's Pest Control",
          timezone: 'America/New_York',
          settings: { theme: 'light' },
        })
        .select()
        .single();

      if (error) throw error;
      testOrgId = newOrg.id;
    }

    // Sign in as test user or create one
    try {
      const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      if (signInError) {
        // Create test user
        const { data: newUser, error: signUpError } = await adminSupabase.auth.admin.createUser({
          email: TEST_USER.email,
          password: TEST_USER.password,
          email_confirm: true,
          user_metadata: {
            first_name: 'Test',
            last_name: 'Sales',
            org_id: testOrgId,
          },
        });

        if (signUpError) throw signUpError;
        
        // Sign in after creation
        const { data } = await supabase.auth.signInWithPassword({
          email: TEST_USER.email,
          password: TEST_USER.password,
        });
        
        testUserId = data.user?.id || '';
      } else {
        testUserId = authData.user?.id || '';
      }
    } catch (e: any) {
      console.log('Auth setup:', e.message);
    }
  });

  afterAll(async () => {
    // Cleanup test data
    if (testOpportunityId) {
      await adminSupabase.from('opportunities').delete().eq('id', testOpportunityId);
    }
    if (testContactId) {
      await adminSupabase.from('contacts').delete().eq('id', testContactId);
    }
    if (testLeadId) {
      await adminSupabase.from('leads').delete().eq('id', testLeadId);
    }

    // Sign out
    await supabase.auth.signOut();
  });

  describe('Lead Creation', () => {
    it('should create a new lead', async () => {
      const leadData = {
        org_id: testOrgId,
        first_name: 'John',
        last_name: 'Smith',
        email: `john.smith.${Date.now()}@example.com`,
        phone: '555-0123',
        company_name: 'ABC Corp',
        lead_source: 'website',
        lead_source_detail: 'Contact Form',
        status: 'new' as const,
        address_line1: '123 Main St',
        city: 'Tampa',
        state: 'FL',
        postal_code: '33601',
        property_type: 'commercial',
        property_size_sqft: 5000,
        pest_types: ['termites', 'ants'],
        urgency: 'high' as const,
        estimated_value: 2500,
        notes: 'E2E test lead - requires immediate attention',
      };

      const { data: lead, error } = await supabase
        .from('leads')
        .insert(leadData)
        .select()
        .single();

      if (error) {
        console.log('Lead creation error:', error);
      }

      expect(error).toBeNull();
      expect(lead).toBeDefined();
      expect(lead?.first_name).toBe('John');
      expect(lead?.last_name).toBe('Smith');
      expect(lead?.status).toBe('new');
      expect(lead?.lead_score).toBeDefined();

      testLeadId = lead!.id;
    });

    it('should calculate lead score automatically', async () => {
      const { data: lead } = await supabase
        .from('leads')
        .select('lead_score, score_factors')
        .eq('id', testLeadId)
        .single();

      expect(lead?.lead_score).toBeGreaterThan(0);
    });
  });

  describe('Lead Qualification', () => {
    it('should update lead to contacted status', async () => {
      const { data: lead, error } = await supabase
        .from('leads')
        .update({
          status: 'contacted',
          last_contacted_at: new Date().toISOString(),
          contact_attempts: 1,
        })
        .eq('id', testLeadId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(lead?.status).toBe('contacted');
      expect(lead?.contact_attempts).toBe(1);
    });

    it('should qualify lead after successful contact', async () => {
      const { data: lead, error } = await supabase
        .from('leads')
        .update({
          status: 'qualified',
          next_follow_up_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
        })
        .eq('id', testLeadId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(lead?.status).toBe('qualified');
    });
  });

  describe('Lead Conversion', () => {
    it('should create contact from lead', async () => {
      // Get lead data
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', testLeadId)
        .single();

      // Create contact
      const contactData = {
        org_id: testOrgId,
        first_name: lead!.first_name || 'Unknown',
        last_name: lead!.last_name || 'Unknown',
        email: lead!.email,
        phone: lead!.phone,
        job_title: lead!.job_title,
        address_line1: lead!.address_line1,
        city: lead!.city,
        state: lead!.state,
        postal_code: lead!.postal_code,
        lead_source: lead!.lead_source,
        is_primary: true,
        is_decision_maker: true,
      };

      const { data: contact, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(contact).toBeDefined();
      expect(contact?.first_name).toBe(lead?.first_name);

      testContactId = contact!.id;
    });

    it('should create opportunity from lead', async () => {
      const { data: lead } = await supabase
        .from('leads')
        .select('*')
        .eq('id', testLeadId)
        .single();

      const opportunityData = {
        org_id: testOrgId,
        lead_id: testLeadId,
        contact_id: testContactId,
        name: `${lead!.company_name || 'Unknown'} - Pest Control Service`,
        description: lead!.notes,
        stage: 'lead' as const,
        status: 'open' as const,
        amount: lead!.estimated_value || 0,
        probability: 10,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        owner_id: testUserId,
        service_type: 'pest_control',
        service_frequency: 'monthly',
        contract_length_months: 12,
        service_address_line1: lead!.address_line1,
        service_city: lead!.city,
        service_state: lead!.state,
        service_postal_code: lead!.postal_code,
        property_type: lead!.property_type,
        property_size_sqft: lead!.property_size_sqft,
        pest_types: lead!.pest_types,
        forecast_category: 'pipeline' as const,
      };

      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .insert(opportunityData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(opportunity).toBeDefined();
      expect(opportunity?.stage).toBe('lead');
      expect(opportunity?.probability).toBe(10);

      testOpportunityId = opportunity!.id;

      // Mark lead as converted
      await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_contact_id: testContactId,
          converted_opportunity_id: testOpportunityId,
          converted_at: new Date().toISOString(),
        })
        .eq('id', testLeadId);
    });
  });

  describe('Opportunity Progression', () => {
    it('should progress opportunity through inspection stages', async () => {
      // Stage: inspection_scheduled
      const { data: opp1, error: err1 } = await supabase
        .from('opportunities')
        .update({
          stage: 'inspection_scheduled',
          inspection_scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          next_step: 'Conduct on-site inspection',
        })
        .eq('id', testOpportunityId)
        .select()
        .single();

      expect(err1).toBeNull();
      expect(opp1?.stage).toBe('inspection_scheduled');
      expect(opp1?.probability).toBe(15);

      // Stage: inspection_completed
      const { data: opp2, error: err2 } = await supabase
        .from('opportunities')
        .update({
          stage: 'inspection_completed',
          inspection_completed_at: new Date().toISOString(),
          inspection_notes: 'Found evidence of termite activity. Recommended quarterly treatment.',
          next_step: 'Prepare and send quote',
        })
        .eq('id', testOpportunityId)
        .select()
        .single();

      expect(err2).toBeNull();
      expect(opp2?.stage).toBe('inspection_completed');
      expect(opp2?.probability).toBe(25);
    });

    it('should progress opportunity through quote stages', async () => {
      // Stage: quote_sent
      const { data: opp1, error: err1 } = await supabase
        .from('opportunities')
        .update({
          stage: 'quote_sent',
          amount: 2500,
          monthly_value: 250,
          annual_value: 3000,
          next_step: 'Follow up in 3 days',
        })
        .eq('id', testOpportunityId)
        .select()
        .single();

      expect(err1).toBeNull();
      expect(opp1?.stage).toBe('quote_sent');
      expect(opp1?.probability).toBe(50);

      // Stage: negotiation
      const { data: opp2, error: err2 } = await supabase
        .from('opportunities')
        .update({
          stage: 'negotiation',
          amount: 2200, // Customer requested discount
          next_step: 'Finalize contract terms',
        })
        .eq('id', testOpportunityId)
        .select()
        .single();

      expect(err2).toBeNull();
      expect(opp2?.stage).toBe('negotiation');
      expect(opp2?.probability).toBe(60);
    });

    it('should progress opportunity through commitment stages', async () => {
      // Stage: verbal_commitment
      const { data: opp1, error: err1 } = await supabase
        .from('opportunities')
        .update({
          stage: 'verbal_commitment',
          forecast_category: 'best_case',
          next_step: 'Send contract for signature',
        })
        .eq('id', testOpportunityId)
        .select()
        .single();

      expect(err1).toBeNull();
      expect(opp1?.stage).toBe('verbal_commitment');
      expect(opp1?.probability).toBe(75);

      // Stage: contract_sent
      const { data: opp2, error: err2 } = await supabase
        .from('opportunities')
        .update({
          stage: 'contract_sent',
          forecast_category: 'commit',
          next_step: 'Await signature',
        })
        .eq('id', testOpportunityId)
        .select()
        .single();

      expect(err2).toBeNull();
      expect(opp2?.stage).toBe('contract_sent');
      expect(opp2?.probability).toBe(90);
    });

    it('should close opportunity as won', async () => {
      const { data: opportunity, error } = await supabase
        .from('opportunities')
        .update({
          stage: 'closed_won',
          status: 'won',
          actual_close_date: new Date().toISOString(),
          close_reason: 'Contract signed, service scheduled to begin next week',
        })
        .eq('id', testOpportunityId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(opportunity?.stage).toBe('closed_won');
      expect(opportunity?.status).toBe('won');
      expect(opportunity?.probability).toBe(100);
      expect(opportunity?.actual_close_date).toBeDefined();
    });
  });

  describe('Activity Logging', () => {
    it('should log activities throughout the workflow', async () => {
      // Create a call activity
      const { data: activity, error } = await supabase
        .from('activities')
        .insert({
          org_id: testOrgId,
          activity_type: 'call',
          subject: 'Initial qualification call',
          description: 'Discussed pest issues and scheduled inspection',
          related_to_type: 'opportunity',
          related_to_id: testOpportunityId,
          activity_date: new Date().toISOString(),
          duration_minutes: 15,
          is_completed: true,
          completed_at: new Date().toISOString(),
          priority: 'normal',
          outcome: 'Inspection scheduled for next week',
          owner_id: testUserId,
          created_by: testUserId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(activity).toBeDefined();
      expect(activity?.activity_type).toBe('call');
    });

    it('should retrieve activity history for opportunity', async () => {
      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('related_to_id', testOpportunityId)
        .order('created_at', { ascending: false });

      expect(error).toBeNull();
      expect(activities).toBeDefined();
      expect(activities!.length).toBeGreaterThan(0);
    });
  });

  describe('Stage History Tracking', () => {
    it('should have recorded stage transitions', async () => {
      const { data: history, error } = await supabase
        .from('opportunity_stage_history')
        .select('*')
        .eq('opportunity_id', testOpportunityId)
        .order('created_at', { ascending: true });

      expect(error).toBeNull();
      expect(history).toBeDefined();
      
      // Should have at least transitions through the pipeline
      // lead → inspection_scheduled → inspection_completed → quote_sent → etc
      expect(history!.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('RLS Isolation', () => {
    it('should not allow access to other organization data', async () => {
      // Try to read opportunities from a non-existent org
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('org_id', '00000000-0000-0000-0000-000000000000');

      // Should return empty array, not error (RLS filters silently)
      expect(error).toBeNull();
      expect(data).toEqual([]);
    });
  });
});

describe('Lost Deal Workflow', () => {
  let supabase: SupabaseClient<Database>;
  let testOrgId: string;
  let testOpportunityId: string;

  beforeAll(async () => {
    supabase = createClient<Database>(SUPABASE_URL, SUPABASE_KEY);
    
    // Sign in
    await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    // Get test org
    const { data: orgs } = await supabase
      .from('organizations')
      .select('id')
      .eq('name', "April's Pest Control")
      .limit(1);

    testOrgId = orgs?.[0]?.id || '';
  });

  afterAll(async () => {
    if (testOpportunityId) {
      const adminSupabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY);
      await adminSupabase.from('opportunities').delete().eq('id', testOpportunityId);
    }
    await supabase.auth.signOut();
  });

  it('should handle opportunity lost flow', async () => {
    // Create an opportunity
    const { data: user } = await supabase.auth.getUser();
    
    const { data: opportunity, error } = await supabase
      .from('opportunities')
      .insert({
        org_id: testOrgId,
        name: 'Lost Deal Test',
        stage: 'quote_sent',
        status: 'open',
        amount: 1500,
        probability: 50,
        owner_id: user.user?.id || '',
        service_type: 'pest_control',
      })
      .select()
      .single();

    expect(error).toBeNull();
    testOpportunityId = opportunity!.id;

    // Mark as lost
    const { data: lostOpp, error: lostError } = await supabase
      .from('opportunities')
      .update({
        stage: 'closed_lost',
        status: 'lost',
        lost_reason: 'price_too_high',
        lost_to_competitor: 'Bug Busters Inc',
        actual_close_date: new Date().toISOString(),
      })
      .eq('id', testOpportunityId)
      .select()
      .single();

    expect(lostError).toBeNull();
    expect(lostOpp?.stage).toBe('closed_lost');
    expect(lostOpp?.status).toBe('lost');
    expect(lostOpp?.probability).toBe(0);
    expect(lostOpp?.lost_reason).toBe('price_too_high');
  });
});

