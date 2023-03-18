import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { PricingName } from 'src/common/enums/pricing.enum';

export class CreatePricingPlanDto {
  @ApiProperty({ default: 'basic' })
  name: PricingName;

  @ApiProperty()
  @IsNotEmpty()
  price: number;

  @ApiProperty()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  requestLimit: number;
}
