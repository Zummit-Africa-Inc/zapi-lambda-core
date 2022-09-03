import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Api } from 'src/entities/api.entity';
import { Endpoint } from 'src/entities/endpoint.entity';
import { EndpointsController } from './endpoints.controller';
import { EndpointsService } from './endpoints.service';

@Module({
  controllers: [EndpointsController],
  imports: [TypeOrmModule.forFeature([Api, Endpoint])],
  providers: [EndpointsService],
})
export class EndpointsModule {}
