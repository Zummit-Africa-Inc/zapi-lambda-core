import { Controller, Get, Body, Post, UseGuards } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { Feedback } from 'src/entities/feedback.entity';
import { AuthenticationGuard } from 'src/common/guards/authentication.guard';
import { Public } from 'src/common/decorators/publicRoute.decorator';

@ApiTags('Feedback')
@ApiBearerAuth('access-token')
@UseGuards(AuthenticationGuard)
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Public()
  @Post('/create')
  @ApiOperation({ summary: 'Add new feedback' })
  async create(
    @Body() createFeedbackDto: CreateFeedbackDto,
  ): Promise<Ok<Feedback>> {
    const feedback = await this.feedbackService.create(createFeedbackDto);
    return ZaLaResponse.Ok(feedback, 'Feedback created', '201');
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all available feedback' })
  async findAll(): Promise<Ok<Feedback[]>> {
    const feedbacks = await this.feedbackService.findAll();
    return ZaLaResponse.Ok(feedbacks, 'Ok', '200');
  }
}
