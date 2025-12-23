-- ============================================================================
-- April's Pest Control Dashboard - Sales Schema
-- Version: 1.0.0
-- Description: Sales CRM tables including contacts, companies, leads, deals,
--              quotes, and commission tracking.
-- Dependencies: 001-core.sql
-- ============================================================================

-- Create sales schema
CREATE SCHEMA IF NOT EXISTS sales;

-- Set search path
SET search_path TO sales, core, public;

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Contact types
CREATE TYPE sales.contact_type AS ENUM (
    'residential',
    'commercial',
    'property_manager',
    'referral_partner',
    'vendor',
    'other'
);

-- Lead status
CREATE TYPE sales.lead_status AS ENUM (
    'new',
    'contacted',
    'qualified',
    'unqualified',
    'nurturing',
    'converted',
    'lost'
);

-- Lead source categories
CREATE TYPE sales.lead_source_category AS ENUM (
    'organic',
    'paid',
    'referral',
    'partner',
    'direct',
    'other'
);

-- Deal status
CREATE TYPE sales.deal_status AS ENUM (
    'open',
    'won',
    'lost',
    'cancelled'
);

-- Deal stage (pipeline stages)
CREATE TYPE sales.deal_stage AS ENUM (
    'lead',
    'inspection_scheduled',
    'inspection_completed',
    'quote_sent',
    'negotiation',
    'verbal_commitment',
    'contract_sent',
    'closed_won',
    'closed_lost'
);

-- Quote status
CREATE TYPE sales.quote_status AS ENUM (
    'draft',
    'pending_approval',
    'approved',
    'sent',
    'viewed',
    'accepted',
    'rejected',
    'expired',
    'revised'
);

-- Service frequency
CREATE TYPE sales.service_frequency AS ENUM (
    'one_time',
    'weekly',
    'bi_weekly',
    'monthly',
    'bi_monthly',
    'quarterly',
    'semi_annual',
    'annual',
    'custom'
);

-- Property types
CREATE TYPE sales.property_type AS ENUM (
    'single_family',
    'multi_family',
    'apartment',
    'condo',
    'townhouse',
    'mobile_home',
    'commercial_office',
    'commercial_retail',
    'commercial_restaurant',
    'commercial_warehouse',
    'commercial_industrial',
    'commercial_medical',
    'commercial_other',
    'agricultural',
    'vacant_land',
    'other'
);

-- Commission types
CREATE TYPE sales.commission_type AS ENUM (
    'percentage',
    'flat',
    'tiered',
    'recurring'
);

-- ============================================================================
-- COMPANIES TABLE (Customer Companies/Organizations)
-- ============================================================================

CREATE TABLE sales.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Company Information
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    dba_name VARCHAR(255),

    -- Industry/Type
    industry VARCHAR(100),
    company_size VARCHAR(50),                       -- e.g., "1-10", "11-50", "51-200"
    annual_revenue NUMERIC(15, 2),

    -- Contact Information
    email VARCHAR(255),
    phone VARCHAR(50),
    fax VARCHAR(50),
    website VARCHAR(255),

    -- Primary Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',

    -- Geographic
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Territory
    territory_id UUID REFERENCES core.territories(id),

    -- Account Management
    account_owner_id UUID REFERENCES core.users(id),
    account_type VARCHAR(50),                       -- prospect, customer, former_customer

    -- Billing
    billing_contact_id UUID,                        -- FK to contacts (set after contacts table)
    payment_terms VARCHAR(50) DEFAULT 'NET30',
    tax_exempt BOOLEAN DEFAULT FALSE,
    tax_exempt_number VARCHAR(100),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    customer_since DATE,

    -- Scoring
    account_score INTEGER DEFAULT 0,

    -- Tags
    tags TEXT[],

    -- Social Media
    linkedin_url VARCHAR(255),
    facebook_url VARCHAR(255),
    twitter_handle VARCHAR(100),

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT companies_email_format_check CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

COMMENT ON TABLE sales.companies IS 'Customer companies and organizations';
COMMENT ON COLUMN sales.companies.company_id IS 'Reference to tenant company (core.companies)';

