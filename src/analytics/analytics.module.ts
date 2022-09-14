import { Module } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from 'src/entities/analytics.entity';
import { AnalyticsLogs } from 'src/entities/analyticsLogs.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Analytics, AnalyticsLogs])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
