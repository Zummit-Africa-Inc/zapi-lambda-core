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
import { UpdateApiDto } from './dto/update-api.dto';
import { Category } from 'src/entities/category.entity';
import { Analytics } from 'src/entities/analytics.entity';
import { GetApiDto } from './dto/get-api.dto';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Analytics)
    private readonly analyticsRepo: Repository<Analytics>,
  ) {}

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
   * It gets an api by its id
   * @param {string} apiId - string - the id of the api you want to get
   * @returns The api object
   */
  async getAnApi(apiId: string, profileId?: string): Promise<GetApiDto> {
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const isOwner = await this.verify(apiId, profileId);
      if (!api) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not found',
            'The api does not exist',
            '404',
          ),
        );
      }
      if (api && isOwner === true) {
        return api;
      } else {
        const {
          ['base_url']: unused1,
          ['visibility']: unused2,
          ['subscriptions']: unused3,
          ['status']: unused4,
          ['secretKey']: unused5,
          ...partialApi
        } = api;

        return partialApi;
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It creates an api for a user
   * @param {CreateApiDto} createApiDto - CreateApiDto
   * @param {string} profileId - string
   * @returns The return type is an object of type ApiEntity.
   */
  async createApi(createApiDto: CreateApiDto, profileId: string): Promise<Api> {
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
      const savedApi = await this.apiRepo.save(newApi);
      const analytics = this.analyticsRepo.create({ apiId: savedApi.id });
      this.analyticsRepo.save(analytics);
      return savedApi;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', err.message, '500'),
      );
    }
  }

  /**
   * It checks if the profileId of the api is the same as the profileId of the user.
   * </code>
   * @param {string} apiId - the id of the api
   * @param {string} profileId - The id of the profile that is being verified
   * @returns a boolean value.
   */
  async verify(apiId: string, profileId: string): Promise<boolean> {
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

  /**
   * It checks if the user is the owner of the api, if yes, it updates the api.
   * </code>
   * @param {string} apiId - The id of the api to be updated.
   * @param {string} profileId - The id of the user who is trying to update the api.
   * @param {UpdateApiDto} updateApiDto - UpdateApiDto
   * @returns The update method returns a promise of type UpdateResult.
   */

  async update(
    apiId: string,
    profileId: string,
    updateApiDto: UpdateApiDto,
  ): Promise<Api> {
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      if (api) {
        /* Checking if the user is the owner of the api. */
        const verified = await this.verify(apiId, profileId);
        if (verified === false) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest('Forbidden', 'Unauthorized action', '403'),
          );
        }

        /* Checking if the user is also updating the Api name
         *  then check if the new updated API name already exist.
         */

        if (updateApiDto.name) {
          const apiNameExist = await this.apiRepo.findOne({
            where: { name: updateApiDto.name },
          });

          if (apiNameExist) {
            throw new BadRequestException(
              ZaLaResponse.BadRequest(
                'Existing values',
                'An api with this name already exist... try another name',
              ),
            );
          }
        }

        /* Checking if user is also updating the categoryId.
         * then it finds and check if it exist
         */

        if (updateApiDto.categoryId) {
          const findCategory = await this.categoryRepo.findOne({
            where: { id: updateApiDto.categoryId },
          });

          if (!findCategory) {
            throw new NotFoundException(
              ZaLaResponse.NotFoundRequest(
                'Not Found',
                'Category does not exist',
                '404',
              ),
            );
          }
        }

        await this.apiRepo.update(apiId, updateApiDto);
        const updatedApi = await this.apiRepo.findOne({
          where: { id: apiId },
        });
        if (updatedApi) {
          return updatedApi;
        }
      } else {
        throw new BadRequestException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'Api does not exist',
            '404',
          ),
        );
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It deletes an api from the database if the user is the owner of the api.
   * @param {string} apiId - string, profileId: string
   * @param {string} profileId - string - The id of the profile that is trying to delete the api
   * @returns The return type is a promise.
   */
  async deleteApi(apiId: string, profileId: string) {
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const isOwner = await this.verify(apiId, profileId);

      if (isOwner === false) {
        throw new NotFoundException(
          ZaLaResponse.BadRequest('Forbidden', 'Unauthorized action', '403'),
        );
      }

      if (api && isOwner === true) {
        return await this.apiRepo.remove(api);
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
