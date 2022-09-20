import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';

/**
 * It takes a field name, a required flag, and a MulterOptions object, and returns a decorator that will add a file upload field to the Swagger UI
 * @param {string} [fieldName=file] - The name of the field in the request body that contains the file.
 * @param {boolean} [required=false] - boolean = false
 * @param {MulterOptions} [localOptions] - MulterOptions - This is the same as the options parameter in the Multer documentation.
 * @returns A decorator function
 */
export function ApiFile(
  fieldName: string = 'file',
  required: boolean = false,
  localOptions?: MulterOptions,
) {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}
