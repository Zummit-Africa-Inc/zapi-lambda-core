import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class createSubscriptionDto {
  @IsNotEmpty()
  @ApiProperty()
  apiId: string;

  @IsNotEmpty()
  @ApiProperty()
  profileId: string;
}
