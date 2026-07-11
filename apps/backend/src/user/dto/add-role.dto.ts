import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppRole } from '../../../generated/prisma/client';

export class AddRoleDto {
  @ApiProperty({ enum: AppRole, description: 'Role to assign' })
  @IsEnum(AppRole)
  role: AppRole;
}
