import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshDto {
  @ApiProperty({ description: 'Refresh token issued at login or previous refresh' })
  @IsString()
  refreshToken: string;
}
