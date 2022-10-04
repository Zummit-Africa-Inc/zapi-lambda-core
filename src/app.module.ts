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
import { IdGuard } from './common/guards/id-guard.guard';
import { APP_GUARD } from '@nestjs/core';

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
    TypeOrmModule.forRoot(AppDataSource.options),
    EndpointsModule,
    SubscriptionModule,
    ProfileModule,
    ApiModule,
    CategoriesModule,
    AnalyticsModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RabbitMQService,
    {
      provide: APP_GUARD,
      useClass: IdGuard
    }
  ],
  exports: [RabbitMQService],
})
export class AppModule {}
