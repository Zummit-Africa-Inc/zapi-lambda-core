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
import { AnalyticsModule } from './analytics/analytics.module';
import { Profile } from './entities/profile.entity';
import { Api } from './entities/api.entity';
import { Category } from './entities/category.entity';
import { Endpoint } from './entities/endpoint.entity';
import { Pricing } from './entities/pricing.entity';
import { Subscription } from './entities/subscription.entity';
import { APP_GUARD } from '@nestjs/core';
import { IdCheckGuard } from './common/guards/idcheck.guard';
import { Logger } from './entities/logger.entity';
import { LoggerModule } from './logger/logger.module';

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
      Logger
    ]),
    TypeOrmModule.forRoot(AppDataSource.options),
    EndpointsModule,
    SubscriptionModule,
    ProfileModule,
    ApiModule,
    CategoriesModule,
    AnalyticsModule,
    LoggerModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RabbitMQService,
    {
      provide: APP_GUARD,
      useClass: IdCheckGuard,
    },
  ],
  exports: [RabbitMQService],
})
export class AppModule {}
