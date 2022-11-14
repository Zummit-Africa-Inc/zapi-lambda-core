import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCollectionDto {
  @ApiProperty()
  info: object;

  @ApiProperty()
  item: any[];

  @ApiProperty()
  event: any[];

  @ApiPropertyOptional()
  variable: any[];
}
