import {
  Controller,
  Post,
  Body,
  Get,
  ParseUUIDPipe,
  Param,
  Inject,
} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { Profile } from '../entities/profile.entity';
import { Ok, ZaLaResponse } from '../common/helpers/response';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { ApiOperation } from '@nestjs/swagger';
import { TestDto } from 'src/test.dto';

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
