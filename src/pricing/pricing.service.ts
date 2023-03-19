import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StatusCode } from 'src/common/enums/httpStatusCodes.enum';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Api } from 'src/entities/api.entity';
import { Pricing } from 'src/entities/pricingPlan.entity';
import { Repository } from 'typeorm';
import { CreatePricingDto } from './dto/pricing.dto';
@Injectable()
export class PricingService {
  constructor(
    @InjectRepository(Pricing)
    private pricingRepo: Repository<Pricing>,
    @InjectRepository(Api)
    private apiRepo: Repository<Api>,
  ) {}

  async create(apiId: string, body: CreatePricingDto): Promise<Pricing> {
    try {
      const [plan, api] = await Promise.all([
        this.pricingRepo.findOne({
          where: { apiId, name: body.name },
        }),
        this.apiRepo.findOne({
          where: { id: apiId },
        }),
      ]);

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
      newPlan.api = api;
      return await this.pricingRepo.save(newPlan);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          error.name,
          error.message,
          StatusCode.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  }
}
