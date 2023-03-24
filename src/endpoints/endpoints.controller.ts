import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
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
import { fileMimetypeFilter } from 'src/common/decorators/fileTypeFilter';
import { ApiFile } from 'src/common/decorators/swaggerUploadField';

@ApiTags('Endpoints')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
@Controller('endpoints')
export class EndpointsController {
  constructor(private readonly endpointsService: EndpointsService) {}

  /* This is a post request that takes in a body and returns a promise of an Api */
  @Post('new/:apiId')
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Add a new endpoint' })
  async createSingleEndpoint(
    @Param('apiId') apiId: string,
    @Body() createEndpointDto: CreateEndpointDto,
  ): Promise<Ok<Endpoint>> {
    const endpoint = await this.endpointsService.createSingleEndpoint(
      apiId,
      createEndpointDto,
    );
    return ZaLaResponse.Ok(endpoint, 'Endpoint Created', '201');
  }

  @Post('new/:apiId/multiple')
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Add new endpoints' })
  @ApiBody({ type: [CreateEndpointDto] })
  async createMultipleEndpoints(
    @Param('apiId') apiId: string,
    @Body() createEndpointDtos: CreateEndpointDto[],
  ): Promise<Ok<Endpoint[]>> {
    const endpoints = await this.endpointsService.createMultipleEndpoints(
      apiId,
      createEndpointDtos,
    );
    return ZaLaResponse.Ok(endpoints, 'Endpoints Created', '201');
  }

  @Post('new/collection/:apiId')
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Endpoints from postman collection' })
  async collection(
    @Param('apiId') apiId: string,
    @Body() body: CreateCollectionDto,
  ): Promise<Ok<CollectionResponse>> {
    const endpoints = await this.endpointsService.jsonCollection(apiId, body);
    return ZaLaResponse.Collection(endpoints, 'Endpoint(s) Created', '201');
  }

  @Post('new/yaml/:apiId')
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Upload Yaml Collection' })
  @ApiFile('file', true, {
    fileFilter: fileMimetypeFilter('application/octet-stream'),
  })
  async yamlCollection(
    @Param('apiId') apiId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 5000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const endpoints = await this.endpointsService.yamlCollection(file, apiId);
    return ZaLaResponse.Ok(endpoints, 'Endpoint(s) Created', 201);
  }

  @Get(':apiId')
  @IdCheck('apiId')
  @Public()
  @ApiOperation({ summary: 'Get all endpoints of an api' })
  async getApiEndpoints(
    @Param('apiId') apiId: string,
  ): Promise<Ok<Endpoint[]>> {
    const endpoints = await this.endpointsService.getAllApiEndpoints(apiId);
    return ZaLaResponse.Ok(endpoints, 'Ok', 200);
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
