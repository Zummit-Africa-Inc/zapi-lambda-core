import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EndpointsService } from './endpoints.service';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';

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

  @Get(':apiId')
  @ApiOperation({ summary: 'Get all endpoints of an api' })
  async getApiEndpoints(
    @Param('apiId') apiId: string,
  ): Promise<Ok<Endpoint[]>> {
    const endpoints = await this.endpointsService.getAllApiEndpoints(apiId);
    return ZaLaResponse.Ok(endpoints, 'Ok', 200);
  }

  @Patch(':endpointId')
  @ApiOperation({ summary: 'Update an endpoint' })
  async updateEndpoint(
    @Param('endpointId') endpointId: string,
    @Body() body: UpdateEndpointDto,
  ): Promise<Ok<Endpoint>> {
    const updatedEndpoint = await this.endpointsService.update(
      endpointId,
      body,
    );
    return ZaLaResponse.Ok(updatedEndpoint, 'Ok', 200);
  }

  @Delete(':endpointId')
  @ApiOperation({ summary: 'Delete an endpoint' })
  async deleteEndpoint(
    @Param('endpointId') endpointId: string,
  ): Promise<Ok<string>> {
    await this.endpointsService.delete(endpointId);
    return ZaLaResponse.Ok('success', 'Ok', 200);
  }
}
