import { Controller, Post, Param, Body, Get } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { ApiOperation } from '@nestjs/swagger';
import { PricingDto } from './dto/pricing.dto';
import { ZaLaResponse } from 'src/common/helpers/response'; 

@Controller('pricing')
export class PricingController {
    constructor(
        private pricingService: PricingService
    ) {}
    
    @Post('/:apiId/basic')
    @ApiOperation({summary: 'Create Basic Pricing Plan for an API'})
    async createApiBasicPrice(@Param('apiId') apiId: string, @Body() body: PricingDto ) {
        const basicPlan = await this.pricingService.createApiPrice(apiId, body)
        return ZaLaResponse.Ok(basicPlan, 'Basic pricing created for API', 201)
    }

    @Post('/:apiId/pro')
    async createApiProPrice(@Param('apiId') apiId: string, @Body() body: PricingDto ) {
        const proPlan = await this.pricingService.createApiPrice(apiId, body)
        return ZaLaResponse.Ok(proPlan, 'Pro pricing created for API', 201)
    }

    @Post('/:apiId/ultra')
    async createApiUltraPrice(@Param('apiId') apiId: string, @Body() body: PricingDto ) {
        const ultraPlan = await this.pricingService.createApiPrice(apiId, body)
        return ZaLaResponse.Ok(ultraPlan, 'Ultra pricing created for API', 201)
    }

    @Post('/:apiId/mega')
    async createApiMegaPrice(@Param('apiId') apiId: string, @Body() body: PricingDto ) {
        const megaPlan = await this.pricingService.createApiPrice(apiId, body)
        return ZaLaResponse.Ok(megaPlan, 'Mega pricing created for API', 201)
    }

    @Get('/:apiId/price')
    async getApiPrices() {
        return 
    }

}
