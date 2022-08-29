import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EndpointsModule } from './endpoints/endpoints.module';
import { SubscriptionModule } from './subscription/subscription.module';

@Module({
  imports: [EndpointsModule, SubscriptionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
