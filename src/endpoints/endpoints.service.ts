import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Repository } from 'typeorm';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { Action } from 'src/common/enums/actionLogger.enum';
import { Profile } from 'src/entities/profile.entity';
import { Logger } from 'src/entities/logger.entity';
import { Api } from '../entities/api.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionResponse } from 'src/common/interfaces/collectionResponse.interface';
import * as yaml from 'js-yaml';

@Injectable()
export class EndpointsService {
  constructor(
    @InjectRepository(Endpoint)
    private readonly endpointRepo: Repository<Endpoint>,
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Logger)
    private readonly loggerRepo: Repository<Logger>,
  ) {}

  /**
   * It creates an endpoint and saves it to the database
   * @param {string} apiId - string,
   * @param {CreateEndpointDto} createEndpointDto - CreateEndpointDto
   * @returns The endpoint is being returned.
   */
  async createSingleEndpoint(
    apiId: string,
    createEndpointDto: CreateEndpointDto,
  ): Promise<Endpoint> {
    const endpoint = await this.endpointRepo.findOne({
      where: {
        apiId,
        method: createEndpointDto.method,
        route: encodeURIComponent(createEndpointDto.route),
      },
    });
    if (endpoint) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Existing Endpoint',
          'An endpoint with duplicate method already exists, use another method',
        ),
      );
    }
    const newEndpoint = this.endpointRepo.create({
      ...createEndpointDto,
      apiId,
    });
    return await this.endpointRepo.save(newEndpoint);
  }

  async createMultipleEndpoints(
    apiId: string,
    createEndpointDtos: CreateEndpointDto[],
  ): Promise<{
    createdEndpoints: Endpoint[];
    duplicateEndpoints: CreateEndpointDto[];
  }> {
    const queryRunner =
      this.endpointRepo.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const endpoints = [];
      const duplicates = [];
      for (const createEndpointDto of createEndpointDtos) {
        try {
          const endpoint = await this.createSingleEndpoint(
            apiId,
            createEndpointDto,
          );
          endpoints.push(endpoint);
        } catch (error) {
          if (error instanceof BadRequestException) {
            duplicates.push(createEndpointDto);
          } else {
            throw error;
          }
        }
      }
      await queryRunner.commitTransaction();
      return { createdEndpoints: endpoints, duplicateEndpoints: duplicates };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * It takes a Postman collection, parses it, and creates new endpoints.
   * @param {string} apiId - string,
   * @param {CreateCollectionDto} body - CreateCollectionDto
   * @returns The return type is a Promise of a CollectionResponse.
   */
  async jsonCollection(
    apiId: string,
    body: CreateCollectionDto,
  ): Promise<CollectionResponse> {
    try {
      return await this.getEndpoints(body.item, apiId);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  /**
   * It takes a file and an apiId, then it loads the file, gets the endpoints, and returns the endpoints
   * @param file - Express.Multer.File
   * @param {string} apiId - string - this is the id of the api that the collection is being uploaded to
   * @returns The return type is a Promise of a CollectionResponse.
   */
  async yamlCollection(
    file: Express.Multer.File,
    apiId: string,
  ): Promise<CollectionResponse> {
    try {
      const { item } = await yaml.load(file.buffer.toString());
      return await this.getEndpoints(item, apiId);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  /**
   * It takes an array of objects, loops through them, and creates an endpoint for each object
   * @param {any} data - this is the data that is being passed to the function
   * @param {string} apiId - string
   * @returns An object with two properties: endpoints and skipped.
   */
  async getEndpoints(data: any, apiId: string): Promise<any> {
    try {
      const { base_url } = await this.apiRepo.findOne({ where: { id: apiId } });
      const endpoints: Endpoint[] = [];
      const skipped: CollectionResponse['skipped'] = [];

      for (const item of data) {
        const body =
          item.request.body?.raw && JSON.parse(item.request.body?.raw);

        const endpoint: CreateEndpointDto = {
          name: item.name,
          description: item.request.description,
          body: Array.isArray(body) ? body : body ? [body] : [],
          method: item.request.method.toLowerCase(),
          route: item.request.url.raw.split(base_url)[1],
          headers: item.request.header ?? [],
          query: item.request.url.query ?? [],
        };

        const isEndpoint = await this.endpointRepo.findOne({
          where: {
            apiId,
            method: endpoint.method,
            route: encodeURIComponent(endpoint.route),
          },
        });

        if (Object.values(endpoint).includes(undefined)) {
          skipped.push({ name: endpoint.name, reason: 'Malformed endpoint' });
        } else if (isEndpoint) {
          skipped.push({
            name: endpoint.name,
            reason: 'Duplicate endpoint',
          });
        } else {
          endpoints.push(await this.createSingleEndpoint(apiId, endpoint));
        }
      }
      return { endpoints, skipped };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  /**
   * It gets all the endpoints of an API
   * @param {string} apiId - string
   * @returns An array of Endpoint objects.
   */
  async getAllApiEndpoints(apiId: string): Promise<Endpoint[]> {
    try {
      //check if api exists in Endpoint table
      const endpoints = await this.endpointRepo.find({
        where: { apiId: apiId },
      });
      if (!endpoints) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'API does not exists',
            '404',
          ),
        );
      }
      return endpoints;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  /**
   * It updates an endpoint in the database
   * @param {string} endpointId - string - the id of the endpoint to be updated
   * @param {UpdateEndpointDto} body - UpdateEndpointDto
   * @returns The updatedEndpoint is being returned.
   */
  async update(endpointId: string, body: UpdateEndpointDto): Promise<Endpoint> {
    try {
      const endpoint = await this.endpointRepo.findOne({
        where: { id: endpointId },
      });

      body.route
        ? (body.route = encodeURIComponent(
            body.route.charAt(0) === '/' ? body.route : `/${body.route}`,
          ))
        : null;
      /**
       * 1. find the api that this endpoint belongs to
       * 2. find the author of the api to use during
       * the logger creation
       */
      const api = await this.apiRepo.findOne({
        where: { id: endpoint.apiId },
      });
      const { email } = await this.profileRepo.findOne({
        where: { id: api.profileId },
      });

      const previousValues = await this.endpointRepo.findOne({
        where: { id: endpointId },
        select: ['name', 'description', 'method', 'route', 'headers', 'body'],
      });
      await this.endpointRepo
        .createQueryBuilder()
        .update(Endpoint)
        .set(body)
        .where('id = :endpointId', { endpointId })
        .returning('*')
        .execute();

      const newValues = await this.endpointRepo.findOne({
        where: { id: endpointId },
        select: ['name', 'description', 'method', 'route', 'headers', 'body'],
      });

      //RECORD THE UPDATE DATE ON THE API ALSO
      await this.apiRepo.update({ name: api.name }, { id: newValues.apiId });

      //LOG THE UPDATE MADE
      const logger = await this.loggerRepo.create({
        entity_type: 'endpoint',
        identifier: endpointId,
        action_type: Action.Update,
        previous_values: previousValues,
        new_values: newValues,
        operated_by: email,
      });
      await this.loggerRepo.save(logger);

      return newValues;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It deletes an endpoint from the database.
   * @param {string} endpointId - string - The id of the endpoint to be deleted
   */
  async delete(endpointId: string): Promise<void> {
    try {
      const endpoint = await this.endpointRepo.findOne({
        where: { id: endpointId },
      });

      /**
       * 1. find the api that this endpoint belongs to
       * 2. find the author of the api to use during
       * the logger creation
       */
      const api = await this.apiRepo.findOne({
        where: { id: endpoint.apiId },
      });
      const { email } = await this.profileRepo.findOne({
        where: { id: api.profileId },
      });

      await this.endpointRepo.delete(endpointId);

      //RECORD THE UPDATE DATE ON THE API ALSO
      await this.apiRepo.update({ name: api.name }, { id: api.id });

      const logger = await this.loggerRepo.create({
        entity_type: 'endpoint',
        identifier: endpointId,
        action_type: Action.Delete,
        operated_by: email,
      });
      await this.loggerRepo.save(logger);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
