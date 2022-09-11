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

@Injectable()
export class EndpointsService {
  constructor(
    @InjectRepository(Endpoint)
    private readonly endpointRepo: Repository<Endpoint>,
  ) {}

  async createEndpoint(apiId: string, createEndpointDto: CreateEndpointDto) {
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

  async getAllApiEndpoints(apiId: string) {
    try {
      //check if api exists in Endpoint table
      const apiExists = await this.endpointRepo.find({
        where: { apiId: apiId },
      });
      if (!apiExists) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'API does not exists',
            '404',
          ),
        );
      }
      //return endpoints
      return apiExists;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }
}