-- Indexes for companies
CREATE INDEX sales_companies_company_id_idx ON sales.companies(company_id);
CREATE INDEX sales_companies_territory_id_idx ON sales.companies(territory_id);
CREATE INDEX sales_companies_account_owner_id_idx ON sales.companies(account_owner_id);
CREATE INDEX sales_companies_name_idx ON sales.companies(name);
CREATE INDEX sales_companies_postal_code_idx ON sales.companies(postal_code);
CREATE INDEX sales_companies_is_active_idx ON sales.companies(is_active) WHERE is_active = TRUE;
CREATE INDEX sales_companies_tags_idx ON sales.companies USING GIN(tags);
CREATE INDEX sales_companies_deleted_at_idx ON sales.companies(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- CONTACTS TABLE
-- ============================================================================

CREATE TABLE sales.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,
    sales_company_id UUID REFERENCES sales.companies(id) ON DELETE SET NULL,

    -- Contact Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    full_name VARCHAR(200) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    fax VARCHAR(50),

    -- Job Information
    job_title VARCHAR(100),
    department VARCHAR(100),

    -- Contact Type
    contact_type sales.contact_type DEFAULT 'residential',
    is_primary BOOLEAN DEFAULT FALSE,               -- Primary contact for company

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',

    -- Geographic
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Territory
    territory_id UUID REFERENCES core.territories(id),

    -- Account Management
    owner_id UUID REFERENCES core.users(id),

    -- Property Information (for residential)
    property_type sales.property_type,
    property_size_sqft INTEGER,
    lot_size_sqft INTEGER,
    year_built INTEGER,
    number_of_units INTEGER DEFAULT 1,

    -- Communication Preferences
    preferred_contact_method VARCHAR(20) DEFAULT 'email',  -- email, phone, sms
    best_time_to_contact VARCHAR(50),               -- morning, afternoon, evening
    do_not_call BOOLEAN DEFAULT FALSE,
    do_not_email BOOLEAN DEFAULT FALSE,
    do_not_mail BOOLEAN DEFAULT FALSE,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    customer_since DATE,

    -- Scoring
    contact_score INTEGER DEFAULT 0,

    -- Lead Source (for initial contact)
    lead_source_id UUID,                            -- FK to lead_sources (set later)

    -- Tags
    tags TEXT[],

    -- Notes
    notes TEXT,

    -- Social Media
    linkedin_url VARCHAR(255),
    facebook_url VARCHAR(255),

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT contacts_email_format_check CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT contacts_property_size_check CHECK (property_size_sqft IS NULL OR property_size_sqft > 0)
);

-- Add billing contact FK to companies
ALTER TABLE sales.companies
    ADD CONSTRAINT companies_billing_contact_fkey
    FOREIGN KEY (billing_contact_id) REFERENCES sales.contacts(id) ON DELETE SET NULL;

COMMENT ON TABLE sales.contacts IS 'Customer and prospect contacts';
COMMENT ON COLUMN sales.contacts.sales_company_id IS 'Organization this contact belongs to';
COMMENT ON COLUMN sales.contacts.property_type IS 'Type of property for service';

-- Indexes for contacts
CREATE INDEX sales_contacts_company_id_idx ON sales.contacts(company_id);
CREATE INDEX sales_contacts_sales_company_id_idx ON sales.contacts(sales_company_id);
CREATE INDEX sales_contacts_owner_id_idx ON sales.contacts(owner_id);
CREATE INDEX sales_contacts_territory_id_idx ON sales.contacts(territory_id);
CREATE INDEX sales_contacts_email_idx ON sales.contacts(email);
CREATE INDEX sales_contacts_phone_idx ON sales.contacts(phone);
CREATE INDEX sales_contacts_full_name_idx ON sales.contacts(full_name);
CREATE INDEX sales_contacts_postal_code_idx ON sales.contacts(postal_code);
CREATE INDEX sales_contacts_contact_type_idx ON sales.contacts(contact_type);
CREATE INDEX sales_contacts_is_active_idx ON sales.contacts(is_active) WHERE is_active = TRUE;
CREATE INDEX sales_contacts_tags_idx ON sales.contacts USING GIN(tags);
CREATE INDEX sales_contacts_deleted_at_idx ON sales.contacts(deleted_at) WHERE deleted_at IS NULL;

-- Full-text search index
CREATE INDEX sales_contacts_search_idx ON sales.contacts
    USING GIN (to_tsvector('english', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '')));

-- ============================================================================
-- LEAD_SOURCES TABLE
-- ============================================================================

CREATE TABLE sales.lead_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Source Information
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    description TEXT,
    category sales.lead_source_category NOT NULL,

    -- Tracking
    utm_source VARCHAR(100),
    utm_medium VARCHAR(100),
    utm_campaign VARCHAR(100),

    -- Cost Tracking
    cost_per_lead NUMERIC(10, 2),
    monthly_budget NUMERIC(12, 2),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Performance Metrics (cached)
    total_leads INTEGER DEFAULT 0,
    converted_leads INTEGER DEFAULT 0,
    total_revenue NUMERIC(15, 2) DEFAULT 0,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT lead_sources_name_unique UNIQUE (company_id, name)
);

-- Add FK to contacts
ALTER TABLE sales.contacts
    ADD CONSTRAINT contacts_lead_source_fkey
    FOREIGN KEY (lead_source_id) REFERENCES sales.lead_sources(id) ON DELETE SET NULL;

COMMENT ON TABLE sales.lead_sources IS 'Lead source tracking for attribution';

