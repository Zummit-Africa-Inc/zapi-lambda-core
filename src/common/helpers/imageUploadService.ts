import { BadRequestException } from '@nestjs/common';
import { ZaLaResponse } from './response';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './aws-lib';
import { randomStrings } from './randomString';

/**
 * It takes in a file and a folder name as parameters, generates a random string of characters to be
 * prefixed to the name of the file, creates an object that will be used to upload the image to the S3
 * bucket, and returns the URL of the uploaded image
 * @param file - Express.Multer.File: This is the file that is being uploaded.
 * @param {string} folder - The folder in the S3 bucket where the image will be uploaded.
 * @returns A promise that resolves to a string.
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string,
): Promise<string> => {
  /* Generating a random string of characters to be prefixed to the name of the file. */
  const fileName = randomStrings(file.originalname);

  /* Creating an object that will be used to upload the image to the S3 bucket. */
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: String(folder + fileName),
    Body: file.buffer,
    ACL: 'public-read',
    ContentType: file.mimetype,
    ContentDisposition: 'inline',
  };
  try {
    const url = `${process.env.AWS_IMAGE_URL}${folder}${fileName}`;
    const response = await s3Client.send(new PutObjectCommand(params));
    if (response.$metadata.httpStatusCode === 200) {
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
      ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
    );
  }
};

/* Deleting the image from the S3 bucket. */
export const deleteImage = async (key: string): Promise<string> => {
  try {
    const response = await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
      }),
    );
    if (response.$metadata.httpStatusCode === 204) {
      return 'Image deleted';
    }
  } catch (error) {
    throw new BadRequestException(
      ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
    );
  }
};
