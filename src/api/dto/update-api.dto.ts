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

  @IsString()
  @ApiPropertyOptional()
  about: string;

  @ApiPropertyOptional()
  categoryId: string;

  @IsString()
  @ApiPropertyOptional()
  logo_url: string;

  @IsString()
  @ApiPropertyOptional()
  api_website: string;

  @IsString()
  @ApiPropertyOptional()
  term_of_use: string;

  @ApiPropertyOptional()
  visibility: Visibility;
}
