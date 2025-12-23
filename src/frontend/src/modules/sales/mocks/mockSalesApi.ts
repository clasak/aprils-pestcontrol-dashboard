// Mock Sales API Service
// Provides CRUD operations with localStorage persistence

import { Contact, ContactsQueryParams, ContactsListResponse, ContactResponse, ContactsStatistics } from '../services/contacts.api';
import { Lead, LeadsQueryParams, LeadsListResponse, LeadResponse, LeadStatistics } from '../services/leads.api';
import { Deal, DealsQueryParams, DealsListResponse, DealResponse, DealStatistics, PipelineViewResponse, ForecastResponse } from '../services/deals.api';
import { getMockContacts, getMockLeads, getMockDeals, initializeMockData, MockContact, MockLead, MockDeal } from './mockData';

// ============================================================================
// LOCAL STORAGE PERSISTENCE
// ============================================================================

const STORAGE_KEYS = {
  contacts: 'aprils_mock_contacts',
  leads: 'aprils_mock_leads',
  deals: 'aprils_mock_deals',
};

const loadFromStorage = <T>(key: string, fallback: () => T[]): T[] => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn(`Failed to load ${key} from storage:`, e);
  }
  const data = fallback();
  saveToStorage(key, data);
  return data;
};

const saveToStorage = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed to save ${key} to storage:`, e);
  }
};

// ============================================================================
// DATA STORES
// ============================================================================

let contactsStore: MockContact[] | null = null;
let leadsStore: MockLead[] | null = null;
let dealsStore: MockDeal[] | null = null;

const getContacts = (): MockContact[] => {
  if (!contactsStore) {
    contactsStore = loadFromStorage(STORAGE_KEYS.contacts, getMockContacts);
  }
  return contactsStore;
};

const getLeads = (): MockLead[] => {
  if (!leadsStore) {
    leadsStore = loadFromStorage(STORAGE_KEYS.leads, getMockLeads);
  }
  return leadsStore;
};

const getDeals = (): MockDeal[] => {
  if (!dealsStore) {
    dealsStore = loadFromStorage(STORAGE_KEYS.deals, getMockDeals);
  }
  return dealsStore;
};

const saveContacts = () => saveToStorage(STORAGE_KEYS.contacts, contactsStore || []);
const saveLeads = () => saveToStorage(STORAGE_KEYS.leads, leadsStore || []);
const saveDeals = () => saveToStorage(STORAGE_KEYS.deals, dealsStore || []);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const delay = (ms: number = 200) => new Promise(resolve => setTimeout(resolve, ms));

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const paginate = <T>(items: T[], page: number = 1, limit: number = 10) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    data: items.slice(startIndex, endIndex),
    pagination: {
      page,
      limit,
      total: items.length,
      totalPages: Math.ceil(items.length / limit),
    },
  };
};

const matchesSearch = (obj: any, search: string): boolean => {
  const searchLower = search.toLowerCase();
  const searchableFields = ['firstName', 'lastName', 'email', 'phone', 'title', 'description', 'companyName'];
  return searchableFields.some(field => {
    const value = obj[field];
    return value && String(value).toLowerCase().includes(searchLower);
  });
};

// ============================================================================
// CONTACTS API
// ============================================================================

export const mockContactsApi = {
  async getAll(params?: ContactsQueryParams): Promise<ContactsListResponse> {
    await delay();
    let contacts = [...getContacts()];

    // Apply filters
    if (params?.search) {
      contacts = contacts.filter(c => matchesSearch(c, params.search!));
    }
    if (params?.type) {
      contacts = contacts.filter(c => c.type === params.type);
    }
    if (params?.status) {
      contacts = contacts.filter(c => c.status === params.status);
    }

    // Sort by last name
    contacts.sort((a, b) => a.lastName.localeCompare(b.lastName));

    const result = paginate(contacts, params?.page || 1, params?.limit || 10);
    return { success: true, data: result.data as unknown as Contact[], pagination: result.pagination };
  },

  async getById(id: string): Promise<ContactResponse> {
    await delay();
    const contact = getContacts().find(c => c.id === id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return { success: true, data: contact as unknown as Contact };
  },

  async create(data: Partial<Contact>): Promise<ContactResponse> {
    await delay();
    const newContact: MockContact = {
      id: generateId(),
      companyId: 'company-001',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email,
      phone: data.phone,
      mobilePhone: data.mobilePhone,
      workPhone: data.workPhone,
      type: (data.type as MockContact['type']) || 'residential',
      status: (data.status as MockContact['status']) || 'active',
      companyName: data.companyName,
      title: data.title,
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country || 'USA',
      propertyType: data.propertyType,
      propertySizeSqft: data.propertySizeSqft,
      preferredContactMethod: data.preferredContactMethod || 'phone',
      tags: data.tags || [],
      leadSource: data.leadSource,
      notes: data.notes,
      customFields: data.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    contactsStore = [...getContacts(), newContact];
    saveContacts();
    return { success: true, data: newContact as unknown as Contact, message: 'Contact created successfully' };
  },

  async update(id: string, data: Partial<Contact>): Promise<ContactResponse> {
    await delay();
    const contacts = getContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Contact not found');
    }

    const updated: MockContact = {
      ...contacts[index],
      ...(data as Partial<MockContact>),
      updatedAt: new Date().toISOString(),
    };
    contacts[index] = updated;
    contactsStore = contacts;
    saveContacts();
    
    // Update contact in related leads and deals
    leadsStore = getLeads().map(lead => 
      lead.contactId === id ? { ...lead, contact: updated } : lead
    );
    saveLeads();
    
    dealsStore = getDeals().map(deal => 
      deal.contactId === id ? { ...deal, contact: updated } : deal
    );
    saveDeals();

    return { success: true, data: updated as unknown as Contact, message: 'Contact updated successfully' };
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const contacts = getContacts();
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Contact not found');
    }
    contacts.splice(index, 1);
    contactsStore = contacts;
    saveContacts();
    return { success: true, message: 'Contact deleted successfully' };
  },

  async getStatistics(): Promise<ContactsStatistics> {
    await delay();
    const contacts = getContacts();
    
    const byType = {
      residential: contacts.filter(c => c.type === 'residential').length,
      commercial: contacts.filter(c => c.type === 'commercial').length,
      propertyManager: contacts.filter(c => c.type === 'property_manager').length,
      referralPartner: contacts.filter(c => c.type === 'referral_partner').length,
    };

    return {
      success: true,
      data: {
        total: contacts.length,
        residential: byType.residential,
        commercial: byType.commercial,
        active: contacts.filter(c => c.status === 'active').length,
        byType,
      },
    };
  },
};

// ============================================================================
// LEADS API
// ============================================================================

export const mockLeadsApi = {
  async getAll(params?: LeadsQueryParams): Promise<LeadsListResponse> {
    await delay();
    let leads = [...getLeads()];

    // Apply filters
    if (params?.search) {
      leads = leads.filter(l => matchesSearch(l, params.search!) || matchesSearch(l.contact, params.search!));
    }
    if (params?.status) {
      leads = leads.filter(l => l.status === params.status);
    }
    if (params?.priority) {
      leads = leads.filter(l => l.priority === params.priority);
    }
    if (params?.assignedTo) {
      leads = leads.filter(l => l.assignedTo === params.assignedTo);
    }
    if (params?.minScore !== undefined) {
      leads = leads.filter(l => l.leadScore >= params.minScore!);
    }
    if (params?.maxScore !== undefined) {
      leads = leads.filter(l => l.leadScore <= params.maxScore!);
    }

    // Sort by created date (newest first)
    leads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const result = paginate(leads, params?.page || 1, params?.limit || 10);
    return { success: true, data: result.data as unknown as Lead[], pagination: result.pagination };
  },

  async getById(id: string): Promise<LeadResponse> {
    await delay();
    const lead = getLeads().find(l => l.id === id);
    if (!lead) {
      throw new Error('Lead not found');
    }
    return { success: true, data: lead as unknown as Lead };
  },

  async create(data: Partial<Lead>): Promise<LeadResponse> {
    await delay();
    const contact = getContacts().find(c => c.id === data.contactId);
    
    const newLead: MockLead = {
      id: generateId(),
      companyId: 'company-001',
      contactId: data.contactId || '',
      contact: contact!,
      title: data.title || 'New Lead',
      description: data.description,
      status: (data.status as MockLead['status']) || 'new',
      priority: (data.priority as MockLead['priority']) || 'medium',
      leadSource: data.leadSource || 'website',
      leadSourceCategory: (data.leadSourceCategory as MockLead['leadSourceCategory']) || 'organic',
      leadScore: data.leadScore || 50,
      scoreFactors: data.scoreFactors || {},
      assignedTo: data.assignedTo,
      assignedAt: data.assignedTo ? new Date().toISOString() : undefined,
      serviceType: data.serviceType,
      pestTypes: data.pestTypes || [],
      severityLevel: data.severityLevel,
      propertyType: data.propertyType,
      propertySizeSqft: data.propertySizeSqft,
      estimatedValueCents: data.estimatedValueCents,
      expectedCloseDate: data.expectedCloseDate,
      urgency: data.urgency,
      contactAttempts: 0,
      nextFollowUpDate: data.nextFollowUpDate,
      isQualified: false,
      notes: data.notes,
      tags: data.tags || [],
      customFields: data.customFields || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    leadsStore = [...getLeads(), newLead];
    saveLeads();
    return { success: true, data: newLead as unknown as Lead, message: 'Lead created successfully' };
  },

  async update(id: string, data: Partial<Lead>): Promise<LeadResponse> {
    await delay();
    const leads = getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Lead not found');
    }

    // If contact changed, update the contact reference
    let contact = leads[index].contact;
    if (data.contactId && data.contactId !== leads[index].contactId) {
      contact = getContacts().find(c => c.id === data.contactId)!;
    }

    const updated: MockLead = {
      ...leads[index],
      ...(data as Partial<MockLead>),
      contact,
      updatedAt: new Date().toISOString(),
    };
    leads[index] = updated;
    leadsStore = leads;
    saveLeads();
    return { success: true, data: updated as unknown as Lead, message: 'Lead updated successfully' };
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const leads = getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Lead not found');
    }
    leads.splice(index, 1);
    leadsStore = leads;
    saveLeads();
    return { success: true, message: 'Lead deleted successfully' };
  },

  async assign(id: string, assignedTo: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const leads = getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Lead not found');
    }
    leads[index] = {
      ...leads[index],
      assignedTo,
      assignedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leadsStore = leads;
    saveLeads();
    return { success: true, message: 'Lead assigned successfully' };
  },

  async qualify(id: string, isQualified: boolean, notes?: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const leads = getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Lead not found');
    }
    leads[index] = {
      ...leads[index],
      isQualified,
      status: isQualified ? 'qualified' : 'unqualified',
      qualificationNotes: notes,
      disqualificationReason: !isQualified ? notes : undefined,
      updatedAt: new Date().toISOString(),
    };
    leadsStore = leads;
    saveLeads();
    return { success: true, message: isQualified ? 'Lead qualified' : 'Lead marked as unqualified' };
  },

  async convertToDeal(id: string, dealId: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const leads = getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Lead not found');
    }
    leads[index] = {
      ...leads[index],
      status: 'converted',
      convertedToDealId: dealId,
      convertedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leadsStore = leads;
    saveLeads();
    return { success: true, message: 'Lead converted to deal' };
  },

  async markAsLost(id: string, reason: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const leads = getLeads();
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Lead not found');
    }
    leads[index] = {
      ...leads[index],
      status: 'lost',
      lostReason: reason,
      lostAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    leadsStore = leads;
    saveLeads();
    return { success: true, message: 'Lead marked as lost' };
  },

  async getStatistics(): Promise<LeadStatistics> {
    await delay();
    const leads = getLeads();
    
    const byStatus = {
      new: leads.filter(l => l.status === 'new').length,
      contacted: leads.filter(l => l.status === 'contacted').length,
      qualified: leads.filter(l => l.status === 'qualified').length,
      nurturing: leads.filter(l => l.status === 'nurturing').length,
      converted: leads.filter(l => l.status === 'converted').length,
      lost: leads.filter(l => l.status === 'lost').length,
    };

    const qualified = leads.filter(l => l.isQualified).length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const avgScore = leads.length > 0 
      ? Math.round(leads.reduce((sum, l) => sum + l.leadScore, 0) / leads.length)
      : 0;

    return {
      success: true,
      data: {
        total: leads.length,
        newLeads: byStatus.new,
        qualified,
        converted,
        conversionRate: leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0,
        averageScore: avgScore,
        byStatus,
      },
    };
  },
};

// ============================================================================
// DEALS API
// ============================================================================

const STAGE_PROBABILITIES: Record<string, number> = {
  lead: 10,
  inspection_scheduled: 20,
  inspection_completed: 40,
  quote_sent: 50,
  negotiation: 60,
  verbal_commitment: 80,
  contract_sent: 90,
  closed_won: 100,
  closed_lost: 0,
};

export const mockDealsApi = {
  async getAll(params?: DealsQueryParams): Promise<DealsListResponse> {
    await delay();
    let deals = [...getDeals()];

    // Apply filters
    if (params?.search) {
      deals = deals.filter(d => matchesSearch(d, params.search!) || matchesSearch(d.contact, params.search!));
    }
    if (params?.stage) {
      deals = deals.filter(d => d.stage === params.stage);
    }
    if (params?.assignedTo) {
      deals = deals.filter(d => d.assignedTo === params.assignedTo);
    }
    if (params?.minValue !== undefined) {
      deals = deals.filter(d => d.dealValueCents >= params.minValue!);
    }
    if (params?.maxValue !== undefined) {
      deals = deals.filter(d => d.dealValueCents <= params.maxValue!);
    }

    // Sort by created date (newest first)
    deals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const result = paginate(deals, params?.page || 1, params?.limit || 10);
    return { success: true, data: result.data as unknown as Deal[], pagination: result.pagination };
  },

  async getById(id: string): Promise<DealResponse> {
    await delay();
    const deal = getDeals().find(d => d.id === id);
    if (!deal) {
      throw new Error('Deal not found');
    }
    return { success: true, data: deal as unknown as Deal };
  },

  async create(data: Partial<Deal>): Promise<DealResponse> {
    await delay();
    const contact = getContacts().find(c => c.id === data.contactId);
    const stage = (data.stage as MockDeal['stage']) || 'lead';
    const dealValue = data.dealValueCents || 0;
    
    const newDeal: MockDeal = {
      id: generateId(),
      companyId: 'company-001',
      contactId: data.contactId || '',
      contact: contact!,
      leadId: data.leadId,
      title: data.title || 'New Deal',
      description: data.description,
      status: 'open',
      stage,
      dealValueCents: dealValue,
      recurringRevenueCents: data.recurringRevenueCents,
      serviceFrequency: data.serviceFrequency as MockDeal['serviceFrequency'],
      winProbability: STAGE_PROBABILITIES[stage],
      weightedValueCents: Math.round(dealValue * STAGE_PROBABILITIES[stage] / 100),
      daysInPipeline: 0,
      stageDurationDays: 0,
      expectedCloseDate: data.expectedCloseDate,
      assignedTo: data.assignedTo,
      serviceType: data.serviceType,
      pestTypes: data.pestTypes || [],
      propertyType: data.propertyType,
      propertySizeSqft: data.propertySizeSqft,
      notes: data.notes,
      tags: data.tags || [],
      customFields: data.customFields || {},
      metadata: data.metadata || {},
      stageHistory: [{
        stage,
        enteredAt: new Date().toISOString(),
      }],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dealsStore = [...getDeals(), newDeal];
    saveDeals();
    return { success: true, data: newDeal as unknown as Deal, message: 'Deal created successfully' };
  },

  async update(id: string, data: Partial<Deal>): Promise<DealResponse> {
    await delay();
    const deals = getDeals();
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Deal not found');
    }

    // If contact changed, update the contact reference
    let contact = deals[index].contact;
    if (data.contactId && data.contactId !== deals[index].contactId) {
      contact = getContacts().find(c => c.id === data.contactId)!;
    }

    const updated: MockDeal = {
      ...deals[index],
      ...(data as Partial<MockDeal>),
      contact,
      updatedAt: new Date().toISOString(),
    };
    deals[index] = updated;
    dealsStore = deals;
    saveDeals();
    return { success: true, data: updated as unknown as Deal, message: 'Deal updated successfully' };
  },

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await delay();
    const deals = getDeals();
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Deal not found');
    }
    deals.splice(index, 1);
    dealsStore = deals;
    saveDeals();
    return { success: true, message: 'Deal deleted successfully' };
  },

  async moveToStage(id: string, stage: string): Promise<DealResponse> {
    await delay();
    const deals = getDeals();
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Deal not found');
    }

    const now = new Date().toISOString();
    const stageHistory = [...(deals[index].stageHistory || [])];
    
    // Close previous stage
    if (stageHistory.length > 0) {
      stageHistory[stageHistory.length - 1].exitedAt = now;
    }
    
    // Add new stage
    stageHistory.push({ stage, enteredAt: now });

    const newStatus: MockDeal['status'] = stage === 'closed_won' ? 'won' : stage === 'closed_lost' ? 'lost' : 'open';

    const updated: MockDeal = {
      ...deals[index],
      status: newStatus,
      stage: stage as MockDeal['stage'],
      winProbability: STAGE_PROBABILITIES[stage] || deals[index].winProbability,
      weightedValueCents: Math.round(deals[index].dealValueCents * (STAGE_PROBABILITIES[stage] || 0) / 100),
      stageHistory,
      updatedAt: now,
      actualCloseDate: (stage === 'closed_won' || stage === 'closed_lost') ? now : deals[index].actualCloseDate,
    };

    deals[index] = updated;
    dealsStore = deals;
    saveDeals();
    return { success: true, data: updated as unknown as Deal, message: `Deal moved to ${stage}` };
  },

  async markAsWon(id: string, notes?: string): Promise<DealResponse> {
    const result = await this.moveToStage(id, 'closed_won');
    if (notes) {
      await this.update(id, { wonReason: notes });
    }
    return result;
  },

  async markAsLost(id: string, reason: string, competitor?: string): Promise<DealResponse> {
    await delay();
    const deals = getDeals();
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Deal not found');
    }

    const now = new Date().toISOString();
    const stageHistory = [...(deals[index].stageHistory || [])];
    if (stageHistory.length > 0) {
      stageHistory[stageHistory.length - 1].exitedAt = now;
    }
    stageHistory.push({ stage: 'closed_lost', enteredAt: now });

    const updated: MockDeal = {
      ...deals[index],
      status: 'lost',
      stage: 'closed_lost',
      winProbability: 0,
      weightedValueCents: 0,
      actualCloseDate: now,
      lostReason: reason,
      lostToCompetitor: competitor,
      stageHistory,
      updatedAt: now,
    };

    deals[index] = updated;
    dealsStore = deals;
    saveDeals();
    return { success: true, data: updated as unknown as Deal, message: 'Deal marked as lost' };
  },

  async getStatistics(): Promise<DealStatistics> {
    await delay();
    const deals = getDeals();
    
    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const wonDeals = deals.filter(d => d.stage === 'closed_won');
    const lostDeals = deals.filter(d => d.stage === 'closed_lost');
    
    const totalValue = openDeals.reduce((sum, d) => sum + d.dealValueCents, 0);
    
    const closedDeals = wonDeals.length + lostDeals.length;
    const winRate = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 0;
    const avgDealSize = openDeals.length > 0 ? Math.round(totalValue / openDeals.length) : 0;

    return {
      success: true,
      data: {
        total: deals.length,
        open: openDeals.length,
        won: wonDeals.length,
        lost: lostDeals.length,
        winRate,
        totalValue,
        avgDealSize,
      },
    };
  },

  async getPipelineView(): Promise<PipelineViewResponse> {
    await delay();
    const deals = getDeals();
    
    const stages = ['lead', 'inspection_scheduled', 'inspection_completed', 'quote_sent', 'negotiation', 'verbal_commitment', 'contract_sent', 'closed_won', 'closed_lost'];
    
    const pipeline: Record<string, Deal[]> = {};
    const stageCounts: Record<string, number> = {};
    const stageValues: Record<string, number> = {};
    
    for (const stage of stages) {
      const stageDeals = deals.filter(d => d.stage === stage);
      pipeline[stage] = stageDeals as unknown as Deal[];
      stageCounts[stage] = stageDeals.length;
      stageValues[stage] = stageDeals.reduce((sum, d) => sum + d.dealValueCents, 0);
    }

    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const totalValue = openDeals.reduce((sum, d) => sum + d.dealValueCents, 0);
    const totalWeightedValue = openDeals.reduce((sum, d) => sum + (d.dealValueCents * d.winProbability / 100), 0);

    return {
      success: true,
      data: {
        pipeline,
        summary: {
          totalDeals: openDeals.length,
          totalValue,
          totalWeightedValue: Math.round(totalWeightedValue),
          stageCounts,
          stageValues,
        },
      },
    };
  },

  async getForecast(): Promise<ForecastResponse> {
    await delay();
    const deals = getDeals();
    
    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const totalValue = openDeals.reduce((sum, d) => sum + d.dealValueCents, 0);
    const weightedValue = openDeals.reduce((sum, d) => sum + (d.dealValueCents * d.winProbability / 100), 0);

    // Group by expected close month
    const monthlyForecast: Record<string, { dealCount: number; totalValue: number; weightedValue: number }> = {};
    
    openDeals.forEach(deal => {
      if (deal.expectedCloseDate) {
        const date = new Date(deal.expectedCloseDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!monthlyForecast[monthKey]) {
          monthlyForecast[monthKey] = { dealCount: 0, totalValue: 0, weightedValue: 0 };
        }
        monthlyForecast[monthKey].dealCount++;
        monthlyForecast[monthKey].totalValue += deal.dealValueCents;
        monthlyForecast[monthKey].weightedValue += Math.round(deal.dealValueCents * deal.winProbability / 100);
      }
    });

    return {
      success: true,
      data: {
        summary: {
          totalDeals: openDeals.length,
          totalValue,
          weightedValue: Math.round(weightedValue),
        },
        monthlyForecast,
      },
    };
  },
};

// ============================================================================
// RESET FUNCTION
// ============================================================================

export const resetMockData = () => {
  contactsStore = null;
  leadsStore = null;
  dealsStore = null;
  localStorage.removeItem(STORAGE_KEYS.contacts);
  localStorage.removeItem(STORAGE_KEYS.leads);
  localStorage.removeItem(STORAGE_KEYS.deals);
  initializeMockData();
};

// ============================================================================
// OPPORTUNITIES MOCK API (Maps Deals to Opportunities format)
// ============================================================================

export const mockOpportunitiesApi = {
  /**
   * Get pipeline summary by stage (for dashboards)
   */
  async getPipelineSummary(ownerId?: string): Promise<Array<{ stage: string; count: number; totalValue: number; weightedValue: number }>> {
    await delay();
    const deals = getDeals();
    
    // Filter by owner if specified (for demo, we don't have owner_id, so skip filtering)
    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    
    const stages = ['lead', 'inspection_scheduled', 'inspection_completed', 'quote_sent', 'negotiation', 'verbal_commitment', 'contract_sent'];
    
    return stages.map(stage => {
      const stageDeals = openDeals.filter(d => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        totalValue: stageDeals.reduce((sum, d) => sum + d.dealValueCents, 0),
        weightedValue: stageDeals.reduce((sum, d) => sum + Math.round(d.dealValueCents * d.winProbability / 100), 0),
      };
    });
  },

  /**
   * Get opportunity statistics (for dashboards)
   */
  async getStatistics(ownerId?: string): Promise<{
    totalOpen: number;
    totalValue: number;
    weightedValue: number;
    wonThisMonth: number;
    wonValueThisMonth: number;
    lostThisMonth: number;
    winRate: number;
    avgDealSize: number;
    avgSalesCycle: number;
  }> {
    await delay();
    const deals = getDeals();
    
    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const wonDeals = deals.filter(d => d.stage === 'closed_won');
    const lostDeals = deals.filter(d => d.stage === 'closed_lost');
    
    const totalValue = openDeals.reduce((sum, d) => sum + d.dealValueCents, 0);
    const weightedValue = openDeals.reduce((sum, d) => sum + Math.round(d.dealValueCents * d.winProbability / 100), 0);
    
    // Get deals from this month
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1);
    firstOfMonth.setHours(0, 0, 0, 0);
    
    const wonThisMonth = wonDeals.filter(d => d.actualCloseDate && new Date(d.actualCloseDate) >= firstOfMonth);
    const lostThisMonth = lostDeals.filter(d => d.actualCloseDate && new Date(d.actualCloseDate) >= firstOfMonth);
    
    const closedDeals = wonDeals.length + lostDeals.length;
    const winRate = closedDeals > 0 ? Math.round((wonDeals.length / closedDeals) * 100) : 0;
    
    const avgDealSize = wonDeals.length > 0 
      ? Math.round(wonDeals.reduce((sum, d) => sum + d.dealValueCents, 0) / wonDeals.length)
      : 0;

    return {
      totalOpen: openDeals.length,
      totalValue,
      weightedValue,
      wonThisMonth: wonThisMonth.length,
      wonValueThisMonth: wonThisMonth.reduce((sum, d) => sum + d.dealValueCents, 0),
      lostThisMonth: lostThisMonth.length,
      winRate,
      avgDealSize,
      avgSalesCycle: 21, // Mock average of 21 days
    };
  },

  /**
   * Get stalled opportunities (no activity in X days)
   */
  async getStalled(days: number = 7, ownerId?: string): Promise<any[]> {
    await delay();
    const deals = getDeals();
    
    const stalledDate = new Date();
    stalledDate.setDate(stalledDate.getDate() - days);
    
    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    const stalledDeals = openDeals.filter(d => {
      if (!d.lastActivityDate) return true;
      return new Date(d.lastActivityDate) < stalledDate;
    });
    
    // Map to opportunity-like format
    return stalledDeals.slice(0, 10).map(d => ({
      id: d.id,
      name: d.title,
      stage: d.stage,
      amount: d.dealValueCents,
      expected_close_date: d.expectedCloseDate,
      last_activity_at: d.lastActivityDate,
      account: d.contact ? { id: d.contactId, name: d.contact.companyName || `${d.contact.firstName} ${d.contact.lastName}` } : null,
      owner: null,
    }));
  },

  /**
   * Get opportunities without next step
   */
  async getWithoutNextStep(ownerId?: string): Promise<any[]> {
    await delay();
    const deals = getDeals();
    
    const today = new Date().toISOString().split('T')[0];
    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    
    const noNextStep = openDeals.filter(d => {
      // No next follow up date, or it's in the past
      if (!d.nextFollowUpDate) return true;
      return d.nextFollowUpDate < today;
    });
    
    // Map to opportunity-like format
    return noNextStep.slice(0, 10).map(d => ({
      id: d.id,
      name: d.title,
      stage: d.stage,
      amount: d.dealValueCents,
      expected_close_date: d.expectedCloseDate,
      next_step: null,
      next_step_date: d.nextFollowUpDate,
      account: d.contact ? { id: d.contactId, name: d.contact.companyName || `${d.contact.firstName} ${d.contact.lastName}` } : null,
      owner: null,
    }));
  },

  /**
   * Get all open opportunities (for pipeline view)
   */
  async getOpen(ownerId?: string): Promise<any[]> {
    await delay();
    const deals = getDeals();
    
    const openDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage));
    
    // Map to opportunity-like format
    return openDeals.map(d => ({
      id: d.id,
      name: d.title,
      stage: d.stage,
      status: 'open',
      amount: d.dealValueCents,
      weighted_amount: Math.round(d.dealValueCents * d.winProbability / 100),
      probability: d.winProbability,
      expected_close_date: d.expectedCloseDate,
      account: d.contact ? { id: d.contactId, name: d.contact.companyName || `${d.contact.firstName} ${d.contact.lastName}` } : null,
      contact: d.contact ? { id: d.contactId, first_name: d.contact.firstName, last_name: d.contact.lastName } : null,
      owner: null,
    }));
  },
};

