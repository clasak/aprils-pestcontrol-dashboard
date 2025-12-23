/**
 * Supabase Service for NestJS Backend
 * 
 * CompassIQ Hybrid Architecture:
 * This service handles Supabase client initialization and JWT verification
 * for the NestJS backend. It validates Supabase auth tokens and provides
 * admin operations using the service role key.
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';

interface SupabaseJwtPayload {
  aud: string;
  exp: number;
  iat: number;
  iss: string;
  sub: string;
  email: string;
  phone: string;
  app_metadata: {
    provider: string;
    providers: string[];
  };
  user_metadata: Record<string, any>;
  role: string;
  aal: string;
  amr: { method: string; timestamp: number }[];
  session_id: string;
}

interface AppUser {
  id: string;
  authUserId: string;
  orgId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  
  // Client for authenticated user requests (uses anon key)
  private supabaseClient: SupabaseClient;
  
  // Admin client for service operations (uses service role key)
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 
                        'http://127.0.0.1:54321';
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY') ||
                           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';
    const supabaseServiceRoleKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY') ||
                                   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

    // Initialize client for user requests
    this.supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Initialize admin client for service operations
    this.supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const isLocal = supabaseUrl.includes('127.0.0.1') || supabaseUrl.includes('localhost');
    this.logger.log(`Supabase initialized: ${isLocal ? 'Local' : 'Cloud'} (${supabaseUrl})`);
  }

  /**
   * Get the Supabase client for user requests
   */
  getClient(): SupabaseClient {
    return this.supabaseClient;
  }

  /**
   * Get the admin client for service operations
   * CAUTION: This bypasses RLS! Use only for admin operations
   */
  getAdminClient(): SupabaseClient {
    return this.supabaseAdmin;
  }

  /**
   * Get a client with a specific user's JWT token
   * This respects RLS policies for that user
   */
  getClientWithToken(accessToken: string): SupabaseClient {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL') || 
                        'http://127.0.0.1:54321';
    const supabaseAnonKey = this.configService.get<string>('SUPABASE_ANON_KEY') ||
                           'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  /**
   * Verify a JWT token and get the user
   */
  async verifyToken(accessToken: string): Promise<User | null> {
    const { data: { user }, error } = await this.supabaseAdmin.auth.getUser(accessToken);
    
    if (error) {
      this.logger.warn(`Token verification failed: ${error.message}`);
      return null;
    }

    return user;
  }

  /**
   * Get the application user from the database
   * This retrieves the user record from our users table (not auth.users)
   */
  async getAppUser(authUserId: string): Promise<AppUser | null> {
    const { data, error } = await this.supabaseAdmin
      .from('users')
      .select(`
        id,
        auth_user_id,
        org_id,
        email,
        first_name,
        last_name,
        status,
        user_roles (
          role:roles (
            name
          )
        )
      `)
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !data) {
      this.logger.warn(`App user not found for auth_user_id: ${authUserId}`);
      return null;
    }

    // Extract role name from joined data
    const roleName = data.user_roles?.[0]?.role?.name || 'ae';

    return {
      id: data.id,
      authUserId: data.auth_user_id,
      orgId: data.org_id,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      role: roleName,
      status: data.status,
    };
  }

  /**
   * Get the user's organization
   */
  async getOrganization(orgId: string) {
    const { data, error } = await this.supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', orgId)
      .single();

    if (error) {
      this.logger.warn(`Organization not found: ${orgId}`);
      return null;
    }

    return data;
  }

  /**
   * Create a new user in the application
   * Called after a user signs up via Supabase Auth
   */
  async createAppUser(
    authUserId: string,
    orgId: string,
    email: string,
    firstName: string,
    lastName: string,
    role: string = 'ae'
  ): Promise<AppUser | null> {
    // Create the user record
    const { data: user, error: userError } = await this.supabaseAdmin
      .from('users')
      .insert({
        auth_user_id: authUserId,
        org_id: orgId,
        email,
        first_name: firstName,
        last_name: lastName,
        status: 'active',
      })
      .select()
      .single();

    if (userError) {
      this.logger.error(`Failed to create user: ${userError.message}`);
      return null;
    }

    // Get or create the role
    const { data: existingRole } = await this.supabaseAdmin
      .from('roles')
      .select('id')
      .eq('org_id', orgId)
      .eq('name', role)
      .single();

    let roleId = existingRole?.id;

    // If role doesn't exist for this org, create it
    if (!roleId) {
      const { data: newRole, error: roleError } = await this.supabaseAdmin
        .from('roles')
        .insert({
          org_id: orgId,
          name: role,
          display_name: role.charAt(0).toUpperCase() + role.slice(1),
          is_system_role: true,
        })
        .select('id')
        .single();

      if (roleError) {
        this.logger.error(`Failed to create role: ${roleError.message}`);
      } else {
        roleId = newRole?.id;
      }
    }

    // Assign role to user
    if (roleId) {
      await this.supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: user.id,
          role_id: roleId,
        });
    }

    return {
      id: user.id,
      authUserId: user.auth_user_id,
      orgId: user.org_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role,
      status: user.status,
    };
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.supabaseAdmin
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', userId);
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const { data, error } = await this.supabaseAdmin
      .from('user_roles')
      .select(`
        role:roles!inner (
          name
        )
      `)
      .eq('user_id', userId)
      .eq('roles.name', roleName);

    return !error && data && data.length > 0;
  }

  /**
   * Check if user is admin or manager
   */
  async isAdminOrManager(userId: string): Promise<boolean> {
    const isAdmin = await this.hasRole(userId, 'admin');
    const isManager = await this.hasRole(userId, 'manager');
    return isAdmin || isManager;
  }
}

