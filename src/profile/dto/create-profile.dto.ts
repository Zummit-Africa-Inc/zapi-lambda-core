import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateProfileDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty()
  userId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: `The full Name of the profile to be created` })
  fullName: string;
}
