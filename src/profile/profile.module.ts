import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImageUploadService } from 'src/common/helpers/imageUploadService';
import { Api } from 'src/entities/api.entity';
import { Profile } from '../entities/profile.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Api])],
  controllers: [ProfileController],
  providers: [ProfileService, ImageUploadService],
})
export class ProfileModule {}
