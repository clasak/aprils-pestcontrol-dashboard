import { registerAs } from '@nestjs/config';

// Parse DATABASE_URL if provided, otherwise use individual env vars
function parseDatabaseConfig() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (databaseUrl) {
    // Parse postgresql://user:password@host:port/database
    const urlMatch = databaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (urlMatch) {
      return {
        host: urlMatch[3],
        port: parseInt(urlMatch[4], 10),
        username: urlMatch[1],
        password: urlMatch[2],
        database: urlMatch[5],
      };
    }
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.DB_HOST || process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.DB_USERNAME || process.env.POSTGRES_USER || 'postgres',
    password: process.env.DB_PASSWORD || process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.DB_DATABASE || process.env.POSTGRES_DB || 'pestcontrol_dev',
  };
}

export default registerAs('database', () => {
  const config = parseDatabaseConfig();
  return {
    ...config,
    synchronize: process.env.DB_SYNC === 'true',
    logging: process.env.DB_LOGGING === 'true',
  };
});
