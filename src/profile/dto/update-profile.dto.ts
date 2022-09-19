import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
export class UpdateProfileDto {
  @IsEmail()
  @ApiPropertyOptional()
  email?: string;
}
