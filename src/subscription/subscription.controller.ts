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
  Req,
  Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { ApiRequestDto, DevTestRequestDto } from './dto/make-request.dto';
import { SubscriptionService } from './subscription.service';
import { Tokens } from 'src/common/interfaces/subscriptionToken.interface';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { FreeRequestDto } from './dto/make-request.dto';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Public } from 'src/common/decorators/publicRoute.decorator';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { DevTesting } from 'src/entities/devTesting.entity';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@ApiTags('Subscription')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
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

  @Public()
  @Post('api-request')
  @ApiOperation({ summary: 'Request an api' })
  async apiRequest(
    @Body() requestBody: ApiRequestDto,
    @Headers('x-zapi-request-token') token: string,
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

  @Post('/api-dev-test/:testId')
  @ApiOperation({ summary: 'Test an api' })
  async devTest(@Param('testId') testId: string): Promise<Ok<any>> {
    const request = await this.subscriptionService.devTest(testId);
    return ZaLaResponse.Ok(request, 'Request Successful', '200');
  }

  @Post('save-dev-test')
  @ApiOperation({ summary: 'Save test data' })
  async saveTest(
    @Body() requestBody: DevTestRequestDto,
    @Req() req: Request,
  ): Promise<Ok<any>> {
    const test = await this.subscriptionService.saveTest(
      req.profileId,
      requestBody,
    );
    return ZaLaResponse.Ok(test, 'Test saved', '201');
  }

  @Get('/get-dev-tests')
  @ApiOperation({ summary: 'Get test records' })
  async getTests(
    @Req() req: Request,
    @Paginate() query: PaginateQuery,
  ): Promise<Ok<Paginated<DevTesting>>> {
    const filter = query.filter;
    const tests = await this.subscriptionService.getTests({
      ...query,
      filter: { ...filter, profileId: req.profileId },
    });
    return ZaLaResponse.Paginated(tests, 'Request Successful', '200');
  }

  @Delete('/delete-test/:testId')
  @ApiOperation({ summary: 'Delete a test record' })
  async deleteTest(@Param('testId') testId: string): Promise<Ok<string>> {
    await this.subscriptionService.deleteTest(testId);
    return ZaLaResponse.Ok('Ok', 'Test record removed', '200');
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

  @Post('/remove-all-api-subscriptions/:apiId')
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Remove all subscriptions from an api' })
  async removeAllApiSubscriptions(
    @Param('apiId') apiId: string,
  ): Promise<Ok<string>> {
    await this.subscriptionService.removeAllApiSubscriptions(apiId);
    return ZaLaResponse.Ok('Unsubscriptions complete', 'Ok', '200');
  }
}
