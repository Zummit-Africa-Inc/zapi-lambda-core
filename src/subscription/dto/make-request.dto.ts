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

export class DevTestRequestDto extends ApiRequestDto {
  @ApiProperty()
  profileId: string;

  @ApiProperty()
  apiId: string;

  @ApiProperty()
  endpointId: string;

  @ApiProperty()
  testName: string;
}
