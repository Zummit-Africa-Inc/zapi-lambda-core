import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Logger } from 'src/entities/logger.entity';
import { SearchLogDto } from './dto/search-log.dto';

@ApiTags('Activity Logs')
@Controller('log')
export class LoggerController {
  constructor(
    private loggerService: LoggerService,
  ) {}

  @Get('/all')
  @ApiOperation({ summary: 'Gets All CRUD logs' })
  async fetchLogs(): Promise<Ok<Logger[]>> {
    const userProfile = await this.loggerService.fetchLogs();
    return ZaLaResponse.Ok(userProfile, 'Profile created', 201);
  }

  @Get('/one/:logId')
  @ApiOperation({summary: "Get one CRUD logger"})
  async findOne(
    @Param('logId') logId: string,
  ): Promise<Ok<Logger>>{
    const crudLog = await this.loggerService.getOneLog(logId)
    return ZaLaResponse.Ok(crudLog,'Ok', '200')
  }

  @Post('/search')
  @ApiOperation({summary: 'Search for logs'})
  async search(
    @Body()body: SearchLogDto
  ): Promise<Ok<Logger[]>>{
    const foundLogs = await this.loggerService.searchLogs(body)
    return ZaLaResponse.Ok(foundLogs, 'Ok', '200')
  }
}
