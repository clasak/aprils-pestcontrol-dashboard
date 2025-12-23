/**
 * Auth Service
 * 
 * CompassIQ Hybrid Architecture:
 * This service handles authentication using Supabase Auth.
 * - Login/logout via Supabase Auth
 * - Profile management
 * - Password reset via Supabase
 */

import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private supabaseService: SupabaseService,
  ) {}

  /**
   * Validate user credentials with Supabase
   */
  async validateUser(email: string, password: string): Promise<any> {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      this.logger.warn(`Login failed for ${email}: ${error.message}`);
      return null;
    }

    // Get the application user
    const appUser = await this.supabaseService.getAppUser(data.user.id);
    
    if (!appUser) {
      this.logger.warn(`No app user found for Supabase user: ${data.user.id}`);
      return null;
    }

    return {
      ...appUser,
      session: data.session,
    };
  }

  /**
   * Login user and return tokens
   */
  async login(user: any) {
    // If called after validateUser, we already have the session
    return {
      success: true,
      data: {
        accessToken: user.session.access_token,
        refreshToken: user.session.refresh_token,
        expiresIn: user.session.expires_in,
        expiresAt: user.session.expires_at,
        user: {
          id: user.id,
          authUserId: user.authUserId,
          orgId: user.orgId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: null, // TODO: Add avatar support
        },
      },
    };
  }

  /**
   * Register a new user
   */
  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();

    // Validate password strength
    if (registerDto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Parse name
    const nameParts = registerDto.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Sign up with Supabase Auth
    const supabase = this.supabaseService.getClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: registerDto.password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (authError) {
      this.logger.error(`Registration failed: ${authError.message}`);
      throw new BadRequestException(authError.message);
    }

    if (!authData.user) {
      throw new BadRequestException('Failed to create user');
    }

    // The user record will be created by the database trigger (auth.users -> public.users)
    // But for now, we'll create it manually if needed
    
    // TODO: Get org_id from registration or create new org
    // For now, we'll need to handle this during onboarding
    
    return {
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    const supabase = this.supabaseService.getClient();
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      this.logger.warn(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      success: true,
      data: {
        accessToken: data.session?.access_token,
        refreshToken: data.session?.refresh_token,
        expiresIn: data.session?.expires_in,
      },
    };
  }

  /**
   * Get user profile
   */
  async getProfile(user: any) {
    // User is already populated from JWT validation
    const organization = await this.supabaseService.getOrganization(user.orgId);

    return {
      success: true,
      data: {
        id: user.id,
        authUserId: user.authUserId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        organization: organization ? {
          id: organization.id,
          name: organization.name,
          logoUrl: organization.logo_url,
        } : null,
      },
    };
  }

  /**
   * Logout user
   */
  async logout(user: any) {
    const supabase = this.supabaseService.getClient();
    
    await supabase.auth.signOut();

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string) {
    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${this.configService.get('FRONTEND_URL') || 'http://localhost:3000'}/auth/reset-password`,
    });

    if (error) {
      this.logger.warn(`Password reset request failed: ${error.message}`);
      // Don't reveal if email exists
    }

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    const supabase = this.supabaseService.getClient();
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      this.logger.error(`Password reset failed: ${error.message}`);
      throw new BadRequestException('Failed to reset password');
    }

    return {
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    };
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    // Get the user's email
    const appUser = await this.supabaseService.getAppUser(userId);
    
    if (!appUser) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password by attempting to sign in
    const supabase = this.supabaseService.getClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: appUser.email,
      password: currentPassword,
    });

    if (verifyError) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      this.logger.error(`Password change failed: ${error.message}`);
      throw new BadRequestException('Failed to change password');
    }

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
