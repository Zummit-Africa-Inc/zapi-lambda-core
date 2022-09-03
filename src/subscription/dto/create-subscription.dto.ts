import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSubDto {
  @IsNotEmpty()
  @ApiProperty()
  apiId: string;

  @IsNotEmpty()
  @ApiProperty()
  profileId: string;
}
