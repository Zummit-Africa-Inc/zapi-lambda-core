import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZaLaResponse } from 'src/common/helpers/response';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { EndpointsService } from './endpoints.service';

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
