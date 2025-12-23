import { AppDataSource } from '../../config/database';

interface Organization {
  id: string;
  name: string;
  slug: string;
  industry: string;
  website: string;
  phone: string;
  email: string;
}

/**
 * Seed organizations
 * Creates test organizations for development
 */
export async function seedOrganizations(): Promise<Organization[]> {
  const queryRunner = AppDataSource.createQueryRunner();

  const organizations = [
    {
      id: '00000000-0000-0000-0000-000000000001',
      name: "April's Pest Control",
      slug: 'aprils-pest-control',
      industry: 'Pest Control',
      website: 'https://aprilspestcontrol.com',
      phone: '(555) 123-4567',
      email: 'info@aprilspestcontrol.com',
    },
    {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Demo Pest Services',
      slug: 'demo-pest-services',
      industry: 'Pest Control',
      website: 'https://demopest.com',
      phone: '(555) 987-6543',
      email: 'info@demopest.com',
    },
  ];

  try {
    for (const org of organizations) {
      await queryRunner.query(
        `
        INSERT INTO core.organizations (
          id, name, slug, industry, website, phone, email,
          status, is_active, settings
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          'active', true, '{
            "features": {
              "route_optimization": true,
              "chemical_tracking": true,
              "payment_processing": true
            },
            "branding": {
              "primary_color": "#2563eb",
              "secondary_color": "#7c3aed"
            }
          }'::jsonb
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          slug = EXCLUDED.slug,
          updated_at = NOW()
      `,
        [org.id, org.name, org.slug, org.industry, org.website, org.phone, org.email]
      );
    }
  } finally {
    await queryRunner.release();
  }

  return organizations;
}
