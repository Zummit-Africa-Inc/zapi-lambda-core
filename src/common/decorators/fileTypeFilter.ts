import { UnsupportedMediaTypeException } from '@nestjs/common';
import { Request } from 'express';

/**
 * It takes a list of mimetypes and returns a function that takes a file and returns true if the file's mimetype is in the list of mimetypes
 * @param {string[]} mimetypes - string[] - An array of mimetypes that are allowed to be uploaded.
 * @returns A function that takes in a request, file, and callback.
 */
export function fileMimetypeFilter(...mimetypes: string[]) {
  return (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (mimetypes.some((mime) => file.mimetype.includes(mime))) {
      callback(null, true);
    } else {
      callback(
        new UnsupportedMediaTypeException(
          `You can only upload ${mimetypes.join(', ')} files`,
        ),
        false,
      );
    }
  };
}
