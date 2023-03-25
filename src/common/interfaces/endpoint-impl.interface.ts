import { ApiProperty } from '@nestjs/swagger';
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
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  key: string;

  @ApiProperty({
    oneOf: [
      { type: 'string' },
      { type: 'boolean' },
      { type: 'number' },
      { type: 'object' },
      { type: 'symbol' },
      { type: 'array' },
    ],
  })
  value: string | Date | boolean | number | object | symbol | Array<any>;

  constructor(key: string, value: ReqBody['value']) {
    this.key = key;
    this.value = value;
  }
}

export class HeaderTypeClass implements HeaderType {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(EndpointHeaderType)
  @ApiProperty({
    enum: EndpointHeaderType,
    enumName: 'EndpointHeaderType',
  })
  type: EndpointHeaderType;

  @IsOptional()
  @ApiProperty({ type: String })
  value: string;

  @IsBoolean()
  @ApiProperty()
  required: boolean;

  constructor(
    name: string,
    type: EndpointHeaderType,
    required: boolean,
  ) {
    this.name = name;
    this.type = type;
    this.required = required;
  }
}

export class QueryTypeClass implements QueryType {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsNotEmpty()
  @IsEnum(EndpointHeaderType)
  @ApiProperty({
    enum: EndpointHeaderType,
    enumName: 'EndpointHeaderType',
  })
  type: EndpointHeaderType;

  @ApiProperty({ type: String })
  value: string;

  @IsBoolean()
  @ApiProperty()
  required: boolean;

  constructor(
    name: string,
    type: EndpointHeaderType,
    required: boolean,
  ) {
    this.name = name;
    this.type = type;
    this.required = required;
  }
}
