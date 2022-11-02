import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comments } from 'src/entities/comments.entity';
import { Discussion } from 'src/entities/discussion.entity';
import { DiscussionController } from './discussion.controller';
import { DiscussionService } from './discussion.service';

@Module({
  controllers: [DiscussionController],
  providers: [DiscussionService],
  imports: [TypeOrmModule.forFeature([Discussion, Comments])]
})
export class DiscussionModule {}
