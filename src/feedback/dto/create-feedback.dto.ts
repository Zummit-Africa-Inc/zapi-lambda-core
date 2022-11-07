import { ApiProperty } from '@nestjs/swagger';
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
  title: string;

  @ApiProperty()
  @IsString()
  category: FeedbackEnum;
}
