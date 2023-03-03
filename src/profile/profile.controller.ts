import {
  Controller,
  Post,
  Body,
  Get,
  ParseUUIDPipe,
  Param,
  Inject,
  Delete,
  Patch,
  UploadedFile,
  MaxFileSizeValidator,
  ParseFilePipe,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { Profile } from '../entities/profile.entity';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TestDto } from 'src/test.dto';
import { fileMimetypeFilter } from 'src/common/decorators/fileTypeFilter';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiFile } from 'src/common/decorators/swaggerUploadField';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { AuthorizationGuard } from 'src/common/guards/authorization.guard';
import { Request } from 'express';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
@Controller('profile')
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    @Inject('NOTIFY_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post('/create')
  @ApiOperation({ summary: 'Add a new profile' })
  async createProfile(@Body() body: CreateProfileDto): Promise<Ok<Profile>> {
    const userProfile = await this.profileService.createprofile(body);
    return ZaLaResponse.Ok(userProfile, 'Profile created', 201);
  }

  @Get()
  @ApiOperation({ summary: 'Get a profile' })
  async getOne(@Req() req: Request): Promise<Ok<Profile>> {
    const profile = await this.profileService.getone(req.profileId);
    return ZaLaResponse.Ok(profile, 'Ok', 200);
  }

  @Patch()
  @ApiOperation({ summary: 'Update an existing profile' })
  async updateProfile(
    @Req() req: Request,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Ok<Profile>> {
    const profile = await this.profileService.updateProfile(
      req.profileId,
      updateProfileDto,
    );
    return ZaLaResponse.Ok(profile, 'Ok', 200);
  }

  @Post('profile-image')
  @ApiOperation({ summary: 'Upload profile image' })
  @ApiFile('image', true, { fileFilter: fileMimetypeFilter('image') })
  async upload(
    @Req() req: Request,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 500000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const imageUrl = await this.profileService.uploadImage(file, req.profileId);
    return ZaLaResponse.Ok(imageUrl, 'Ok', 201);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete a profile' })
  async deleteOne(@Req() req: Request): Promise<Ok<string>> {
    await this.profileService.deleteProfile(req.profileId);
    return ZaLaResponse.Ok('Profile deleted successfully', 'Ok', 200);
  }
  @Get('/profile/admin-data')
  @ApiOperation({ summary: 'Get profile details for admin dashboard' })
  async dash(): Promise<Ok<any>> {
    const apis = await this.profileService.getUserProfiles();
    return ZaLaResponse.Ok(apis, 'Ok', 200);
  }

  //Endpoints for communication testing
  @Post('/send_to_notification')
  @ApiOperation({ description: 'send to notification' })
  async testNotify(@Body() body: TestDto): Promise<any> {
    this.client.emit('notify_test', body);
  }

  @EventPattern('identity_test')
  async testProd(@Body() body: any) {
    console.log(body);
  }
}
