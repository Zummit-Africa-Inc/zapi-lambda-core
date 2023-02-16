import { ApiProperty } from '@nestjs/swagger';

export class CreateCollectionDto {
  @ApiProperty()
  info: object;

  @ApiProperty()
  item: any[];

  @ApiProperty()
  event: any[];

  @ApiProperty()
  variable: any[];
}
