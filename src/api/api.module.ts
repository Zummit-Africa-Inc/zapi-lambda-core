import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Analytics } from 'src/entities/analytics.entity';
import { Api } from '../entities/api.entity';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Logger } from 'src/entities/logger.entity';
import { Profile } from 'src/entities/profile.entity';
import { Subscription } from 'src/entities/subscription.entity';
import { Review } from 'src/entities/review.entity';
import { Pricing } from 'src/entities/pricing.entity';
import { Comment } from 'src/entities/comments.entity';
import { Discussion } from 'src/entities/discussion.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Api,
      Analytics,
      Category,
      Endpoint,
      Logger,
      Profile,
      Subscription,
      Review,
      Pricing,
      Comment,
      Discussion,
    ]),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