-- Indexes for lead_sources
CREATE INDEX sales_lead_sources_company_id_idx ON sales.lead_sources(company_id);
CREATE INDEX sales_lead_sources_category_idx ON sales.lead_sources(category);
CREATE INDEX sales_lead_sources_is_active_idx ON sales.lead_sources(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- LEADS TABLE
-- ============================================================================

CREATE TABLE sales.leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Lead Information
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(200) GENERATED ALWAYS AS (
        COALESCE(first_name, '') || CASE WHEN first_name IS NOT NULL AND last_name IS NOT NULL THEN ' ' ELSE '' END || COALESCE(last_name, '')
    ) STORED,
    email VARCHAR(255),
    phone VARCHAR(50),
    mobile VARCHAR(50),
    company_name VARCHAR(255),

    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',

    -- Geographic
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Lead Classification
    lead_type sales.contact_type DEFAULT 'residential',
    property_type sales.property_type,

    -- Source
    lead_source_id UUID REFERENCES sales.lead_sources(id),
    source_details TEXT,                            -- Additional source info
    referral_contact_id UUID REFERENCES sales.contacts(id),

    -- Campaign
    campaign_id UUID,                               -- FK to marketing.campaigns (set later)

    -- Status
    status sales.lead_status NOT NULL DEFAULT 'new',
    status_changed_at TIMESTAMPTZ DEFAULT NOW(),
    status_reason TEXT,

    -- Assignment
    owner_id UUID REFERENCES core.users(id),
    assigned_at TIMESTAMPTZ,
    territory_id UUID REFERENCES core.territories(id),

    -- Scoring
    lead_score INTEGER DEFAULT 0,
    score_breakdown JSONB DEFAULT '{}'::JSONB,      -- Details of score calculation

    -- Qualification
    is_qualified BOOLEAN DEFAULT FALSE,
    qualification_notes TEXT,
    budget_range VARCHAR(50),
    decision_timeline VARCHAR(50),
    decision_maker BOOLEAN,

    -- Service Interest
    interested_services TEXT[],                     -- Array of service types
    pest_issues TEXT[],                             -- Reported pest problems
    urgency VARCHAR(20) DEFAULT 'normal',           -- low, normal, high, urgent

    -- Property Details
    property_size_sqft INTEGER,
    estimated_value NUMERIC(12, 2),

    -- Communication
    preferred_contact_method VARCHAR(20) DEFAULT 'email',
    best_time_to_contact VARCHAR(50),
    last_contacted_at TIMESTAMPTZ,
    next_follow_up_at TIMESTAMPTZ,
    follow_up_count INTEGER DEFAULT 0,

    -- Conversion
    converted_at TIMESTAMPTZ,
    converted_to_contact_id UUID REFERENCES sales.contacts(id),
    converted_to_deal_id UUID,                      -- FK to deals (set later)
    conversion_value NUMERIC(12, 2),

    -- Loss Reason
    lost_at TIMESTAMPTZ,
    lost_reason VARCHAR(100),
    lost_to_competitor VARCHAR(100),

    -- Notes
    notes TEXT,

    -- Tags
    tags TEXT[],

    -- Web Activity (if tracked)
    web_activity JSONB DEFAULT '{}'::JSONB,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT leads_email_format_check CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

COMMENT ON TABLE sales.leads IS 'Sales leads before conversion to contacts';
COMMENT ON COLUMN sales.leads.lead_score IS 'Calculated lead score based on scoring rules';
COMMENT ON COLUMN sales.leads.interested_services IS 'Array of service types the lead is interested in';

-- Indexes for leads
CREATE INDEX sales_leads_company_id_idx ON sales.leads(company_id);
CREATE INDEX sales_leads_owner_id_idx ON sales.leads(owner_id);
CREATE INDEX sales_leads_territory_id_idx ON sales.leads(territory_id);
CREATE INDEX sales_leads_lead_source_id_idx ON sales.leads(lead_source_id);
CREATE INDEX sales_leads_status_idx ON sales.leads(status);
CREATE INDEX sales_leads_lead_score_idx ON sales.leads(lead_score DESC);
CREATE INDEX sales_leads_created_at_idx ON sales.leads(created_at DESC);
CREATE INDEX sales_leads_next_follow_up_idx ON sales.leads(next_follow_up_at)
    WHERE status IN ('new', 'contacted', 'qualified', 'nurturing');
CREATE INDEX sales_leads_email_idx ON sales.leads(email);
CREATE INDEX sales_leads_phone_idx ON sales.leads(phone);
CREATE INDEX sales_leads_postal_code_idx ON sales.leads(postal_code);
CREATE INDEX sales_leads_tags_idx ON sales.leads USING GIN(tags);
CREATE INDEX sales_leads_deleted_at_idx ON sales.leads(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- LEAD_SCORING_RULES TABLE
-- ============================================================================

CREATE TABLE sales.lead_scoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Rule Definition
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Criteria
    field VARCHAR(100) NOT NULL,                    -- Field to evaluate
    operator VARCHAR(20) NOT NULL,                  -- equals, contains, greater_than, etc.
    value JSONB NOT NULL,                           -- Value to compare

    -- Score
    score_points INTEGER NOT NULL,                  -- Points to add/subtract

    -- Priority
    priority INTEGER DEFAULT 0,                     -- Higher = processed first

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id)
);

COMMENT ON TABLE sales.lead_scoring_rules IS 'Rules for automatic lead scoring';

-- Index for lead_scoring_rules
CREATE INDEX sales_lead_scoring_rules_company_id_idx ON sales.lead_scoring_rules(company_id);

-- ============================================================================
-- DEALS TABLE
-- ============================================================================

