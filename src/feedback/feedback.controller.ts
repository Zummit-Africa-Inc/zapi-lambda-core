import { Controller, Get, Body, Post } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Feedback } from 'src/entities/feedback.entity';

@ApiTags('Feedback')
// @ApiBearerAuth('access-token')
// @UseGuards(AuthenticationGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post('/create')
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<Ok<Feedback>> {
    const feedback = await this.feedbackService.create(createFeedbackDto);
    return ZaLaResponse.Ok(feedback, 'Feedback created', '201');
  }

  @Get()
  @ApiOperation({ summary: 'Get all available feedback' })
  async findAll(): Promise<Ok<Feedback[]>> {
    const feedbacks = await this.feedbackService.findAll();
    return ZaLaResponse.Ok(feedbacks, 'Ok', '200');
  }
}
