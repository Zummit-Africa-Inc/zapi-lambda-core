import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { AnalyticsLogs } from 'src/entities/analytics-logs.entity';
import { Analytics } from 'src/entities/analytics.entity';
import { Api } from 'src/entities/api.entity';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Profile } from 'src/entities/profile.entity';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ApiService } from 'src/api/api.service';
import { Subscription } from 'src/entities/subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Api,
      Profile,
      Endpoint,
      Analytics,
      Subscription,
      AnalyticsLogs,
    ]),
    JwtModule.register({}),
    HttpModule,
  ],
  controllers: [SubscriptionController],
  providers: [SubscriptionService, AnalyticsService, ApiService],
})
export class SubscriptionModule {}
