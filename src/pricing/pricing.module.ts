import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingPlanController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PricingPlan } from '../entities/pricingPlan.entity';
import { Api } from 'src/entities/api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PricingPlan, Api])],
  controllers: [PricingPlanController],
  providers: [PricingService],
})
export class PricingModule {}
