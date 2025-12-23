import { registerAs } from '@nestjs/config';

// Parse REDIS_URL if provided, otherwise use individual env vars
function parseRedisConfig() {
  const redisUrl = process.env.REDIS_URL;
  
  if (redisUrl) {
    // Parse redis://:password@host:port/db
    const urlMatch = redisUrl.match(/redis:\/\/(?:([^:]+):([^@]+)@)?([^:]+):(\d+)(?:\/(\d+))?/);
    if (urlMatch) {
      return {
        host: urlMatch[3],
        port: parseInt(urlMatch[4], 10),
        password: urlMatch[2] || process.env.REDIS_PASSWORD || undefined,
        db: urlMatch[5] ? parseInt(urlMatch[5], 10) : 0,
      };
    }
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  };
}

export default registerAs('redis', () => parseRedisConfig());
