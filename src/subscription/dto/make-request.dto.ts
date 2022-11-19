import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { HttpMethod } from '../../common/enums/httpMethods.enum';

export class ApiRequestDto {
  @IsNotEmpty()
  @ApiProperty()
  method: HttpMethod;

  @ApiProperty()
  route: string;

  @ApiPropertyOptional()
  payload: any;

  @ApiPropertyOptional()
  headers: string;
}

export class FreeRequestDto {
  @ApiPropertyOptional()
  payload: any;
}

export class DevTestRequestDto {
  @ApiProperty()
  method: string;

  @ApiProperty()
  route: string;

  @ApiProperty()
  requestStatus: string;

  @ApiProperty()
  url: string;
}
