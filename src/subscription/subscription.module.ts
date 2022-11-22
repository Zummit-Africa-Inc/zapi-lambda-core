import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { Analytics } from 'src/entities/analytics.entity';
import { AnalyticsLogs } from 'src/entities/analyticsLogs.entity';
import { Api } from 'src/entities/api.entity';
import { DevTesting } from 'src/entities/devTesting.entity';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Profile } from 'src/entities/profile.entity';
import { Subscription } from 'src/entities/subscription.entity';
import { HttpCallService } from './httpCall.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subscription,
      Api,
      Profile,
      Endpoint,
      DevTesting,
      Analytics,
      AnalyticsLogs,
      JwtModule,
    ]),
    JwtModule.register({}),
    HttpModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, AnalyticsService, HttpCallService],
})
export class SubscriptionModule {}
