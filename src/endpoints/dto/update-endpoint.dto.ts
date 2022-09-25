import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { HttpMethod } from 'src/common/enums/httpMethods.enum';
import { ReqBody } from '../interface/endpoint.interface';
import { CreateEndpointDto } from './create-endpoint.dto';

export class UpdateEndpointDto extends PartialType(CreateEndpointDto) {
  @ApiPropertyOptional()
  name: string;

  @ApiPropertyOptional()
  description: string;

  @ApiPropertyOptional({ default: 'get' })
  method: HttpMethod;

  @ApiPropertyOptional()
  route: string;

  @IsArray()
  @ApiPropertyOptional()
  headers: {
    name: string;
    description: string;
    type: string;
    value: string;
    required: boolean;
  }[];

  @IsArray()
  @ApiPropertyOptional()
  requestBody: ReqBody[];
}
