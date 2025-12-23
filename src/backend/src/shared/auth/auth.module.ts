/**
 * Auth Module
 * 
 * CompassIQ Hybrid Architecture:
 * This module provides authentication using Supabase Auth.
 * - JwtStrategy validates Supabase JWT tokens
 * - SupabaseService provides database operations
 * - AuthService handles login/logout/profile operations
 */

import { Module, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { SupabaseService } from './supabase.service';

@Global() // Make SupabaseService available everywhere
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        // Use Supabase JWT secret for token verification
        secret: configService.get<string>('JWT_SECRET') || 
                configService.get<string>('SUPABASE_JWT_SECRET') ||
                'super-secret-jwt-token-with-at-least-32-characters-long',
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    SupabaseService,
    AuthService, 
    JwtStrategy, 
    LocalStrategy,
  ],
  exports: [
    SupabaseService,  // Export for use in other modules
    AuthService, 
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
