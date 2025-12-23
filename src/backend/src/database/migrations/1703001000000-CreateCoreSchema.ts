import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial migration to create core schema tables
 * This is a placeholder migration that will be replaced with actual schema
 * once @software-architect provides the database design
 */
export class CreateCoreSchema1703001000000 implements MigrationInterface {
  name = 'CreateCoreSchema1703001000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create core.organizations table
    await queryRunner.query(`
      CREATE TABLE core.organizations (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) UNIQUE NOT NULL,
        industry VARCHAR(100),
        website VARCHAR(255),
        phone VARCHAR(50),
        email VARCHAR(255),
        logo_url TEXT,

        -- Settings (JSONB for flexibility)
        settings JSONB DEFAULT '{}'::jsonb,

        -- Status
        status VARCHAR(50) DEFAULT 'active',
        is_active BOOLEAN DEFAULT true,

        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by UUID,
        updated_by UUID
      );

      -- Indexes
      CREATE INDEX idx_organizations_slug ON core.organizations(slug);
      CREATE INDEX idx_organizations_status ON core.organizations(status) WHERE deleted_at IS NULL;

      -- Trigger for updated_at
      CREATE TRIGGER update_organizations_updated_at
        BEFORE UPDATE ON core.organizations
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

      -- Audit trigger
      CREATE TRIGGER audit_organizations
        AFTER INSERT OR UPDATE OR DELETE ON core.organizations
        FOR EACH ROW
        EXECUTE FUNCTION public.audit_trigger_func();
    `);

    // Create core.branches table
    await queryRunner.query(`
      CREATE TABLE core.branches (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,

        -- Branch info
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50),

        -- Location
        address VARCHAR(500),
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        country VARCHAR(100) DEFAULT 'USA',
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        timezone VARCHAR(50) DEFAULT 'America/New_York',

        -- Contact
        phone VARCHAR(50),
        email VARCHAR(255),

        -- Status
        status VARCHAR(50) DEFAULT 'active',
        is_active BOOLEAN DEFAULT true,

        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by UUID,
        updated_by UUID
      );

      -- Indexes
      CREATE INDEX idx_branches_org ON core.branches(organization_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_branches_code ON core.branches(code);
      CREATE INDEX idx_branches_location ON core.branches USING GIST(ll_to_earth(latitude, longitude));

      -- Triggers
      CREATE TRIGGER update_branches_updated_at
        BEFORE UPDATE ON core.branches
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

      CREATE TRIGGER audit_branches
        AFTER INSERT OR UPDATE OR DELETE ON core.branches
        FOR EACH ROW
        EXECUTE FUNCTION public.audit_trigger_func();
    `);

    // Create core.users table
    await queryRunner.query(`
      CREATE TABLE core.users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        organization_id UUID NOT NULL REFERENCES core.organizations(id) ON DELETE CASCADE,
        branch_id UUID REFERENCES core.branches(id) ON DELETE SET NULL,

        -- User info
        email VARCHAR(255) UNIQUE NOT NULL,
        username VARCHAR(100) UNIQUE,
        password_hash VARCHAR(255),

        -- Profile
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        phone VARCHAR(50),
        avatar_url TEXT,

        -- Role & permissions
        role VARCHAR(50) DEFAULT 'user',
        permissions JSONB DEFAULT '[]'::jsonb,

        -- Authentication
        email_verified BOOLEAN DEFAULT false,
        last_login_at TIMESTAMP WITH TIME ZONE,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TIMESTAMP WITH TIME ZONE,

        -- Status
        status VARCHAR(50) DEFAULT 'active',
        is_active BOOLEAN DEFAULT true,

        -- Timestamps
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        deleted_at TIMESTAMP WITH TIME ZONE,
        created_by UUID,
        updated_by UUID
      );

      -- Indexes
      CREATE INDEX idx_users_org ON core.users(organization_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_users_branch ON core.users(branch_id) WHERE deleted_at IS NULL;
      CREATE INDEX idx_users_email ON core.users(LOWER(email));
      CREATE INDEX idx_users_role ON core.users(role) WHERE deleted_at IS NULL AND is_active = true;

      -- Triggers
      CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON core.users
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();

      CREATE TRIGGER audit_users
        AFTER INSERT OR UPDATE OR DELETE ON core.users
        FOR EACH ROW
        EXECUTE FUNCTION public.audit_trigger_func();
    `);

    // Log migration
    await queryRunner.query(`
      INSERT INTO public.audit_log (schema_name, table_name, operation, new_data)
      VALUES ('core', 'migrations', 'CREATE', '{"migration": "CreateCoreSchema1703001000000", "tables": ["organizations", "branches", "users"]}'::jsonb)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS core.users CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS core.branches CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS core.organizations CASCADE`);
  }
}
