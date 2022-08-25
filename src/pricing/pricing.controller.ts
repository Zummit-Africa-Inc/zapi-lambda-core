import { Controller, Post, Param, Body } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { ApiOperation } from '@nestjs/swagger';
import { PricingDto } from './dto/pricing.dto';

@Controller('pricing')
export class PricingController {
    constructor(
        private pricingService: PricingService
    ) {}
    
    @Post('/:apiId/basic')
    @ApiOperation({summary: 'Create Basic Pricing Plan for an API'})
    async createApiBasicPrice(@Param('apiId') apiId: string, @Body() body: PricingDto ) {
        const BasicPlan = await this.pricingService.createApiPrice(apiId, body)
        return BasicPlan;
    }

    @Post('/:apiId/pro')
    async createApiProPrice() {

    }

    @Post('/:apiId/ultra')
    async createApiUltraPrice() {

    }

}
