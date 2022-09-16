import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  picture?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  subscriptions?: string;
}
