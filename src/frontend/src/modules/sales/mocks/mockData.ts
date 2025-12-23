// Mock Data for Sales CRM Module
// Realistic pest control business data for development and testing

// Define interfaces locally to avoid circular dependencies
// These match the interfaces in the API files

export interface MockContact {
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

export interface MockLead {
  id: string;
  companyId: string;
  contactId: string;
  contact: MockContact;
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

export interface MockDeal {
  id: string;
  companyId: string;
  contactId: string;
  contact: MockContact;
  leadId?: string;
  title: string;
  description?: string;
  status: 'open' | 'won' | 'lost' | 'cancelled';
  stage: 'lead' | 'inspection_scheduled' | 'inspection_completed' | 'quote_sent' | 'negotiation' | 'verbal_commitment' | 'contract_sent' | 'closed_won' | 'closed_lost';
  dealValueCents: number;
  recurringRevenueCents?: number;
  serviceFrequency?: 'one_time' | 'weekly' | 'bi_weekly' | 'monthly' | 'bi_monthly' | 'quarterly' | 'semi_annual' | 'annual' | 'custom';
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

// Helper to generate UUIDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Helper to get random date within range
const randomDate = (start: Date, end: Date): string => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString();
};

// Helper to get random item from array
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper to get random number in range
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

// ============================================================================
// CONTACTS DATA
// ============================================================================

const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
  'Timothy', 'Deborah'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
];

const streetNames = [
  'Oak', 'Maple', 'Cedar', 'Pine', 'Elm', 'Willow', 'Birch', 'Magnolia',
  'Hickory', 'Cypress', 'Palm', 'Peach', 'Cherry', 'Dogwood', 'Sycamore'
];

const streetTypes = ['St', 'Ave', 'Blvd', 'Dr', 'Ln', 'Ct', 'Way', 'Rd', 'Pl'];

const cities = [
  { name: 'Houston', state: 'TX', zip: '770' },
  { name: 'Sugar Land', state: 'TX', zip: '774' },
  { name: 'The Woodlands', state: 'TX', zip: '773' },
  { name: 'Katy', state: 'TX', zip: '774' },
  { name: 'Pearland', state: 'TX', zip: '775' },
  { name: 'Spring', state: 'TX', zip: '773' },
  { name: 'League City', state: 'TX', zip: '775' },
  { name: 'Cypress', state: 'TX', zip: '774' },
  { name: 'Missouri City', state: 'TX', zip: '774' },
  { name: 'Pasadena', state: 'TX', zip: '775' },
  { name: 'Clear Lake', state: 'TX', zip: '770' },
  { name: 'Humble', state: 'TX', zip: '773' },
];

const companyNames = [
  'Lone Star Properties LLC', 'Texas Home Services', 'Gulf Coast Rentals',
  'Houston Property Group', 'Bayou City Management', 'Energy Corridor Realty',
  'Memorial Apartments', 'Galleria Living Properties', 'Greater Houston Homes',
  'Heights Management', 'Space City Property Services', 'Texas Realty Group',
  'Bluebonnet Estates', 'Magnolia Property Management', 'Willow Creek HOA'
];

const generateAddress = () => {
  const city = randomItem(cities);
  return {
    addressLine1: `${randomInt(100, 9999)} ${randomItem(streetNames)} ${randomItem(streetTypes)}`,
    addressLine2: Math.random() > 0.8 ? `Apt ${randomInt(1, 400)}` : undefined,
    city: city.name,
    state: city.state,
    postalCode: `${city.zip}${randomInt(10, 99)}`,
    country: 'USA',
  };
};

const houstonAreaCodes = ['713', '281', '832', '346'];
const generatePhone = () => `(${randomItem(houstonAreaCodes)}) ${randomInt(200, 999)}-${randomInt(1000, 9999)}`;

export const generateContacts = (): MockContact[] => {
  const contacts: MockContact[] = [];
  const companyId = 'company-001';

  for (let i = 0; i < 55; i++) {
    const firstName = randomItem(firstNames);
    const lastName = randomItem(lastNames);
    const address = generateAddress();
    const type = i < 33 ? 'residential' : i < 48 ? 'commercial' : 'property_manager';
    const hasCompany = type !== 'residential' || Math.random() > 0.7;

    contacts.push({
      id: `contact-${String(i + 1).padStart(3, '0')}`,
      companyId,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${Math.random() > 0.5 ? 'gmail.com' : 'yahoo.com'}`,
      phone: generatePhone(),
      mobilePhone: Math.random() > 0.3 ? generatePhone() : undefined,
      type: type as MockContact['type'],
      status: Math.random() > 0.1 ? 'active' : 'inactive',
      companyName: hasCompany ? randomItem(companyNames) : undefined,
      title: type === 'commercial' ? randomItem(['Owner', 'Manager', 'Facilities Director', 'Property Manager']) : undefined,
      ...address,
      country: 'USA',
      propertyType: type === 'residential' ? randomItem(['single_family', 'townhouse', 'condo', 'apartment']) : randomItem(['office', 'retail', 'restaurant', 'warehouse']),
      propertySizeSqft: randomInt(800, 5000),
      preferredContactMethod: randomItem(['email', 'phone', 'sms']),
      tags: [],
      leadSource: randomItem(['website', 'referral', 'google', 'yelp', 'facebook', 'door_to_door']),
      notes: Math.random() > 0.7 ? 'Regular customer, prefers morning appointments.' : undefined,
      customFields: {},
      createdAt: randomDate(new Date('2023-01-01'), new Date('2024-06-01')),
      updatedAt: randomDate(new Date('2024-06-01'), new Date()),
    });
  }

  return contacts;
};

// ============================================================================
// LEADS DATA
// ============================================================================

const leadSources = [
  { source: 'Website Contact Form', category: 'organic' },
  { source: 'Google Ads', category: 'paid' },
  { source: 'Facebook Ads', category: 'paid' },
  { source: 'Yelp', category: 'organic' },
  { source: 'Customer Referral', category: 'referral' },
  { source: 'Partner Referral', category: 'partner' },
  { source: 'Door to Door', category: 'direct' },
  { source: 'Home Show', category: 'direct' },
  { source: 'Nextdoor', category: 'organic' },
  { source: 'Google Maps', category: 'organic' },
];

const serviceTypes = [
  'General Pest Control',
  'Termite Inspection',
  'Termite Treatment',
  'Bed Bug Treatment',
  'Rodent Control',
  'Mosquito Control',
  'Wildlife Removal',
  'Ant Control',
  'Cockroach Treatment',
  'Flea & Tick Treatment',
];

const pestTypes = [
  ['ants', 'roaches'],
  ['termites'],
  ['bed bugs'],
  ['mice', 'rats'],
  ['mosquitoes'],
  ['raccoons', 'squirrels'],
  ['ants'],
  ['roaches', 'ants', 'spiders'],
  ['fleas', 'ticks'],
  ['wasps', 'bees'],
];

const leadTitles = [
  'Ant infestation in kitchen',
  'Termite inspection needed',
  'Bed bugs in master bedroom',
  'Rodent sounds in attic',
  'Monthly pest control service',
  'Mosquito treatment for backyard',
  'Wildlife in crawl space',
  'Roach problem in apartment',
  'New home pest inspection',
  'Commercial kitchen pest control',
  'HOA common area treatment',
  'Restaurant pest management',
  'Warehouse rodent control',
  'Pool area mosquito control',
  'Pre-purchase termite inspection',
];

export const generateLeads = (contacts: MockContact[]): MockLead[] => {
  const leads: MockLead[] = [];
  const companyId = 'company-001';
  const statuses: MockLead['status'][] = ['new', 'contacted', 'qualified', 'unqualified', 'nurturing', 'converted', 'lost'];
  const priorities: MockLead['priority'][] = ['low', 'medium', 'high', 'urgent'];

  // Use subset of contacts for leads
  const leadContacts = contacts.slice(0, 35);

  for (let i = 0; i < 35; i++) {
    const contact = leadContacts[i];
    const source = randomItem(leadSources);
    const serviceType = randomItem(serviceTypes);
    const status = i < 8 ? 'new' : i < 15 ? 'contacted' : i < 22 ? 'qualified' : i < 25 ? 'nurturing' : i < 30 ? 'converted' : randomItem(['unqualified', 'lost']);
    const priority = status === 'new' ? randomItem(['medium', 'high', 'urgent']) : randomItem(priorities);
    const isQualified = ['qualified', 'converted'].includes(status);
    
    // Calculate lead score based on various factors
    let leadScore = 30;
    if (contact.type === 'commercial') leadScore += 20;
    if (contact.type === 'property_manager') leadScore += 25;
    if (priority === 'urgent') leadScore += 15;
    if (priority === 'high') leadScore += 10;
    if (isQualified) leadScore += 20;
    if (serviceType.includes('Termite')) leadScore += 10;
    leadScore = Math.min(100, leadScore + randomInt(-10, 15));

    const estimatedValue = serviceType.includes('Termite') ? randomInt(100000, 300000) :
      serviceType.includes('Bed Bug') ? randomInt(50000, 200000) :
      serviceType.includes('Wildlife') ? randomInt(30000, 80000) :
      randomInt(7500, 50000);

    leads.push({
      id: `lead-${String(i + 1).padStart(3, '0')}`,
      companyId,
      contactId: contact.id,
      contact,
      title: randomItem(leadTitles),
      description: `Customer reported ${serviceType.toLowerCase()} issues. ${Math.random() > 0.5 ? 'Urgent attention needed.' : 'Requesting quote.'}`,
      status,
      priority,
      leadSource: source.source,
      leadSourceCategory: source.category as Lead['leadSourceCategory'],
      leadScore,
      scoreFactors: {
        propertyType: contact.type === 'commercial' ? 20 : 10,
        serviceValue: estimatedValue > 100000 ? 15 : 5,
        urgency: priority === 'urgent' ? 15 : priority === 'high' ? 10 : 5,
        engagement: randomInt(5, 20),
      },
      assignedTo: Math.random() > 0.3 ? `user-${randomInt(1, 5)}` : undefined,
      assignedAt: Math.random() > 0.3 ? randomDate(new Date('2024-10-01'), new Date()) : undefined,
      serviceType,
      pestTypes: randomItem(pestTypes),
      severityLevel: randomItem(['minor', 'moderate', 'severe', 'critical']),
      propertyType: contact.type === 'commercial' ? randomItem(['office', 'retail', 'restaurant', 'warehouse']) : randomItem(['single_family', 'townhouse', 'condo', 'apartment']),
      propertySizeSqft: randomInt(800, 5000),
      estimatedValueCents: estimatedValue,
      expectedCloseDate: randomDate(new Date(), new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)),
      urgency: priority === 'urgent' ? 'immediate' : priority === 'high' ? 'this_week' : 'flexible',
      firstContactDate: randomDate(new Date('2024-09-01'), new Date()),
      lastContactDate: status !== 'new' ? randomDate(new Date('2024-11-01'), new Date()) : undefined,
      contactAttempts: status === 'new' ? 0 : randomInt(1, 5),
      nextFollowUpDate: ['new', 'contacted', 'nurturing'].includes(status) ? randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : undefined,
      isQualified,
      qualificationNotes: isQualified ? 'Customer confirmed budget and timeline. Ready to proceed.' : undefined,
      disqualificationReason: status === 'unqualified' ? randomItem(['No budget', 'Outside service area', 'DIY preference', 'Wrong contact']) : undefined,
      convertedToDealId: status === 'converted' ? `deal-${String(i + 1).padStart(3, '0')}` : undefined,
      convertedAt: status === 'converted' ? randomDate(new Date('2024-11-01'), new Date()) : undefined,
      lostReason: status === 'lost' ? randomItem(['Chose competitor', 'No response', 'Price too high', 'Issue resolved']) : undefined,
      lostAt: status === 'lost' ? randomDate(new Date('2024-11-01'), new Date()) : undefined,
      notes: Math.random() > 0.5 ? 'Customer prefers afternoon appointments. Has pets.' : undefined,
      tags: randomInt(0, 1) === 1 ? [randomItem(['VIP', 'Recurring', 'Commercial', 'Referral'])] : [],
      customFields: {},
      createdAt: randomDate(new Date('2024-09-01'), new Date('2024-11-15')),
      updatedAt: randomDate(new Date('2024-11-15'), new Date()),
    });
  }

  return leads;
};

// ============================================================================
// DEALS DATA
// ============================================================================

const stageConfig = [
  { id: 'lead', probability: 10 },
  { id: 'inspection_scheduled', probability: 20 },
  { id: 'inspection_completed', probability: 40 },
  { id: 'quote_sent', probability: 50 },
  { id: 'negotiation', probability: 60 },
  { id: 'verbal_commitment', probability: 80 },
  { id: 'contract_sent', probability: 90 },
  { id: 'closed_won', probability: 100 },
  { id: 'closed_lost', probability: 0 },
];

const dealTitles = [
  'Annual Pest Control Contract',
  'Termite Treatment & Prevention',
  'Bed Bug Elimination Package',
  'Rodent Exclusion Services',
  'Quarterly Pest Management',
  'Monthly Maintenance Plan',
  'Commercial Kitchen Service',
  'Property Management Contract',
  'New Construction Treatment',
  'Wildlife Removal & Exclusion',
  'Mosquito Control Program',
  'Emergency Pest Response',
];

export const generateDeals = (contacts: MockContact[], leads: MockLead[]): MockDeal[] => {
  const deals: MockDeal[] = [];
  const companyId = 'company-001';
  
  // Create deals from converted leads and additional opportunities
  const dealContacts = contacts.slice(0, 30);
  
  const stageDistribution = [
    { stage: 'lead', count: 3 },
    { stage: 'inspection_scheduled', count: 4 },
    { stage: 'inspection_completed', count: 3 },
    { stage: 'quote_sent', count: 5 },
    { stage: 'negotiation', count: 3 },
    { stage: 'verbal_commitment', count: 2 },
    { stage: 'contract_sent', count: 2 },
    { stage: 'closed_won', count: 6 },
    { stage: 'closed_lost', count: 2 },
  ];

  let dealIndex = 0;
  
  for (const { stage, count } of stageDistribution) {
    for (let i = 0; i < count; i++) {
      const contact = dealContacts[dealIndex % dealContacts.length];
      const stageInfo = stageConfig.find(s => s.id === stage)!;
      const isCommercial = contact.type === 'commercial' || contact.type === 'property_manager';
      
      const baseValue = isCommercial ? randomInt(50000, 500000) : randomInt(7500, 150000);
      const serviceType = randomItem(serviceTypes);

      const daysInPipeline = randomInt(5, 45);
      const stageDurationDays = randomInt(2, 14);
      const status: MockDeal['status'] = stage === 'closed_won' ? 'won' : stage === 'closed_lost' ? 'lost' : 'open';
      
      deals.push({
        id: `deal-${String(dealIndex + 1).padStart(3, '0')}`,
        companyId,
        contactId: contact.id,
        contact,
        leadId: dealIndex < leads.length ? leads[dealIndex].id : undefined,
        title: randomItem(dealTitles),
        description: `${serviceType} for ${isCommercial ? 'commercial property' : 'residential home'}`,
        status,
        stage: stage as MockDeal['stage'],
        dealValueCents: baseValue,
        recurringRevenueCents: serviceType.includes('Monthly') || serviceType.includes('Quarterly') ? Math.round(baseValue * 0.15) : undefined,
        serviceFrequency: serviceType.includes('Monthly') ? 'monthly' : serviceType.includes('Quarterly') ? 'quarterly' : 'one_time',
        winProbability: stageInfo.probability,
        weightedValueCents: Math.round(baseValue * stageInfo.probability / 100),
        daysInPipeline,
        stageDurationDays,
        expectedCloseDate: stage.includes('closed') 
          ? randomDate(new Date('2024-10-01'), new Date()) 
          : randomDate(new Date(), new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)),
        actualCloseDate: stage === 'closed_won' || stage === 'closed_lost' 
          ? randomDate(new Date('2024-11-01'), new Date()) 
          : undefined,
        assignedTo: `user-${randomInt(1, 3)}`,
        serviceType,
        pestTypes: randomItem(pestTypes),
        propertyType: isCommercial ? randomItem(['office', 'retail', 'restaurant', 'warehouse']) : randomItem(['single_family', 'townhouse', 'condo']),
        propertySizeSqft: randomInt(1000, 8000),
        quoteId: ['quote_sent', 'negotiation', 'verbal_commitment', 'contract_sent', 'closed_won'].includes(stage)
          ? `quote-${String(dealIndex + 1).padStart(3, '0')}`
          : undefined,
        quoteSentAt: ['quote_sent', 'negotiation', 'verbal_commitment', 'contract_sent', 'closed_won'].includes(stage)
          ? randomDate(new Date('2024-11-01'), new Date())
          : undefined,
        lastActivityDate: randomDate(new Date('2024-11-01'), new Date()),
        nextFollowUpDate: !stage.includes('closed') ? randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) : undefined,
        wonReason: stage === 'closed_won' 
          ? randomItem(['Best price', 'Quality service', 'Referral trust', 'Quick response'])
          : undefined,
        lostReason: stage === 'closed_lost' 
          ? randomItem(['Price too high', 'Chose competitor', 'Project cancelled', 'No response'])
          : undefined,
        lostToCompetitor: stage === 'closed_lost' && Math.random() > 0.5 
          ? randomItem(['Terminix', 'Orkin', 'HomeTeam', 'Local competitor'])
          : undefined,
        notes: Math.random() > 0.5 ? 'Follow up scheduled. Customer interested in recurring service.' : undefined,
        tags: randomInt(0, 1) === 1 ? [randomItem(['High Value', 'Recurring', 'Referral', 'Commercial'])] : [],
        customFields: {},
        metadata: {},
        stageHistory: [
          {
            stage: 'lead',
            enteredAt: randomDate(new Date('2024-10-01'), new Date('2024-10-15')),
            exitedAt: stage !== 'lead' ? randomDate(new Date('2024-10-15'), new Date('2024-10-20')) : undefined,
          }
        ],
        createdAt: randomDate(new Date('2024-10-01'), new Date('2024-10-15')),
        updatedAt: randomDate(new Date('2024-11-15'), new Date()),
      });
      
      dealIndex++;
    }
  }

  return deals;
};

// ============================================================================
// INITIALIZE ALL DATA
// ============================================================================

let _contacts: MockContact[] | null = null;
let _leads: MockLead[] | null = null;
let _deals: MockDeal[] | null = null;

export const initializeMockData = () => {
  if (!_contacts) {
    _contacts = generateContacts();
    _leads = generateLeads(_contacts);
    _deals = generateDeals(_contacts, _leads);
  }
  return {
    contacts: _contacts,
    leads: _leads,
    deals: _deals,
  };
};

export const getMockContacts = (): MockContact[] => {
  if (!_contacts) initializeMockData();
  return _contacts!;
};

export const getMockLeads = (): MockLead[] => {
  if (!_leads) initializeMockData();
  return _leads!;
};

export const getMockDeals = (): MockDeal[] => {
  if (!_deals) initializeMockData();
  return _deals!;
};

export const resetMockData = () => {
  _contacts = null;
  _leads = null;
  _deals = null;
  localStorage.removeItem('mockContacts');
  localStorage.removeItem('mockLeads');
  localStorage.removeItem('mockDeals');
};

// ============================================================================
// SALES TEAM DATA
// ============================================================================

export interface SalesTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'sales_manager' | 'account_executive' | 'sales_rep';
  avatarUrl?: string;
  hireDate: string;
  territory?: string;
  quota: number; // Monthly quota in cents
  status: 'active' | 'on_leave' | 'inactive';
}

export interface SalesTeamPerformance {
  member: SalesTeamMember;
  dealsWon: number;
  dealsLost: number;
  dealsOpen: number;
  totalRevenue: number; // Revenue in cents
  pipelineValue: number; // Current pipeline value in cents
  weightedPipeline: number;
  conversionRate: number;
  avgDealSize: number;
  leadsConverted: number;
  leadsAssigned: number;
  activitiesThisMonth: number;
  quotaAttainment: number; // Percentage
  rank?: number;
}

// Sales team members
export const salesTeamMembers: SalesTeamMember[] = [
  {
    id: 'user-manager',
    firstName: 'April',
    lastName: 'Shane',
    email: 'april.shane@pestcontrol.com',
    phone: '(713) 555-0100',
    role: 'sales_manager',
    hireDate: '2020-03-15',
    status: 'active',
    quota: 0, // Manager doesn't have individual quota
  },
  {
    id: 'user-1',
    firstName: 'Marcus',
    lastName: 'Rodriguez',
    email: 'marcus.rodriguez@pestcontrol.com',
    phone: '(713) 555-0101',
    role: 'account_executive',
    hireDate: '2022-06-01',
    territory: 'Downtown Houston',
    quota: 7500000, // $75,000 monthly quota
    status: 'active',
  },
  {
    id: 'user-2',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@pestcontrol.com',
    phone: '(281) 555-0102',
    role: 'account_executive',
    hireDate: '2021-09-15',
    territory: 'Sugar Land / Missouri City',
    quota: 8000000, // $80,000 monthly quota
    status: 'active',
  },
  {
    id: 'user-3',
    firstName: 'Devon',
    lastName: 'Williams',
    email: 'devon.williams@pestcontrol.com',
    phone: '(832) 555-0103',
    role: 'account_executive',
    hireDate: '2023-02-01',
    territory: 'The Woodlands / Spring',
    quota: 6000000, // $60,000 monthly quota
    status: 'active',
  },
  {
    id: 'user-4',
    firstName: 'Emily',
    lastName: 'Thompson',
    email: 'emily.thompson@pestcontrol.com',
    phone: '(281) 555-0104',
    role: 'account_executive',
    hireDate: '2022-11-15',
    territory: 'Katy / Cypress',
    quota: 7000000, // $70,000 monthly quota
    status: 'active',
  },
  {
    id: 'user-5',
    firstName: 'James',
    lastName: 'Patterson',
    email: 'james.patterson@pestcontrol.com',
    phone: '(346) 555-0105',
    role: 'account_executive',
    hireDate: '2024-01-15',
    territory: 'Pearland / Clear Lake',
    quota: 5000000, // $50,000 monthly quota (newer hire)
    status: 'active',
  },
];

// Generate team performance data based on deals
export const generateTeamPerformance = (deals: MockDeal[], leads: MockLead[]): SalesTeamPerformance[] => {
  const accountExecutives = salesTeamMembers.filter(m => m.role === 'account_executive');
  
  return accountExecutives.map((member, index) => {
    // Simulate varying performance levels
    const performanceMultiplier = [1.15, 1.25, 0.85, 1.05, 0.75][index] || 1;
    
    const assignedDeals = deals.filter(d => d.assignedTo === member.id);
    const wonDeals = assignedDeals.filter(d => d.status === 'won');
    const lostDeals = assignedDeals.filter(d => d.status === 'lost');
    const openDeals = assignedDeals.filter(d => d.status === 'open');
    
    // Calculate base metrics or generate realistic ones
    const baseRevenue = Math.round(member.quota * performanceMultiplier * (0.8 + Math.random() * 0.4));
    const totalRevenue = wonDeals.length > 0 
      ? wonDeals.reduce((sum, d) => sum + d.dealValueCents, 0)
      : baseRevenue;
    
    const pipelineValue = openDeals.length > 0
      ? openDeals.reduce((sum, d) => sum + d.dealValueCents, 0)
      : Math.round(member.quota * 2.5 * performanceMultiplier);
    
    const weightedPipeline = openDeals.length > 0
      ? openDeals.reduce((sum, d) => sum + d.weightedValueCents, 0)
      : Math.round(pipelineValue * 0.45);
    
    const closedDeals = wonDeals.length + lostDeals.length;
    const conversionRate = closedDeals > 0 
      ? Math.round((wonDeals.length / closedDeals) * 100)
      : Math.round(55 + (performanceMultiplier - 1) * 100 + (Math.random() * 10 - 5));
    
    const dealsWonCount = wonDeals.length || Math.round(4 + performanceMultiplier * 3);
    const avgDealSize = dealsWonCount > 0 ? Math.round(totalRevenue / dealsWonCount) : Math.round(totalRevenue / 5);
    
    const assignedLeads = leads.filter(l => l.assignedTo === member.id);
    const convertedLeads = assignedLeads.filter(l => l.status === 'converted');
    
    const leadsAssigned = assignedLeads.length || Math.round(12 + Math.random() * 8);
    const leadsConverted = convertedLeads.length || Math.round(leadsAssigned * (conversionRate / 100) * 0.8);
    
    const quotaAttainment = Math.round((totalRevenue / member.quota) * 100);
    
    return {
      member,
      dealsWon: dealsWonCount,
      dealsLost: lostDeals.length || Math.round(2 + Math.random() * 3),
      dealsOpen: openDeals.length || Math.round(6 + performanceMultiplier * 4),
      totalRevenue,
      pipelineValue,
      weightedPipeline,
      conversionRate: Math.min(100, Math.max(0, conversionRate)),
      avgDealSize,
      leadsConverted,
      leadsAssigned,
      activitiesThisMonth: Math.round(45 + performanceMultiplier * 30),
      quotaAttainment: Math.min(200, Math.max(0, quotaAttainment)),
    };
  }).sort((a, b) => b.totalRevenue - a.totalRevenue)
    .map((perf, index) => ({ ...perf, rank: index + 1 }));
};

// Helper to get team performance
export const getTeamPerformance = (): SalesTeamPerformance[] => {
  const deals = getMockDeals();
  const leads = getMockLeads();
  return generateTeamPerformance(deals, leads);
};

// Get team summary stats
export const getTeamSummary = () => {
  const performance = getTeamPerformance();
  const totalRevenue = performance.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalPipeline = performance.reduce((sum, p) => sum + p.pipelineValue, 0);
  const totalDealsWon = performance.reduce((sum, p) => sum + p.dealsWon, 0);
  const totalDealsOpen = performance.reduce((sum, p) => sum + p.dealsOpen, 0);
  const avgConversionRate = Math.round(performance.reduce((sum, p) => sum + p.conversionRate, 0) / performance.length);
  const totalQuota = salesTeamMembers.filter(m => m.role === 'account_executive').reduce((sum, m) => sum + m.quota, 0);
  
  return {
    teamSize: performance.length,
    totalRevenue,
    totalPipeline,
    weightedPipeline: performance.reduce((sum, p) => sum + p.weightedPipeline, 0),
    totalDealsWon,
    totalDealsOpen,
    totalDealsLost: performance.reduce((sum, p) => sum + p.dealsLost, 0),
    avgConversionRate,
    teamQuotaAttainment: Math.round((totalRevenue / totalQuota) * 100),
    topPerformer: performance[0]?.member,
  };
};

