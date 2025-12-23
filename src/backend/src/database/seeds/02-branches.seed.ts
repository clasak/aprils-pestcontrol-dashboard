import { AppDataSource } from '../../config/database';

interface Branch {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

/**
 * Seed branches
 * Creates test branch locations for development
 */
export async function seedBranches(organizations: any[]): Promise<Branch[]> {
  const queryRunner = AppDataSource.createQueryRunner();

  const aprils = organizations.find((o) => o.slug === 'aprils-pest-control');

  const branches = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      organization_id: aprils?.id,
      name: 'Houston Headquarters',
      code: 'HOU-HQ',
      address: '1200 Main St',
      city: 'Houston',
      state: 'TX',
      zip_code: '77002',
      phone: '(713) 555-0100',
      email: 'houston@aprilspestcontrol.com',
      latitude: 29.7604,
      longitude: -95.3698,
      timezone: 'America/Chicago',
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      organization_id: aprils?.id,
      name: 'Sugar Land Branch',
      code: 'SGL',
      address: '2450 Town Center Blvd',
      city: 'Sugar Land',
      state: 'TX',
      zip_code: '77479',
      phone: '(281) 555-0200',
      email: 'sugarland@aprilspestcontrol.com',
      latitude: 29.6197,
      longitude: -95.6349,
      timezone: 'America/Chicago',
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      organization_id: aprils?.id,
      name: 'The Woodlands Branch',
      code: 'TWL',
      address: '9595 Six Pines Dr',
      city: 'The Woodlands',
      state: 'TX',
      zip_code: '77380',
      phone: '(832) 555-0300',
      email: 'woodlands@aprilspestcontrol.com',
      latitude: 30.1658,
      longitude: -95.4613,
      timezone: 'America/Chicago',
    },
  ];

  try {
    for (const branch of branches) {
      await queryRunner.query(
        `
        INSERT INTO core.branches (
          id, organization_id, name, code,
          address, city, state, zip_code,
          phone, email, latitude, longitude, timezone,
          status, is_active
        ) VALUES (
          $1, $2, $3, $4,
          $5, $6, $7, $8,
          $9, $10, $11, $12, $13,
          'active', true
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          updated_at = NOW()
      `,
        [
          branch.id,
          branch.organization_id,
          branch.name,
          branch.code,
          branch.address,
          branch.city,
          branch.state,
          branch.zip_code,
          branch.phone,
          branch.email,
          branch.latitude,
          branch.longitude,
          branch.timezone,
        ]
      );
    }
  } finally {
    await queryRunner.release();
  }

  return branches;
}
