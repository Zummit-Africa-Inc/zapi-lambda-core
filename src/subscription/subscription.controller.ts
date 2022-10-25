import {
  Body,
  Controller,
  Post,
  Headers,
  BadRequestException,
  Get,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { ApiRequestDto } from './dto/make-request.dto';
import { SubscriptionService } from './subscription.service';
import { Tokens } from 'src/common/interfaces/subscriptionToken.interface';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { FreeRequestDto } from './dto/make-request.dto';
import { AccessTokenGuard } from 'src/common/guards/access-token.guard';
import { Public } from 'src/common/decorators/publicRoute.decorator';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';

@ApiTags('Subscription')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @IdCheck('apiId')
  @UseGuards(AuthorizationGuard)
  @Post('subscribe/:apiId')
  @ApiOperation({ summary: 'Subscribe to an API' })
  async subscribe(
    @Param('apiId') apiId: string,
    @Query('profileId') profileId: string,
  ): Promise<Ok<Tokens>> {
    const subToken = await this.subscriptionService.subscribe(apiId, profileId);
    return ZaLaResponse.Ok(subToken, 'Subscription successful', '200');
  }

  @IdCheck('apiId')
  @UseGuards(AuthorizationGuard)
  @Post('unsubscribe/:apiId')
  @ApiOperation({ summary: 'Unsubscribe from an API' })
  async unsubscribe(
    @Param('apiId') apiId: string,
    @Query('profileId') profileId: string,
  ): Promise<Ok<string>> {
    await this.subscriptionService.unsubscribe(apiId, profileId);
    return ZaLaResponse.Ok('Successful', 'Unsubscription successful', '200');
  }

  @IdCheck('apiId')
  @UseGuards(AuthorizationGuard)
  @Post('revoke/:apiId')
  @ApiOperation({ summary: 'Revoke a subscription token' })
  async revokeToken(
    @Param('apiId') apiId: string,
    @Query('profileId') profileId: string,
  ): Promise<Ok<Tokens>> {
    const subToken = await this.subscriptionService.revokeToken(
      apiId,
      profileId,
    );
    return ZaLaResponse.Ok(subToken, 'Access key revoked', '200');
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
  @Public()
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
    const data = Array.isArray(request) ? request[0] : request;
    let response = Object.values(data);

    for (let value of response) {
      return ZaLaResponse.Ok(value, 'Request Successful', '200');
    }
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
