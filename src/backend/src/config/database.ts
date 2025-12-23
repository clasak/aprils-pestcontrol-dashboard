import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config();

const isProduction = process.env.NODE_ENV === 'production';

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,

  // Connection pool configuration
  poolSize: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),

  // Entity configuration
  entities: [path.join(__dirname, '../database/entities/**/*.entity{.ts,.js}')],

  // Migration configuration
  migrations: [path.join(__dirname, '../database/migrations/**/*{.ts,.js}')],
  migrationsTableName: 'migrations_history',
  migrationsRun: false, // We'll run migrations manually

  // Logging
  logging: !isProduction ? ['query', 'error', 'warn', 'migration'] : ['error', 'warn'],
  logger: 'advanced-console',

  // Schema configuration
  schema: 'public',

  // Synchronization - NEVER use in production
  synchronize: false,

  // Connection options
  ssl: isProduction ? { rejectUnauthorized: false } : false,

  // Extra configuration for performance
  extra: {
    max: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
    min: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    // PostgreSQL-specific settings
    statement_timeout: 30000, // 30 seconds
    query_timeout: 30000,
    application_name: 'pestcontrol_crm',
  },

  // Enable cache for query results (uses in-memory cache)
  cache: {
    type: 'redis',
    options: {
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      duration: 60000, // 1 minute default cache duration
    },
  },
};

// Create and export the DataSource
export const AppDataSource = new DataSource(dataSourceOptions);

// Helper function to initialize database connection
export async function initializeDatabase(): Promise<DataSource> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✓ Database connection established successfully');

      // Log connection info
      const queryRunner = AppDataSource.createQueryRunner();
      const result = await queryRunner.query(
        'SELECT version(), current_database(), current_schema(), current_user'
      );
      console.log('Database Info:', {
        version: result[0].version.split(' ')[0] + ' ' + result[0].version.split(' ')[1],
        database: result[0].current_database,
        schema: result[0].current_schema,
        user: result[0].current_user,
      });
      await queryRunner.release();
    }
    return AppDataSource;
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    throw error;
  }
}

// Helper function to close database connection
export async function closeDatabase(): Promise<void> {
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
    console.log('✓ Database connection closed');
  }
}

// Export for use in migrations CLI
export default AppDataSource;
