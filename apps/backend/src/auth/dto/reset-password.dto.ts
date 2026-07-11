import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token sent to your inbox' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'newSecurePass123', minLength: 8, maxLength: 128, description: 'New password' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
