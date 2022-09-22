import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';
import { HttpMethod } from '../../common/enums/httpMethods.enum';
import { ReqBody } from '../interface/endpoint.interface';

export class CreateEndpointDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  description: string;

  @ApiProperty({ default: 'get' })
  method: HttpMethod;

  @IsString()
  @ApiProperty()
  route: string;

  @IsArray()
  @ApiProperty()
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
