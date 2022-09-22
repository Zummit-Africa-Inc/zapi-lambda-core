import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from './response';
import { Profile } from '../../entities/profile.entity';
import { Repository } from 'typeorm';
import { Api } from 'src/entities/api.entity';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './aws-lib';
import { randomStrings } from './randomString';

@Injectable()
export class ImageUploadService {
  constructor(
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
    @InjectRepository(Api)
    private apiRepo: Repository<Api>,
  ) {}

  /**
   * It uploads an image to the S3 bucket, deletes the previous image if it exists, and returns the URL
   * of the new image
   * @param file - Express.Multer.File - This is the file that was uploaded to the server.
   * @param {string} id - The id of the user or the api.
   * @returns a promise that resolves to a string.
   */
  async upload(file: Express.Multer.File, id: string): Promise<string> {
    try {
      const api = await this.apiRepo.findOne({
        where: { id },
      });
      const profile = await this.profileRepo.findOne({
        where: { id },
      });

      /* Generating a random string of characters to be prefixed to the name of the file. */
      const fileName = randomStrings(file.originalname);
      const folder = profile
        ? process.env.AWS_S3_DP_FOLDER
        : process.env.AWS_S3_LOGO_FOLDER;

      /* Creating an object that will be used to upload the image to the S3 bucket. */
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: String(folder + fileName),
        Body: file.buffer,
        ACL: 'public-read',
        ContentType: file.mimetype,
        ContentDisposition: 'inline',
      };

      /**
       * It uploads an image to AWS S3 and returns the image url
       * @returns The url of the image
       */
      const uploadImage = async (): Promise<string> => {
        try {
          const url = `${process.env.AWS_IMAGE_URL}${folder}${fileName}`;
          const response = await s3Client.send(new PutObjectCommand(params));
          if (response.$metadata.httpStatusCode === 200) {
            if (profile) {
              await this.profileRepo.update(id, { picture: url });
              return url;
            } else if (api) {
              await this.apiRepo.update(id, { logo_url: url });
              return url;
            }
            throw new BadRequestException(
              ZaLaResponse.BadRequest(
                'Internal Server Error',
                'Something went wrong',
                '500',
              ),
            );
          }
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
       * It takes a key as a parameter, and returns a promise that resolves to a string
       * @param {string} key - The key of the image you want to delete.
       * @returns a promise that resolves to a string.
       */
      const deleteImage = async (key: string): Promise<string> => {
        try {
          const response = await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.AWS_BUCKET_NAME,
              Key: key,
            }),
          );
          if (response.$metadata.httpStatusCode === 204) {
            return uploadImage();
          }
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'Something went wrong',
              "Couldn't delete image",
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

      /* Checking if the api or profile has an image. */
      const isLogo = api?.logo_url ?? null;
      const isProfileImage = profile?.picture ?? null;

      if (!isLogo && !isProfileImage) {
        return uploadImage();
      } else {
        const imageColumn = profile ? profile.picture : api.logo_url;
        const key = `${folder}${imageColumn.split('/')[4]}`;
        return deleteImage(key);
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
