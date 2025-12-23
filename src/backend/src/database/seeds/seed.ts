import { AppDataSource } from '../../config/database';
import { seedOrganizations } from './01-organizations.seed';
import { seedBranches } from './02-branches.seed';
import { seedUsers } from './03-users.seed';

/**
 * Main seeding function
 * Seeds the database with test data for development
 */
async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✓ Database connection established\n');
    }

    // Run seeds in order (respecting foreign key dependencies)
    console.log('📦 Seeding organizations...');
    const organizations = await seedOrganizations();
    console.log(`✓ Created ${organizations.length} organizations\n`);

    console.log('📦 Seeding branches...');
    const branches = await seedBranches(organizations);
    console.log(`✓ Created ${branches.length} branches\n`);

    console.log('📦 Seeding users...');
    const users = await seedUsers(organizations, branches);
    console.log(`✓ Created ${users.length} users\n`);

    // TODO: Add more seeders as tables are created
    // - Accounts
    // - Leads
    // - Technicians
    // - Routes
    // - Appointments
    // - etc.

    console.log('✅ Database seeding completed successfully!\n');

    // Log summary
    console.log('Summary:');
    console.log(`  - Organizations: ${organizations.length}`);
    console.log(`  - Branches: ${branches.length}`);
    console.log(`  - Users: ${users.length}`);
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

// Run seeder if called directly
if (require.main === module) {
  seed();
}

export default seed;
