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

export class UserRoleResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  createdAt: Date;
}
