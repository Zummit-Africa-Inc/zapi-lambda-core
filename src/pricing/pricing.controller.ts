import { Controller, Post, Param, Body, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePricingPlanDto } from './dto/pricing.dto';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { PricingPlan } from 'src/entities/pricingPlan.entity';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { StatusCode } from 'src/common/enums/httpStatusCodes.enum';

@ApiTags('Pricing')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
@Controller('pricing')
export class PricingPlanController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('new/:apiId')
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Create a new pricing plan' })
  async create(
    @Param('apiId') apiId: string,
    @Body() body: CreatePricingPlanDto,
  ): Promise<Ok<PricingPlan>> {
    const pricing = await this.pricingService.create(apiId, body);
    return ZaLaResponse.Ok(pricing, 'Pricing Created', StatusCode.CREATED);
  }
}
