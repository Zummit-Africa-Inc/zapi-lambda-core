import { Controller, Body, Post, Param, } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Subscription } from 'src/entities/subscription.entity';
import { createSubscriptionDto } from './dto/create-subscription.dto';
import { SubscriptionService } from './subscription.service';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
    constructor(
        private readonly subscriptionService: SubscriptionService
    ){}

    @Post('subscribe')
    @ApiOperation({description: "User to subscribe to an API"})
    async subscribe(
        @Body() createSubDto: createSubscriptionDto,        
    ):Promise<Ok<Subscription>> {
        const subToken = await this.subscriptionService.subscribe(createSubDto)
        return ZaLaResponse.Ok(subToken, 'User now subscribed to this API', "201")
    }
}
