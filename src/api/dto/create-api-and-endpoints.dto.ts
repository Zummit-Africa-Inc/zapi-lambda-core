import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Visibility } from 'src/common/enums/visibility.enum';
import { CreateEndpointDto } from 'src/endpoints/dto/create-endpoint.dto';

export class CreateApiAndEndpointsDto {
  @IsString()
  @ApiProperty()
  name: string;

  @IsString()
  @ApiProperty()
  base_url: string;

  @IsString()
  @ApiProperty()
  description: string;

  @IsString()
  @ApiProperty()
  categoryId: string;

  @IsString()
  @ApiPropertyOptional()
  term_of_use?: string;

  @ApiProperty()
  visibility: Visibility;

  @ApiProperty({ type: [CreateEndpointDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateEndpointDto)
  endpoints: CreateEndpointDto[];
}
