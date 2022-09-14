import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { Subscription } from '../entities/subscription.entity';
import { Api } from '../entities/api.entity';
import { Profile } from '../entities/profile.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Subscription,
      Api,
      Profile,
  ]),
  JwtModule.register({}),
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService]
})
export class SubscriptionModule {}
