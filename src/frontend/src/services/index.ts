/**
 * Services Index
 * 
 * Export all Supabase-based services.
 */

export { accountsService } from './accounts.service';
export { contactsService } from './contacts.service';
export { leadsService } from './leads.service';
export { opportunitiesService } from './opportunities.service';
export { activitiesService } from './activities.service';
export { leadConversionService } from './leadConversion.service';

// Re-export types
export type { AccountFilters, AccountsResponse } from './accounts.service';
export type { ContactFilters, ContactsResponse } from './contacts.service';
export type { LeadFilters, LeadsResponse, LeadStatistics } from './leads.service';
export type { 
  OpportunityFilters, 
  OpportunitiesResponse, 
  PipelineSummary, 
  OpportunityStatistics 
} from './opportunities.service';
export type { ActivityFilters, ActivitiesResponse, ActivityStatistics } from './activities.service';
export type { ConversionData, ConversionResult } from './leadConversion.service';

