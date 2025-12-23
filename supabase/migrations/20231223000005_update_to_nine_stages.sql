-- Migration: Update Opportunities to 9 Stages (Pest Control Specific)
-- Description: Update stages from 7 generic to 9 pest-control-specific stages
-- Version: 20231223000005

-- ============================================================================
-- UPDATE OPPORTUNITIES STAGE CHECK CONSTRAINT
-- ============================================================================

-- Drop the old constraint
ALTER TABLE opportunities DROP CONSTRAINT IF EXISTS opportunities_stage_check;

-- Add new constraint with 9 stages (pest control specific)
ALTER TABLE opportunities ADD CONSTRAINT opportunities_stage_check 
    CHECK (stage IN (
        'lead',                  -- 10% probability
        'inspection_scheduled',  -- 15% probability
        'inspection_completed',  -- 25% probability
        'quote_sent',            -- 50% probability
        'negotiation',           -- 60% probability
        'verbal_commitment',     -- 75% probability
        'contract_sent',         -- 90% probability
        'closed_won',            -- 100% probability
        'closed_lost'            -- 0% probability
    ));

-- ============================================================================
-- UPDATE STAGE TRACKING TRIGGER
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
            NEW.created_by
        );
        
        NEW.stage_entered_at := NOW();
        
        -- Update probability based on 9-stage pipeline
        NEW.probability := CASE NEW.stage
            WHEN 'lead' THEN 10
            WHEN 'inspection_scheduled' THEN 15
            WHEN 'inspection_completed' THEN 25
            WHEN 'quote_sent' THEN 50
            WHEN 'negotiation' THEN 60
            WHEN 'verbal_commitment' THEN 75
            WHEN 'contract_sent' THEN 90
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

-- ============================================================================
-- ADD PEST CONTROL SPECIFIC FIELDS TO OPPORTUNITIES
-- ============================================================================

-- Add pest control specific columns if they don't exist
DO $$ 
BEGIN
    -- Service address fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'service_address_line1') THEN
        ALTER TABLE opportunities ADD COLUMN service_address_line1 TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'service_city') THEN
        ALTER TABLE opportunities ADD COLUMN service_city TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'service_state') THEN
        ALTER TABLE opportunities ADD COLUMN service_state TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'service_postal_code') THEN
        ALTER TABLE opportunities ADD COLUMN service_postal_code TEXT;
    END IF;
    
    -- Property info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'property_type') THEN
        ALTER TABLE opportunities ADD COLUMN property_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'property_size_sqft') THEN
        ALTER TABLE opportunities ADD COLUMN property_size_sqft INTEGER;
    END IF;
    
    -- Pest info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'pest_types') THEN
        ALTER TABLE opportunities ADD COLUMN pest_types TEXT[];
    END IF;
    
    -- Inspection info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'inspection_scheduled_at') THEN
        ALTER TABLE opportunities ADD COLUMN inspection_scheduled_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'inspection_completed_at') THEN
        ALTER TABLE opportunities ADD COLUMN inspection_completed_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'inspection_notes') THEN
        ALTER TABLE opportunities ADD COLUMN inspection_notes TEXT;
    END IF;
    
    -- Monthly recurring value
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'monthly_value') THEN
        ALTER TABLE opportunities ADD COLUMN monthly_value NUMERIC(12,2);
    END IF;
    
    -- Annual contract value (calculated)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'annual_value') THEN
        ALTER TABLE opportunities ADD COLUMN annual_value NUMERIC(12,2) GENERATED ALWAYS AS (
            CASE 
                WHEN service_frequency = 'monthly' THEN monthly_value * 12
                WHEN service_frequency = 'quarterly' THEN monthly_value * 4
                WHEN service_frequency = 'bi-monthly' THEN monthly_value * 6
                ELSE amount
            END
        ) STORED;
    END IF;
END $$;

-- ============================================================================
-- CREATE STAGE PROBABILITY LOOKUP TABLE (OPTIONAL - FOR REFERENCE)
-- ============================================================================

CREATE TABLE IF NOT EXISTS opportunity_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    stage_key TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    probability INTEGER NOT NULL,
    stage_order INTEGER NOT NULL,
    description TEXT,
    required_fields TEXT[],
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert 9 stages with pest control specific names
INSERT INTO opportunity_stages (stage_key, display_name, probability, stage_order, description, required_fields, color)
VALUES 
    ('lead', 'Lead', 10, 1, 'Initial inquiry or prospect', ARRAY['name', 'contact_id'], '#9E9E9E'),
    ('inspection_scheduled', 'Inspection Scheduled', 15, 2, 'On-site inspection has been scheduled', ARRAY['inspection_scheduled_at'], '#2196F3'),
    ('inspection_completed', 'Inspection Completed', 25, 3, 'Inspection done, preparing quote', ARRAY['inspection_completed_at'], '#03A9F4'),
    ('quote_sent', 'Quote Sent', 50, 4, 'Proposal/quote delivered to customer', ARRAY['amount', 'expected_close_date'], '#FF9800'),
    ('negotiation', 'Negotiation', 60, 5, 'Terms and pricing under discussion', ARRAY['next_step'], '#FFC107'),
    ('verbal_commitment', 'Verbal Commitment', 75, 6, 'Customer verbally agreed', ARRAY['next_step_date'], '#8BC34A'),
    ('contract_sent', 'Contract Sent', 90, 7, 'Contract awaiting signature', ARRAY['expected_close_date'], '#4CAF50'),
    ('closed_won', 'Closed Won', 100, 8, 'Deal won - customer signed', ARRAY['actual_close_date', 'close_reason'], '#2E7D32'),
    ('closed_lost', 'Closed Lost', 0, 9, 'Deal lost', ARRAY['actual_close_date', 'lost_reason'], '#F44336')
ON CONFLICT (stage_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    probability = EXCLUDED.probability,
    stage_order = EXCLUDED.stage_order,
    description = EXCLUDED.description,
    required_fields = EXCLUDED.required_fields,
    color = EXCLUDED.color;

-- ============================================================================
-- ADD SERVICE FREQUENCY OPTIONS
-- ============================================================================

-- Update service_frequency column check if exists or add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'opportunities' AND column_name = 'service_frequency') THEN
        ALTER TABLE opportunities ADD COLUMN service_frequency TEXT;
    END IF;
END $$;

COMMENT ON COLUMN opportunities.stage IS '9-stage pest control pipeline: lead, inspection_scheduled, inspection_completed, quote_sent, negotiation, verbal_commitment, contract_sent, closed_won, closed_lost';
COMMENT ON COLUMN opportunities.service_type IS 'Type of pest control service: general, termite, rodent, mosquito, bed_bug, commercial, residential';
COMMENT ON COLUMN opportunities.service_frequency IS 'Service frequency: one_time, monthly, bi_monthly, quarterly, annually';

