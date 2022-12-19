import { Body, Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Analytics } from 'src/entities/analytics.entity';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { IdCheck } from 'src/common/decorators/idcheck.decorator';
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate';
import { AnalyticsLogs } from 'src/entities/analyticsLogs.entity';
import { EventPattern } from '@nestjs/microservices';
import { CreateLogsDto } from './dto/createLogsDto.dto';
import { CreateAnalyticsDto } from './dto/createAnalyticsDto.dto';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
// @UseGuards(AuthenticationGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('/api/:apiId')
  @IdCheck('apiId')
  @ApiOperation({ summary: 'Get analytics for an API' })
  async getAnalytics(@Param('apiId') apiId: string): Promise<Ok<Analytics>> {
    const analytics = await this.analyticsService.getAnalytics(apiId);
    return ZaLaResponse.Ok(analytics, 'Ok', '200');
  }

  @Get('/logs')
  @ApiOperation({ summary: 'Get analytics logs for an API' })
  async getLogs(
    @Paginate() query: PaginateQuery,
  ): Promise<Ok<Paginated<AnalyticsLogs>>> {
    const analytics = await this.analyticsService.getAnalyticLogs(query);
    return ZaLaResponse.Paginated(analytics, 'Ok', '200');
  }

  @EventPattern('analytics')
  async analytics(@Body() body: CreateAnalyticsDto) {
    this.analyticsService.updateAnalytics(body);
  }
  @EventPattern('logs')
  async logs(@Body() body: CreateLogsDto) {
    this.analyticsService.analyticLogs(body);
  }
}
