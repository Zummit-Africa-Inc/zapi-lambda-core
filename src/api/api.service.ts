import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { QueryRunner, Repository } from 'typeorm';
import { Api } from '../entities/api.entity';
import { Profile } from 'src/entities/profile.entity';
import { Logger } from 'src/entities/logger.entity';
import { CreateApiAndEndpointsDto } from './dto/create-api-and-endpoints.dto';
import { CreateApiDto } from './dto/create-api.dto';
import { CreateEndpointDto } from 'src/endpoints/dto/create-endpoint.dto';
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
import { EndpointFolder } from 'src/entities/endpoint-folder.entity';
import { Action } from 'src/common/enums/actionLogger.enum';
import { FreeApis } from 'src/subscription/apis';
import { Visibility } from 'src/common/enums/visibility.enum';
import { ApiRatingDto } from '../review/dto/create-api-review.dto';
import { Review } from 'src/entities/review.entity';

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
    @InjectRepository(EndpointFolder)
    private readonly endpointFolderRepo: Repository<EndpointFolder>,
    @InjectRepository(Logger)
    private readonly loggerRepo: Repository<Logger>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
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
  async createApiOnly(
    createApiDto: CreateApiDto,
    profileId: string,
  ): Promise<Api> {
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
      console.log(err);
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err, 'error occured'),
        // ZaLaResponse.BadRequest(
        //   err.response.error,
        //   err.response.message,
        //   err.response.errorCode,
        // ),
      );
    }
  }

  /**
   * It creates an API with its endpoints for a user
   * @param {CreateApiAndEndpointsDto} apiEndpointDto - CreateApiAndEndpointsDto
   * @param {string} profileId - string
   * @returns The return value of this method is an object with two properties, API and Endpoints[]
   */
  async createApiWithEndpoints(
    apiEndpointDto: CreateApiAndEndpointsDto,
    profileId: string,
  ) {
    const queryRunner = this.apiRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const api = await this.createApi(apiEndpointDto, profileId, queryRunner);
      let endpoints = [],
        duplicateEndpoints = [];
      if (apiEndpointDto.endpoints) {
        const res = await this.createEndpoints(
          api.id,
          apiEndpointDto.endpoints,
          queryRunner,
        );
        endpoints = res.endpoints;
        duplicateEndpoints = res.duplicateEndpoints;
      }
      await queryRunner.commitTransaction();
      return { api, endpoints, duplicateEndpoints };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err, 'error during transaction'),
      );
    } finally {
      await queryRunner.release();
    }
  }

  async createApi(
    apiEndpointDto: CreateApiAndEndpointsDto,
    profileId: string,
    queryRunner: QueryRunner,
  ): Promise<Api> {
    const categoryExists = await this.categoryRepo.findOne({
      where: { id: apiEndpointDto.categoryId },
    });
    if (!categoryExists) {
      throw new NotFoundException(
        ZaLaResponse.NotFoundRequest(
          'Not Found',
          'Category does not exist',
          '404',
        ),
      );
    }
    const apiExist = await this.apiRepo.findOne({
      where: { name: apiEndpointDto.name },
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
    const secretKey = uuid();
    const api = this.apiRepo.create({
      profileId,
      ...apiEndpointDto,
      secretKey,
    });
    const savedApi = await queryRunner.manager.save(api);
    const analytics = this.analyticsRepo.create({ apiId: savedApi.id });
    await queryRunner.manager.save(analytics);
    return savedApi;
  }

  async createEndpoints(
    apiId: string,
    createEndpointsDto: CreateEndpointDto[],
    queryRunner: QueryRunner,
  ) {
    const endpointSet = new Set();
    const duplicateEndpoints = [];
    const endpointsToSave: Endpoint[] = [];
    const foldersToSave: EndpointFolder[] = [];
    const endpointsWithFolder: Endpoint[] = [];
    const folderMap = new Map<string, EndpointFolder>();
    for (const createEndpointDto of createEndpointsDto) {
      let endpoint: Endpoint;
      if (createEndpointDto.isFolder) {
        let folder = folderMap.get(createEndpointDto.folderName);
        if (!folder) {
          folder = this.endpointFolderRepo.create({
            name: createEndpointDto.folderName,
            apiId,
          });
          foldersToSave.push(folder);
          folderMap.set(folder.name, folder);
        }
        endpoint = this.endpointsRepo.create({
          ...createEndpointDto,
          apiId,
          folder,
        });
      } else {
        endpoint = this.endpointsRepo.create({
          ...createEndpointDto,
          apiId,
        });
      }
      const endpointKey = `${endpoint.method} ${endpoint.route}`;
      if (!endpointSet.has(endpointKey)) {
        endpointSet.add(endpointKey);
        endpointsToSave.push(endpoint);
      } else if (
        !duplicateEndpoints.some(
          (e) => e.route === endpoint.route && e.method === endpoint.method,
        )
      ) {
        duplicateEndpoints.push(endpoint);
      }
    }
    for (const endpoint of endpointsToSave) {
      if (endpoint.folder) {
        const folder = foldersToSave.find(
          (f) => f.name === endpoint.folder.name,
        );
        if (folder) {
          await queryRunner.manager.save(folder);
          endpoint.folder = folder;
          endpointsWithFolder.push(endpoint);
        }
      }
    }
    const endpoints = await queryRunner.manager.save(endpointsToSave);
    return { endpoints, duplicateEndpoints };
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

          if (apiNameExist && apiNameExist.id !== apiId) {
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

        if (!updateApiDto.description) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'Bad Request',
              'Description is required',
              '403',
            ),
          );
        }

        if (!updateApiDto.base_url) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'Bad Request',
              'Base Url is required',
              '403',
            ),
          );
        }
        if (!updateApiDto.base_url.slice(0, 5).includes('https')) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest('Bad Request', 'Invalid Base Url', '403'),
          );
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
        where: { visibility: Visibility.Public },
        filterableColumns: {
          category: [FilterOperator.IN],
          status: [FilterOperator.IN],
          rating: [FilterOperator.GTE, FilterOperator.LTE],
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

  async getAllApiSubscriptions(apiId: string) {
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const subscriptions = [];
      const subscriptionIds = api.subscriptions;
      for (const id of subscriptionIds) {
        const contributor = await this.profileRepo.findOneBy({ id });
        if (contributor) {
          subscriptions.push(contributor);
        }
      }
      return subscriptions;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Internal Server Error',
          'Something went wrong',
          '500',
        ),
      );
    }
  }
  /**
   * It returns the top 20 most subscribed apis in the system
   * @returns an array of api objects
   */
  async getPopularAPis() {
    try {
      const apis = await this.apiRepo.query(
        `SELECT * FROM Api ORDER BY cardinality(subscriptions) DESC LIMIT 20`,
      );
      return apis;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  async getAllApiContributors(apiId: string) {
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const contributors = [];
      const contributorIds = api.contributors;
      for (const id of contributorIds) {
        const contributor = await this.profileRepo.findOneBy({ id });
        if (contributor) {
          contributors.push(contributor);
        }
      }
      return contributors;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Internal Server Error',
          'Something went wrong',
          '500',
        ),
      );
    }
  }

  /**
   * allows the user to review and rate an api
   * @param profileId : id of the profile making a request to update an api
   * @param apiId : id of the api to be updated
   * @param dto : api update dto
   */
  async addApiRating(
    profileId: string,
    apiId: string,
    dto: ApiRatingDto,
  ): Promise<void> {
    try {
      // Ensure api owner cannot post a review
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      if (api.profileId === profileId) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server error',
            'You cannot rate your own api',
            '500',
          ),
        );
      }

      // Ensure user cannot rate an api twice
      const reviewAlreadyExists = await this.reviewRepo.findOne({
        where: { api_id: apiId, profile_id: profileId },
      });
      if (reviewAlreadyExists) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server error',
            'You cannot rate an api twice',
            '500',
          ),
        );
      }

      // Get email from the provided profileId to populate the `reviewer` field
      const reviewer = await this.profileRepo.findOne({
        where: { id: profileId },
      });

      // Create api rating object
      const apiRating = this.reviewRepo.create({
        profile_id: profileId,
        api_id: apiId,
        reviewer: reviewer.email,
        rating: dto.rating,
      });

      // Save api rating
      await this.reviewRepo.save(apiRating);

      // Calculate api rating
      const reviews = await this.reviewRepo.find({ where: { api_id: apiId } });
      let ratingsTotal = 0;

      reviews.forEach((review) => {
        ratingsTotal += review.rating;
      });

      const overallRating = (ratingsTotal / reviews.length) * 2;

      // Update api rating
      await this.apiRepo.update(apiId, { rating: overallRating });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * it gets all the reviews of an api
   * @param apiId : id of the api
   * @returns : returns all reviews of the api
   */
  async getApiReviewsAndRating(apiId: string): Promise<Review[]> {
    try {
      return await this.reviewRepo.find({ where: { api_id: apiId } });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It gets the count of all the APIs, gets all the APIs, gets the analytics of each API, gets the
   * subscription count of each API, and returns the count of all the APIs and the APIs with their
   * analytics and subscription count.
   * </code>
   * @returns An object with two properties: apiCount and apis.
   */
  async getApiDetails(): Promise<any> {
    try {
      const apiCount = await this.apiRepo.createQueryBuilder('api').getCount();
      const allApis = await this.apiRepo.createQueryBuilder('api').getMany();

      const apis = await Promise.all(
        allApis.map(async (api) => {
          const { totalCalls, totalLatency, successfulCalls, totalErrors } =
            await this.analyticsRepo
              .createQueryBuilder('analytics')
              .select('SUM(analytics.total_calls)', 'totalCalls')
              .addSelect('SUM(analytics.totalLatency)', 'totalLatency')
              .addSelect('SUM(analytics.successful_calls)', 'successfulCalls')
              .addSelect('SUM(analytics.total_errors)', 'totalErrors')
              .where('analytics.apiId = :apiId', { apiId: api.id })
              .getRawOne();

          const subscriptionCount = await this.subscriptionRepo
            .createQueryBuilder('subscription')
            .where('subscription.apiId = :apiId', { apiId: api.id })
            .getCount();

          return {
            apiId: api.id,
            name: api.name,
            owner: api.profileId,
            createdOn: api.createdOn,
            updatedOn: api.updatedOn,
            popularity: api.popularity,
            visibilty: api.visibility,
            status: api.status,
            categoryId: api.categoryId,
            rating: api.rating,
            subscriptionCount,
            subscriptions: api.subscriptions,
            totalCalls: Number(totalCalls),
            totalLatency: Number(totalLatency),
            successfulCalls: Number(successfulCalls),
            totalErrors: Number(totalErrors),
          };
        }),
      );
      return { apiCount, apis };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
