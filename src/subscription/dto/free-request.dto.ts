import { ApiPropertyOptional } from '@nestjs/swagger';

export class FreeRequestDto {
  @ApiPropertyOptional()
  payload: any;
}