CREATE TABLE sales.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Deal Number
    deal_number VARCHAR(50) NOT NULL,

    -- Deal Information
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Related Entities
    contact_id UUID REFERENCES sales.contacts(id),
    sales_company_id UUID REFERENCES sales.companies(id),
    lead_id UUID REFERENCES sales.leads(id),

    -- Pipeline
    stage sales.deal_stage NOT NULL DEFAULT 'lead',
    status sales.deal_status NOT NULL DEFAULT 'open',
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),

    -- Dates
    expected_close_date DATE,
    actual_close_date DATE,
    stage_entered_at TIMESTAMPTZ DEFAULT NOW(),

    -- Value
    amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    monthly_value NUMERIC(12, 2),                   -- For recurring deals
    annual_value NUMERIC(12, 2),
    weighted_amount NUMERIC(12, 2) GENERATED ALWAYS AS (amount * probability / 100.0) STORED,
    currency VARCHAR(3) DEFAULT 'USD',

    -- Service Details
    service_type VARCHAR(100),
    service_frequency sales.service_frequency,
    contract_length_months INTEGER,
    estimated_start_date DATE,

    -- Assignment
    owner_id UUID REFERENCES core.users(id),
    territory_id UUID REFERENCES core.territories(id),

    -- Source
    lead_source_id UUID REFERENCES sales.lead_sources(id),
    campaign_id UUID,                               -- FK to marketing.campaigns

    -- Competition
    competitor VARCHAR(100),
    competitive_notes TEXT,

    -- Win/Loss
    close_reason VARCHAR(100),
    close_notes TEXT,
    lost_to_competitor VARCHAR(100),

    -- Follow-up
    next_step TEXT,
    next_step_date DATE,
    last_activity_at TIMESTAMPTZ,
    activity_count INTEGER DEFAULT 0,

    -- Tags
    tags TEXT[],

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT deals_number_unique UNIQUE (company_id, deal_number)
);

-- Add FK from leads to deals
ALTER TABLE sales.leads
    ADD CONSTRAINT leads_converted_to_deal_fkey
    FOREIGN KEY (converted_to_deal_id) REFERENCES sales.deals(id) ON DELETE SET NULL;

COMMENT ON TABLE sales.deals IS 'Sales deals/opportunities';
COMMENT ON COLUMN sales.deals.weighted_amount IS 'Amount * probability for pipeline forecasting';

-- Indexes for deals
CREATE INDEX sales_deals_company_id_idx ON sales.deals(company_id);
CREATE INDEX sales_deals_contact_id_idx ON sales.deals(contact_id);
CREATE INDEX sales_deals_sales_company_id_idx ON sales.deals(sales_company_id);
CREATE INDEX sales_deals_owner_id_idx ON sales.deals(owner_id);
CREATE INDEX sales_deals_territory_id_idx ON sales.deals(territory_id);
CREATE INDEX sales_deals_stage_idx ON sales.deals(stage);
CREATE INDEX sales_deals_status_idx ON sales.deals(status);
CREATE INDEX sales_deals_expected_close_date_idx ON sales.deals(expected_close_date);
CREATE INDEX sales_deals_created_at_idx ON sales.deals(created_at DESC);
CREATE INDEX sales_deals_amount_idx ON sales.deals(amount DESC);
CREATE INDEX sales_deals_lead_source_id_idx ON sales.deals(lead_source_id);
CREATE INDEX sales_deals_tags_idx ON sales.deals USING GIN(tags);
CREATE INDEX sales_deals_deleted_at_idx ON sales.deals(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX sales_deals_open_idx ON sales.deals(company_id, stage, expected_close_date)
    WHERE status = 'open';

-- ============================================================================
-- DEAL_CONTACTS TABLE (Many-to-Many)
-- ============================================================================

CREATE TABLE sales.deal_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES sales.deals(id) ON DELETE CASCADE,
    contact_id UUID NOT NULL REFERENCES sales.contacts(id) ON DELETE CASCADE,

    -- Role
    role VARCHAR(50) DEFAULT 'stakeholder',         -- decision_maker, influencer, stakeholder
    is_primary BOOLEAN DEFAULT FALSE,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),

    CONSTRAINT deal_contacts_unique UNIQUE (deal_id, contact_id)
);

COMMENT ON TABLE sales.deal_contacts IS 'Association between deals and contacts';

-- Indexes for deal_contacts
CREATE INDEX sales_deal_contacts_deal_id_idx ON sales.deal_contacts(deal_id);
CREATE INDEX sales_deal_contacts_contact_id_idx ON sales.deal_contacts(contact_id);

-- ============================================================================
-- DEAL_STAGE_HISTORY TABLE
-- ============================================================================

CREATE TABLE sales.deal_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deal_id UUID NOT NULL REFERENCES sales.deals(id) ON DELETE CASCADE,

    -- Stage Change
    from_stage sales.deal_stage,
    to_stage sales.deal_stage NOT NULL,

    -- Duration
    time_in_stage_seconds BIGINT,

    -- Context
    changed_by UUID REFERENCES core.users(id),
    change_reason TEXT,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sales.deal_stage_history IS 'History of deal stage changes';

-- Indexes for deal_stage_history
CREATE INDEX sales_deal_stage_history_deal_id_idx ON sales.deal_stage_history(deal_id);
CREATE INDEX sales_deal_stage_history_created_at_idx ON sales.deal_stage_history(created_at);

-- ============================================================================
-- SERVICE_TYPES TABLE
-- ============================================================================

CREATE TABLE sales.service_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Service Information
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20),
    description TEXT,
    category VARCHAR(50),                           -- general_pest, termite, rodent, bed_bugs, etc.

    -- Pricing
    base_price NUMERIC(10, 2),
    price_per_sqft NUMERIC(10, 4),
    min_price NUMERIC(10, 2),
    max_price NUMERIC(10, 2),

    -- Pricing by frequency
    pricing_by_frequency JSONB DEFAULT '{}'::JSONB,

    -- Duration
    estimated_duration_minutes INTEGER,

    -- Requirements
    requires_inspection BOOLEAN DEFAULT FALSE,
    requires_certification TEXT[],                  -- Required tech certifications
    restricted_use_chemicals BOOLEAN DEFAULT FALSE,

    -- Display
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,

    -- Tax
    is_taxable BOOLEAN DEFAULT TRUE,
    tax_category VARCHAR(50),

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT service_types_name_unique UNIQUE (company_id, name)
);

