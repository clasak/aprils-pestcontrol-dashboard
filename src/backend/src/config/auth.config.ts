import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-change-this',
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  },
  jwtRefresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-this',
    expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  bcrypt: {
    saltRounds: 10,
  },
}));
