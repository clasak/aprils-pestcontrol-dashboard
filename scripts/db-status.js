#!/usr/bin/env node
/**
 * Database Status Script
 * Shows database connection status, schema info, and migration status
 */

const { Client } = require('pg');
require('dotenv').config();

async function getDatabaseStatus() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pestcontrol_dev';

  // Parse the database URL
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

  if (!urlParts) {
    console.error('Invalid DATABASE_URL format');
    process.exit(1);
  }

  const [, user, password, host, port, database] = urlParts;

  const client = new Client({
    host,
    port,
    user,
    password,
    database,
  });

  try {
    console.log('Database Status');
    console.log('===============\n');

    console.log(`Connecting to ${database} at ${host}:${port}...`);
    await client.connect();
    console.log('✓ Connection successful\n');

    // Get PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL Version:');
    console.log(`  ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Get database size
    const sizeResult = await client.query(`
      SELECT pg_size_pretty(pg_database_size($1)) as size
    `, [database]);
    console.log('Database Size:');
    console.log(`  ${sizeResult.rows[0].size}\n`);

    // Get schemas
    const schemasResult = await client.query(`
      SELECT schema_name
      FROM information_schema.schemata
      WHERE schema_name NOT IN ('pg_catalog', 'information_schema')
      ORDER BY schema_name
    `);
    console.log('Schemas:');
    schemasResult.rows.forEach(row => {
      console.log(`  - ${row.schema_name}`);
    });
    console.log('');

    // Get table counts by schema
    const tablesResult = await client.query(`
      SELECT
        schemaname,
        COUNT(*) as table_count
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      GROUP BY schemaname
      ORDER BY schemaname
    `);
    console.log('Tables by Schema:');
    if (tablesResult.rows.length > 0) {
      tablesResult.rows.forEach(row => {
        console.log(`  ${row.schemaname}: ${row.table_count} tables`);
      });
    } else {
      console.log('  No tables found (run migrations)');
    }
    console.log('');

    // Get migration status
    const migrationCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'migrations_history'
      ) as exists
    `);

    if (migrationCheck.rows[0].exists) {
      const migrationsResult = await client.query(`
        SELECT
          name,
          timestamp
        FROM migrations_history
        ORDER BY timestamp DESC
        LIMIT 5
      `);

      console.log('Recent Migrations:');
      if (migrationsResult.rows.length > 0) {
        migrationsResult.rows.forEach(row => {
          const date = new Date(parseInt(row.timestamp));
          console.log(`  - ${row.name} (${date.toISOString()})`);
        });
      } else {
        console.log('  No migrations run yet');
      }
      console.log('');
    } else {
      console.log('Migrations:');
      console.log('  Migration table not found (run migrations)');
      console.log('');
    }

    // Get active connections
    const connectionsResult = await client.query(`
      SELECT COUNT(*) as count
      FROM pg_stat_activity
      WHERE datname = $1
    `, [database]);
    console.log('Active Connections:');
    console.log(`  ${connectionsResult.rows[0].count}\n`);

    // Get cache status if Redis is configured
    if (process.env.REDIS_URL) {
      console.log('Cache (Redis):');
      console.log(`  Configured: ${process.env.REDIS_URL}`);
      console.log('');
    }

  } catch (error) {
    console.error('✗ Connection failed:', error.message);
    console.log('\nPossible issues:');
    console.log('  - PostgreSQL server not running (try: npm run docker:db)');
    console.log('  - Incorrect DATABASE_URL in .env file');
    console.log('  - Database not created yet (try: npm run db:create)');
    process.exit(1);
  } finally {
    await client.end();
  }
}

getDatabaseStatus();
