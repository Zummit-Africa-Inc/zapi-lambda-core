import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Analytics } from 'src/entities/analytics.entity';
import { Api } from 'src/entities/api.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateApiDto } from './dto/create-api.dto';

@Injectable()
export class ApiService {
  constructor(
    @InjectRepository(Api)
    private readonly apiRepository: Repository<Api>,
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
  ) {}

  /**
   * It creates a new api for a developer
   * @param {string} profileId - The id of the developer that owns the api
   * @param {CreateApiDto} createApiDto - This is the data transfer object that contains the data that
   * will be used to create the api.
   * @returns The api object
   */
  async create(profileId: string, createApiDto: CreateApiDto): Promise<Api> {
    try {
      const api = await this.apiRepository.findOne({
        where: { name: createApiDto.name },
      });

      if (api) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Existing Values',
            'An api with this name already exists, use another name',
          ),
        );
      }

      // Generate a unique UUID string as the api secret key
      const uniqueApiSecurityKey = uuid();

      const newApi = this.apiRepository.create({
        ...createApiDto,
        profileId,
        secretKey: uniqueApiSecurityKey,
      });

      const savedApi = await this.apiRepository.save(newApi);
      const newAnalytic = this.analyticsRepository.create({
        apiId: savedApi.id,
      });
      await this.analyticsRepository.save(newAnalytic);
      return savedApi;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
