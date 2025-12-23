/**
 * Lead Conversion Service
 * 
 * Handles the workflow of converting a lead into an Account, Contact, and Opportunity.
 * This is a complex transaction that needs to be atomic.
 */

import { supabase } from '../lib/supabase';
import type { 
  Lead, 
  Account, 
  Contact, 
  Opportunity,
  AccountInsert,
  ContactInsert,
  OpportunityInsert,
} from '../lib/database.types';

export interface ConversionData {
  // Account information (can create new or use existing)
  createNewAccount: boolean;
  existingAccountId?: string;
  accountName?: string;
  accountIndustry?: string;
  accountPhone?: string;
  accountAddress?: {
    line1?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  
  // Contact information (pre-populated from lead)
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  isDecisionMaker?: boolean;
  
  // Opportunity information
  opportunityName: string;
  opportunityAmount: number;
  expectedCloseDate: string;
  serviceType?: string;
  serviceFrequency?: string;
  contractLengthMonths?: number;
  description?: string;
  nextStep?: string;
  nextStepDate?: string;
}

export interface ConversionResult {
  success: boolean;
  account?: Account;
  contact?: Contact;
  opportunity?: Opportunity;
  error?: string;
}

export const leadConversionService = {
  /**
   * Convert a lead to Account/Contact/Opportunity
   * 
   * This operation:
   * 1. Creates or uses existing Account
   * 2. Creates Contact linked to Account
   * 3. Creates Opportunity linked to Account and Contact
   * 4. Updates Lead with conversion info
   * 5. Logs the conversion event
   */
  async convertLead(leadId: string, data: ConversionData): Promise<ConversionResult> {
    try {
      // Get the lead first
      const { data: lead, error: leadError } = await supabase
        .from('leads')
        .select('*')
        .eq('id', leadId)
        .single();

      if (leadError || !lead) {
        return { success: false, error: 'Lead not found' };
      }

      // Check if lead is already converted
      if (lead.status === 'converted') {
        return { success: false, error: 'Lead has already been converted' };
      }

      // Get current user's profile
      const { data: userData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('users')
        .select('id, org_id')
        .eq('auth_user_id', userData.user?.id)
        .single();

      if (!profile) {
        return { success: false, error: 'User profile not found' };
      }

      let account: Account | null = null;
      let contact: Contact | null = null;
      let opportunity: Opportunity | null = null;

      // Step 1: Create or get Account
      if (data.createNewAccount) {
        const accountData: AccountInsert = {
          org_id: profile.org_id,
          name: data.accountName || lead.company_name || `${data.firstName} ${data.lastName}`,
          industry: data.accountIndustry,
          phone: data.accountPhone || lead.phone,
          address_line1: data.accountAddress?.line1 || lead.address_line1,
          city: data.accountAddress?.city || lead.city,
          state: data.accountAddress?.state || lead.state,
          postal_code: data.accountAddress?.postalCode || lead.postal_code,
          owner_id: profile.id,
          account_type: 'prospect',
          created_by: profile.id,
        };

        const { data: newAccount, error: accountError } = await supabase
          .from('accounts')
          .insert(accountData)
          .select()
          .single();

        if (accountError) {
          return { success: false, error: `Failed to create account: ${accountError.message}` };
        }

        account = newAccount;
      } else if (data.existingAccountId) {
        const { data: existingAccount, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('id', data.existingAccountId)
          .single();

        if (accountError) {
          return { success: false, error: `Failed to find account: ${accountError.message}` };
        }

        account = existingAccount;
      }

      // Step 2: Create Contact
      const contactData: ContactInsert = {
        org_id: profile.org_id,
        account_id: account?.id,
        first_name: data.firstName || lead.first_name || '',
        last_name: data.lastName || lead.last_name || '',
        email: data.email || lead.email,
        phone: data.phone || lead.phone,
        job_title: data.jobTitle || lead.job_title,
        is_decision_maker: data.isDecisionMaker ?? true,
        is_primary: true, // First contact from lead conversion is primary
        lead_source: lead.lead_source,
        address_line1: lead.address_line1,
        city: lead.city,
        state: lead.state,
        postal_code: lead.postal_code,
        owner_id: profile.id,
        created_by: profile.id,
      };

      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      if (contactError) {
        // Rollback account if we created it
        if (data.createNewAccount && account?.id) {
          await supabase.from('accounts').delete().eq('id', account.id);
        }
        return { success: false, error: `Failed to create contact: ${contactError.message}` };
      }

      contact = newContact;

      // Step 3: Create Opportunity
      const opportunityData: OpportunityInsert = {
        org_id: profile.org_id,
        account_id: account?.id,
        contact_id: contact.id,
        lead_id: leadId,
        name: data.opportunityName,
        description: data.description,
        stage: 'lead',
        status: 'open',
        amount: data.opportunityAmount,
        expected_close_date: data.expectedCloseDate,
        service_type: data.serviceType || lead.property_type,
        service_frequency: data.serviceFrequency,
        contract_length_months: data.contractLengthMonths,
        next_step: data.nextStep,
        next_step_date: data.nextStepDate,
        owner_id: profile.id,
        forecast_category: 'pipeline',
        created_by: profile.id,
      };

      const { data: newOpportunity, error: opportunityError } = await supabase
        .from('opportunities')
        .insert(opportunityData)
        .select()
        .single();

      if (opportunityError) {
        // Rollback contact and account
        await supabase.from('contacts').delete().eq('id', contact.id);
        if (data.createNewAccount && account?.id) {
          await supabase.from('accounts').delete().eq('id', account.id);
        }
        return { success: false, error: `Failed to create opportunity: ${opportunityError.message}` };
      }

      opportunity = newOpportunity;

      // Step 4: Update Lead as converted
      const { error: updateLeadError } = await supabase
        .from('leads')
        .update({
          status: 'converted',
          converted_contact_id: contact.id,
          converted_opportunity_id: opportunity.id,
          converted_at: new Date().toISOString(),
          converted_by: profile.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', leadId);

      if (updateLeadError) {
        // Rollback everything
        await supabase.from('opportunities').delete().eq('id', opportunity.id);
        await supabase.from('contacts').delete().eq('id', contact.id);
        if (data.createNewAccount && account?.id) {
          await supabase.from('accounts').delete().eq('id', account.id);
        }
        return { success: false, error: `Failed to update lead: ${updateLeadError.message}` };
      }

      // Step 5: Log the conversion event
      await supabase.from('event_log').insert({
        org_id: profile.org_id,
        user_id: profile.id,
        action: 'create',
        entity_type: 'lead_conversion',
        entity_id: leadId,
        new_values: {
          lead_id: leadId,
          account_id: account?.id,
          contact_id: contact.id,
          opportunity_id: opportunity.id,
          created_new_account: data.createNewAccount,
        },
      });

      // Step 6: Create initial activity on the opportunity
      await supabase.from('activities').insert({
        org_id: profile.org_id,
        activity_type: 'note',
        subject: 'Lead Converted',
        description: `Lead converted to opportunity. Original lead source: ${lead.lead_source}`,
        related_to_type: 'opportunity',
        related_to_id: opportunity.id,
        owner_id: profile.id,
        created_by: profile.id,
        is_completed: true,
        completed_at: new Date().toISOString(),
      });

      return {
        success: true,
        account: account || undefined,
        contact,
        opportunity,
      };

    } catch (error) {
      console.error('Lead conversion error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error during conversion' 
      };
    }
  },

  /**
   * Get conversion preview - shows what will be created
   */
  async getConversionPreview(leadId: string): Promise<{
    lead: Lead | null;
    suggestedAccountName: string;
    suggestedOpportunityName: string;
    estimatedValue: number;
  }> {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return {
        lead: null,
        suggestedAccountName: '',
        suggestedOpportunityName: '',
        estimatedValue: 0,
      };
    }

    const name = `${lead.first_name || ''} ${lead.last_name || ''}`.trim();
    const suggestedAccountName = lead.company_name || name || 'New Account';
    const suggestedOpportunityName = `${suggestedAccountName} - ${lead.property_type || 'Service'}`;

    return {
      lead,
      suggestedAccountName,
      suggestedOpportunityName,
      estimatedValue: lead.estimated_value || 0,
    };
  },

  /**
   * Check if lead can be converted
   */
  async canConvert(leadId: string): Promise<{
    canConvert: boolean;
    reason?: string;
  }> {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('status')
      .eq('id', leadId)
      .single();

    if (error || !lead) {
      return { canConvert: false, reason: 'Lead not found' };
    }

    if (lead.status === 'converted') {
      return { canConvert: false, reason: 'Lead has already been converted' };
    }

    if (lead.status === 'lost') {
      return { canConvert: false, reason: 'Cannot convert a lost lead' };
    }

    if (lead.status === 'unqualified') {
      return { canConvert: false, reason: 'Lead must be qualified before conversion' };
    }

    return { canConvert: true };
  },
};

export default leadConversionService;

