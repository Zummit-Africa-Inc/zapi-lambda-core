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
@Module({
  imports: [TypeOrmModule.forFeature([Api, Analytics, Category, Endpoint, Logger, Profile])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
