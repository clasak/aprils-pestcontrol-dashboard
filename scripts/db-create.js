#!/usr/bin/env node
/**
 * Database Creation Script
 * Creates the PostgreSQL database if it doesn't exist
 */

const { Client } = require('pg');
require('dotenv').config();

async function createDatabase() {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/pestcontrol_dev';

  // Parse the database URL
  const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);

  if (!urlParts) {
    console.error('Invalid DATABASE_URL format');
    process.exit(1);
  }

  const [, user, password, host, port, database] = urlParts;

  // Connect to postgres database to create our database
  const client = new Client({
    host,
    port,
    user,
    password,
    database: 'postgres', // Connect to default postgres database
  });

  try {
    console.log(`Connecting to PostgreSQL at ${host}:${port}...`);
    await client.connect();
    console.log('✓ Connected to PostgreSQL');

    // Check if database exists
    const checkDb = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [database]
    );

    if (checkDb.rows.length > 0) {
      console.log(`Database "${database}" already exists`);
    } else {
      console.log(`Creating database "${database}"...`);
      await client.query(`CREATE DATABASE ${database}`);
      console.log(`✓ Database "${database}" created successfully`);
    }

  } catch (error) {
    console.error('Error creating database:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createDatabase();
