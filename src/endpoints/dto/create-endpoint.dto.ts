import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { HeaderType, ReqBody } from 'src/common/interfaces/endpoint.interface';
import { HttpMethod } from '../../common/enums/httpMethods.enum';

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

  @ApiPropertyOptional()
  headers: HeaderType[];

  @ApiPropertyOptional()
  query: HeaderType[];

  @ApiPropertyOptional()
  body: ReqBody[];
}
