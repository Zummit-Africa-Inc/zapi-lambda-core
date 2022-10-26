import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { HttpMethod } from 'src/common/enums/httpMethods.enum';
import { HeaderType, ReqBody } from 'src/common/interfaces/endpoint.interface';
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

  @ApiPropertyOptional()
  headers: HeaderType[];

  @ApiPropertyOptional()
  query: HeaderType[];

  @ApiPropertyOptional()
  body: ReqBody[];
}
