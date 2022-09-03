import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@Controller('Analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}
}
