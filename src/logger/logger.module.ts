import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Logger } from 'src/entities/logger.entity';
import { LoggerController } from './logger.controller';
import { LoggerService } from './logger.service';

@Module({
  imports: [TypeOrmModule.forFeature([Logger])],
  controllers: [LoggerController],
  providers: [LoggerService],
})
export class LoggerModule {}
