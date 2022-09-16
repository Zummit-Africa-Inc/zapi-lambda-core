import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Repository } from 'typeorm';
import { Api } from '../entities/api.entity';
import { CreateApiDto } from './dto/create-api.dto';
import { v4 as uuid } from 'uuid';
import { verify } from 'crypto';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
  ) {}

  async createApi(createApiDto: CreateApiDto, profileId: string) {
    try {
      const apiExist = await this.apiRepo.findOne({
        where: { name: createApiDto.name },
      });

      if (apiExist) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Existing values',
            'An api with with this name already exist... try another name',
          ),
        );
      }
      const uniqueApiSecretKey = uuid();
      const newApi = this.apiRepo.create({
        ...createApiDto,
        profileId,
        secretKey: uniqueApiSecretKey,
      });
      const saveApi = await this.apiRepo.save(newApi);
      return saveApi;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', err.message, '500'),
      );
    }
  }

  /**
   * @param {string} profileId - The id of the user who is trying to get his or her api list.
   * checks if user has an api created from query result.
   * @returns The getUserApis method returns a promise of unique apis created by the user(profileId).
   */

  async getUserApis(profileId: string): Promise<Api[]> {
    try {
      const userApis = await this.apiRepo.find({ where: { profileId } });
      if (userApis.length === 0) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'User has no api created.',
            '404',
          ),
        );
      }
      return userApis;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * @param {string} apiId - id of the API
   * @param {string} profileId -  id of the user who is trying to get the api.
   * checks if the api exist and the user is can get the api.
   * @returns The getAnApi method returns a promise of unique api the user(profileId) requested .
   */
  
  async getAnApi(apiId: string, profileId: string) {
    try{
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
    if (!api) {
      throw new NotFoundException(
        ZaLaResponse.NotFoundRequest(
          'Not found',
          'The api does not exist',
          '404',
        ),
      );
    }
    if(api.profileId === profileId){
      return api;
    }else{
      delete api.base_url,api.visibility,api.website
      return api;
    }
    
    }catch(error){
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  async verify(apiId: string, profileId: string) {
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      if (!api) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not found',
            'The api does not exist',
            '404',
          ),
        );
      } else {
        const status = api.profileId === profileId ? true : false;
        return status;
      }
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', err.message, '500'),
      );
    }
  }

  async deleteApi(apiId: string, profileId: string) {
    try {
      const apiExist = await this.apiRepo.findOne({ where: { id: apiId } });
      const isOwner = await this.verify(apiId, profileId);

      if (isOwner === false) {
        throw new NotFoundException(
          ZaLaResponse.BadRequest('Forbidden', 'Unauthorized action', '403'),
        );
      }

      if (apiExist && isOwner === true) {
        return await this.apiRepo.remove(apiExist);
      }
      throw new NotFoundException(
        ZaLaResponse.NotFoundRequest('Not Found', 'Api does not exist', '404'),
      );
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', err.message, '500'),
      );
    }
  }
}
