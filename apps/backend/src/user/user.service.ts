import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddRoleDto } from './dto/add-role.dto';
import { UserResponse, UserRoleResponse } from './dto/user-response.dto';
import { AppRole } from '../../generated/prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<UserResponse[]> {
    const profiles = await this.prisma.profile.findMany();
    const roles = await this.prisma.userRole.findMany();

    return profiles.map((profile) =>
      this.mapToResponse(
        profile,
        roles
          .filter((r) => r.userId === profile.id)
          .map((r) => r.role),
      ),
    );
  }

  async findOne(id: string): Promise<UserResponse> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.prisma.userRole.findMany({
      where: { userId: id },
      select: { role: true },
    });

    return this.mapToResponse(
      profile,
      roles.map((r) => r.role),
    );
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserResponse> {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.prisma.profile.update({
      where: { id },
      data: dto,
    });

    const roles = await this.prisma.userRole.findMany({
      where: { userId: id },
      select: { role: true },
    });

    return this.mapToResponse(
      updated,
      roles.map((r) => r.role),
    );
  }

  async getRoles(userId: string): Promise<UserRoleResponse[]> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const roles = await this.prisma.userRole.findMany({
      where: { userId },
    });

    return roles.map((r) => ({
      id: r.id,
      userId: r.userId,
      role: r.role,
      createdAt: r.createdAt,
    }));
  }

  async addRole(userId: string, dto: AddRoleDto): Promise<UserRoleResponse> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    const role = await this.prisma.userRole.create({
      data: {
        userId,
        role: dto.role,
      },
    });

    return {
      id: role.id,
      userId: role.userId,
      role: role.role,
      createdAt: role.createdAt,
    };
  }

  async removeRole(userId: string, role: AppRole): Promise<void> {
    const profile = await this.prisma.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.userRole.deleteMany({
      where: { userId, role },
    });
  }

  private mapToResponse(profile: any, roles: string[]): UserResponse {
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
