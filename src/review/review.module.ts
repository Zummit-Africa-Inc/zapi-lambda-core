import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Api } from 'src/entities/api.entity';
import { Profile } from 'src/entities/profile.entity';
import { Review } from 'src/entities/review.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Api, Profile, Review])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
