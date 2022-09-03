import { Body, Controller, Param, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Api } from 'src/entities/api.entity';
import { ApiService } from './api.service';
import { Ok } from 'src/common/helpers/response/ResponseType';
import { CreateApiDto } from './dto/create-api.dto';

@ApiTags('Apis')
@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('new/:profileId')
  @ApiOperation({ summary: 'Add a new api' })
  async create(
    @Param('profileId') profileId: string,
    @Body() createApiDto: CreateApiDto,
  ): Promise<Ok<Api>> {
    const api = await this.apiService.create(profileId, createApiDto);
    return ZaLaResponse.Ok(api, 'Api Created', '201');
  }
}
