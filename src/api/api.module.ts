import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from 'src/entities/analytics.entity';
import { Api } from '../entities/api.entity';
import { Category } from 'src/entities/category.entity';
import { Endpoint } from 'src/entities/endpoint.entity';
import { EndpointFolder } from 'src/entities/endpoint-folder.entity';
import { Logger } from 'src/entities/logger.entity';
import { Profile } from 'src/entities/profile.entity';
import { Review } from 'src/entities/review.entity';
import { Subscription } from 'src/entities/subscription.entity';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Api,
      Analytics,
      Category,
      Endpoint,
      EndpointFolder,
      Logger,
      Profile,
      Subscription,
      Review,
    ]),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
