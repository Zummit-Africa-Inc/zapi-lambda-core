import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateAnalyticsDto {
  @ApiPropertyOptional()
  latency?: number;

  @ApiProperty()
  status: number;

  @ApiProperty()
  apiId: string;
}
