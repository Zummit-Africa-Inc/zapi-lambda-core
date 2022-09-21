import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';
import { CreateApiDto } from './create-api.dto';

export class UpdateApiDto extends PartialType(CreateApiDto) {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional()
  base_url: string;

  @ApiPropertyOptional()
  about: string;

  @ApiPropertyOptional()
  categoryId: string;

  @ApiPropertyOptional()
  logo_url: string;

  @ApiPropertyOptional()
  api_website: string;

  @ApiPropertyOptional()
  term_of_use: string;

  @ApiPropertyOptional()
  visibility: Visibility;
}
