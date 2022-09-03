import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { ApiRequestDto } from './dto/make-request.dto';
import { CreateSubDto } from './dto/create-subscription.dto';
import { Tokens } from 'src/common/interfaces/subcriptionToken.interface';

@ApiTags('Subscriptions')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('api-request')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Request an api' })
  async makeRequest(
    @Headers('X-ZAPI-AUTH-TOKEN') xZapiAuth: string,
    @Body() apiRequest: ApiRequestDto,
  ): Promise<Ok<any>> {
    if (!xZapiAuth) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('No Token', 'No Token provided', '403'),
      );
    }

    const request = await this.subscriptionService.apiRequest(
      xZapiAuth,
      apiRequest,
    );
    return ZaLaResponse.Ok(request, 'Request Successful', '200');
  }

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to an api' })
  async subscribe(@Body() createSubDto: CreateSubDto): Promise<Ok<Tokens>> {
    const subscription = await this.subscriptionService.subscribe(createSubDto);
    return ZaLaResponse.Ok(subscription, 'Subscription Created', '201');
  }

  @Post('unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from an api' })
  async unsubscribe(@Body() createSubDto: CreateSubDto): Promise<Ok<object>> {
    const subscription = await this.subscriptionService.unsubscribe(
      createSubDto,
    );
    return ZaLaResponse.Ok(subscription, 'Subscription Removed', '200');
  }
}
