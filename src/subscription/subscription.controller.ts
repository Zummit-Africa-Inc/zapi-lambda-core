import { Controller, Body, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Tokens } from 'src/common/interfaces/subscriptionToken.interface';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('subscribe')
  @ApiOperation({ summary: 'User to subscribe to an API' })
  async subscribe(
    @Body() createSubDto: CreateSubscriptionDto,
  ): Promise<Ok<Tokens>> {
    const subToken = await this.subscriptionService.subscribe(createSubDto);
    return ZaLaResponse.Ok(subToken, 'User now subscribed to this API', '201');
  }
}
