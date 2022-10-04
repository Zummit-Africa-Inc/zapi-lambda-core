import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { ApiRequestDto } from './dto/make-request.dto';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { Tokens } from 'src/common/interfaces/subscriptionToken.interface';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'Subscribe to an API' })
  async subscribe(
    @Body() createSubDto: CreateSubscriptionDto,
  ): Promise<Ok<Tokens>> {
    const subToken = await this.subscriptionService.subscribe(createSubDto);
    return ZaLaResponse.Ok(subToken, 'User now subscribed to this API', '201');
  }
  
  @Post('api-request')
  @ApiOperation({ summary: 'Request an api' })
  async verify(
    @Headers('X-ZAPI-AUTH-TOKEN') xZapiAuth: string,
    @Body() requestBody: ApiRequestDto,
  ): Promise<Ok<any>> {
    if (!xZapiAuth) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Bad Request',
          'Subscription token is required to make a request',
          '403',
        ),
      );
    }
    const request = await this.subscriptionService.apiRequest(
      xZapiAuth,
      requestBody,
    );
    return ZaLaResponse.Ok(request, 'Request Successful', '200');
  }

  @Get('/user-subscriptions/:profileId')
  @IdCheck('profileId')
  @ApiOperation({ summary: 'Get all apis a user is subscribed to' })
  async getAllSubscriptions(@Param('profileId') profileId: string) {
    const subscriptions = await this.subscriptionService.getUserSubscriptions(
      profileId,
    );
    return ZaLaResponse.Ok(subscriptions, 'Ok', '200');
  }
}
