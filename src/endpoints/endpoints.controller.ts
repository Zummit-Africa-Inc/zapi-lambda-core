import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EndpointsService } from './endpoints.service';
import { ZaLaResponse } from './../common/helpers/response/Response';
import { Ok } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';
import { CreateEndpointDto } from './dto/create-endpoint.dto';

@ApiTags('endpoints')
@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  /* This is a post request that takes in a body and returns a promise of an Api */
  @Post('new/:apiId')
  @ApiOperation({ summary: 'Add a new endpoint' })
  async create(
    @Param('apiId') apiId: string,
    @Body() createEndpointDto: CreateEndpointDto,
  ): Promise<Ok<Endpoint>> {
    const endpoint = await this.endpointsService.create(
      apiId,
      createEndpointDto,
    );
    return ZaLaResponse.Ok(endpoint, 'Endpoint Created', '201');
  }

  @Get('api:apiId')
  @ApiOperation({ summary: 'Get all endpoints of an api' })
  async getApiEndpoints(@Param('apiId') apiId: string) {
    return await this.endpointsService.getAllApiEndpoints(apiId);
  }
}
