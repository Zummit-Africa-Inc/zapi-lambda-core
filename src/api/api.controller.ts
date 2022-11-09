import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Query,
  Get,
  Patch,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
} from '@nestjs/common';
import { ApiService } from './api.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { CreateApiDto } from './dto/create-api.dto';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { Api } from '../entities/api.entity';
import { UpdateApiDto } from './dto/update-api.dto';
import { ApiFile } from 'src/common/decorators/swaggerUploadField';
import { fileMimetypeFilter } from 'src/common/decorators/fileTypeFilter';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { Public } from 'src/common/decorators/publicRoute.decorator';

@ApiTags('Apis')
@UseGuards(AuthenticationGuard)
@ApiBearerAuth('access-token')
@Controller('api')
export class ApiController {
  constructor(private readonly apiService: ApiService) {}

  @Post('/new/:profileId')
  @IdCheck('profileId')
  @ApiOperation({ summary: 'Create an API' })
  async createApi(
    @Body() body: CreateApiDto,
    @Param('profileId') profileId: string,
  ): Promise<Ok<Api>> {
    const api = await this.apiService.createApi(body, profileId);
    return ZaLaResponse.Ok(api, 'Api created', '201');
  }

  // This is a get request that takes profileId and returns all api belonging to the user
  @Get('/user-apis/:profileId')
  @IdCheck('profileId')
  @ApiOperation({ summary: 'Get all APIs belonging to a user' })
  async getUserApis(@Param('profileId') profileId: string): Promise<Ok<Api[]>> {
    const userApis = await this.apiService.getUserApis(profileId);
    return ZaLaResponse.Ok(userApis, 'OK', '200');
  }

  @Get('/findOne/:apiId')
  @IdCheck('apiId')
  @Public()
  @ApiOperation({ summary: 'Get an API' })
  @ApiQuery({
    name: 'profileId',
    required: false,
    type: String,
  })
  async findOne(
    @Param('apiId') apiId: string,
    @Query('profileId') profileId: string,
  ): Promise<Ok<Api>> {
    const api = await this.apiService.getAnApi(apiId, profileId);
    return ZaLaResponse.Ok(api, 'Ok', '200');
  }

  @Delete(':apiId')
  @UseGuards(AuthorizationGuard)
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Delete an API' })
  async deleteApi(
    @Param('apiId') apiId: string,
    @Query('profileId') profileId: string,
  ): Promise<Ok<Api>> {
    const api = await this.apiService.deleteApi(apiId, profileId);
    return ZaLaResponse.Ok(api, 'Api deleted', '200');
  }

  @Post('api-logo/:apiId')
  @ApiOperation({ summary: 'Upload api logo' })
  @ApiFile('image', true, { fileFilter: fileMimetypeFilter('image') })
  async upload(
    @Param('apiId') apiId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 200000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const imageUrl = await this.apiService.uploadLogo(file, apiId);
    return ZaLaResponse.Ok(imageUrl, 'Ok', 201);
  }

  /* A put request that takes in an apiId, profileId, and a body and returns a promise of an
  UpdateResult. */
  @Patch(':apiId')
  @UseGuards(AuthorizationGuard)
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Update an API' })
  async update(
    @Param('apiId') apiId: string,
    @Query('profileId') profileId: string,
    @Body() updateApiDto: UpdateApiDto,
  ): Promise<Ok<any>> {
    const api = await this.apiService.update(apiId, profileId, updateApiDto);
    return ZaLaResponse.Ok(api, 'Api Updated', '200');
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get or search all apis' })
  async findAll(@Paginate() query: PaginateQuery): Promise<Ok<Paginated<Api>>> {
    const apis = await this.apiService.findAll(query);
    return ZaLaResponse.Paginated(apis, 'Ok', '200');
  }

  @Get('/dev-platform-data/:profileId')
  @IdCheck('profileId')
  @ApiOperation({ summary: "Get Developer's Platform Data" })
  async getdpd(@Param('profileId') profileId: string): Promise<Ok<Api[]>> {
    const apis = await this.apiService.getDPD(profileId);
    return ZaLaResponse.Ok(apis, 'Ok', '200');
  }

  @Public()
  @Get('/free-request')
  @ApiOperation({ summary: 'Get free access APIs' })
  async getAll() {
    const apis = await this.apiService.freeRequest();
    return ZaLaResponse.Ok(apis, 'Ok', '200');
  }

  @Get('/popular-apis')
  @ApiOperation({
    summary: 'Get most popular apis based on user subscriptions',
  })
  async getPopularApis(): Promise<Ok<Api[]>> {
    const apis = await this.apiService.getPopularAPis();
    return ZaLaResponse.Ok(apis, 'OK', '200');
  }
}
