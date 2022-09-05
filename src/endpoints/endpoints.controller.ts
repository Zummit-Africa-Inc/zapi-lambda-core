import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { FindApiEndpoints } from './dto/find-api-endpoints.dto';
import { EndpointsService } from './endpoints.service';

@ApiTags('endpoints')
@Controller('endpoints')
export class EndpointsController {
    constructor(
        private readonly endpointsService : EndpointsService
    ){}

    @Get('api:apiId')
    @ApiOperation({summary: "Get all endpoints of an api"})
    async getApiEndpoints(@Param("apiId") dto : FindApiEndpoints ){
        return await this.endpointsService.getAllApiEndpoints(dto)
    }
}
