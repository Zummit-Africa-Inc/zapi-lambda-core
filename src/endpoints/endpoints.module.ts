import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Api } from 'src/entities/api.entity';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Logger } from 'src/entities/logger.entity';
import { Profile } from 'src/entities/profile.entity';
import { EndpointsController } from './endpoints.controller';
import { EndpointsService } from './endpoints.service';

@Module({
  controllers: [EndpointsController],
  providers: [EndpointsService],
  imports:[TypeOrmModule.forFeature([Endpoint, Logger, Profile, Api])]
})
export class EndpointsModule {}