COMMENT ON TABLE sales.service_types IS 'Service type catalog for quotes';

-- Index for service_types
CREATE INDEX sales_service_types_company_id_idx ON sales.service_types(company_id);
CREATE INDEX sales_service_types_category_idx ON sales.service_types(category);
CREATE INDEX sales_service_types_is_active_idx ON sales.service_types(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- QUOTES TABLE
-- ============================================================================

CREATE TABLE sales.quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Quote Number
    quote_number VARCHAR(50) NOT NULL,
    version INTEGER DEFAULT 1,

    -- Relationships
    deal_id UUID REFERENCES sales.deals(id),
    contact_id UUID REFERENCES sales.contacts(id),
    sales_company_id UUID REFERENCES sales.companies(id),

    -- Quote Information
    name VARCHAR(255),
    description TEXT,

    -- Status
    status sales.quote_status NOT NULL DEFAULT 'draft',
    status_changed_at TIMESTAMPTZ DEFAULT NOW(),

    -- Validity
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,

    -- Service Details
    service_address_line1 VARCHAR(255),
    service_address_line2 VARCHAR(255),
    service_city VARCHAR(100),
    service_state VARCHAR(50),
    service_postal_code VARCHAR(20),
    service_frequency sales.service_frequency,
    contract_length_months INTEGER,
    estimated_start_date DATE,

    -- Pricing Summary
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    discount_percent NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,

    -- Recurring Pricing
    monthly_amount NUMERIC(12, 2),
    annual_amount NUMERIC(12, 2),
    setup_fee NUMERIC(12, 2) DEFAULT 0,

    -- Currency
    currency VARCHAR(3) DEFAULT 'USD',

    -- Terms
    terms_and_conditions TEXT,
    payment_terms VARCHAR(50) DEFAULT 'NET30',
    warranty_terms TEXT,

    -- Approval
    requires_approval BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES core.users(id),
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,

    -- Signature
    signature_required BOOLEAN DEFAULT TRUE,
    signed_at TIMESTAMPTZ,
    signed_by_name VARCHAR(200),
    signed_by_email VARCHAR(255),
    signature_ip INET,
    signature_data TEXT,                            -- Base64 signature image

    -- Assignment
    owner_id UUID REFERENCES core.users(id),
    prepared_by UUID REFERENCES core.users(id),

    -- Email Tracking
    sent_at TIMESTAMPTZ,
    sent_to_email VARCHAR(255),
    viewed_at TIMESTAMPTZ,
    viewed_count INTEGER DEFAULT 0,

    -- Revision
    previous_version_id UUID REFERENCES sales.quotes(id),
    revision_notes TEXT,

    -- PDF
    pdf_url VARCHAR(500),
    pdf_generated_at TIMESTAMPTZ,

    -- Notes
    internal_notes TEXT,
    customer_notes TEXT,

    -- Tags
    tags TEXT[],

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    updated_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT quotes_number_version_unique UNIQUE (company_id, quote_number, version)
);

COMMENT ON TABLE sales.quotes IS 'Sales quotes and proposals';
COMMENT ON COLUMN sales.quotes.version IS 'Version number for quote revisions';

