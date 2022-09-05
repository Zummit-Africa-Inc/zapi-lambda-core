import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';
import { Repository } from 'typeorm';
import { FindApiEndpoints } from './dto/find-api-endpoints.dto';


@Injectable()
export class EndpointsService {
    constructor(
        @InjectRepository(Endpoint)
        private readonly endpointRepo : Repository<Endpoint>
    ){}

    async getAllApiEndpoints(dto: FindApiEndpoints){
        try {
            //check if api exists in Endpoint table
            const apiExists = await this.endpointRepo.find({where : { apiId : dto.apiId }})
            if(!apiExists){
                throw new NotFoundException(
                    ZaLaResponse.NotFoundRequest(
                        "Not Found",
                        "API does not exists",
                        "404"
                    )
                )
            }
            //return endpoints
            return apiExists    
        } catch (error) {
            throw new BadRequestException(
                ZaLaResponse.BadRequest(
                    error.name,
                    error.message,
                    error.status
                )
            )
        }
    }
}
