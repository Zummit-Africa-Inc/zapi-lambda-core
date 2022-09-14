import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZaLaResponse } from 'src/common/helpers/response';
import { EndpointsService } from './endpoints.service';
import { ZaLaResponse } from './../common/helpers/response/Response';
import { Ok } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';
import { CreateEndpointDto } from './dto/create-endpoint.dto';

@ApiTags('endpoints')
@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}
  
  @Get('api:apiId')
  @ApiOperation({ summary: 'Get all endpoints of an api' })
  async getApiEndpoints(@Param('apiId') apiId: string) {
    return await this.endpointsService.getAllApiEndpoints(apiId);
  }
}
