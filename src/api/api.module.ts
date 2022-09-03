import { Module } from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiController } from './api.controller';
import { Api } from 'src/entities/api.entity';
import { Analytics } from 'src/entities/analytics.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Api, Analytics])],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
