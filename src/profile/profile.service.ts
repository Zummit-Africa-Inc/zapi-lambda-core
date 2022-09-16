import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from '../common/helpers/response';
import { Profile } from '../entities/profile.entity';
import { DeleteResult, Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
  ) {}

  async createprofile(body: CreateProfileDto): Promise<Profile> {
    try {
      const profileExist = await this.profileRepo.findOne({
        where: { email: body.email },
      });
      if (profileExist) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Bad Request',
            `A profile with ${body.email} already exists`,
          ),
        );
      }
      const profile = await this.profileRepo.create({
        ...body,
      });
      const newProfile = await this.profileRepo.save(profile);
      return newProfile;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', err.message, '500'),
      );
    }
  }

  async getone(profileId: string): Promise<Profile> {
    try {
      const profile = await this.profileRepo.findOne({
        where: { id: profileId },
      });
      if (!profile) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'Profile does not exist',
            '404',
          ),
        );
      }
      return profile;
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', err.message, '500'),
      );
    }
  }

  /**
   * It updates a profile by id
   * @param {string} profileId - string - The id of the profile to be deleted
   * @param {UpdateProfileDto} updateProfileDto - UpdateProfileDto - the data to be updated
   * @returns The delete method returns a DeleteResult object.
   */

  async updateProfile(
    profileId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    try{
      const profile = await this.profileRepo.findOne({
        where: { id: profileId },
      });
      if (profile) {
        await this.profileRepo.update(profileId, updateProfileDto);
  
        const undatedProfile = await this.profileRepo.findOne({ where: {id:profileId}});
        if (undatedProfile){
          return undatedProfile;
        }else{
          ZaLaResponse.NotFoundRequest('Not Found', 'Profile does not exist', '404');
        }
      }
    }catch(error){
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    };
  }

  /**
   * It deletes a profile by id
   * @param {string} profileId - string - The id of the profile to be deleted
   * @returns The delete method returns a DeleteResult object.
   */
  async deleteProfile(profileId: string): Promise<void> {
    try {
      const { id } = await this.profileRepo.findOne({
        where: { id: profileId },
      });
      if (!id) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'Profile does not exist',
            '404',
          ),
        );
      }
      await this.profileRepo.delete(id);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
