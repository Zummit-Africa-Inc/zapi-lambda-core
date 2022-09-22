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

@Injectable()
export class EndpointsService {
  constructor(
    @InjectRepository(Endpoint)
    private readonly endpointRepo: Repository<Endpoint>,
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

      const updatedEndpoint = await this.endpointRepo
        .createQueryBuilder()
        .update(Endpoint)
        .set(body)
        .where('id = :endpointId', { endpointId })
        .returning('*')
        .execute();

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

      await this.endpointRepo.delete(endpointId);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
