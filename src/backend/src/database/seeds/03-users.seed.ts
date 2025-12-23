import { AppDataSource } from '../../config/database';
import * as bcrypt from 'bcrypt';

interface User {
  id: string;
  email: string;
  role: string;
}

/**
 * Seed users
 * Creates test users for development
 * Default password for all test users: "password123"
 */
export async function seedUsers(organizations: any[], branches: any[]): Promise<User[]> {
  const queryRunner = AppDataSource.createQueryRunner();

  const aprils = organizations.find((o) => o.slug === 'aprils-pest-control');
  const houstonHQ = branches.find((b) => b.code === 'HOU-HQ');
  const sugarlandBranch = branches.find((b) => b.code === 'SGL');

  // Hash password (for all test users)
  const passwordHash = await bcrypt.hash('password123', 10);

  const users = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      organization_id: aprils?.id,
      branch_id: houstonHQ?.id,
      email: 'admin@aprilspestcontrol.com',
      username: 'admin',
      first_name: 'April',
      last_name: 'Admin',
      phone: '(713) 555-0001',
      role: 'admin',
      permissions: JSON.stringify(['*']),
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      organization_id: aprils?.id,
      branch_id: houstonHQ?.id,
      email: 'manager@aprilspestcontrol.com',
      username: 'manager',
      first_name: 'Sarah',
      last_name: 'Manager',
      phone: '(713) 555-0002',
      role: 'manager',
      permissions: JSON.stringify(['sales.*', 'operations.read', 'reports.*']),
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      organization_id: aprils?.id,
      branch_id: houstonHQ?.id,
      email: 'salesrep@aprilspestcontrol.com',
      username: 'salesrep',
      first_name: 'Mike',
      last_name: 'Sales',
      phone: '(713) 555-0003',
      role: 'sales_rep',
      permissions: JSON.stringify(['sales.leads', 'sales.accounts', 'sales.quotes']),
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      organization_id: aprils?.id,
      branch_id: sugarlandBranch?.id,
      email: 'technician@aprilspestcontrol.com',
      username: 'technician',
      first_name: 'John',
      last_name: 'Tech',
      phone: '(281) 555-0004',
      role: 'technician',
      permissions: JSON.stringify(['operations.routes', 'operations.appointments']),
    },
    {
      id: '20000000-0000-0000-0000-000000000005',
      organization_id: aprils?.id,
      branch_id: houstonHQ?.id,
      email: 'dispatcher@aprilspestcontrol.com',
      username: 'dispatcher',
      first_name: 'Lisa',
      last_name: 'Dispatch',
      phone: '(832) 555-0005',
      role: 'dispatcher',
      permissions: JSON.stringify([
        'operations.routes.*',
        'operations.appointments.*',
        'operations.technicians.read',
      ]),
    },
  ];

  try {
    for (const user of users) {
      await queryRunner.query(
        `
        INSERT INTO core.users (
          id, organization_id, branch_id,
          email, username, password_hash,
          first_name, last_name, phone,
          role, permissions,
          email_verified, status, is_active
        ) VALUES (
          $1, $2, $3,
          $4, $5, $6,
          $7, $8, $9,
          $10, $11::jsonb,
          true, 'active', true
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          updated_at = NOW()
      `,
        [
          user.id,
          user.organization_id,
          user.branch_id,
          user.email,
          user.username,
          passwordHash,
          user.first_name,
          user.last_name,
          user.phone,
          user.role,
          user.permissions,
        ]
      );
    }
  } finally {
    await queryRunner.release();
  }

  console.log('\n  Test user credentials:');
  console.log('  -----------------------------------');
  users.forEach((user) => {
    console.log(`  ${user.email} / password123 (${user.role})`);
  });
  console.log('  -----------------------------------\n');

  return users;
}
