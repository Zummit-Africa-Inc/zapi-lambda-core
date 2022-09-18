import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateLogsDto {
  @ApiPropertyOptional()
  latency?: number;

  @ApiProperty()
  profileId: string;

  @ApiPropertyOptional()
  errorMessage?: string;

  @ApiProperty()
  status: number;

  @ApiProperty()
  apiId: string;

  @ApiProperty()
  endpoint: string;

  @ApiProperty()
  method: string;
}
