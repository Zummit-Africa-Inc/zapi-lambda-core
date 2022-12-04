import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EndpointsService } from './endpoints.service';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Endpoint } from 'src/entities/endpoint.entity';
import { CreateEndpointDto } from './dto/create-endpoint.dto';
import { UpdateEndpointDto } from './dto/update-endpoint.dto';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { Public } from 'src/common/decorators/publicRoute.decorator';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionResponse } from 'src/common/interfaces/collectionResponse.interface';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@ApiTags('endpoints')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  /* This is a post request that takes in a body and returns a promise of an Api */
  @Post('new/:apiId')
  @IdCheck('apiId')
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
  @Post('new/collection/:apiId')
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Endpoints from postman collection' })
  async collection(
    @Param('apiId') apiId: string,
    @Body() body: CreateCollectionDto,
  ): Promise<Ok<CollectionResponse>> {
    const endpoints = await this.endpointsService.collection(apiId, body);
    return ZaLaResponse.Collection(endpoints, 'Endpoint(s) Created', '201');
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all endpoints of an api' })
  async getApiEndpoints(
    @Paginate() query: PaginateQuery,
  ): Promise<Ok<Paginated<Endpoint>>> {
    const endpoints = await this.endpointsService.getAllApiEndpoints(query);
    return ZaLaResponse.Paginated(endpoints, 'Ok', 200);
  }

  @Patch(':endpointId')
  @IdCheck('endpointId')
  @UseGuards(AuthorizationGuard)
  @ApiOperation({ summary: 'Update an endpoint' })
  async updateEndpoint(
    @Param('endpointId') endpointId: string,
    @Body() body: UpdateEndpointDto,
    @Query('profileId') profileId: string,
  ): Promise<Ok<Endpoint>> {
    const updatedEndpoint = await this.endpointsService.update(
      endpointId,
      body,
    );
    return ZaLaResponse.Ok(updatedEndpoint, 'Ok', 200);
  }

  @Delete(':endpointId')
  @IdCheck('endpointId')
  @UseGuards(AuthorizationGuard)
  @ApiOperation({ summary: 'Delete an endpoint' })
  async deleteEndpoint(
    @Param('endpointId') endpointId: string,
    @Query('profileId') profileId: string,
  ): Promise<Ok<string>> {
    await this.endpointsService.delete(endpointId);
    return ZaLaResponse.Ok('success', 'Endpoint Deleted', 203);
  }
}
