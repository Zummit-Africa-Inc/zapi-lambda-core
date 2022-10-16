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
import { Tokens } from 'src/common/interfaces/subscriptionToken.interface';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { FreeRequestDto } from './dto/make-request.dto';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @IdCheck('apiId', 'profileId')
  @Post('subscribe/:apiId/:profileId')
  @ApiOperation({ summary: 'Subscribe to an API' })
  async subscribe(
    @Param('apiId') apiId: string,
    @Param('profileId') profileId: string,
  ): Promise<Ok<Tokens>> {
    const subToken = await this.subscriptionService.subscribe(apiId, profileId);
    return ZaLaResponse.Ok(subToken, 'User now subscribed to this API', '201');
  }

  @Post('api-request')
  @ApiOperation({ summary: 'Request an api' })
  async apiRequest(
    @Body() requestBody: ApiRequestDto,
    @Headers('X-ZAPI-AUTH-TOKEN') token: string,
  ): Promise<Ok<any>> {
    if (!token) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Bad Request',
          'Subscription token is required to make a request',
          '403',
        ),
      );
    }
    const request = await this.subscriptionService.apiRequest(
      token,
      requestBody,
    );
    return ZaLaResponse.Ok(request, 'Request Successful', '200');
  }

  @Post('/free-request/:apiId')
  @ApiOperation({ summary: 'Free api request' })
  async freeRequest(
    @Headers('X-ZAPI-FREE-TOKEN') token: string,
    @Param('apiId') apiId: string,
    @Body() requestBody: FreeRequestDto,
  ): Promise<Ok<any>> {
    if (!token) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Bad Request',
          'Subscription token is required to make a request',
          '403',
        ),
      );
    }
    const request = await this.subscriptionService.freeApiRequest(
      token,
      requestBody,
      apiId,
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
