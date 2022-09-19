import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Analytics } from 'src/entities/analytics.entity';

import { Api } from '../entities/api.entity';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [TypeOrmModule.forFeature([Api, Analytics, Category])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
