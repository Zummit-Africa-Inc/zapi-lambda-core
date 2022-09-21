import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { Status } from 'src/common/enums/apiVerification.enum';
import { Visibility } from 'src/common/enums/visibility.enum';
export class GetApiDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsDate()
  createdOn: Date;

  @ApiProperty()
  @IsString()
  createdBy?: string;

  @ApiProperty()
  @IsDate()
  updatedOn?: Date;

  @ApiProperty()
  @IsString()
  updatedBy?: string;

  @ApiProperty()
  @IsDate()
  deletedOn?: Date;

  @ApiProperty()
  @IsString()
  deletedBy?: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  base_url?: string;

  @ApiProperty()
  @IsNumber()
  popularity: number;

  @ApiProperty()
  @IsString()
  about: string;

  @ApiProperty()
  @IsArray()
  subscriptions?: string[];

  @ApiProperty()
  @IsEnum(Status)
  status?: Status;

  @ApiProperty()
  @IsEnum(Visibility)
  visibility?: Visibility;

  @ApiProperty()
  @IsNumber()
  rating: number;

  @ApiProperty()
  @IsNumber()
  service_level: number;

  @ApiProperty()
  @IsNumber()
  latency: number;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiProperty()
  @IsString()
  profileId: string;

  @ApiProperty()
  @IsString()
  secretKey?: string;

  @ApiProperty()
  @IsString()
  tutorialsId: string;
}
