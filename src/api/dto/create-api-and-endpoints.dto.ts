import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { CreateEndpointDto } from 'src/endpoints/dto/create-endpoint.dto';
import { CreateApiDto } from './create-api.dto';

export class CreateApiAndEndpointsDto {
  @ValidateNested()
  @Type(() => CreateApiDto)
  createApiDto: CreateApiDto;

  @ValidateNested({ each: true })
  @Type(() => CreateEndpointDto)
  createEndpointDto: CreateEndpointDto[];
}
