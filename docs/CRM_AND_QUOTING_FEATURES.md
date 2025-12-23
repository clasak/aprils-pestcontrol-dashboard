# CRM & Quoting System Features Reference

> **Purpose**: Comprehensive reference document for implementing CRM and quoting system features in April's Pest Control Dashboard. Use this as a guide for prioritizing and building new functionality.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current System State](#current-system-state)
3. [CRM Features](#crm-features)
   - [Must-Have Features](#crm-must-have-features)
   - [Most Sought-After Features](#crm-most-sought-after-features)
4. [Quoting System Features](#quoting-system-features)
   - [Must-Have Features](#quoting-must-have-features)
   - [Advanced CPQ Features](#advanced-cpq-features)
5. [Pest Control Industry-Specific Features](#pest-control-industry-specific-features)
6. [Implementation Roadmap](#implementation-roadmap)
7. [Technical Considerations](#technical-considerations)
8. [Competitive Analysis](#competitive-analysis)

---

## Executive Summary

This document outlines the essential and competitive CRM and quoting features based on industry research of leading platforms (Salesforce, HubSpot, Zoho, ServiceTitan, PestRoutes) and field service industry requirements. The goal is to build a CRM that surpasses Salesforce for pest control operations while remaining intuitive and efficient.

### Key Findings

- **Current Strength**: Solid foundation with contacts, leads, deals pipeline (Kanban), and basic quoting
- **Critical Gaps**: Activity management, email integration, PDF generation, workflow automation
- **Competitive Edge Opportunities**: AI-powered features, mobile-first field service, customer portal

---

## Current System State

### Implementation Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully Implemented |
| ⚠️ | Partially Implemented |
| ❌ | Not Implemented |

### Current Module Overview

| Module | Status | Key Files |
|--------|--------|-----------|
| Contact Management | ✅ | `src/frontend/src/modules/sales/pages/ContactsPage.tsx` |
| Lead Management | ✅ | `src/frontend/src/modules/sales/pages/LeadsPage.tsx` |
| Deal Pipeline | ✅ | `src/frontend/src/modules/sales/components/PipelineKanban.tsx` |
| Quote Builder | ⚠️ | `src/frontend/src/modules/sales/components/QuoteBuilder.tsx` |
| Dashboard & Analytics | ✅ | `src/frontend/src/modules/sales/pages/SalesDashboardPage.tsx` |
| Mock Data Layer | ✅ | `src/frontend/src/modules/sales/mocks/` |

---

## CRM Features

### CRM Must-Have Features

#### 1. Contact Management

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Contact database with custom fields | ✅ | P0 | Implemented with type, status, address fields |
| Contact segmentation and filtering | ✅ | P0 | Search and filter by type, status |
| Contact history and activity timeline | ❌ | P0 | **Critical gap** - need to track all interactions |
| Duplicate detection and merging | ❌ | P1 | Prevent data quality issues |
| Contact relationships | ⚠️ | P1 | Basic link to leads/deals, need family/business relationships |
| Contact tags and labels | ✅ | P2 | Implemented in mock data |
| Import/Export (CSV) | ⚠️ | P1 | Export exists, import missing |

**Implementation Requirements for Activity Timeline**:
```typescript
interface Activity {
  id: string;
  contactId: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'task' | 'quote' | 'service';
  subject: string;
  description?: string;
  outcome?: string;
  duration?: number; // minutes
  scheduledAt?: string;
  completedAt?: string;
  createdBy: string;
  createdAt: string;
  metadata?: Record<string, any>;
}
```

**Database Schema Addition**:
```sql
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id),
  lead_id UUID REFERENCES leads(id),
  deal_id UUID REFERENCES deals(id),
  type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT,
  outcome VARCHAR(100),
  duration_minutes INTEGER,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

#### 2. Lead Management

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Lead capture and entry | ✅ | P0 | Form-based lead creation |
| Lead scoring | ✅ | P0 | 0-100 score with factors |
| Lead qualification | ✅ | P0 | Status progression |
| Lead source tracking | ✅ | P0 | Source and category fields |
| Lead nurturing workflows | ❌ | P0 | **Critical gap** - automated follow-up sequences |
| Lead assignment rules | ❌ | P1 | Auto-assign based on territory, capacity |
| Lead to deal conversion | ✅ | P0 | Convert action implemented |
| Web lead capture forms | ❌ | P1 | Embeddable forms for website |

**Lead Nurturing Workflow Example**:
```typescript
interface NurturingWorkflow {
  id: string;
  name: string;
  trigger: {
    type: 'lead_created' | 'status_change' | 'score_threshold' | 'time_based';
    conditions: Record<string, any>;
  };
  steps: WorkflowStep[];
  isActive: boolean;
}

interface WorkflowStep {
  id: string;
  type: 'email' | 'sms' | 'task' | 'wait' | 'condition';
  config: {
    template?: string;
    assignTo?: string;
    waitDuration?: number; // hours
    condition?: string;
  };
  nextStepId?: string;
}
```

---

#### 3. Deal/Opportunity Management

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Pipeline visualization (Kanban) | ✅ | P0 | Excellent drag-and-drop implementation |
| Deal stages and progression | ✅ | P0 | 9 stages configured |
| Win/loss tracking | ✅ | P0 | Mark as won/lost with reasons |
| Win probability by stage | ✅ | P0 | Auto-calculated from stage |
| Revenue forecasting | ✅ | P0 | Weighted pipeline value |
| Deal collaboration | ❌ | P1 | Comments, mentions, shared notes |
| Deal templates | ❌ | P2 | Pre-configured deal types |
| Competitor tracking | ⚠️ | P2 | Lost to competitor field exists |

---

#### 4. Activity Management (CRITICAL GAP)

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Task management | ❌ | P0 | Create, assign, track tasks |
| Task reminders/notifications | ❌ | P0 | Push, email, in-app |
| Calendar view | ❌ | P0 | Day/week/month views |
| Calendar integration | ❌ | P1 | Google Calendar, Outlook sync |
| Call logging | ❌ | P0 | Manual call entry |
| Email integration | ❌ | P0 | Send/receive emails in CRM |
| Meeting scheduling | ❌ | P1 | Schedule with availability |
| Follow-up automation | ❌ | P1 | Auto-create follow-up tasks |

**Recommended Task Interface**:
```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'site_visit' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  dueTime?: string;
  assignedTo: string;
  relatedTo: {
    type: 'contact' | 'lead' | 'deal' | 'service';
    id: string;
  };
  reminder?: {
    type: 'email' | 'push' | 'sms';
    beforeMinutes: number;
  };
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

#### 5. Reporting & Analytics

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Sales dashboard | ✅ | P0 | KPIs, funnel, win rate |
| Pipeline reports | ✅ | P0 | Stage distribution, values |
| Performance metrics | ✅ | P0 | Conversion rates, averages |
| Custom report builder | ❌ | P1 | Drag-and-drop report creation |
| Scheduled reports | ❌ | P2 | Auto-email reports |
| Export to Excel/PDF | ⚠️ | P1 | Basic export, needs enhancement |
| Data visualization | ✅ | P1 | Charts in dashboard |

---

### CRM Most Sought-After Features

#### 1. AI & Automation (High Value Differentiator)

| Feature | Priority | Complexity | Impact |
|---------|----------|------------|--------|
| AI-powered lead scoring | P1 | High | Predict lead quality from behavior |
| Predictive analytics | P2 | High | Churn prediction, upsell opportunities |
| Smart data enrichment | P1 | Medium | Auto-fill contact info from web |
| Email response suggestions | P2 | High | AI-generated reply templates |
| Next best action | P2 | High | Recommend actions to sales reps |
| Conversation intelligence | P3 | Very High | Analyze call recordings |

**AI Lead Scoring Factors**:
```typescript
const leadScoreFactors = {
  // Demographic factors
  propertyType: { residential: 5, commercial: 10, propertyManager: 15 },
  propertySize: { '<1000sqft': 3, '1000-3000': 7, '>3000': 12 },
  
  // Behavioral factors
  responseTime: { '<1hour': 15, '<24hours': 10, '>24hours': 2 },
  websiteVisits: { multiplier: 2 }, // per visit
  emailOpens: { multiplier: 3 }, // per open
  
  // Need factors
  urgency: { emergency: 20, soon: 10, researching: 3 },
  pestSeverity: { severe: 15, moderate: 8, preventive: 3 },
  
  // Engagement factors
  requestedCallback: 10,
  downloadedContent: 5,
  referredBy: 20,
};
```

---

#### 2. Communication Hub

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Built-in email client | P0 | Medium | Send/receive, track opens |
| Email templates | P0 | Low | Customizable templates |
| SMS/text messaging | P1 | Medium | Two-way SMS |
| WhatsApp integration | P2 | Medium | Business API |
| Unified inbox | P1 | High | All channels in one view |
| Call recording | P2 | High | VoIP integration |
| Click-to-call | P1 | Medium | One-click dialing |

**Email Template Structure**:
```typescript
interface EmailTemplate {
  id: string;
  name: string;
  category: 'lead_nurture' | 'quote_follow_up' | 'service_reminder' | 'thank_you' | 'custom';
  subject: string;
  htmlBody: string;
  textBody: string;
  variables: string[]; // {{contact.firstName}}, {{deal.value}}, etc.
  attachments?: string[];
  isActive: boolean;
}
```

---

#### 3. Mobile Experience (Critical for Field Service)

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Progressive Web App | P0 | Medium | Mobile-responsive, installable |
| Offline capabilities | P1 | High | Work without internet |
| GPS check-in | P1 | Medium | Technician location tracking |
| Photo/document capture | P1 | Low | Upload from camera |
| Route optimization | P2 | High | Efficient route planning |
| Push notifications | P1 | Medium | Real-time alerts |
| Mobile signature capture | P1 | Medium | Sign on device |

---

#### 4. Advanced Workflow Automation

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Visual workflow builder | P1 | High | Drag-and-drop automation |
| Trigger-based actions | P0 | Medium | Status changes, time-based |
| Multi-step sequences | P1 | Medium | Email drip campaigns |
| Assignment rules | P1 | Medium | Auto-assign based on criteria |
| Escalation workflows | P1 | Medium | Overdue task escalation |
| Approval workflows | P1 | Medium | Quote/discount approvals |

**Workflow Trigger Types**:
```typescript
type WorkflowTrigger = 
  | { type: 'record_created'; entity: 'lead' | 'deal' | 'contact' }
  | { type: 'field_changed'; entity: string; field: string; from?: any; to?: any }
  | { type: 'stage_changed'; fromStage?: string; toStage: string }
  | { type: 'time_based'; schedule: string } // cron expression
  | { type: 'date_field'; entity: string; field: string; offset: number }
  | { type: 'score_threshold'; entity: 'lead'; threshold: number }
  | { type: 'webhook'; source: string };
```

---

#### 5. Document Management

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Document storage | P1 | Medium | Attach files to records |
| Version control | P2 | Medium | Track document versions |
| E-signature integration | P0 | Medium | DocuSign, Adobe Sign |
| Document templates | P1 | Medium | Generate from templates |
| Contract management | P2 | High | Track contract lifecycle |
| Auto-generate documents | P1 | High | Merge fields into templates |

---

#### 6. Customer Self-Service Portal

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Customer login | P1 | Medium | Secure authentication |
| Service history view | P1 | Low | Past services, invoices |
| Schedule appointments | P1 | Medium | Self-service booking |
| Pay invoices | P1 | High | Payment processing |
| Request callbacks | P0 | Low | Form submission |
| View/accept quotes | P0 | Medium | Online quote acceptance |
| Support tickets | P2 | Medium | Issue reporting |

---

#### 7. Integration Ecosystem

| Feature | Priority | Integration |
|---------|----------|-------------|
| Accounting sync | P0 | QuickBooks, Xero |
| Marketing automation | P1 | Mailchimp, ActiveCampaign |
| Payment processing | P0 | Stripe, Square |
| Calendar sync | P1 | Google Calendar, Outlook |
| VoIP/Phone | P1 | Twilio, RingCentral |
| E-signature | P1 | DocuSign, PandaDoc |
| Zapier/Make | P2 | Custom automations |

---

## Quoting System Features

### Quoting Must-Have Features

#### 1. Basic Quote Creation

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Line item management | ✅ | P0 | Add, edit, remove items |
| Product/service catalog | ⚠️ | P0 | Templates exist, need full catalog |
| Quantity and pricing | ✅ | P0 | Per-item pricing |
| Percentage discount | ✅ | P0 | Discount by percentage |
| Fixed discount | ✅ | P0 | Flat amount discount |
| Tax calculation | ✅ | P0 | Configurable tax rate |
| Terms and conditions | ✅ | P0 | Default terms included |
| Quote notes | ✅ | P1 | Customer-facing notes |
| Quote number generation | ✅ | P0 | Auto-generated |

---

#### 2. Quote Management

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Quote versioning | ❌ | P0 | Track revisions |
| Quote status tracking | ⚠️ | P0 | draft, sent, accepted, rejected, expired |
| Quote expiration | ✅ | P0 | Valid until date |
| Quote approval workflows | ❌ | P1 | Manager approval for discounts |
| Clone/duplicate quotes | ❌ | P1 | Copy existing quote |
| Quote history | ❌ | P1 | All quotes for contact/deal |
| Bulk quote operations | ❌ | P2 | Update multiple quotes |

**Quote Version Schema**:
```typescript
interface QuoteVersion {
  id: string;
  quoteId: string;
  version: number;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  createdBy: string;
  createdAt: string;
  snapshot: Quote; // Full quote state at this version
}
```

---

#### 3. Quote Delivery

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| PDF generation | ❌ | P0 | **Critical** - Professional PDF output |
| Email delivery | ❌ | P0 | **Critical** - Send via email |
| Custom PDF templates | ❌ | P1 | Branded templates |
| Quote link sharing | ❌ | P1 | Shareable URL |
| Track quote views | ❌ | P1 | Know when viewed |
| SMS quote link | ❌ | P2 | Send via text |

**PDF Generation Requirements**:
- Professional layout with company branding
- Logo, company info, contact details
- Line items table with descriptions
- Subtotal, discount, tax breakdown
- Terms and conditions section
- Signature line
- QR code for quick acceptance

---

#### 4. Quote Pricing

| Feature | Status | Priority | Notes |
|---------|--------|----------|-------|
| Customer-specific pricing | ❌ | P1 | Price lists per customer |
| Volume discounts | ❌ | P1 | Tiered quantity pricing |
| Time-based pricing | ❌ | P2 | Seasonal rates |
| Bundle pricing | ❌ | P1 | Package deals |
| Cost tracking | ❌ | P1 | Track margins |

---

### Advanced CPQ Features

#### 1. Product Configuration (CPQ)

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Service packages | P0 | Medium | Pre-built bundles |
| Product rules | P1 | High | Required combos, exclusions |
| Dynamic pricing | P1 | High | Rules-based pricing |
| Guided selling | P2 | High | Wizard for config |
| Upsell/cross-sell suggestions | P1 | Medium | AI recommendations |

**Service Package Structure**:
```typescript
interface ServicePackage {
  id: string;
  name: string;
  description: string;
  category: 'residential' | 'commercial' | 'specialized';
  services: {
    serviceId: string;
    quantity: number;
    isRequired: boolean;
    discount?: number; // package discount
  }[];
  basePrice: number;
  frequency?: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  savings?: number; // vs individual pricing
  isActive: boolean;
}

// Example packages
const packages = [
  {
    name: "Home Protection Plan",
    services: ["general_pest_quarterly", "termite_inspection_annual"],
    basePrice: 49900, // $499/year
    savings: 10000, // saves $100
    frequency: "annual"
  },
  {
    name: "Complete Commercial Coverage",
    services: ["commercial_pest_monthly", "rodent_monthly", "fly_control"],
    basePrice: 29900, // $299/month
    frequency: "monthly"
  }
];
```

---

#### 2. Smart Pricing Engine

| Feature | Priority | Notes |
|---------|----------|-------|
| AI pricing recommendations | P2 | Based on win history |
| Competitive price benchmarking | P3 | Market rate comparison |
| Profitability analysis | P1 | Per-line-item margins |
| Dynamic discount limits | P1 | Max discount by role |
| Price optimization | P3 | Maximize revenue |

**Dynamic Pricing Rules**:
```typescript
interface PricingRule {
  id: string;
  name: string;
  priority: number;
  conditions: {
    customerType?: string[];
    propertyType?: string[];
    serviceType?: string[];
    minQuantity?: number;
    maxQuantity?: number;
    dateRange?: { start: string; end: string };
  };
  adjustment: {
    type: 'percentage' | 'fixed' | 'override';
    value: number;
  };
  isActive: boolean;
}
```

---

#### 3. Interactive Online Quotes

| Feature | Priority | Complexity | Notes |
|---------|----------|------------|-------|
| Online quote view | P0 | Medium | Customer-facing page |
| One-click acceptance | P0 | Medium | Accept with signature |
| Add/remove services | P1 | High | Customer customization |
| Payment plan options | P1 | Medium | Financing calculator |
| Real-time price updates | P1 | Medium | Dynamic total |
| Schedule from quote | P1 | Medium | Book service directly |

**Online Quote Page Requirements**:
- Responsive mobile design
- Clear pricing breakdown
- Service descriptions with images
- Accept/Reject buttons
- E-signature capture
- Payment method selection
- Preferred scheduling
- Contact form for questions

---

#### 4. Approval Workflows

| Feature | Priority | Notes |
|---------|----------|-------|
| Discount approval thresholds | P0 | Auto-approve < X% |
| Multi-level approval chains | P1 | Manager → Director |
| Approval notifications | P0 | Email/push alerts |
| Approval audit trail | P1 | Who approved, when |
| Delegation rules | P2 | Backup approvers |

**Approval Threshold Example**:
```typescript
const approvalThresholds = {
  discountPercent: [
    { max: 10, autoApprove: true },
    { max: 20, approvers: ['sales_manager'] },
    { max: 30, approvers: ['sales_director'] },
    { max: 100, approvers: ['vp_sales', 'owner'] }
  ],
  dealValue: [
    { max: 100000, autoApprove: true }, // $1,000
    { max: 500000, approvers: ['sales_manager'] },
    { max: Infinity, approvers: ['sales_director'] }
  ]
};
```

---

#### 5. Quote Analytics

| Feature | Priority | Notes |
|---------|----------|-------|
| Quote-to-close rate | P0 | Conversion tracking |
| Average time to close | P0 | Days from quote to accept |
| Discount analysis | P1 | Average discount given |
| Win/loss by service | P1 | Best selling services |
| Price sensitivity | P2 | Price vs win rate |
| Quote engagement | P1 | Views, time on page |

---

#### 6. Recurring Revenue Features

| Feature | Priority | Notes |
|---------|----------|-------|
| Recurring service quotes | P0 | Monthly/quarterly pricing |
| Subscription management | P1 | Manage recurring services |
| Auto-renewal quotes | P1 | Generate renewal quotes |
| Contract length discounts | P1 | Longer = cheaper |
| Usage-based add-ons | P2 | Variable pricing |

---

## Pest Control Industry-Specific Features

### Field Service Requirements

| Feature | Priority | Category | Notes |
|---------|----------|----------|-------|
| Property assessment | P0 | Inspection | Square footage, type, conditions |
| Pest identification | P0 | Service | Pest types, severity levels |
| Treatment area calculator | P1 | Quoting | Price by area/volume |
| Infestation severity pricing | P1 | Quoting | Severity-based pricing |
| Photo documentation | P0 | Service | Before/after photos |
| Inspection reports | P1 | Compliance | Detailed findings |
| Treatment protocols | P1 | Operations | Standard procedures |
| Chemical usage tracking | P0 | Compliance | EPA requirements |
| Re-treatment triggers | P1 | Service | Auto-schedule follow-ups |
| Warranty management | P1 | Service | Track guarantees |

### Pest-Specific Services Catalog

```typescript
const pestControlServices = {
  generalPest: {
    name: "General Pest Control",
    targetPests: ["ants", "roaches", "spiders", "silverfish"],
    frequencies: ["one_time", "monthly", "quarterly"],
    basePrice: { residential: 7500, commercial: 15000 },
    areaMultiplier: 0.02 // per sqft over 2000
  },
  termite: {
    name: "Termite Services",
    types: ["inspection", "bait_system", "liquid_treatment", "fumigation"],
    warranties: ["1_year", "5_year", "lifetime"],
    basePrice: { inspection: 15000, bait: 150000, liquid: 200000 }
  },
  bedBug: {
    name: "Bed Bug Treatment",
    methods: ["heat", "chemical", "combination"],
    scope: ["single_room", "multiple_rooms", "whole_house"],
    followUp: { required: true, interval: 14 } // days
  },
  rodent: {
    name: "Rodent Control",
    services: ["inspection", "trapping", "exclusion", "monitoring"],
    ongoing: true,
    basePrice: { initial: 25000, monthly: 7500 }
  },
  mosquito: {
    name: "Mosquito Control",
    seasonal: true,
    frequency: "monthly",
    basePrice: 8500,
    areaMultiplier: 0.01
  },
  wildlife: {
    name: "Wildlife Removal",
    animals: ["raccoons", "squirrels", "bats", "birds", "snakes"],
    services: ["removal", "exclusion", "cleanup"],
    pricing: "quote_required"
  }
};
```

### Property Assessment Data

```typescript
interface PropertyAssessment {
  propertyId: string;
  contactId: string;
  assessedAt: string;
  assessedBy: string;
  
  // Property details
  propertyType: 'single_family' | 'multi_family' | 'condo' | 'commercial' | 'industrial';
  squareFootage: number;
  lotSize?: number;
  yearBuilt?: number;
  stories: number;
  basement: boolean;
  crawlSpace: boolean;
  attic: boolean;
  garage: boolean;
  pool: boolean;
  
  // Risk factors
  moistureIssues: boolean;
  woodToGroundContact: boolean;
  vegetationTouchingStructure: boolean;
  standingWater: boolean;
  foodStorage: 'residential' | 'commercial_kitchen' | 'warehouse';
  
  // Current conditions
  existingPestActivity: {
    pestType: string;
    severity: 'none' | 'light' | 'moderate' | 'severe';
    locations: string[];
  }[];
  
  // Photos
  photos: {
    url: string;
    caption: string;
    location: string;
    timestamp: string;
  }[];
  
  // Recommendations
  recommendedServices: string[];
  recommendedFrequency: string;
  estimatedCost: number;
  notes: string;
}
```

---

## Implementation Roadmap

### Phase 1: Essential Gaps (Weeks 1-6)

**Goal**: Fill critical missing functionality

| Week | Focus | Features |
|------|-------|----------|
| 1-2 | Activity Management | Tasks, activity timeline, calendar view |
| 3-4 | Quote Enhancement | PDF generation, email delivery, versioning |
| 5-6 | Workflow Foundation | Basic automations, reminders, notifications |

**Key Deliverables**:
1. Task management system with CRUD operations
2. Activity timeline component for contacts/leads/deals
3. PDF quote generation with professional template
4. Email integration for sending quotes
5. Quote approval workflow (basic)
6. Reminder/notification system

**Database Changes**:
- Add `activities` table
- Add `tasks` table
- Add `quote_versions` table
- Add `notifications` table
- Add `email_logs` table

---

### Phase 2: Competitive Advantage (Weeks 7-16)

**Goal**: Differentiate from competitors

| Week | Focus | Features |
|------|-------|----------|
| 7-8 | Service Catalog | Full product catalog, packages, bundles |
| 9-10 | Customer Portal | Online quotes, self-service booking |
| 11-12 | Advanced Quoting | CPQ logic, dynamic pricing, approvals |
| 13-14 | Mobile Experience | PWA, offline mode, field tech features |
| 15-16 | Communication | Email templates, SMS, unified inbox |

**Key Deliverables**:
1. Complete service catalog with categories
2. Customer self-service portal
3. Online quote acceptance with e-signature
4. CPQ with bundles and rules
5. Progressive web app
6. Two-way SMS integration
7. Email template system

---

### Phase 3: Industry Leadership (Weeks 17-26)

**Goal**: Best-in-class pest control CRM

| Week | Focus | Features |
|------|-------|----------|
| 17-18 | AI Features | Smart lead scoring, recommendations |
| 19-20 | Automation | Visual workflow builder, sequences |
| 21-22 | Analytics | Custom reports, dashboards, forecasting |
| 23-24 | Integrations | QuickBooks, payment processing, calendar |
| 25-26 | Advanced | Route optimization, IoT sensors |

**Key Deliverables**:
1. AI-powered lead scoring model
2. Visual workflow automation builder
3. Custom report builder
4. QuickBooks integration
5. Stripe payment processing
6. Route optimization for technicians
7. Advanced analytics dashboard

---

## Technical Considerations

### Architecture Recommendations

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  React + TypeScript + Material-UI + Redux                   │
│  PWA with Service Workers for offline                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway                             │
│  NestJS with REST + WebSocket for real-time                 │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌───────────────┐
│  Core CRM     │   │   Workflow      │   │  Integration  │
│  Service      │   │   Engine        │   │  Service      │
│               │   │                 │   │               │
│ - Contacts    │   │ - Automations   │   │ - QuickBooks  │
│ - Leads       │   │ - Sequences     │   │ - Stripe      │
│ - Deals       │   │ - Triggers      │   │ - Twilio      │
│ - Quotes      │   │ - Tasks         │   │ - Calendar    │
└───────────────┘   └─────────────────┘   └───────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      PostgreSQL                              │
│  Primary database with Redis caching                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Technical Decisions

| Area | Recommendation | Reason |
|------|----------------|--------|
| PDF Generation | `@react-pdf/renderer` or Puppeteer | React-based, good for templates |
| Email | SendGrid or AWS SES | Reliable, analytics |
| SMS | Twilio | Industry standard, reliable |
| E-Signature | DocuSign API or PandaDoc | Legal compliance |
| Payments | Stripe | Developer-friendly, ACH support |
| Search | PostgreSQL full-text + Elasticsearch | Start simple, scale later |
| Queue | Bull (Redis-based) | Job processing, retries |
| Real-time | Socket.io | Already in stack |

### New API Endpoints Needed

```
# Activities
POST   /api/activities
GET    /api/activities?contactId=X&leadId=X&dealId=X
GET    /api/activities/:id
PUT    /api/activities/:id
DELETE /api/activities/:id

# Tasks
POST   /api/tasks
GET    /api/tasks?assignedTo=X&status=X&dueDate=X
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
POST   /api/tasks/:id/complete

# Quotes (enhanced)
POST   /api/quotes/:id/send          # Email quote
GET    /api/quotes/:id/pdf           # Generate PDF
POST   /api/quotes/:id/accept        # Customer acceptance
POST   /api/quotes/:id/reject        # Customer rejection
GET    /api/quotes/:id/versions      # Version history
POST   /api/quotes/:id/clone         # Duplicate quote

# Workflows
POST   /api/workflows
GET    /api/workflows
PUT    /api/workflows/:id
DELETE /api/workflows/:id
POST   /api/workflows/:id/activate
POST   /api/workflows/:id/deactivate

# Notifications
GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/mark-all-read

# Service Catalog
GET    /api/services
GET    /api/services/:id
POST   /api/services
PUT    /api/services/:id
GET    /api/service-packages
```

---

## Competitive Analysis

### Feature Comparison Matrix

| Feature | Salesforce | HubSpot | ServiceTitan | PestRoutes | April's (Target) |
|---------|------------|---------|--------------|------------|------------------|
| Contact Management | ✅ | ✅ | ✅ | ✅ | ✅ |
| Lead Scoring | ✅ | ✅ | ⚠️ | ❌ | ✅ |
| Pipeline Kanban | ✅ | ✅ | ✅ | ⚠️ | ✅ |
| Quoting/CPQ | ✅ | ⚠️ | ✅ | ⚠️ | ✅ (Target) |
| E-Signature | ✅ | ✅ | ✅ | ❌ | ✅ (Target) |
| Workflow Automation | ✅ | ✅ | ⚠️ | ❌ | ✅ (Target) |
| Mobile App | ✅ | ✅ | ✅ | ✅ | ✅ (Target) |
| Route Optimization | ❌ | ❌ | ✅ | ✅ | ✅ (Target) |
| Chemical Tracking | ❌ | ❌ | ⚠️ | ✅ | ✅ (Target) |
| Pest-Specific | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Customer Portal | ⚠️ | ✅ | ✅ | ⚠️ | ✅ (Target) |
| AI Features | ✅ | ⚠️ | ❌ | ❌ | ✅ (Target) |
| Price | $$$$ | $$$ | $$$$ | $$ | $$ |

### Target Differentiators

1. **Pest Control Native**: Built specifically for pest control, not adapted from generic CRM
2. **AI-Powered**: Smart lead scoring, recommendations, predictive analytics
3. **Modern UX**: Consumer-grade interface, not enterprise complexity
4. **Integrated Field Service**: CRM + Operations in one platform
5. **Affordable**: Enterprise features at SMB pricing
6. **Fast Implementation**: Quick setup, minimal training needed

---

## References

### Industry Research Sources

- Salesforce Sales Cloud documentation
- HubSpot CRM best practices
- ServiceTitan feature comparison
- PestRoutes field service features
- Gartner CRM Magic Quadrant
- G2 Crowd CRM reviews
- Capterra field service software comparison

### Pest Control Industry Standards

- NPMA (National Pest Management Association) guidelines
- EPA pesticide record-keeping requirements
- State licensing requirements (varies by state)
- Industry average metrics:
  - Lead conversion rate: 25-35%
  - Quote acceptance rate: 50-65%
  - Customer retention: 70-85%
  - Average ticket: $150-300 residential, $300-1000 commercial

---

*Last Updated: December 2024*
*Version: 1.0*

