#!/usr/bin/env node
/**
 * Database Reset Script
 * Drops, creates, migrates, and seeds the database
 * Perfect for development when you need a clean slate
 */

const { execSync } = require('child_process');
const readline = require('readline');
require('dotenv').config();

async function resetDatabase() {
  // Don't allow resetting production database
  if (process.env.NODE_ENV === 'production') {
    console.error('Cannot reset database in production environment!');
    process.exit(1);
  }

  console.log('Database Reset Process');
  console.log('======================');
  console.log('This will:');
  console.log('  1. Drop the existing database');
  console.log('  2. Create a fresh database');
  console.log('  3. Run all migrations');
  console.log('  4. Seed test data');
  console.log('');

  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Continue? (yes/no): ', async (answer) => {
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('Database reset cancelled');
      process.exit(0);
    }

    try {
      console.log('\n1. Dropping database...');
      execSync('echo "yes" | node scripts/db-drop.js', { stdio: 'inherit' });

      console.log('\n2. Creating database...');
      execSync('node scripts/db-create.js', { stdio: 'inherit' });

      console.log('\n3. Running migrations...');
      execSync('npm run db:migrate', { stdio: 'inherit' });

      console.log('\n4. Seeding database...');
      execSync('npm run db:seed', { stdio: 'inherit' });

      console.log('\n✅ Database reset completed successfully!');
      console.log('\nYour database is now fresh and ready for development.');

    } catch (error) {
      console.error('\n❌ Database reset failed:', error.message);
      process.exit(1);
    }
  });
}

resetDatabase();
