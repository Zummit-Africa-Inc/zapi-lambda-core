import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
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

  @IsString()
  @ApiProperty()
  contentType?: string;

  @ApiPropertyOptional({ type: [HeaderTypeClass] })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => HeaderTypeClass)
  headers?: HeaderTypeClass[];

  @ApiPropertyOptional({ type: [QueryTypeClass] })
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => QueryTypeClass)
  query?: QueryTypeClass[];

  @ApiPropertyOptional({ type: [ReqBodyClass] })
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => ReqBodyClass)
  body?: ReqBodyClass[];
}
