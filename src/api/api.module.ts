import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Api } from '../entities/api.entity'
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

@Module({
  imports:[
    TypeOrmModule.forFeature([Api]),
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
