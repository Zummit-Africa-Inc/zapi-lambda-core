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
import { ApiFile } from 'src/common/decorators/swaggerUploadField';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateResult } from 'typeorm';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(
    private profileService: ProfileService,
    @Inject('NOTIFY_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Post('/create')
  async createProfile(@Body() body: CreateProfileDto): Promise<Ok<Profile>> {
    const userProfile = await this.profileService.createprofile(body);
    return ZaLaResponse.Ok(userProfile, 'Profile created', 201);
  }

  @Get('/:id')
  async getOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Ok<Profile>> {
    const profile = await this.profileService.getone(id);
    return ZaLaResponse.Ok(profile, 'Ok', 200);
  }

  @Patch(':profileId')
  @ApiOperation({ summary: 'Update a profile' })
  async updateProfile(
    @Param('profileId') profileId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<Ok<string>> {
    await this.profileService.updateProfile(profileId, updateProfileDto);
    return ZaLaResponse.Ok('Profile Updated', 'Ok', 200);
  }

  @Post('profile-image/:profileId')
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
    const imageUrl = await this.profileService.upload(file, profileId);
    return ZaLaResponse.Ok(imageUrl, 'Ok', 201);
  }

  @Delete('/:id')
  async deleteOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Ok<string>> {
    await this.profileService.deleteProfile(id);
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
