import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';
import {Profile} from 'src/entities/profile.entity'
import { Api } from '../entities/api.entity';
import { Repository } from 'typeorm';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { Logger } from 'src/entities/logger.entity';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { Action } from 'src/common/enums/actionLogger.enum';

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
          route: createEndpointDto.route,
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

      const savedEndpoint = await this.endpointRepo.save(newEndpoint);
      return savedEndpoint;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
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
      if (!endpoint) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'Endpoint does not exist',
            '404',
          ),
        );
      }

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
     let values = Object.keys(body)
      const api = await this.apiRepo.findOne({
        where:{id: endpoint.apiId}
      })
      const {email} = await this.profileRepo.findOne({
        where: {id:api.profileId}
      })

      const previousValues = await this.endpointRepo
        .createQueryBuilder()
        .select(values)
        .where('id = :enpointId', {endpointId})
        .execute()

      const updatedEndpoint = await this.endpointRepo
        .createQueryBuilder()
        .update(Endpoint)
        .set(body)
        .where('id = :endpointId', { endpointId })
        .returning('*')
        .execute();
      const newValues = await this.endpointRepo
        .createQueryBuilder()
        .select(values)
        .where('id = :enpointId', {endpointId})
        .execute()
      //LOG THE UPDATE MADE
      const logger = await this.loggerRepo.create({
        entity_type: 'ENDPOINT',
        identifier: endpointId,
        action_type: Action.Update,
        previous_values: previousValues,
        new_values: newValues,
        operated_by: email
      })
      await this.loggerRepo.save(logger)
      console.log(logger);
      
      return updatedEndpoint.raw[0];
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
      if (!endpoint) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'Endpoint does not exist',
            '404',
          ),
        );
      }
        /**
       * 1. find the api that this endpoint belongs to
       * 2. find the author of the api to use during
       * the logger creation
      */
      const api = await this.apiRepo.findOne({
        where:{id: endpoint.apiId}
      })
      const {email} = await this.profileRepo.findOne({
        where: {id:api.profileId}
      })
      await this.endpointRepo.delete(endpointId);
      const logger = await this.loggerRepo.create({
        entity_type: 'ENDPOINT',
        identifier: endpointId,
        action_type: Action.Delete,
        operated_by: email
      })
      await this.loggerRepo.save(logger)

    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
