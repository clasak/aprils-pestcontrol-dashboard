-- Migration: Create CRM Tables
-- Description: Accounts, Contacts, Leads, Opportunities, Activities, Notes, Attachments
-- Version: 20231223000002

-- ============================================================================
-- ACCOUNTS TABLE (Customer Companies)
-- ============================================================================

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    website TEXT,
    phone TEXT,
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'USA',
    owner_id UUID REFERENCES users(id),
    annual_revenue NUMERIC(15,2),
    employee_count INTEGER,
    account_type TEXT DEFAULT 'prospect' CHECK (account_type IN ('prospect', 'customer', 'churned')),
    last_activity_at TIMESTAMPTZ,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

CREATE INDEX idx_accounts_org_id ON accounts(org_id);
CREATE INDEX idx_accounts_owner_id ON accounts(owner_id);
CREATE INDEX idx_accounts_name ON accounts(name);
CREATE INDEX idx_accounts_type ON accounts(account_type);

COMMENT ON TABLE accounts IS 'Customer companies and organizations';

-- ============================================================================
-- CONTACTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    mobile TEXT,
    job_title TEXT,
    department TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    is_decision_maker BOOLEAN DEFAULT FALSE,
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    owner_id UUID REFERENCES users(id),
    lead_source TEXT,
    last_activity_at TIMESTAMPTZ,
    do_not_call BOOLEAN DEFAULT FALSE,
    do_not_email BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT contacts_email_format CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

CREATE INDEX idx_contacts_org_id ON contacts(org_id);
CREATE INDEX idx_contacts_account_id ON contacts(account_id);
CREATE INDEX idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_name ON contacts(first_name, last_name);

COMMENT ON TABLE contacts IS 'People at accounts';

-- ============================================================================
-- LEADS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    job_title TEXT,
    lead_source TEXT NOT NULL,
    lead_source_detail TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'nurturing', 'converted', 'lost')),
    lead_score INTEGER DEFAULT 0,
    score_factors JSONB DEFAULT '{}',
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ,
    address_line1 TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    property_type TEXT,
    property_size_sqft INTEGER,
    pest_types TEXT[],
    urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low', 'normal', 'high', 'urgent')),
    estimated_value NUMERIC(12,2),
    next_follow_up_date DATE,
    last_contacted_at TIMESTAMPTZ,
    contact_attempts INTEGER DEFAULT 0,
    converted_contact_id UUID REFERENCES contacts(id),
    converted_opportunity_id UUID,  -- FK added after opportunities table
    converted_at TIMESTAMPTZ,
    converted_by UUID REFERENCES users(id),
    lost_reason TEXT,
    lost_at TIMESTAMPTZ,
    notes TEXT,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    
    CONSTRAINT leads_email_format CHECK (
        email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    )
);

CREATE INDEX idx_leads_org_id ON leads(org_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_next_follow_up ON leads(next_follow_up_date) WHERE status IN ('new', 'contacted', 'qualified', 'nurturing');

COMMENT ON TABLE leads IS 'Pre-qualified prospects before conversion';

-- ============================================================================
-- OPPORTUNITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'quote_sent', 'negotiation', 'verbal_commitment', 'closed_won', 'closed_lost')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
    amount NUMERIC(12,2) NOT NULL DEFAULT 0,
    probability INTEGER DEFAULT 10 CHECK (probability >= 0 AND probability <= 100),
    weighted_amount NUMERIC(12,2) GENERATED ALWAYS AS (amount * probability / 100.0) STORED,
    expected_close_date DATE,
    actual_close_date DATE,
    next_step TEXT,
    next_step_date DATE,
    owner_id UUID NOT NULL REFERENCES users(id),
    service_type TEXT,
    service_frequency TEXT,
    contract_length_months INTEGER,
    competitor TEXT,
    close_reason TEXT,
    lost_reason TEXT,
    lost_to_competitor TEXT,
    forecast_category TEXT DEFAULT 'pipeline' CHECK (forecast_category IN ('commit', 'best_case', 'pipeline')),
    stage_entered_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ,
    activity_count INTEGER DEFAULT 0,
    tags TEXT[],
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Add FK from leads to opportunities
ALTER TABLE leads 
    ADD CONSTRAINT leads_converted_opportunity_fk 
    FOREIGN KEY (converted_opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL;

CREATE INDEX idx_opportunities_org_id ON opportunities(org_id);
CREATE INDEX idx_opportunities_owner_id ON opportunities(owner_id);
CREATE INDEX idx_opportunities_account_id ON opportunities(account_id);
CREATE INDEX idx_opportunities_contact_id ON opportunities(contact_id);
CREATE INDEX idx_opportunities_stage ON opportunities(stage);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_expected_close ON opportunities(expected_close_date);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);
CREATE INDEX idx_opportunities_open ON opportunities(org_id, status) WHERE status = 'open';

COMMENT ON TABLE opportunities IS 'Sales pipeline opportunities';

