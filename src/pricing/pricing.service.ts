import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
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


    async createPricing(pricing: PricingDto) {
        const pricingData = Object.assign(new Pricing(), pricing);

        console.log(pricingData)

        const newPricing = await this.pricingRepo.save(pricingData)

        if(!newPricing) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest("Error creating pricing")
            )
        }
        return newPricing.id;
    }

    async getApiPricing(apiId: string) {
        
    }
}
