import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Pricing } from 'src/entities/pricing.entity';
import { Repository } from 'typeorm';
import { PricingDto } from './dto/pricing.dto';

@Injectable()
export class PricingService {
    constructor(
        @InjectRepository(Pricing)
        private pricingRepo: Repository<Pricing>
    ) {}
    
    /**
    * Assigns a created pricing plan to an api and then stores it in the database.
    * Returns the pricing plan along with the api if successful.
    * Returns an error if unsuccessful.
    */
    // route: profile/zapi-12747494/basic
    async createApiPrice(apiId: string, body: PricingDto) {
        return
    }
}
