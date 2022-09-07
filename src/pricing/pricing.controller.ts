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
}
