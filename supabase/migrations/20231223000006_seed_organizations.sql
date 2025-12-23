-- Migration: Seed Organizations and Demo Data
-- Description: Create CompassIQ platform org and April's org with sample data
-- Version: 20231223000006

-- ============================================================================
-- CREATE COMPASSIQ PLATFORM ORGANIZATION
-- ============================================================================

INSERT INTO organizations (id, name, legal_name, timezone, settings)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::UUID,
    'CompassIQ',
    'CompassIQ Inc.',
    'America/New_York',
    jsonb_build_object(
        'type', 'platform_owner',
        'features_enabled', ARRAY['crm', 'pipeline', 'forecasting', 'admin'],
        'theme', jsonb_build_object(
            'primary_color', '#2196F3',
            'logo_url', '/compassiq-logo.svg'
        ),
        'subscription', 'enterprise'
    )
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CREATE APRIL'S PEST CONTROL ORGANIZATION (First Customer)
-- ============================================================================

INSERT INTO organizations (id, name, legal_name, timezone, settings)
VALUES (
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID,
    'April''s Pest Control',
    'April''s Pest Control LLC',
    'America/New_York',
    jsonb_build_object(
        'type', 'customer',
        'features_enabled', ARRAY['crm', 'pipeline', 'forecasting'],
        'pipeline_stages', ARRAY[
            'lead',
            'inspection_scheduled',
            'inspection_completed',
            'quote_sent',
            'negotiation',
            'verbal_commitment',
            'contract_sent',
            'closed_won',
            'closed_lost'
        ],
        'theme', jsonb_build_object(
            'primary_color', '#1976d2'
        ),
        'industry', 'pest_control',
        'subscription', 'professional'
    )
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CREATE ROLES FOR APRIL'S ORG
-- ============================================================================

INSERT INTO roles (org_id, name, display_name, is_system_role) VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 'admin', 'Administrator', TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 'manager', 'Sales Manager', TRUE),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 'ae', 'Account Executive', TRUE)
ON CONFLICT (org_id, name) DO NOTHING;

-- ============================================================================
-- CREATE SAMPLE ACCOUNTS FOR APRIL'S ORG
-- ============================================================================

-- Note: These are example accounts. In production, data would be imported.

INSERT INTO accounts (id, org_id, name, industry, phone, address_line1, city, state, postal_code, account_type, tags)
VALUES
    ('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 
     'Sunrise Restaurant Group', 'Restaurant', '555-100-1001', '123 Main St', 'Tampa', 'FL', '33601', 
     'prospect', ARRAY['commercial', 'multi-location']),
    ('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a32'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 
     'Green Valley HOA', 'Property Management', '555-100-1002', '456 Oak Ave', 'Orlando', 'FL', '32801', 
     'customer', ARRAY['commercial', 'hoa']),
    ('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 
     'Harbor View Apartments', 'Real Estate', '555-100-1003', '789 Harbor Blvd', 'Miami', 'FL', '33101', 
     'prospect', ARRAY['commercial', 'apartments'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- CREATE SAMPLE CONTACTS FOR APRIL'S ORG
-- ============================================================================

INSERT INTO contacts (id, org_id, account_id, first_name, last_name, email, phone, job_title, is_primary, is_decision_maker)
VALUES
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a41'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 
     'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a31'::UUID,
     'Maria', 'Rodriguez', 'maria@sunriserestaurants.com', '555-200-2001', 'Operations Manager', TRUE, TRUE),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a42'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 
     'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a32'::UUID,
     'Robert', 'Chen', 'robert.chen@greenvalleyhoa.org', '555-200-2002', 'Property Manager', TRUE, TRUE),
    ('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a43'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 
     'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a33'::UUID,
     'Jennifer', 'Williams', 'jennifer@harborview.com', '555-200-2003', 'Building Manager', TRUE, FALSE),
    -- Residential contacts (no account)
    ('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a44'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 
     NULL,
     'James', 'Thompson', 'james.thompson@email.com', '555-200-2004', NULL, FALSE, FALSE),
    ('d5eebc99-9c0b-4ef8-bb6d-6bb9bd380a45'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID, 
     NULL,
     'Sarah', 'Davis', 'sarah.davis@email.com', '555-200-2005', NULL, FALSE, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE LEADS FOR APRIL'S ORG
-- ============================================================================

INSERT INTO leads (id, org_id, first_name, last_name, email, phone, lead_source, status, lead_score, 
                   property_type, pest_types, urgency, estimated_value, notes)
VALUES
    ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a51'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID,
     'Michael', 'Brown', 'michael.brown@email.com', '555-300-3001', 'google_ads', 'new', 75,
     'single_family', ARRAY['ants', 'roaches'], 'high', 5000, 'Called about ant problem in kitchen'),
    ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a52'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID,
     'Lisa', 'Martinez', 'lisa.martinez@email.com', '555-300-3002', 'referral', 'contacted', 85,
     'commercial', ARRAY['rodents'], 'urgent', 15000, 'Referral from Green Valley HOA'),
    ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a53'::UUID, 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22'::UUID,
     'David', 'Wilson', 'david.wilson@email.com', '555-300-3003', 'website', 'qualified', 60,
     'single_family', ARRAY['termites'], 'normal', 25000, 'Termite inspection requested')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE OPPORTUNITIES WILL BE CREATED AFTER USER SETUP
-- (requires owner_id which needs a user to be created first)
-- ============================================================================

-- Note: Demo opportunities will be created when the demo user is set up
-- This allows proper owner_id assignment

COMMENT ON TABLE organizations IS 'Multi-tenant organizations - CompassIQ platform';
COMMENT ON TABLE accounts IS 'Customer companies/businesses for CRM';
COMMENT ON TABLE contacts IS 'People associated with accounts';
COMMENT ON TABLE leads IS 'Pre-qualified sales leads';

