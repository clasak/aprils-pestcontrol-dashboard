import apiService from '@shared/services/api';
import { Contact } from './contacts.api';

// Flag to use mock data (set to true during development without backend)
const USE_MOCK_DATA = true;

export type QuoteStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'approved' 
  | 'sent' 
  | 'viewed' 
  | 'accepted' 
  | 'rejected' 
  | 'expired' 
  | 'revised';

export type ServiceFrequency = 
  | 'one_time' 
  | 'weekly' 
  | 'bi_weekly' 
  | 'monthly' 
  | 'bi_monthly' 
  | 'quarterly' 
  | 'semi_annual' 
  | 'annual' 
  | 'custom';

export interface QuoteLineItem {
  id: string;
  lineNumber: number;
  serviceTypeId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  discountAmount?: number;
  discountPercent?: number;
  subtotal: number;
  totalAmount: number;
  isTaxable: boolean;
  taxRate?: number;
  taxAmount?: number;
  frequency?: ServiceFrequency;
  isOptional: boolean;
  isSelected: boolean;
}

export interface Quote {
  id: string;
  companyId: string;
  quoteNumber: string;
  version: number;
  dealId?: string;
  contactId: string;
  contact?: Contact;
  salesCompanyId?: string;
  name?: string;
  description?: string;
  status: QuoteStatus;
  statusChangedAt?: string;
  validFrom?: string;
  validUntil?: string;
  serviceAddressLine1?: string;
  serviceAddressLine2?: string;
  serviceCity?: string;
  serviceState?: string;
  servicePostalCode?: string;
  serviceFrequency?: ServiceFrequency;
  contractLengthMonths?: number;
  estimatedStartDate?: string;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  monthlyAmount?: number;
  annualAmount?: number;
  setupFee: number;
  currency: string;
  termsAndConditions?: string;
  paymentTerms: string;
  warrantyTerms?: string;
  requiresApproval: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  signatureRequired: boolean;
  signedAt?: string;
  signedByName?: string;
  signedByEmail?: string;
  signatureData?: string;
  ownerId?: string;
  preparedBy?: string;
  sentAt?: string;
  sentToEmail?: string;
  viewedAt?: string;
  viewedCount: number;
  previousVersionId?: string;
  revisionNotes?: string;
  pdfUrl?: string;
  pdfGeneratedAt?: string;
  internalNotes?: string;
  customerNotes?: string;
  tags?: string[];
  customFields: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface QuotesListResponse {
  success: boolean;
  data: Quote[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QuoteResponse {
  success: boolean;
  data: Quote;
  message?: string;
}

export interface QuoteStatistics {
  success: boolean;
  data: {
    byStatus: Array<{
      status: QuoteStatus;
      count: string;
      totalValue: string;
    }>;
    last30Days: {
      totalQuotes: string;
      acceptedCount: string;
      rejectedCount: string;
      acceptedValue: string;
    };
  };
}

export interface CreateQuoteDto {
  quoteNumber?: string;
  dealId?: string;
  contactId: string;
  name?: string;
  description?: string;
  status?: QuoteStatus;
  validFrom?: string;
  validUntil?: string;
  serviceAddressLine1?: string;
  serviceAddressLine2?: string;
  serviceCity?: string;
  serviceState?: string;
  servicePostalCode?: string;
  serviceFrequency?: ServiceFrequency;
  contractLengthMonths?: number;
  estimatedStartDate?: string;
  lineItems: Omit<QuoteLineItem, 'lineNumber'>[];
  subtotal: number;
  discountAmount?: number;
  discountPercent?: number;
  discountType?: 'percentage' | 'fixed';
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  monthlyAmount?: number;
  annualAmount?: number;
  setupFee?: number;
  termsAndConditions?: string;
  paymentTerms?: string;
  warrantyTerms?: string;
  internalNotes?: string;
  customerNotes?: string;
  tags?: string[];
  customFields?: Record<string, any>;
}

export interface UpdateQuoteDto extends Partial<CreateQuoteDto> {
  revisionNotes?: string;
}

export interface SendQuoteDto {
  recipientEmail: string;
  ccEmails?: string[];
  subject?: string;
  message?: string;
  includePdf?: boolean;
}

export interface AcceptQuoteDto {
  signedByName: string;
  signedByEmail: string;
  signatureData?: string;
}

export interface RejectQuoteDto {
  rejectionReason?: string;
}

export interface QuotesQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuoteStatus;
  contactId?: string;
  dealId?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// Mock data for development
const mockQuotes: Quote[] = [];

const generateMockQuote = (overrides: Partial<Quote> = {}): Quote => {
  const id = `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const year = new Date().getFullYear();
  const quoteNumber = `${year}-Q${Math.floor(Math.random() * 10000).toString().padStart(5, '0')}`;
  
  return {
    id,
    companyId: 'default-company',
    quoteNumber,
    version: 1,
    contactId: 'contact-1',
    status: 'draft',
    lineItems: [],
    subtotal: 0,
    discountAmount: 0,
    discountPercent: 0,
    discountType: 'percentage',
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 0,
    setupFee: 0,
    currency: 'USD',
    paymentTerms: 'NET30',
    requiresApproval: false,
    signatureRequired: true,
    viewedCount: 0,
    customFields: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
};

class QuotesApi {
  private baseUrl = '/sales/quotes';

  async getAll(params?: QuotesQueryParams): Promise<QuotesListResponse> {
    if (USE_MOCK_DATA) {
      const { page = 1, limit = 10, search, status, contactId, dealId } = params || {};
      
      let filteredQuotes = [...mockQuotes];
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredQuotes = filteredQuotes.filter(q => 
          q.quoteNumber.toLowerCase().includes(searchLower) ||
          q.name?.toLowerCase().includes(searchLower)
        );
      }
      if (status) {
        filteredQuotes = filteredQuotes.filter(q => q.status === status);
      }
      if (contactId) {
        filteredQuotes = filteredQuotes.filter(q => q.contactId === contactId);
      }
      if (dealId) {
        filteredQuotes = filteredQuotes.filter(q => q.dealId === dealId);
      }
      
      const total = filteredQuotes.length;
      const startIndex = (page - 1) * limit;
      const paginatedQuotes = filteredQuotes.slice(startIndex, startIndex + limit);
      
      return {
        success: true,
        data: paginatedQuotes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }
    
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiService.get<QuotesListResponse>(`${this.baseUrl}${queryString}`);
  }

  async getById(id: string): Promise<QuoteResponse> {
    if (USE_MOCK_DATA) {
      const quote = mockQuotes.find(q => q.id === id);
      if (!quote) {
        throw new Error('Quote not found');
      }
      return { success: true, data: quote };
    }
    return apiService.get<QuoteResponse>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateQuoteDto): Promise<QuoteResponse> {
    if (USE_MOCK_DATA) {
      const lineItems = data.lineItems.map((item, index) => ({
        ...item,
        lineNumber: index + 1,
      }));
      
      const newQuote = generateMockQuote({
        ...data,
        lineItems,
      } as Partial<Quote>);
      
      mockQuotes.unshift(newQuote);
      return { success: true, data: newQuote, message: 'Quote created successfully' };
    }
    return apiService.post<QuoteResponse>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateQuoteDto, createVersion: boolean = false): Promise<QuoteResponse> {
    if (USE_MOCK_DATA) {
      const index = mockQuotes.findIndex(q => q.id === id);
      if (index === -1) {
        throw new Error('Quote not found');
      }
      
      if (createVersion) {
        // Create new version
        const original = mockQuotes[index];
        original.status = 'revised';
        
        const newQuote = generateMockQuote({
          ...original,
          ...data,
          id: undefined,
          version: original.version + 1,
          previousVersionId: original.id,
          status: 'draft',
          sentAt: undefined,
          viewedAt: undefined,
          viewedCount: 0,
        } as any);
        
        mockQuotes.unshift(newQuote);
        return { success: true, data: newQuote, message: 'New quote version created' };
      }
      
      mockQuotes[index] = {
        ...mockQuotes[index],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: mockQuotes[index], message: 'Quote updated successfully' };
    }
    
    const queryString = createVersion ? '?createVersion=true' : '';
    return apiService.put<QuoteResponse>(`${this.baseUrl}/${id}${queryString}`, data);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      const index = mockQuotes.findIndex(q => q.id === id);
      if (index === -1) {
        throw new Error('Quote not found');
      }
      mockQuotes.splice(index, 1);
      return { success: true, message: 'Quote deleted successfully' };
    }
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async clone(id: string): Promise<QuoteResponse> {
    if (USE_MOCK_DATA) {
      const original = mockQuotes.find(q => q.id === id);
      if (!original) {
        throw new Error('Quote not found');
      }
      
      const cloned = generateMockQuote({
        ...original,
        id: undefined,
        quoteNumber: undefined,
        version: 1,
        previousVersionId: undefined,
        status: 'draft',
        sentAt: undefined,
        viewedAt: undefined,
        viewedCount: 0,
        signedAt: undefined,
        signedByName: undefined,
        signedByEmail: undefined,
        signatureData: undefined,
        name: original.name ? `${original.name} (Copy)` : 'Copy',
      } as any);
      
      mockQuotes.unshift(cloned);
      return { success: true, data: cloned, message: 'Quote cloned successfully' };
    }
    return apiService.post<QuoteResponse>(`${this.baseUrl}/${id}/clone`);
  }

  async send(id: string, data: SendQuoteDto): Promise<QuoteResponse> {
    if (USE_MOCK_DATA) {
      const quote = mockQuotes.find(q => q.id === id);
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      quote.status = 'sent';
      quote.sentAt = new Date().toISOString();
      quote.sentToEmail = data.recipientEmail;
      quote.statusChangedAt = new Date().toISOString();
      quote.updatedAt = new Date().toISOString();
      
      return { success: true, data: quote, message: 'Quote sent successfully' };
    }
    return apiService.post<QuoteResponse>(`${this.baseUrl}/${id}/send`, data);
  }

  async recordView(id: string): Promise<QuoteResponse> {
    if (USE_MOCK_DATA) {
      const quote = mockQuotes.find(q => q.id === id);
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      if (quote.status === 'sent') {
        quote.status = 'viewed';
        quote.statusChangedAt = new Date().toISOString();
      }
      if (!quote.viewedAt) {
        quote.viewedAt = new Date().toISOString();
      }
      quote.viewedCount = (quote.viewedCount || 0) + 1;
      quote.updatedAt = new Date().toISOString();
      
      return { success: true, data: quote };
    }
    return apiService.post<QuoteResponse>(`${this.baseUrl}/${id}/view`);
  }

  async accept(id: string, data: AcceptQuoteDto): Promise<QuoteResponse> {
    if (USE_MOCK_DATA) {
      const quote = mockQuotes.find(q => q.id === id);
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      quote.status = 'accepted';
      quote.statusChangedAt = new Date().toISOString();
      quote.signedAt = new Date().toISOString();
      quote.signedByName = data.signedByName;
      quote.signedByEmail = data.signedByEmail;
      quote.signatureData = data.signatureData;
      quote.updatedAt = new Date().toISOString();
      
      return { success: true, data: quote, message: 'Quote accepted successfully' };
    }
    return apiService.post<QuoteResponse>(`${this.baseUrl}/${id}/accept`, data);
  }

  async reject(id: string, data: RejectQuoteDto): Promise<QuoteResponse> {
    if (USE_MOCK_DATA) {
      const quote = mockQuotes.find(q => q.id === id);
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      quote.status = 'rejected';
      quote.statusChangedAt = new Date().toISOString();
      quote.rejectionReason = data.rejectionReason;
      quote.updatedAt = new Date().toISOString();
      
      return { success: true, data: quote, message: 'Quote rejected' };
    }
    return apiService.post<QuoteResponse>(`${this.baseUrl}/${id}/reject`, data);
  }

  async getVersionHistory(id: string): Promise<{ success: boolean; data: Quote[] }> {
    if (USE_MOCK_DATA) {
      const quote = mockQuotes.find(q => q.id === id);
      if (!quote) {
        throw new Error('Quote not found');
      }
      
      // Find all versions with the same quote number
      const versions = mockQuotes
        .filter(q => q.quoteNumber === quote.quoteNumber)
        .sort((a, b) => b.version - a.version);
      
      return { success: true, data: versions };
    }
    return apiService.get(`${this.baseUrl}/${id}/versions`);
  }

  async getStatistics(): Promise<QuoteStatistics> {
    if (USE_MOCK_DATA) {
      const statusCounts = mockQuotes.reduce((acc, q) => {
        if (!acc[q.status]) {
          acc[q.status] = { count: 0, totalValue: 0 };
        }
        acc[q.status].count++;
        acc[q.status].totalValue += q.totalAmount;
        return acc;
      }, {} as Record<string, { count: number; totalValue: number }>);
      
      const byStatus = Object.entries(statusCounts).map(([status, data]) => ({
        status: status as QuoteStatus,
        count: data.count.toString(),
        totalValue: data.totalValue.toString(),
      }));
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentQuotes = mockQuotes.filter(q => new Date(q.createdAt) >= thirtyDaysAgo);
      const acceptedRecent = recentQuotes.filter(q => q.status === 'accepted');
      const rejectedRecent = recentQuotes.filter(q => q.status === 'rejected');
      
      return {
        success: true,
        data: {
          byStatus,
          last30Days: {
            totalQuotes: recentQuotes.length.toString(),
            acceptedCount: acceptedRecent.length.toString(),
            rejectedCount: rejectedRecent.length.toString(),
            acceptedValue: acceptedRecent.reduce((sum, q) => sum + q.totalAmount, 0).toString(),
          },
        },
      };
    }
    return apiService.get(`${this.baseUrl}/statistics`);
  }
}

export const quotesApi = new QuotesApi();
export default quotesApi;

