import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EndpointsService } from './endpoints.service';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';

@ApiTags('endpoints')
@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  @Get('api:apiId')
  @ApiOperation({ summary: 'Get all endpoints of an api' })
  async getApiEndpoints(
    @Param('apiId') apiId: string,
  ): Promise<Ok<Endpoint[]>> {
    const endpoints = await this.endpointsService.getAllApiEndpoints(apiId);
    return ZaLaResponse.Ok(endpoints, 'Ok', 200);
  }
}
