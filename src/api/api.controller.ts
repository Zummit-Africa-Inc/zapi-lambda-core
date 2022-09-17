import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  Get,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateApiDto } from './dto/create-api.dto';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { Api } from '../entities/api.entity';
@ApiTags('Apis')
@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post(':profileId/new')
  @ApiOperation({ summary: 'Create an API' })
  async createApi(
    @Body() body: CreateApiDto,
    @Param('profileId') profileId: string,
  ): Promise<Ok<Api>> {
    const api = await this.apiService.createApi(body, profileId);
    return ZaLaResponse.Ok(api, 'Api created', '201');
  }

  // This is a get request that takes profileId and returns all api belonging to the user
  @Get(':profileId/myapis')
  @ApiOperation({ summary: 'Get all api belonging to a user' })
  async getUserApis(@Param('profileId') profileId: string): Promise<Ok<Api[]>> {
    const myApis = await this.apiService.getUserApis(profileId);
    return ZaLaResponse.Ok(myApis, 'OK', '200');
  }

  /**
   * @Get request that takes
   * @Param {string} profileId and {string} apiId
   * @returns a response from the api.service
   */
  @Get(':apiId')
  @ApiOperation({ summary: 'Get an API' })
  async findOne(@Param('apiId') apiId: string): Promise<Ok<Api>> {
    const api = await this.apiService.getAnApi(apiId);
    return ZaLaResponse.Ok(api, 'Ok', '200');
  }

  @Delete(':apiId/delete')
  @ApiOperation({ summary: 'Delete an API' })
  async deleteApi(
    @Param('apiId') apiId: string,
    @Query('profileId') profileId: string,
  ): Promise<Ok<Api>> {
    const api = await this.apiService.deleteApi(apiId, profileId);
    return ZaLaResponse.Ok(api, 'Api deleted', '200');
  }
}
