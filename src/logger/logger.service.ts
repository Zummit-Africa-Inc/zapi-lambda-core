import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from '../common/helpers/response';
import { Repository, Like } from 'typeorm';
import { Logger } from 'src/entities/logger.entity';
import { SearchLogDto } from './dto/search-log.dto';
import { PaginateQuery } from 'nestjs-paginate';


@Injectable()
export class LoggerService {
  constructor(
    @InjectRepository(Logger)
    private loggerRepo: Repository<Logger>,
  ) {}

  async fetchLogs(): Promise<Logger[]> {
    try {
      const allLogs = await this.loggerRepo.find()
      if (allLogs.length <1) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            `No CRUD logs found at the moment`,
          ),
        );
      }
      
      return allLogs;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', err.message, '500'),
      );
    }
  }

  async getOneLog(logId: string): Promise<Logger>{
    try {
      const crudLog = await this.loggerRepo.findOne({
        where: {id: logId}
      })
      if(!crudLog){
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not found',
            'CRUD log not found',
            '404', 
          )
        )
      }
      return crudLog
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  async searchLogs(body: SearchLogDto): Promise<Logger[]>{
    try {
      const {searchField, action} = body
      const foundResult = await this.loggerRepo.find({
        where:[
          { entity_type: Like(`%${searchField}%`)},
          { operated_by: Like(`%${searchField}%`)},
          { action_type: action}
        ]
      })
      if(foundResult.length < 1){
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not found',
            'CRUD log not found',
            '404', 
          )
        )
      }
      return foundResult
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

}
