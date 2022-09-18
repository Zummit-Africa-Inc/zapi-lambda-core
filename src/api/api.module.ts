import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Analytics } from 'src/entities/analytics.entity';
import { Api } from '../entities/api.entity';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports: [TypeOrmModule.forFeature([Api, Analytics])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
