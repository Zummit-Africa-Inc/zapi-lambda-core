import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EndpointsModule } from './endpoints/endpoints.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { CategoriesModule } from './categories/categories.module';
import { ProfileModule } from './profile/profile.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'ormconfig';
import { ApiModule } from './api/api.module';
import { JwtService } from '@nestjs/jwt';
import { AnalyticsModule } from './analytics/analytics.module';
import { Profile } from './entities/profile.entity';
import { Api } from './entities/api.entity';
import { Category } from './entities/category.entity';
import { Endpoint } from './entities/endpoint.entity';
import { Pricing } from './entities/pricing.entity';
import { Subscription } from './entities/subscription.entity';
import { APP_GUARD } from '@nestjs/core';
import { IdCheckGuard } from './common/guards/idcheck.guard';
import { Logger } from 'src/entities/logger.entity';
import { LoggerModule } from 'src/logger/logger.module';
import { FeedbackModule } from './feedback/feedback.module';
import { DiscussionModule } from './discussion/discussion.module';
import { Comment } from './entities/comments.entity';
import { Discussion } from './entities/discussion.entity';
import { InvitationModule } from './invitation/invitation.module';
import { Invitation } from './entities/invitation.entity';
import { ContactModule } from './contact/contact.module';
import { ReviewModule } from './review/review.module';

/* Creating rabbitmq service that can be used in other modules. */
const RabbitMQService = {
  provide: 'NOTIFY_SERVICE',
  useFactory: (configService: ConfigService) => {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>('RABBITMQ_URL')],
        queue:
          process.env.NODE_ENV !== 'production'
            ? process.env.DEV_NOTIFY_QUEUE
            : process.env.NOTIFY_QUEUE,
        queueOptions: {
          durable: true,
        },
      },
    });
  },
  inject: [ConfigService],
};
@Global()
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([
      Profile,
      Api,
      Category,
      Endpoint,
      Pricing,
      Subscription,
      Logger,
      Comment,
      Discussion,
      Invitation
    ]),
    TypeOrmModule.forRoot(AppDataSource.options),
    EndpointsModule,
    SubscriptionModule,
    ProfileModule,
    ApiModule,
    CategoriesModule,
    AnalyticsModule,
    LoggerModule,
    FeedbackModule,
    DiscussionModule,
    InvitationModule,
    ContactModule,
    ReviewModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    RabbitMQService,
    JwtService,
    {
      provide: APP_GUARD,
      useClass: IdCheckGuard,
    },
  ],
  exports: [RabbitMQService, JwtService],
})
export class AppModule {}
