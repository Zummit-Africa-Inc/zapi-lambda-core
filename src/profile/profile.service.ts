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
   * It uploads an image to AWS S3 and returns the URL of the image
   * @param file - Express.Multer.File - This is the file that was uploaded.
   * @param {string} profileId - The id of the profile whose picture is to be updated.
   * @returns The return value is a promise.
   */
  async upload(file: Express.Multer.File, profileId: string): Promise<string> {
    try {
      const profile = await this.profileRepo.findOne({
        where: { id: profileId },
      });

      /* Generating a random string of characters to be prefixed to the name of the file. */
      const fileName = randomStrings(file.originalname);
      const dpFolder = process.env.AWS_S3_DP_FOLDER;

      /* Creating an object that will be used to upload the image to the S3 bucket. */
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: String(dpFolder + fileName),
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
        ContentDisposition: 'inline',
      };

      /**
       * It uploads an image to AWS S3 and returns the URL of the image.
       * @returns The url of the image.
       */
      const uploadImage = async (): Promise<string> => {
        try {
          const url = `${process.env.AWS_IMAGE_URL}${fileName}`;
          const results = await s3Client.send(new PutObjectCommand(params));
          if (results.$metadata.httpStatusCode === 200) {
            await this.profileRepo.update(profileId, { picture: url });
            return url;
          }
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'Internal Server Error',
              'Something went wrong',
              '500',
            ),
          );
        } catch (error) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'Internal Server Error',
              error.message,
              '500',
            ),
          );
        }
      };

      /**
       * It deletes an image from an S3 bucket, then uploads a new image to the same bucket
       * @param {string} key - The key of the image to be deleted.
       * @returns The return value is a promise.
       */
      const deleteImage = async (key: string): Promise<string> => {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
            }),
          );
          return uploadImage();
        } catch (error) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'Internal Server Error',
              error.message,
              '500',
            ),
          );
        }
      };

      if (!profile.picture) {
        return uploadImage();
      } else {
        const key = `${dpFolder}${profile.picture.split('/')[4]}`;
        return deleteImage(key);
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
