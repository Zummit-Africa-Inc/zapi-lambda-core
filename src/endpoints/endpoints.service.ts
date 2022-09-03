import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Repository } from 'typeorm';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
@Injectable()
export class EndpointsService {
  constructor(
    @InjectRepository(Endpoint)
    private readonly endpointRepository: Repository<Endpoint>,
  ) {}

  /**
   * It creates an endpoint for an API
   * @param {string} apiId - string,
   * @param {CreateEndpointDto} createEndpointDto - CreateEndpointDto
   * @returns The endpoint object
   */
  async create(
    apiId: string,
    createEndpointDto: CreateEndpointDto,
  ): Promise<Endpoint> {
    try {
      const endpoint = await this.endpointRepository.findOne({
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

      const newEndpoint = this.endpointRepository.create({
        ...createEndpointDto,
        apiId,
      });

      const savedEndpoint = await this.endpointRepository.save(newEndpoint);
      return savedEndpoint;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