-- Indexes for quotes
CREATE INDEX sales_quotes_company_id_idx ON sales.quotes(company_id);
CREATE INDEX sales_quotes_deal_id_idx ON sales.quotes(deal_id);
CREATE INDEX sales_quotes_contact_id_idx ON sales.quotes(contact_id);
CREATE INDEX sales_quotes_owner_id_idx ON sales.quotes(owner_id);
CREATE INDEX sales_quotes_status_idx ON sales.quotes(status);
CREATE INDEX sales_quotes_valid_until_idx ON sales.quotes(valid_until);
CREATE INDEX sales_quotes_created_at_idx ON sales.quotes(created_at DESC);
CREATE INDEX sales_quotes_tags_idx ON sales.quotes USING GIN(tags);
CREATE INDEX sales_quotes_deleted_at_idx ON sales.quotes(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- QUOTE_LINE_ITEMS TABLE
-- ============================================================================

CREATE TABLE sales.quote_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_id UUID NOT NULL REFERENCES sales.quotes(id) ON DELETE CASCADE,

    -- Line Item
    line_number INTEGER NOT NULL,
    service_type_id UUID REFERENCES sales.service_types(id),

    -- Description
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Quantity/Pricing
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit_price NUMERIC(12, 2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'each',                -- each, sqft, hour, etc.

    -- Discounts
    discount_amount NUMERIC(12, 2) DEFAULT 0,
    discount_percent NUMERIC(5, 2) DEFAULT 0,

    -- Calculated
    subtotal NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    total_amount NUMERIC(12, 2),                    -- After discounts

    -- Tax
    is_taxable BOOLEAN DEFAULT TRUE,
    tax_rate NUMERIC(5, 2) DEFAULT 0,
    tax_amount NUMERIC(12, 2) DEFAULT 0,

    -- Frequency (for recurring items)
    frequency sales.service_frequency,
    frequency_value INTEGER,                        -- e.g., every 2 weeks = bi_weekly, 2

    -- Optional
    is_optional BOOLEAN DEFAULT FALSE,
    is_selected BOOLEAN DEFAULT TRUE,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT quote_line_items_line_unique UNIQUE (quote_id, line_number)
);

COMMENT ON TABLE sales.quote_line_items IS 'Line items for quotes';

-- Indexes for quote_line_items
CREATE INDEX sales_quote_line_items_quote_id_idx ON sales.quote_line_items(quote_id);
CREATE INDEX sales_quote_line_items_service_type_id_idx ON sales.quote_line_items(service_type_id);

-- ============================================================================
-- COMMISSION_PLANS TABLE
-- ============================================================================

CREATE TABLE sales.commission_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Plan Information
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Type
    commission_type sales.commission_type NOT NULL,

    -- Rates
    base_rate NUMERIC(5, 2),                        -- Percentage or flat amount
    rate_tiers JSONB DEFAULT '[]'::JSONB,           -- For tiered commissions

    -- Recurring
    recurring_rate NUMERIC(5, 2),                   -- Rate for recurring revenue
    recurring_months INTEGER,                        -- How many months to pay recurring

    -- Conditions
    applies_to_new BOOLEAN DEFAULT TRUE,
    applies_to_renewal BOOLEAN DEFAULT TRUE,
    applies_to_upsell BOOLEAN DEFAULT TRUE,
    min_deal_amount NUMERIC(12, 2),
    max_deal_amount NUMERIC(12, 2),

    -- Service Types (if limited)
    service_type_ids UUID[],

    -- Clawback Rules
    clawback_enabled BOOLEAN DEFAULT FALSE,
    clawback_period_days INTEGER,
    clawback_conditions JSONB,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    effective_from DATE DEFAULT CURRENT_DATE,
    effective_until DATE,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT commission_plans_name_unique UNIQUE (company_id, name)
);

COMMENT ON TABLE sales.commission_plans IS 'Commission plan definitions';

-- Index for commission_plans
CREATE INDEX sales_commission_plans_company_id_idx ON sales.commission_plans(company_id);
CREATE INDEX sales_commission_plans_is_active_idx ON sales.commission_plans(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- USER_COMMISSION_PLANS TABLE
-- ============================================================================

CREATE TABLE sales.user_commission_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    commission_plan_id UUID NOT NULL REFERENCES sales.commission_plans(id) ON DELETE CASCADE,

    -- Override Rates (if different from plan)
    override_rate NUMERIC(5, 2),
    override_recurring_rate NUMERIC(5, 2),

    -- Effective Period
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,

    -- Quota
    monthly_quota NUMERIC(12, 2),
    quarterly_quota NUMERIC(12, 2),
    annual_quota NUMERIC(12, 2),

    -- Accelerators
    accelerator_tiers JSONB,                        -- Bonus rates for exceeding quota

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),

    CONSTRAINT user_commission_plans_unique UNIQUE (user_id, commission_plan_id, effective_from)
);

COMMENT ON TABLE sales.user_commission_plans IS 'User commission plan assignments';

-- Indexes for user_commission_plans
CREATE INDEX sales_user_commission_plans_user_id_idx ON sales.user_commission_plans(user_id);
CREATE INDEX sales_user_commission_plans_plan_id_idx ON sales.user_commission_plans(commission_plan_id);

-- ============================================================================
-- COMMISSION_RECORDS TABLE
-- ============================================================================

CREATE TABLE sales.commission_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- User
    user_id UUID NOT NULL REFERENCES core.users(id),
    commission_plan_id UUID REFERENCES sales.commission_plans(id),

    -- Deal
    deal_id UUID REFERENCES sales.deals(id),

    -- Commission Details
    deal_amount NUMERIC(12, 2) NOT NULL,
    commission_rate NUMERIC(5, 2) NOT NULL,
    commission_amount NUMERIC(12, 2) NOT NULL,

    -- Type
    commission_type VARCHAR(50) NOT NULL,           -- initial, recurring, bonus, clawback

    -- Period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- pending, approved, paid, cancelled
    status_changed_at TIMESTAMPTZ,

    -- Payment
    paid_at TIMESTAMPTZ,
    payment_reference VARCHAR(100),

    -- Clawback
    is_clawback BOOLEAN DEFAULT FALSE,
    clawback_of_id UUID REFERENCES sales.commission_records(id),
    clawback_reason TEXT,

    -- Notes
    notes TEXT,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_by UUID REFERENCES core.users(id),
    approved_at TIMESTAMPTZ
);

COMMENT ON TABLE sales.commission_records IS 'Commission payment records';

-- Indexes for commission_records
CREATE INDEX sales_commission_records_company_id_idx ON sales.commission_records(company_id);
CREATE INDEX sales_commission_records_user_id_idx ON sales.commission_records(user_id);
CREATE INDEX sales_commission_records_deal_id_idx ON sales.commission_records(deal_id);
CREATE INDEX sales_commission_records_period_idx ON sales.commission_records(period_start, period_end);
CREATE INDEX sales_commission_records_status_idx ON sales.commission_records(status);

-- ============================================================================
-- ACTIVITIES TABLE
-- ============================================================================

