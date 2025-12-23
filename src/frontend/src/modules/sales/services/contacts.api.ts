import apiService from '@shared/services/api';
import { mockContactsApi } from '../mocks/mockSalesApi';

// Flag to use mock data (set to true during development without backend)
const USE_MOCK_DATA = true;

export interface Contact {
  id: string;
  companyId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  workPhone?: string;
  title?: string;
  department?: string;
  type: 'residential' | 'commercial' | 'property_manager' | 'referral_partner' | 'vendor' | 'other';
  status: 'active' | 'inactive' | 'do_not_contact';
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country: string;
  propertyType?: string;
  propertySizeSqft?: number;
  lotSizeAcres?: number;
  yearBuilt?: number;
  companyName?: string;
  industry?: string;
  preferredContactMethod?: string;
  bestContactTime?: string;
  notes?: string;
  leadSource?: string;
  referralSource?: string;
  tags?: string[];
  customFields: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface ContactsListResponse {
  success: boolean;
  data: Contact[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContactResponse {
  success: boolean;
  data: Contact;
  message?: string;
}

export interface ContactsStatistics {
  success: boolean;
  data: {
    total: number;
    residential: number;
    commercial: number;
    active: number;
    byType: {
      residential: number;
      commercial: number;
      propertyManager: number;
      referralPartner: number;
    };
  };
}

export interface CreateContactDto {
  companyId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  workPhone?: string;
  title?: string;
  department?: string;
  type?: string;
  status?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  propertyType?: string;
  propertySizeSqft?: number;
  lotSizeAcres?: number;
  yearBuilt?: number;
  companyName?: string;
  industry?: string;
  preferredContactMethod?: string;
  bestContactTime?: string;
  notes?: string;
  leadSource?: string;
  referralSource?: string;
  tags?: string[];
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {}

export interface ContactsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  tags?: string;
}

class ContactsApi {
  private baseUrl = '/sales/contacts';

  async getAll(params?: ContactsQueryParams): Promise<ContactsListResponse> {
    if (USE_MOCK_DATA) {
      return mockContactsApi.getAll(params);
    }
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiService.get<ContactsListResponse>(`${this.baseUrl}${queryString}`);
  }

  async getById(id: string): Promise<ContactResponse> {
    if (USE_MOCK_DATA) {
      return mockContactsApi.getById(id);
    }
    return apiService.get<ContactResponse>(`${this.baseUrl}/${id}`);
  }

  async create(data: CreateContactDto): Promise<ContactResponse> {
    if (USE_MOCK_DATA) {
      return mockContactsApi.create(data as Partial<Contact>);
    }
    return apiService.post<ContactResponse>(this.baseUrl, data);
  }

  async update(id: string, data: UpdateContactDto): Promise<ContactResponse> {
    if (USE_MOCK_DATA) {
      return mockContactsApi.update(id, data as Partial<Contact>);
    }
    return apiService.put<ContactResponse>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    if (USE_MOCK_DATA) {
      return mockContactsApi.delete(id);
    }
    return apiService.delete(`${this.baseUrl}/${id}`);
  }

  async restore(id: string): Promise<{ success: boolean; message: string }> {
    // Mock implementation just returns success
    if (USE_MOCK_DATA) {
      return { success: true, message: 'Contact restored' };
    }
    return apiService.post(`${this.baseUrl}/${id}/restore`);
  }

  async autocomplete(query: string): Promise<{
    success: boolean;
    data: Array<{ id: string; label: string; email?: string; phone?: string }>;
  }> {
    if (USE_MOCK_DATA) {
      const result = await mockContactsApi.getAll({ search: query, limit: 10 });
      return {
        success: true,
        data: result.data.map(c => ({
          id: c.id,
          label: `${c.firstName} ${c.lastName}`,
          email: c.email,
          phone: c.phone,
        })),
      };
    }
    return apiService.get(`${this.baseUrl}/search/autocomplete?q=${encodeURIComponent(query)}`);
  }

  async exportCsv(): Promise<{ success: boolean; data: string }> {
    if (USE_MOCK_DATA) {
      const result = await mockContactsApi.getAll({ limit: 1000 });
      const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Type', 'Status'];
      const rows = result.data.map(c => [c.id, c.firstName, c.lastName, c.email || '', c.phone || '', c.type, c.status]);
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      return { success: true, data: csv };
    }
    return apiService.get(`${this.baseUrl}/export/csv`);
  }

  async getStatistics(): Promise<ContactsStatistics> {
    if (USE_MOCK_DATA) {
      return mockContactsApi.getStatistics();
    }
    return apiService.get(`${this.baseUrl}/statistics`);
  }
}

export const contactsApi = new ContactsApi();
export default contactsApi;
