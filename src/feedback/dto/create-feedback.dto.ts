import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { FeedbackEnum } from 'src/common/enums/feedback.enum';

export class CreateFeedbackDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  email: string;

  @ApiProperty()
  @IsString()
  body: string;

  @ApiPropertyOptional()
  title: string;

  @ApiPropertyOptional()
  category: FeedbackEnum;
}
