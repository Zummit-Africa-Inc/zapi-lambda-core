import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from '../common/helpers/response';
import { Profile } from '../entities/profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../common/helpers/aws-lib';
import { randomStrings } from 'src/common/helpers/randomString';
import {
  deleteImage,
  uploadImage,
} from 'src/common/helpers/imageUploadService';

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
    try {
      await this.profileRepo.update(profileId, updateProfileDto);
      const undatedProfile = await this.profileRepo.findOne({
        where: { id: profileId },
      });

      if (undatedProfile) {
        return undatedProfile;
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }

  /**
   * It deletes a profile by id
   * @param {string} profileId - string - The id of the profile to be deleted
   * @returns The delete method returns a DeleteResult object.
   */
  async deleteProfile(profileId: string): Promise<void> {
    try {
      await this.profileRepo.delete(profileId);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }

  /**
   * It uploads an image to AWS S3 and updates the profile picture in the database
   * @param file - Express.Multer.File,
   * @param {string} profileId - string - the id of the profile
   * @returns The picture is being returned.
   */
  async uploadImage(
    file: Express.Multer.File,
    profileId: string,
  ): Promise<string> {
    try {
      const profile = await this.profileRepo.findOne({
        where: { id: profileId },
      });
      const folder = process.env.AWS_S3_DP_FOLDER;
      let picture: string;

      if (profile.picture) {
        const key = `${folder}${profile.picture.split('/')[4]}`;
        await deleteImage(key);
        picture = await uploadImage(file, folder);
      } else {
        picture = await uploadImage(file, folder);
      }
      await this.profileRepo.update(profileId, { picture });
      return picture;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
