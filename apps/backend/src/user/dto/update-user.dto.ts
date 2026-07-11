import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Doe', description: 'Display name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  fullName?: string;

  @ApiPropertyOptional({ example: 'Trade Corp', description: 'Company name' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  companyName?: string;

  @ApiPropertyOptional({ example: 'US', description: 'Country code or name' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 'exporter', description: 'Type of business' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  businessType?: string;

  @ApiPropertyOptional({ description: 'Avatar image URL' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
