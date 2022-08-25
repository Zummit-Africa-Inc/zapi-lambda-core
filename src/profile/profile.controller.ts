import { Controller, Post, Body, Get, ParseUUIDPipe, Param} from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
    constructor(private profileService: ProfileService) {}

    @Post('/create')
    async createProfile(@Body() body: CreateProfileDto) {
        const userProfile = await this.profileService.createprofile(body)
        return userProfile;
    }

    @Get('/:id')
    async getOne(@Param('id', new ParseUUIDPipe()) id: string) {
        const getOneProfile = await this.profileService.getone(id)
        return getOneProfile;
    }
}
