import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Pricing } from 'src/entities/pricing.entity';
import { Repository } from 'typeorm';
@Injectable()
export class PricingService {
    constructor(
        @InjectRepository(Pricing)
        private pricingRepo: Repository<Pricing>
    ) {}
}
