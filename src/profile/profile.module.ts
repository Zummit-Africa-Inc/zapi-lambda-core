import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { AnalyticsLogs } from 'src/entities/analyticsLogs.entity';
import { Api } from 'src/entities/api.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, AnalyticsLogs, Api])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
