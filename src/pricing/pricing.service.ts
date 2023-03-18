import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusCode } from 'src/common/enums/httpStatusCodes.enum';
import { ZaLaResponse } from 'src/common/helpers/response';
import { PricingPlan } from 'src/entities/pricingPlan.entity';
import { Repository } from 'typeorm';
import { CreatePricingPlanDto } from './dto/pricing.dto';
@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(PricingPlan)
    private pricingRepo: Repository<PricingPlan>,
  ) {}

  async create(
    apiId: string,
    body: CreatePricingPlanDto,
  ): Promise<PricingPlan> {
    try {
      const plan = await this.pricingRepo.findOne({
        where: { apiId, name: body.name },
      });

      if (plan) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Bad Request',
            'Pricing plan already exists',
            StatusCode.BAD_REQUEST,
          ),
        );
      }

      const newPlan = this.pricingRepo.create({ ...body, apiId });
      return await this.pricingRepo.save(newPlan);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          error.name,
          error.message,
          error.response.errorCode,
        ),
      );
    }
  }
}
