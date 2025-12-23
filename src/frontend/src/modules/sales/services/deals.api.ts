import apiService from '@shared/services/api';
import { Contact } from './contacts.api';
import { mockDealsApi } from '../mocks/mockSalesApi';

// Flag to use mock data (set to true during development without backend)
const USE_MOCK_DATA = true;

export interface Deal {
  id: string;
  companyId: string;
  contactId: string;
  contact: Contact;
  leadId?: string;
  title: string;
  description?: string;
  status: 'open' | 'won' | 'lost' | 'cancelled';
  stage:
    | 'lead'
    | 'inspection_scheduled'
    | 'inspection_completed'
    | 'quote_sent'
    | 'negotiation'
    | 'verbal_commitment'
    | 'contract_sent'
    | 'closed_won'
    | 'closed_lost';
  dealValueCents: number;
  recurringRevenueCents?: number;
  serviceFrequency?:
    | 'one_time'
    | 'weekly'
    | 'bi_weekly'
    | 'monthly'
    | 'bi_monthly'
    | 'quarterly'
    | 'semi_annual'
    | 'annual'
    | 'custom';
  contractLengthMonths?: number;
  lifetimeValueCents?: number;
  winProbability: number;
  weightedValueCents: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  assignedTo?: string;
  salesRepId?: string;
  salesTeamId?: string;
  serviceType?: string;
  pestTypes?: string[];
  propertyType?: string;
  propertySizeSqft?: number;
  serviceAddressLine1?: string;
  serviceAddressLine2?: string;
  serviceCity?: string;
  serviceState?: string;
  servicePostalCode?: string;
  competitors?: string[];
  competitiveAdvantage?: string;
  currentProvider?: string;
  quoteId?: string;
  quoteSentAt?: string;
  quoteViewedAt?: string;
  quoteAcceptedAt?: string;
  lastActivityDate?: string;
  nextFollowUpDate?: string;
  daysInPipeline: number;
  stageDurationDays: number;
  wonReason?: string;
  lostReason?: string;
  lostToCompetitor?: string;
  notes?: string;
  tags?: string[];
  customFields: Record<string, any>;
  metadata?: Record<string, any>;
  stageHistory: Array<{
    stage: string;
    enteredAt: string;
    exitedAt?: string;
    durationDays?: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface DealsListResponse {
  success: boolean;
  data: Deal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DealResponse {
  success: boolean;
  data: Deal;
  message?: string;
}

export interface PipelineViewResponse {
  success: boolean;
  data: {
    pipeline: Record<string, Deal[]>;
    summary: {
      totalDeals: number;
      totalValue: number;
      totalWeightedValue: number;
      stageValues: Record<string, number>;
      stageCounts: Record<string, number>;
    };
  };
}

export interface ForecastResponse {
  success: boolean;
  data: {
    summary: {
      totalDeals: number;
      totalValue: number;
      weightedValue: number;
    };
    monthlyForecast: Record<
      string,
      {
        dealCount: number;
        totalValue: number;
        weightedValue: number;
      }
    >;
  };
}

export interface DealStatistics {
  success: boolean;
  data: {
    total: number;
    open: number;
    won: number;
    lost: number;
    winRate: number;
    totalValue: number;
    avgDealSize: number;
  };
}

export interface CreateDealDto {
  companyId: string;
  contactId: string;
  leadId?: string;
  title: string;
  description?: string;
  status?: string;
  stage?: string;
  dealValueCents: number;
  recurringRevenueCents?: number;
  serviceFrequency?: string;
  contractLengthMonths?: number;
  winProbability?: number;
  expectedCloseDate?: string;
  assignedTo?: string;
  salesRepId?: string;
  serviceType?: string;
  pestTypes?: string[];
  propertyType?: string;
  propertySizeSqft?: number;
  serviceAddressLine1?: string;
  serviceAddressLine2?: string;
  serviceCity?: string;
  serviceState?: string;
  servicePostalCode?: string;
  competitors?: string[];
  competitiveAdvantage?: string;
  currentProvider?: string;
  nextFollowUpDate?: string;
  notes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateDealDto extends Partial<CreateDealDto> {}

export interface DealsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  stage?: string;
  assignedTo?: string;
  salesRepId?: string;
  minValue?: number;
  maxValue?: number;
  fromDate?: string;
  toDate?: string;
}

class DealsApi {
  private baseUrl = '/sales/deals';

  async getAll(params?: DealsQueryParams): Promise<DealsListResponse> {
    if (USE_MOCK_DATA) {
      return mockDealsApi.getAll(params);
    }
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiService.get<DealsListResponse>(`${this.baseUrl}${queryString}`);
  }

  async getById(id: string): Promise<DealResponse> {
    if (USE_MOCK_DATA) {
      return mockDealsApi.getById(id);
    }
    return apiService.get<DealResponse>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateDealDto): Promise<DealResponse> {
    if (USE_MOCK_DATA) {
      return mockDealsApi.create(data as Partial<Deal>);
    }
    return apiService.post<DealResponse>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateDealDto): Promise<DealResponse> {
    if (USE_MOCK_DATA) {
      return mockDealsApi.update(id, data as Partial<Deal>);
    }
    return apiService.put<DealResponse>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      return mockDealsApi.delete(id);
    }
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async moveToStage(id: string, stage: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      const result = await mockDealsApi.moveToStage(id, stage);
      return { success: result.success, message: result.message || 'Stage updated' };
    }
    return apiService.post(`${this.baseUrl}/${id}/move-stage`, { stage });
  }

  async markAsWon(id: string, wonReason?: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      const result = await mockDealsApi.markAsWon(id, wonReason);
      return { success: result.success, message: result.message || 'Deal marked as won' };
    }
    return apiService.post(`${this.baseUrl}/${id}/mark-won`, { wonReason });
  }

  async markAsLost(
    id: string,
    lostReason: string,
    lostToCompetitor?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      const result = await mockDealsApi.markAsLost(id, lostReason, lostToCompetitor);
      return { success: result.success, message: result.message || 'Deal marked as lost' };
    }
    return apiService.post(`${this.baseUrl}/${id}/mark-lost`, { lostReason, lostToCompetitor });
  }

  async getPipelineView(): Promise<PipelineViewResponse> {
    if (USE_MOCK_DATA) {
      return mockDealsApi.getPipelineView();
    }
    return apiService.get(`${this.baseUrl}/pipeline`);
  }

  async getForecast(): Promise<ForecastResponse> {
    if (USE_MOCK_DATA) {
      return mockDealsApi.getForecast();
    }
    return apiService.get(`${this.baseUrl}/forecast`);
  }

  async getStatistics(): Promise<DealStatistics> {
    if (USE_MOCK_DATA) {
      return mockDealsApi.getStatistics();
    }
    return apiService.get(`${this.baseUrl}/statistics`);
  }
}

export const dealsApi = new DealsApi();
export default dealsApi;
