import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from 'src/entities/category.entity';
import { Analytics } from 'src/entities/analytics.entity';
import { Api } from '../entities/api.entity';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';
import { ImageUploadService } from 'src/common/helpers/imageUploadService';
import { Profile } from 'src/entities/profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Api, Analytics, Category, Profile])],
  controllers: [ApiController],
  providers: [ApiService, ImageUploadService],
})
export class ApiModule {}
