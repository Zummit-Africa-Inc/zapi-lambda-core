import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Repository } from 'typeorm';
import { Api } from '../entities/api.entity';
import { Profile } from 'src/entities/profile.entity';
import { Logger } from 'src/entities/logger.entity';
import { CreateApiDto } from './dto/create-api.dto';
import { v4 as uuid } from 'uuid';
import { UpdateApiDto } from './dto/update-api.dto';
import { Category } from 'src/entities/category.entity';
import { Analytics } from 'src/entities/analytics.entity';
import { Subscription } from 'src/entities/subscription.entity';
import {
  deleteImage,
  uploadImage,
} from 'src/common/helpers/imageUploadService';
import {
  FilterOperator,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Action } from 'src/common/enums/actionLogger.enum';
import { FreeApis } from 'src/subscription/apis';
import { Visibility } from 'src/common/enums/visibility.enum';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Analytics)
    private readonly analyticsRepo: Repository<Analytics>,
    @InjectRepository(Endpoint)
    private readonly endpointsRepo: Repository<Endpoint>,
    @InjectRepository(Logger)
    private readonly loggerRepo: Repository<Logger>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  /**
   * It gets all the apis for a user
   * @param {string} profileId - string - this is the id of the user whose apis we are fetching
   * @returns An array of Api objects.
   */

  async getUserApis(profileId: string): Promise<Api[]> {
    try {
      const userApis = await this.apiRepo.find({ where: { profileId } });
      return userApis;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It gets an api by its id
   * @param {string} profileId? - string -  oprional user id
   * @param {string} apiId - string - the id of the api you want to get
   * @returns The full api object when id is provided, partial when it is not
   */
  async getAnApi(apiId: string, profileId?: string): Promise<Api> {
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });

      if (api.profileId === profileId) {
        return api;
      } else {
        delete api.base_url;
        delete api.visibility;
        delete api.subscriptions;
        delete api.status;
        delete api.secretKey;
        delete api.api_website;

        return api;
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
            '403',
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
        ZaLaResponse.BadRequest(
          err.response.error,
          err.response.message,
          err.response.errorCode,
        ),
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
        //Bring out previous values of the api before editing
        const previousValues = await this.apiRepo.findOne({
          where: { id: apiId },
          select: [
            'name',
            'description',
            'base_url',
            'about',
            'categoryId',
            'logo_url',
            'api_website',
            'term_of_use',
            'read_me',
            'visibility',
          ],
        });

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

        updateApiDto.base_url
          ? updateApiDto.base_url.slice(-1) === '/'
            ? (updateApiDto.base_url = updateApiDto.base_url.slice(0, -1))
            : updateApiDto.base_url
          : null;

        const updatedApi = await this.apiRepo.save({
          ...api,
          ...updateApiDto,
        });

        const { email } = await this.profileRepo.findOne({
          where: { id: profileId },
        });
        const logger = this.loggerRepo.create({
          entity_type: 'api',
          identifier: api.id,
          action_type: Action.Update,
          previous_values: previousValues,
          new_values: { ...updateApiDto },
          operated_by: email,
        });
        await this.loggerRepo.save(logger);
        return updatedApi;
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

      if (api) {
        const { email } = await this.profileRepo.findOne({
          where: { id: profileId },
        });
        //LOG THE DELETE ACTION
        const logger = this.loggerRepo.create({
          entity_type: 'api',
          identifier: api.id,
          action_type: Action.Delete,
          operated_by: email,
        });
        await this.loggerRepo.save(logger);
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

  async uploadLogo(file: Express.Multer.File, apiId: string): Promise<string> {
    try {
      const api = await this.apiRepo.findOne({
        where: { id: apiId },
      });
      const folder = process.env.AWS_S3_LOGO_FOLDER;
      let logo_url: string;

      if (api.logo_url) {
        const key = `${folder}${api.logo_url.split('/')[4]}`;
        await deleteImage(key);
        logo_url = await uploadImage(file, folder);
      } else {
        logo_url = await uploadImage(file, folder);
      }
      // fetch the email of the api author
      const { email } = await this.profileRepo.findOne({
        where: { id: api.profileId },
      });
      await this.apiRepo.update(apiId, { logo_url });
      const logger = await this.loggerRepo.create({
        entity_type: 'api',
        identifier: api.id,
        action_type: Action.Update,
        previous_values: { logo_url: api?.logo_url ? api.logo_url : null },
        new_values: { logo_url },
        operated_by: email,
      });
      await this.loggerRepo.save(logger);
      return logo_url;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }

  /**
   * It takes a query object, paginates it, and returns a paginated object
   * @param {PaginateQuery} query - PaginateQuery - This is the query object that is passed to the
   * controller method.
   * @returns Paginated<Api>
   */
  async findAll(query: PaginateQuery): Promise<Paginated<Api>> {
    try {
      return paginate(query, this.apiRepo, {
        sortableColumns: ['createdOn', 'name', 'visibility'],
        searchableColumns: ['name', 'description', 'about', 'visibility'],
        defaultSortBy: [['id', 'DESC']],
        where:{visibility: Visibility.Public},
        filterableColumns: {
          category: [FilterOperator.IN],
          status: [FilterOperator.IN],
          rating: [FilterOperator.GTE, FilterOperator.LTE]
        },
      });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It gets all the apis and endpoints for a profileId and then gets all the subscriptions for  that profileId and returns the apis and subscriptions.
   * @param {string} profileId - string - the id of the profile that is requesting the data
   * @returns An object with two properties: apis and userSubscriptions.
   */
  async getDPD(profileId: string): Promise<any> {
    try {
      const data = (await this.apiRepo.find({ where: { profileId } })).map(
        async (api) => ({
          ...api,
          endpoints: (
            await this.endpointsRepo.find({
              where: { apiId: api.id },
            })
          ).map((endpoint) => ({
            ...endpoint,
            route: endpoint.route,
          })),
        }),
      );

      const subs = (
        await this.subscriptionRepo.find({
          where: { profileId },
        })
      ).map(async (sub) => {
        const { name, id } = await this.getAnApi(sub.apiId);
        return {
          id: sub.id,
          apiId: id,
          name,
          token: sub.subscriptionToken,
        };
      });

      const apis = await Promise.all(data);
      const userSubscriptions = await Promise.all(subs);
      return { apis, userSubscriptions };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
  /**
   * It returns an array of Api objects that have a profileId that matches the value of the environment
   * variable FREE_REQUEST_ID
   * @returns An array of Api objects.
   */
  async freeRequest() {
    try {
      return FreeApis.filter(
        (api) => api.profileId === process.env.FREE_REQUEST_ID,
      );
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It returns the top 20 most subscribed apis in the system 
   * @returns an array of api objects 
   */
  async getPopularAPis(){
    try {
      const apis = await this.apiRepo.query(`SELECT * FROM Api ORDER BY cardinality(subscriptions) DESC LIMIT 20`) 
      return apis
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      ); 
    }
  }

   async getAllApiContributors(apiId: string){
    try {
      //Check if Api exists
      const api = await this.apiRepo.findOne({where:{id:apiId}})
      if(!api){
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            "Not Found Error",
            "Api Not Found",
            "404"
          )
        )
      }
      const contributors = []
      const contributorIds = api.contributors
      for(const id of contributorIds){
        const contributor = await this.profileRepo.findOneBy({id})
        if(contributor){
          contributors.push(contributor)
        }
      }
      return contributors
    } catch (error) {
      console.log(error);  
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server Error',
            'Something went wrong',
            '500',
          ),
        );
    }
  }
}
