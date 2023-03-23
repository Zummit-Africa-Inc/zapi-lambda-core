import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import {
  HeaderType,
  QueryType,
  ReqBody,
} from 'src/common/interfaces/endpoint.interface';
import { HttpMethod } from '../../common/enums/httpMethods.enum';

export class CreateEndpointDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiPropertyOptional()
  description: string;

  @IsEnum(HttpMethod)
  @IsNotEmpty()
  @ApiProperty({ enum: HttpMethod, default: 'get' })
  method: HttpMethod;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  route: string;

  @ApiPropertyOptional()
  headers: HeaderType[];

  @ApiPropertyOptional()
  query: QueryType[];

  @ApiPropertyOptional()
  body: ReqBody[];
}
