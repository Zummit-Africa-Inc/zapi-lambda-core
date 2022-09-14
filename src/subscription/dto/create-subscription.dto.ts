import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @ApiProperty()
  apiId: string;

  @IsNotEmpty()
  @ApiProperty()
  profileId: string;
}

export class SubscriptionTokenDto {
  @IsNotEmpty()
  @ApiProperty()
  subscriptionToken: string;
}