CREATE TABLE sales.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Activity Type
    activity_type VARCHAR(50) NOT NULL,             -- call, email, meeting, note, task

    -- Subject/Description
    subject VARCHAR(255) NOT NULL,
    description TEXT,

    -- Related Entity (polymorphic)
    related_to_type VARCHAR(50) NOT NULL,           -- contact, lead, deal, company
    related_to_id UUID NOT NULL,

    -- Timing
    activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_minutes INTEGER,
    completed_at TIMESTAMPTZ,

    -- Task-specific
    due_date TIMESTAMPTZ,
    priority VARCHAR(20) DEFAULT 'normal',          -- low, normal, high, urgent
    is_completed BOOLEAN DEFAULT FALSE,
    reminder_at TIMESTAMPTZ,

    -- Call-specific
    call_direction VARCHAR(10),                     -- inbound, outbound
    call_outcome VARCHAR(50),
    call_recording_url VARCHAR(500),

    -- Email-specific
    email_from VARCHAR(255),
    email_to TEXT[],
    email_cc TEXT[],
    email_subject VARCHAR(255),
    email_body TEXT,
    email_opened_at TIMESTAMPTZ,
    email_clicked_at TIMESTAMPTZ,

    -- Meeting-specific
    meeting_location VARCHAR(255),
    meeting_attendees JSONB,
    meeting_notes TEXT,

    -- Assignment
    owner_id UUID REFERENCES core.users(id),
    assigned_to UUID REFERENCES core.users(id),

    -- Tags
    tags TEXT[],

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES core.users(id),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

COMMENT ON TABLE sales.activities IS 'Sales activities (calls, emails, meetings, tasks)';

-- Indexes for activities
CREATE INDEX sales_activities_company_id_idx ON sales.activities(company_id);
CREATE INDEX sales_activities_related_to_idx ON sales.activities(related_to_type, related_to_id);
CREATE INDEX sales_activities_owner_id_idx ON sales.activities(owner_id);
CREATE INDEX sales_activities_assigned_to_idx ON sales.activities(assigned_to);
CREATE INDEX sales_activities_activity_type_idx ON sales.activities(activity_type);
CREATE INDEX sales_activities_activity_date_idx ON sales.activities(activity_date DESC);
CREATE INDEX sales_activities_due_date_idx ON sales.activities(due_date)
    WHERE is_completed = FALSE AND due_date IS NOT NULL;
CREATE INDEX sales_activities_tags_idx ON sales.activities USING GIN(tags);

-- ============================================================================
-- PIPELINES TABLE (Custom Pipeline Configurations)
-- ============================================================================

CREATE TABLE sales.pipelines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES core.companies(id) ON DELETE CASCADE,

    -- Pipeline Info
    name VARCHAR(100) NOT NULL,
    description TEXT,

    -- Status
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,

    -- Custom Fields
    custom_fields JSONB DEFAULT '{}'::JSONB,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL,

    CONSTRAINT pipelines_name_unique UNIQUE (company_id, name)
);

COMMENT ON TABLE sales.pipelines IS 'Custom sales pipelines';

-- Index for pipelines
CREATE INDEX sales_pipelines_company_id_idx ON sales.pipelines(company_id);

-- ============================================================================
-- PIPELINE_STAGES TABLE
-- ============================================================================

CREATE TABLE sales.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pipeline_id UUID NOT NULL REFERENCES sales.pipelines(id) ON DELETE CASCADE,

    -- Stage Info
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,

    -- Pipeline Position
    display_order INTEGER NOT NULL,
    probability INTEGER DEFAULT 0 CHECK (probability >= 0 AND probability <= 100),

    -- Type
    stage_type VARCHAR(20) DEFAULT 'open',          -- open, won, lost

    -- Requirements
    required_fields TEXT[],                         -- Fields required to move to this stage
    required_activities TEXT[],                     -- Activities required

    -- Automation
    automation_triggers JSONB,                      -- Actions to trigger on entry

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT pipeline_stages_code_unique UNIQUE (pipeline_id, code)
);

COMMENT ON TABLE sales.pipeline_stages IS 'Custom pipeline stages';

-- Index for pipeline_stages
CREATE INDEX sales_pipeline_stages_pipeline_id_idx ON sales.pipeline_stages(pipeline_id);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update timestamp triggers
CREATE TRIGGER sales_companies_updated_at
    BEFORE UPDATE ON sales.companies
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER sales_contacts_updated_at
    BEFORE UPDATE ON sales.contacts
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER sales_leads_updated_at
    BEFORE UPDATE ON sales.leads
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER sales_deals_updated_at
    BEFORE UPDATE ON sales.deals
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER sales_quotes_updated_at
    BEFORE UPDATE ON sales.quotes
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

CREATE TRIGGER sales_activities_updated_at
    BEFORE UPDATE ON sales.activities
    FOR EACH ROW
    EXECUTE FUNCTION core.update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to auto-generate deal number
