import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EndpointContentType } from 'src/common/enums/endpointContentType.enum';
import {
  HeaderTypeClass,
  QueryTypeClass,
  ReqBodyClass,
} from 'src/common/interfaces/endpoint-impl.interface';
import { HttpMethod } from '../../common/enums/httpMethods.enum';

export class CreateEndpointDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiPropertyOptional()
  description?: string;

  @IsEnum(HttpMethod)
  @IsNotEmpty()
  @ApiProperty({ enum: HttpMethod, default: HttpMethod.GET })
  method: HttpMethod;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  route: string;

  @IsEnum(EndpointContentType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: EndpointContentType,
    default: EndpointContentType.JSON,
  })
  contentType?: EndpointContentType;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HeaderTypeClass)
  @ApiPropertyOptional({ type: [HeaderTypeClass] })
  headers?: HeaderTypeClass[];

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => QueryTypeClass)
  @ApiPropertyOptional({ type: [QueryTypeClass] })
  query?: QueryTypeClass[];

  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => ReqBodyClass)
  @ApiPropertyOptional({ type: [ReqBodyClass] })
  body?: ReqBodyClass[];
}
