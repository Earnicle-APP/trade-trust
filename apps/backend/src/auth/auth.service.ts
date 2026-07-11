import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, UserResponse } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
  private readonly refreshExpiresIn: number;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) {
    const raw = configService.get<string>('JWT_REFRESH_EXPIRATION') || '7d';
    this.refreshExpiresIn = this.parseExpiry(raw);
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.prisma.profile.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const profile = await this.prisma.profile.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
      },
    });

    await this.sendVerificationEmail(profile);

    const roles = await this.prisma.userRole.findMany({
      where: { userId: profile.id },
      select: { role: true },
    });

    return this.buildAuthResponse(
      profile,
      roles.map((r) => r.role),
    );
  }

  async login(profile: { id: string; email: string }): Promise<AuthResponse> {
    const roles = await this.prisma.userRole.findMany({
      where: { userId: profile.id },
      select: { role: true },
    });

    const fullProfile = await this.prisma.profile.findUnique({
      where: { id: profile.id },
    });

    if (!fullProfile) {
      throw new UnauthorizedException('User not found');
    }

    return this.buildAuthResponse(
      fullProfile,
      roles.map((r) => r.role),
    );
  }

  async refresh(refreshTokenValue: string): Promise<AuthResponse> {
    const tokenHash = this.hashToken(refreshTokenValue);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (stored.revokedAt) {
      await this.prisma.refreshToken.deleteMany({
        where: { userId: stored.userId },
      });
      throw new UnauthorizedException('Refresh token has been revoked');
    }

    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Refresh token has expired');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const roles = await this.prisma.userRole.findMany({
      where: { userId: stored.userId },
      select: { role: true },
    });

    return this.buildAuthResponse(
      stored.user,
      roles.map((r) => r.role),
    );
  }

  async logout(refreshTokenValue: string): Promise<void> {
    const tokenHash = this.hashToken(refreshTokenValue);

    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async verifyEmail(tokenValue: string): Promise<{ message: string }> {
    const stored = await this.prisma.verificationToken.findUnique({
      where: { token: tokenValue },
    });

    if (!stored) {
      throw new BadRequestException('Invalid verification token');
    }

    if (stored.type !== 'email_verification') {
      throw new BadRequestException('Invalid token type');
    }

    if (stored.usedAt) {
      throw new BadRequestException('Verification token has already been used');
    }

    if (stored.expiresAt < new Date()) {
      throw new BadRequestException('Verification token has expired');
    }

    await this.prisma.$transaction([
      this.prisma.profile.update({
        where: { id: stored.userId },
        data: { emailVerified: true },
      }),
      this.prisma.verificationToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
    ]);
    return { message: 'Email verified' };
  }

  async resendVerification(email: string): Promise<void> {
    const profile = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (!profile) {
      return;
    }

    if (profile.emailVerified) {
      return;
    }

    await this.prisma.verificationToken.updateMany({
      where: { userId: profile.id, type: 'email_verification', usedAt: null },
      data: { usedAt: new Date() },
    });

    await this.sendVerificationEmail(profile);
  }

  async forgotPassword(email: string): Promise<void> {
    const profile = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (!profile) {
      return;
    }

    await this.prisma.verificationToken.updateMany({
      where: { userId: profile.id, type: 'password_reset', usedAt: null },
      data: { usedAt: new Date() },
    });

    const token = crypto.randomBytes(40).toString('hex');

    await this.prisma.verificationToken.create({
      data: {
        userId: profile.id,
        token,
        type: 'password_reset',
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await this.mailService.sendPasswordResetEmail(
      profile.email,
      token,
      profile.fullName,
    );
  }

  async resetPassword(tokenValue: string, newPassword: string): Promise<void> {
    const stored = await this.prisma.verificationToken.findUnique({
      where: { token: tokenValue },
    });

    if (!stored) {
      throw new BadRequestException('Invalid reset token');
    }

    if (stored.type !== 'password_reset') {
      throw new BadRequestException('Invalid token type');
    }

    if (stored.usedAt) {
      throw new BadRequestException('Reset token has already been used');
    }

    if (stored.expiresAt < new Date()) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await this.prisma.$transaction([
      this.prisma.profile.update({
        where: { id: stored.userId },
        data: { passwordHash },
      }),
      this.prisma.verificationToken.update({
        where: { id: stored.id },
        data: { usedAt: new Date() },
      }),
    ]);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<{ id: string; email: string } | null> {
    const profile = await this.prisma.profile.findUnique({
      where: { email },
    });

    if (!profile || !profile.passwordHash) {
      return null;
    }

    const isValid = await bcrypt.compare(password, profile.passwordHash);

    if (!isValid) {
      return null;
    }

    return { id: profile.id, email: profile.email };
  }

  async findOrCreateGoogleUser(data: {
    googleId: string;
    email: string;
    fullName: string;
  }) {
    const existing = await this.prisma.profile.findFirst({
      where: {
        OR: [{ googleId: data.googleId }, { email: data.email }],
      },
    });

    if (existing) {
      if (!existing.googleId) {
        await this.prisma.profile.update({
          where: { id: existing.id },
          data: { googleId: data.googleId },
        });
      }
      return { id: existing.id, email: existing.email };
    }

    const profile = await this.prisma.profile.create({
      data: {
        email: data.email,
        googleId: data.googleId,
        fullName: data.fullName,
        emailVerified: true,
      },
    });

    return { id: profile.id, email: profile.email };
  }

  async getProfile(userId: string): Promise<UserResponse> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new UnauthorizedException('User not found');
    }

    const roles = await this.prisma.userRole.findMany({
      where: { userId: profile.id },
      select: { role: true },
    });

    return this.mapToUserResponse(
      profile,
      roles.map((r) => r.role),
    );
  }

  private async sendVerificationEmail(profile: any): Promise<void> {
    const token = crypto.randomBytes(40).toString('hex');

    await this.prisma.verificationToken.create({
      data: {
        userId: profile.id,
        token,
        type: 'email_verification',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await this.mailService.sendVerificationEmail(
      profile.email,
      token,
      profile.fullName,
    );
  }

  private async buildAuthResponse(
    profile: any,
    roleNames: string[],
  ): Promise<AuthResponse> {
    const accessToken = this.jwtService.sign({
      sub: profile.id,
      email: profile.email,
      roles: roleNames,
    });

    const refreshTokenValue = crypto.randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(refreshTokenValue);

    await this.prisma.refreshToken.create({
      data: {
        userId: profile.id,
        tokenHash,
        expiresAt: new Date(Date.now() + this.refreshExpiresIn),
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenValue,
      user: this.mapToUserResponse(profile, roleNames),
    };
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private parseExpiry(value: string): number {
    const match = value.match(/^(\d+)\s*(s|m|h|d)$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;

    const num = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return num * 1000;
      case 'm':
        return num * 60 * 1000;
      case 'h':
        return num * 60 * 60 * 1000;
      case 'd':
        return num * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  }

  private mapToUserResponse(profile: any, roles: string[]): UserResponse {
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      companyName: profile.companyName ?? null,
      avatarUrl: profile.avatarUrl ?? null,
      country: profile.country ?? null,
      businessType: profile.businessType ?? null,
      kycLevel: profile.kycLevel,
      kycStatus: profile.kycStatus,
      reputationScore: Number(profile.reputationScore),
      onboardingCompleted: profile.onboardingCompleted,
      roles,
      createdAt: profile.createdAt,
    };
  }
}
