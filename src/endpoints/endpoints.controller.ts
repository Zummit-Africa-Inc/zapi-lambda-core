import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZaLaResponse } from 'src/common/helpers/response';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { EndpointsService } from './endpoints.service';

@ApiTags('endpoints')
@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  @Post('new/:apiId')
  @ApiOperation({ summary: 'Adds endpoint to an API' })
  async createEndpoint(
    @Param('apiId') apiId: string,
    @Body() createEndpointDto: CreateEndpointDto,
  ) {
    const endpoint = await this.endpointsService.createEndpoint(
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
