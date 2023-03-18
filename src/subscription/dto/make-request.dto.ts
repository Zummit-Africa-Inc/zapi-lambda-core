import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { HeaderType } from 'src/common/interfaces/endpoint.interface';
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
  @ValidateNested({ each: true })
  headers: HeaderType[];
}

export class FreeRequestDto {
  @ApiPropertyOptional()
  payload: any;
}

export class DevTestRequestDto extends ApiRequestDto {
  @ApiProperty()
  endpointId: string;

  @ApiProperty()
  profileId: string;

  @ApiProperty()
  apiId: string;

  @ApiProperty()
  name: string;
}
