import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

// Mock user storage (in production, use database)
interface MockUser {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  companyId: string;
  createdAt: Date;
}

// In-memory user store for MVP demo
const mockUsers: Map<string, MockUser> = new Map();

// Initialize with a demo user
const initDemoUser = async () => {
  const hashedPassword = await bcrypt.hash('Demo123!@#', 10);
  mockUsers.set('demo@aprilspestcontrol.com', {
    id: 'user-001',
    email: 'demo@aprilspestcontrol.com',
    password: hashedPassword,
    firstName: 'April',
    lastName: 'Johnson',
    role: 'admin',
    avatar: undefined,
    companyId: 'company-001',
    createdAt: new Date(),
  });
};

// Initialize demo user
initDemoUser();

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    // Look up user
    const user = mockUsers.get(email.toLowerCase());

    if (user && await bcrypt.compare(password, user.password)) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      companyId: user.companyId,
    };

    const refreshPayload = {
      sub: user.id,
      type: 'refresh',
    };

    return {
      success: true,
      data: {
        accessToken: this.jwtService.sign(payload),
        refreshToken: this.jwtService.sign(refreshPayload, {
          secret: this.configService.get('auth.jwtRefresh.secret') || 'refresh-secret',
          expiresIn: this.configService.get('auth.jwtRefresh.expiresIn') || '7d',
        }),
        expiresIn: 3600, // 1 hour in seconds
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          companyId: user.companyId,
        },
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const email = registerDto.email.toLowerCase();

    // Check if user exists
    if (mockUsers.has(email)) {
      throw new BadRequestException('A user with this email already exists');
    }

    // Validate password strength
    if (registerDto.password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Parse name
    const nameParts = registerDto.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Create user
    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: registerDto.role || 'user',
      avatar: undefined,
      companyId: 'company-001', // Default company for demo
      createdAt: new Date(),
    };

    mockUsers.set(email, newUser);

    // Auto-login after registration
    const { password: _, ...userWithoutPassword } = newUser;
    return this.login(userWithoutPassword);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('auth.jwtRefresh.secret') || 'refresh-secret',
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Find user by ID
      let foundUser: MockUser | undefined;
      mockUsers.forEach((user) => {
        if (user.id === payload.sub) {
          foundUser = user;
        }
      });

      if (!foundUser) {
        throw new UnauthorizedException('User not found');
      }

      const { password: _, ...userWithoutPassword } = foundUser;

      const newPayload = {
        email: userWithoutPassword.email,
        sub: userWithoutPassword.id,
        role: userWithoutPassword.role,
        companyId: userWithoutPassword.companyId,
      };

      return {
        success: true,
        data: {
          accessToken: this.jwtService.sign(newPayload),
          expiresIn: 3600,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getProfile(user: any) {
    // Find full user data
    const fullUser = mockUsers.get(user.email);

    if (!fullUser) {
      throw new UnauthorizedException('User not found');
    }

    const { password: _, ...userWithoutPassword } = fullUser;

    return {
      success: true,
      data: userWithoutPassword,
    };
  }

  async logout(user: any) {
    // In production, invalidate the token in Redis/database
    // For MVP, just return success
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async forgotPassword(email: string) {
    const user = mockUsers.get(email.toLowerCase());

    // Always return success for security (don't reveal if email exists)
    if (!user) {
      return {
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      };
    }

    // In production:
    // 1. Generate reset token
    // 2. Store token with expiration
    // 3. Send email with reset link
    // For MVP, just log
    console.log(`Password reset requested for: ${email}`);

    return {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    // In production:
    // 1. Verify token exists and is not expired
    // 2. Find user by token
    // 3. Hash new password
    // 4. Update user password
    // 5. Invalidate token

    // For MVP, just validate the password
    if (newPassword.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    return {
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.',
    };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // Find user
    let foundUser: MockUser | undefined;
    mockUsers.forEach((user) => {
      if (user.id === userId) {
        foundUser = user;
      }
    });

    if (!foundUser) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, foundUser.password);
    if (!isValidPassword) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new BadRequestException('New password must be at least 8 characters long');
    }

    // Hash and update password
    foundUser.password = await bcrypt.hash(newPassword, 10);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }
}
