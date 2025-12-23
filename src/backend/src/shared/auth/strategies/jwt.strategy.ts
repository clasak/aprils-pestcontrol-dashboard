/**
 * JWT Strategy for Supabase Auth
 * 
 * CompassIQ Hybrid Architecture:
 * This strategy validates Supabase JWT tokens and extracts user information.
 * It works with both Supabase local development and cloud.
 */

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../supabase.service';

interface JwtPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;  // Supabase auth user id
  email: string;
  phone?: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: Record<string, any>;
  role: string;
  aal?: string;
  amr?: { method: string; timestamp: number }[];
  session_id?: string;
}

export interface AuthenticatedUser {
  id: string;           // Application user id (from users table)
  authUserId: string;   // Supabase auth user id
  orgId: string;        // Organization id
  email: string;
  firstName: string;
  lastName: string;
  role: string;         // admin, manager, ae
  status: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {
    // Get JWT secret - for Supabase local, this is a fixed value
    // For production, get from Supabase dashboard: Settings > API > JWT Secret
    const jwtSecret = configService.get<string>('JWT_SECRET') || 
                      configService.get<string>('SUPABASE_JWT_SECRET') ||
                      'super-secret-jwt-token-with-at-least-32-characters-long'; // Default for local Supabase

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
      // Also pass the request to validate()
      passReqToCallback: true,
    });
  }

  /**
   * Validate the JWT payload and return the authenticated user
   * 
   * This method is called by Passport after the JWT signature is verified.
   * We look up the application user from our database to get org_id and role.
   */
  async validate(req: any, payload: JwtPayload): Promise<AuthenticatedUser> {
    // The 'sub' claim contains the Supabase auth user id
    const authUserId = payload.sub;

    if (!authUserId) {
      this.logger.warn('JWT missing sub claim');
      throw new UnauthorizedException('Invalid token');
    }

    // Look up the application user
    const appUser = await this.supabaseService.getAppUser(authUserId);

    if (!appUser) {
      this.logger.warn(`No application user found for auth_user_id: ${authUserId}`);
      
      // For new users who just signed up, the user might not exist yet in our users table
      // This can happen if the auth trigger hasn't run or user wasn't properly created
      throw new UnauthorizedException('User not registered in application');
    }

    // Check if user is active
    if (appUser.status !== 'active') {
      this.logger.warn(`User ${appUser.id} is ${appUser.status}`);
      throw new UnauthorizedException(`Account is ${appUser.status}`);
    }

    // Update last login
    await this.supabaseService.updateLastLogin(appUser.id);

    // Attach the Supabase client with user's token to the request for RLS
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (token) {
      req.supabaseClient = this.supabaseService.getClientWithToken(token);
    }

    return appUser;
  }
}
