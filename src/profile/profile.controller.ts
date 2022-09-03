import {
  Controller,
  Post,
  Body,
  Get,
  ParseUUIDPipe,
  Param,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { Profile } from '../entities/profile.entity';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Profile')
@Controller('profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Post('/create')
  @ApiOperation({ summary: 'Create a new profile' })
  async createProfile(@Body() body: CreateProfileDto): Promise<Ok<Profile>> {
    const userProfile = await this.profileService.createprofile(body);
    return ZaLaResponse.Ok(userProfile, 'Profile created', 201);
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get a profile by Id' })
  async getOne(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Ok<Profile>> {
    const profile = await this.profileService.getone(id);
    return ZaLaResponse.Ok(profile, 'Ok', 200);
  }
}
