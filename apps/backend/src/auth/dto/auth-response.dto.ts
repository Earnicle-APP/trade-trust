import { ApiProperty } from '@nestjs/swagger';

export class UserResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty({ nullable: true })
  companyName: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty({ nullable: true })
  country: string | null;

  @ApiProperty({ nullable: true })
  businessType: string | null;

  @ApiProperty()
  kycLevel: string;

  @ApiProperty()
  kycStatus: string;

  @ApiProperty()
  reputationScore: number;

  @ApiProperty()
  onboardingCompleted: boolean;

  @ApiProperty({ type: [String] })
  roles: string[];

  @ApiProperty()
  createdAt: Date;
}

export class AuthResponse {
  @ApiProperty({ description: 'Short-lived JWT access token (15m)' })
  accessToken: string;

  @ApiProperty({ description: 'Long-lived refresh token (7d) — use to get a new access token' })
  refreshToken: string;

  @ApiProperty({ type: UserResponse })
  user: UserResponse;
}
