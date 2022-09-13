import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Endpoint } from 'src/entities/endpoint.entity';
import { EndpointsController } from './endpoints.controller';
import { EndpointsService } from './endpoints.service';

@Module({
  controllers: [EndpointsController],
  providers: [EndpointsService],
  imports:[TypeOrmModule.forFeature([Endpoint])]
})
export class EndpointsModule {}
