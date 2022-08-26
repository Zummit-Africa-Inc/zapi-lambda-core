import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from '../common/helpers/response';
import { Profile } from '../entities/profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class ProfileService {
    constructor(
        @InjectRepository(Profile)
        private profileRepo: Repository<Profile>
    ) {}


    async createprofile(body: CreateProfileDto):Promise<Profile> {
        try{
            const profileExist = await this.profileRepo.findOne({
                where: { email: body.email }
            });
            if(profileExist) {
                throw new BadRequestException(
                    ZaLaResponse.BadRequest('Bad Request', `A profile with ${body.email} already exists`)
                )
            }
            const profile = await this.profileRepo.create({
                ...body,
            });
            const newProfile = await this.profileRepo.save(profile)
            return newProfile;
        }
        catch(err){
            throw new BadRequestException(
                ZaLaResponse.BadRequest('Internal Server Error', err.message, '500')
            )
        }
    }

   async getone(profileID: string):Promise<Profile>{
    try{
        const profile = await this.profileRepo.findOneByOrFail({
            id: profileID
        });
        if(!profile) {
            throw new NotFoundException(
                ZaLaResponse.NotFoundRequest('Not Found', 'Profile does not exist', '404')
            )
        }
        return profile;
    }
    catch(err){
        throw new BadRequestException(
            ZaLaResponse.BadRequest('Internal Server Error', err.message, '500')
        )
    }
   }
}
