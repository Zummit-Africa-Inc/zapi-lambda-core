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
  async create(
    apiId: string,
    createEndpointDto: CreateEndpointDto,
  ): Promise<Endpoint> {
    try {
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
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It takes a collection of endpoints from a postman collection and creates them in the database
   * @param {string} apiId - string
   * @param {CreateCollectionDto} body - CreateCollectionDto
   * @returns The result of the forEach loop.
   */
  async collection(
    apiId: string,
    body: CreateCollectionDto,
  ): Promise<Endpoint[]> {
    try {
      const results: Endpoint[] = [];

      for (const item of body.item) {
        const body = JSON.parse(item.request.body?.raw);
        const endpoint: CreateEndpointDto = {
          name: item.name,
          description: item.request.description,
          body: Array.isArray(body) ? body : [body],
          method: item.request.method.toLowerCase(),
          route: `/${item.request.url.path[0]}`,
          headers: item.request.header ?? [],
          query: item.request.url.query ?? [],
        };
        const isUndefined = Object.values(endpoint).includes(undefined);
        if (!isUndefined) {
          results.push(await this.create(apiId, endpoint));
        }
      }
      return results;
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
