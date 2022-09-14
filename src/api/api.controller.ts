import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { ZaLaResponse } from 'src/common/helpers/response';
import { ApiService } from './api.service';

@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  // This is a get request that takes profileId and returns all api belonging to the user

  @Get('myapi/:profileId')
  @ApiOperation({ summary: 'Get all api belonging to the user' })
  async getUserApis(@Param('profileId') profileId: string) {
    const myApis = await this.apiService.getUserApis(profileId);
    return ZaLaResponse.Ok(myApis, 'OK', '200');
  }
}