CREATE OR REPLACE FUNCTION sales.generate_deal_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    year_prefix VARCHAR(4);
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(deal_number FROM 6) AS INTEGER)), 0) + 1
    INTO next_num
    FROM sales.deals
    WHERE company_id = NEW.company_id
      AND deal_number LIKE year_prefix || '-%';

    NEW.deal_number := year_prefix || '-' || LPAD(next_num::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_generate_number
    BEFORE INSERT ON sales.deals
    FOR EACH ROW
    WHEN (NEW.deal_number IS NULL)
    EXECUTE FUNCTION sales.generate_deal_number();

-- Function to auto-generate quote number
CREATE OR REPLACE FUNCTION sales.generate_quote_number()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
    year_prefix VARCHAR(4);
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(CAST(SUBSTRING(quote_number FROM 6) AS INTEGER)), 0) + 1
    INTO next_num
    FROM sales.quotes
    WHERE company_id = NEW.company_id
      AND quote_number LIKE year_prefix || '-%';

    NEW.quote_number := year_prefix || '-Q' || LPAD(next_num::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_generate_number
    BEFORE INSERT ON sales.quotes
    FOR EACH ROW
    WHEN (NEW.quote_number IS NULL)
    EXECUTE FUNCTION sales.generate_quote_number();

-- Function to track deal stage changes
CREATE OR REPLACE FUNCTION sales.track_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        INSERT INTO sales.deal_stage_history (
            deal_id,
            from_stage,
            to_stage,
            time_in_stage_seconds,
            changed_by
        )
        VALUES (
            NEW.id,
            OLD.stage,
            NEW.stage,
            EXTRACT(EPOCH FROM (NOW() - OLD.stage_entered_at)),
            current_setting('app.current_user_id', TRUE)::UUID
        );

        NEW.stage_entered_at := NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_track_stage_change
    BEFORE UPDATE ON sales.deals
    FOR EACH ROW
    EXECUTE FUNCTION sales.track_deal_stage_change();

-- Function to update lead source metrics
CREATE OR REPLACE FUNCTION sales.update_lead_source_metrics()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total_leads on insert
    IF TG_OP = 'INSERT' AND NEW.lead_source_id IS NOT NULL THEN
        UPDATE sales.lead_sources
        SET total_leads = total_leads + 1
        WHERE id = NEW.lead_source_id;
    END IF;

    -- Update converted_leads when lead is converted
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status != 'converted' AND NEW.status = 'converted' AND NEW.lead_source_id IS NOT NULL THEN
            UPDATE sales.lead_sources
            SET converted_leads = converted_leads + 1
            WHERE id = NEW.lead_source_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_update_source_metrics
    AFTER INSERT OR UPDATE ON sales.leads
    FOR EACH ROW
    EXECUTE FUNCTION sales.update_lead_source_metrics();

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Pipeline view with stage counts
CREATE OR REPLACE VIEW sales.v_pipeline_summary AS
SELECT
    d.company_id,
    d.stage,
    COUNT(*) AS deal_count,
    SUM(d.amount) AS total_amount,
    SUM(d.weighted_amount) AS weighted_amount,
    AVG(d.probability) AS avg_probability
FROM sales.deals d
WHERE d.status = 'open'
  AND d.deleted_at IS NULL
GROUP BY d.company_id, d.stage;

COMMENT ON VIEW sales.v_pipeline_summary IS 'Pipeline summary by stage';

-- Lead conversion funnel
CREATE OR REPLACE VIEW sales.v_lead_funnel AS
SELECT
    l.company_id,
    l.lead_source_id,
    COUNT(*) AS total_leads,
    COUNT(*) FILTER (WHERE l.status = 'contacted') AS contacted,
    COUNT(*) FILTER (WHERE l.status = 'qualified') AS qualified,
    COUNT(*) FILTER (WHERE l.status = 'converted') AS converted,
    COUNT(*) FILTER (WHERE l.status = 'lost') AS lost,
    ROUND(100.0 * COUNT(*) FILTER (WHERE l.status = 'converted') / NULLIF(COUNT(*), 0), 2) AS conversion_rate
FROM sales.leads l
WHERE l.deleted_at IS NULL
GROUP BY l.company_id, l.lead_source_id;

COMMENT ON VIEW sales.v_lead_funnel IS 'Lead conversion funnel by source';

-- Sales rep performance
CREATE OR REPLACE VIEW sales.v_sales_rep_performance AS
SELECT
    d.company_id,
    d.owner_id,
    u.first_name || ' ' || u.last_name AS rep_name,
    COUNT(*) FILTER (WHERE d.status = 'won') AS deals_won,
    COUNT(*) FILTER (WHERE d.status = 'lost') AS deals_lost,
    SUM(d.amount) FILTER (WHERE d.status = 'won') AS revenue_won,
    AVG(EXTRACT(DAY FROM (d.actual_close_date - d.created_at::DATE)))
        FILTER (WHERE d.status = 'won') AS avg_days_to_close,
    ROUND(100.0 * COUNT(*) FILTER (WHERE d.status = 'won') /
          NULLIF(COUNT(*) FILTER (WHERE d.status IN ('won', 'lost')), 0), 2) AS win_rate
FROM sales.deals d
JOIN core.users u ON d.owner_id = u.id
WHERE d.deleted_at IS NULL
  AND d.status IN ('won', 'lost')
GROUP BY d.company_id, d.owner_id, u.first_name, u.last_name;

COMMENT ON VIEW sales.v_sales_rep_performance IS 'Sales rep performance metrics';

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert default lead sources (will be inserted per company on creation)
-- These are templates; actual seed data would be company-specific

-- ============================================================================
-- END OF SALES SCHEMA
-- ============================================================================
