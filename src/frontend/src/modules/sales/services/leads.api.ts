import apiService from '@shared/services/api';
import { Contact } from './contacts.api';
import { mockLeadsApi } from '../mocks/mockSalesApi';

// Flag to use mock data (set to true during development without backend)
const USE_MOCK_DATA = true;

export interface Lead {
  id: string;
  companyId: string;
  contactId: string;
  contact: Contact;
  title: string;
  description?: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified' | 'nurturing' | 'converted' | 'lost';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  leadSource: string;
  leadSourceCategory: 'organic' | 'paid' | 'referral' | 'partner' | 'direct' | 'other';
  campaignId?: string;
  referralSource?: string;
  leadScore: number;
  scoreFactors: Record<string, any>;
  assignedTo?: string;
  assignedAt?: string;
  serviceType?: string;
  pestTypes?: string[];
  severityLevel?: string;
  propertyType?: string;
  propertySizeSqft?: number;
  estimatedValueCents?: number;
  expectedCloseDate?: string;
  urgency?: string;
  firstContactDate?: string;
  lastContactDate?: string;
  contactAttempts: number;
  nextFollowUpDate?: string;
  isQualified: boolean;
  qualificationNotes?: string;
  disqualificationReason?: string;
  convertedToDealId?: string;
  convertedAt?: string;
  lostReason?: string;
  lostAt?: string;
  notes?: string;
  tags?: string[];
  customFields: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LeadsListResponse {
  success: boolean;
  data: Lead[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LeadResponse {
  success: boolean;
  data: Lead;
  message?: string;
}

export interface LeadStatistics {
  success: boolean;
  data: {
    total: number;
    newLeads: number;
    qualified: number;
    converted: number;
    conversionRate: number;
    averageScore: number;
    byStatus: {
      new: number;
      contacted: number;
      qualified: number;
      nurturing: number;
      converted: number;
      lost: number;
    };
  };
}

export interface CreateLeadDto {
  companyId: string;
  contactId: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  leadSource: string;
  leadSourceCategory?: string;
  campaignId?: string;
  referralSource?: string;
  leadScore?: number;
  assignedTo?: string;
  serviceType?: string;
  pestTypes?: string[];
  severityLevel?: string;
  propertyType?: string;
  propertySizeSqft?: number;
  estimatedValueCents?: number;
  expectedCloseDate?: string;
  urgency?: string;
  nextFollowUpDate?: string;
  isQualified?: boolean;
  qualificationNotes?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateLeadDto extends Partial<CreateLeadDto> {}

export interface LeadsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  assignedTo?: string;
  priority?: string;
  minScore?: number;
  maxScore?: number;
  fromDate?: string;
  toDate?: string;
}

class LeadsApi {
  private baseUrl = '/sales/leads';

  async getAll(params?: LeadsQueryParams): Promise<LeadsListResponse> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.getAll(params);
    }
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiService.get<LeadsListResponse>(`${this.baseUrl}${queryString}`);
  }

  async getById(id: string): Promise<LeadResponse> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.getById(id);
    }
    return apiService.get<LeadResponse>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateLeadDto): Promise<LeadResponse> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.create(data as Partial<Lead>);
    }
    return apiService.post<LeadResponse>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateLeadDto): Promise<LeadResponse> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.update(id, data as Partial<Lead>);
    }
    return apiService.put<LeadResponse>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.delete(id);
    }
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async assign(id: string, assignedTo: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.assign(id, assignedTo);
    }
    return apiService.post(`${this.baseUrl}/${id}/assign`, { assignedTo });
  }

  async qualify(
    id: string,
    isQualified: boolean,
    notes?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.qualify(id, isQualified, notes);
    }
    return apiService.post(`${this.baseUrl}/${id}/qualify`, { isQualified, notes });
  }

  async convertToDeal(id: string, dealId: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.convertToDeal(id, dealId);
    }
    return apiService.post(`${this.baseUrl}/${id}/convert`, { dealId });
  }

  async markAsLost(id: string, reason: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.markAsLost(id, reason);
    }
    return apiService.post(`${this.baseUrl}/${id}/mark-lost`, { reason });
  }

  async getStatistics(): Promise<LeadStatistics> {
    if (USE_MOCK_DATA) {
      return mockLeadsApi.getStatistics();
    }
    return apiService.get(`${this.baseUrl}/statistics`);
  }
}

export const leadsApi = new LeadsApi();
export default leadsApi;
