import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { Pricing } from '../entities/pricingPlan.entity';
import { Api } from 'src/entities/api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pricing, Api])],
  controllers: [PricingController],
  providers: [PricingService],
})
export class PricingModule {}
