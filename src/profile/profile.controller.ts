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
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { Profile } from '../entities/profile.entity';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TestDto } from 'src/test.dto';
import { fileMimetypeFilter } from 'src/common/decorators/fileTypeFilter';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiFile } from 'src/common/decorators/swaggerUploadField';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';

@ApiTags('Profile')
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

  @Get('/:profileId')
  @IdCheck('profileId')
  @ApiOperation({ summary: 'Get a profile' })
  async getOne(
    @Param('profileId', new ParseUUIDPipe()) profileId: string,
  ): Promise<Ok<Profile>> {
    const profile = await this.profileService.getone(profileId);
    return ZaLaResponse.Ok(profile, 'Ok', 200);
  }

  @Patch(':profileId')
  @IdCheck('profileId')
  @ApiOperation({ summary: 'Update an existing profile' })
  async updateProfile(
    @Param('profileId', ParseUUIDPipe) profileId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Ok<Profile>> {
    const profile = await this.profileService.updateProfile(
      profileId,
      updateProfileDto,
    );
    return ZaLaResponse.Ok(profile, 'Ok', 200);
  }

  @Post('profile-image/:profileId')
  @ApiOperation({ summary: 'Upload profile image' })
  @IdCheck('profileId')
  @ApiFile('image', true, { fileFilter: fileMimetypeFilter('image') })
  async upload(
    @Param('profileId') profileId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 500000 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const imageUrl = await this.profileService.uploadImage(file, profileId);
    return ZaLaResponse.Ok(imageUrl, 'Ok', 201);
  }

  @Delete('/:profileId')
  @IdCheck('profileId')
  @ApiOperation({ summary: 'Delete a profile' })
  async deleteOne(
    @Param('profileId', new ParseUUIDPipe()) profileId: string,
  ): Promise<Ok<string>> {
    await this.profileService.deleteProfile(profileId);
    return ZaLaResponse.Ok('Profile deleted successfully', 'Ok', 200);
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