-- ============================================================================
-- OPPORTUNITY_STAGE_HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS opportunity_stage_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    from_stage TEXT,
    to_stage TEXT NOT NULL,
    changed_by UUID REFERENCES users(id),
    time_in_stage_seconds BIGINT,
    change_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_stage_history_opportunity ON opportunity_stage_history(opportunity_id);
CREATE INDEX idx_stage_history_created ON opportunity_stage_history(created_at DESC);

COMMENT ON TABLE opportunity_stage_history IS 'Track opportunity stage transitions';

-- ============================================================================
-- ACTIVITIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'task', 'note')),
    subject TEXT NOT NULL,
    description TEXT,
    related_to_type TEXT NOT NULL CHECK (related_to_type IN ('account', 'contact', 'lead', 'opportunity')),
    related_to_id UUID NOT NULL,
    activity_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    duration_minutes INTEGER,
    due_date TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    outcome TEXT,
    owner_id UUID NOT NULL REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activities_org_id ON activities(org_id);
CREATE INDEX idx_activities_related ON activities(related_to_type, related_to_id);
CREATE INDEX idx_activities_owner_id ON activities(owner_id);
CREATE INDEX idx_activities_due_date ON activities(due_date) WHERE is_completed = FALSE;
CREATE INDEX idx_activities_activity_date ON activities(activity_date DESC);

COMMENT ON TABLE activities IS 'Calls, emails, meetings, tasks associated with CRM records';

-- ============================================================================
-- NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    related_to_type TEXT NOT NULL CHECK (related_to_type IN ('account', 'contact', 'lead', 'opportunity')),
    related_to_id UUID NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_related ON notes(related_to_type, related_to_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);

COMMENT ON TABLE notes IS 'Notes attached to CRM entities';

-- ============================================================================
-- ATTACHMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    related_to_type TEXT NOT NULL CHECK (related_to_type IN ('account', 'contact', 'lead', 'opportunity')),
    related_to_id UUID NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size_bytes BIGINT,
    content_type TEXT,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_related ON attachments(related_to_type, related_to_id);

COMMENT ON TABLE attachments IS 'File attachments for CRM entities';

-- ============================================================================
-- FORECAST_SNAPSHOTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS forecast_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- NULL for org-level snapshot
    snapshot_date DATE NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    commit_amount NUMERIC(12,2) DEFAULT 0,
    best_case_amount NUMERIC(12,2) DEFAULT 0,
    pipeline_amount NUMERIC(12,2) DEFAULT 0,
    quota NUMERIC(12,2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(org_id, user_id, snapshot_date, period_start)
);

CREATE INDEX idx_forecast_snapshots_org ON forecast_snapshots(org_id);
CREATE INDEX idx_forecast_snapshots_date ON forecast_snapshots(snapshot_date DESC);

COMMENT ON TABLE forecast_snapshots IS 'Weekly forecast snapshots for tracking';

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER accounts_updated_at
    BEFORE UPDATE ON accounts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TRACK OPPORTUNITY STAGE CHANGES
-- ============================================================================

CREATE OR REPLACE FUNCTION track_opportunity_stage_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.stage IS DISTINCT FROM NEW.stage THEN
        INSERT INTO opportunity_stage_history (
            opportunity_id,
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
            NEW.created_by  -- Will be set by the application
        );
        
        NEW.stage_entered_at := NOW();
        
        -- Update probability based on stage
        NEW.probability := CASE NEW.stage
            WHEN 'lead' THEN 10
            WHEN 'qualified' THEN 25
            WHEN 'quote_sent' THEN 50
            WHEN 'negotiation' THEN 75
            WHEN 'verbal_commitment' THEN 90
            WHEN 'closed_won' THEN 100
            WHEN 'closed_lost' THEN 0
            ELSE NEW.probability
        END;
        
        -- Update status based on stage
        IF NEW.stage = 'closed_won' THEN
            NEW.status := 'won';
            NEW.actual_close_date := COALESCE(NEW.actual_close_date, CURRENT_DATE);
        ELSIF NEW.stage = 'closed_lost' THEN
            NEW.status := 'lost';
            NEW.actual_close_date := COALESCE(NEW.actual_close_date, CURRENT_DATE);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER opportunities_track_stage
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION track_opportunity_stage_change();

-- ============================================================================
-- UPDATE LAST_ACTIVITY_AT ON RELATED ENTITIES
-- ============================================================================

CREATE OR REPLACE FUNCTION update_related_activity_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.related_to_type = 'account' THEN
        UPDATE accounts SET last_activity_at = NOW() WHERE id = NEW.related_to_id;
    ELSIF NEW.related_to_type = 'contact' THEN
        UPDATE contacts SET last_activity_at = NOW() WHERE id = NEW.related_to_id;
    ELSIF NEW.related_to_type = 'opportunity' THEN
        UPDATE opportunities 
        SET last_activity_at = NOW(), 
            activity_count = activity_count + 1 
        WHERE id = NEW.related_to_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activities_update_related
    AFTER INSERT ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_related_activity_timestamp();

