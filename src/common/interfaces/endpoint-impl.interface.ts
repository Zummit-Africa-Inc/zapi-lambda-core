import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { EndpointHeaderType } from '../enums/endpointHeaderType.enum';
import { ReqBody, HeaderType, QueryType } from './endpoint.interface';

export class ReqBodyClass implements ReqBody {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  key?: string;

  @ApiPropertyOptional({
    oneOf: [
      { type: 'string' },
      { type: 'boolean' },
      { type: 'number' },
      { type: 'object' },
      { type: 'symbol' },
      { type: 'array' },
    ],
  })
  @IsOptional()
  value?: string | Date | boolean | number | object | symbol | Array<any>;

  constructor(key: string, value: ReqBody['value']) {
    this.key = key;
    this.value = value;
  }
}

export class HeaderTypeClass implements HeaderType {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  name?: string;

  @IsEnum(EndpointHeaderType)
  @IsOptional()
  @ApiPropertyOptional({
    enum: EndpointHeaderType,
    enumName: 'EndpointHeaderType',
  })
  type?: EndpointHeaderType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  constructor(name: string, type: EndpointHeaderType, required: boolean) {
    this.name = name;
    this.type = type;
    this.required = required;
  }
}

export class QueryTypeClass implements QueryType {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(EndpointHeaderType)
  @ApiProperty({
    enum: EndpointHeaderType,
    enumName: 'EndpointHeaderType',
  })
  type?: EndpointHeaderType;

  @ApiPropertyOptional()
  @IsOptional()
  value?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  constructor(name: string, type: EndpointHeaderType, required: boolean) {
    this.name = name;
    this.type = type;
    this.required = required;
  }
}
