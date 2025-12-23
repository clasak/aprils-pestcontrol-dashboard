#!/usr/bin/env node
/**
 * Database Drop Script
 * Drops the PostgreSQL database (USE WITH CAUTION!)
 */

const { Client } = require('pg');
const readline = require('readline');
require('dotenv').config();

async function dropDatabase() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pestcontrol_dev';

  // Parse the database URL
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

  if (!urlParts) {
    console.error('Invalid DATABASE_URL format');
    process.exit(1);
  }

  const [, user, password, host, port, database] = urlParts;

  // Don't allow dropping production database
  if (process.env.NODE_ENV === 'production') {
    console.error('Cannot drop database in production environment!');
    process.exit(1);
  }

  // Ask for confirmation
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(`Are you sure you want to drop database "${database}"? (yes/no): `, async (answer) => {
    rl.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('Database drop cancelled');
      process.exit(0);
    }

    // Connect to postgres database to drop our database
    const client = new Client({
      host,
      port,
      user,
      password,
      database: 'postgres',
    });

    try {
      console.log(`Connecting to PostgreSQL at ${host}:${port}...`);
      await client.connect();
      console.log('✓ Connected to PostgreSQL');

      // Terminate all connections to the database
      await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [database]);

      // Drop the database
      console.log(`Dropping database "${database}"...`);
      await client.query(`DROP DATABASE IF EXISTS ${database}`);
      console.log(`✓ Database "${database}" dropped successfully`);

    } catch (error) {
      console.error('Error dropping database:', error.message);
      process.exit(1);
    } finally {
      await client.end();
    }
  });
}

dropDatabase();
