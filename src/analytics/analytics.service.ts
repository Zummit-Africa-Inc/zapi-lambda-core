import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { AnalyticsLogs } from 'src/entities/analytics-logs.entity';
import { Repository } from 'typeorm';
import { Analytics } from '../entities/analytics.entity';
import { CreateLogsDto } from './dto/createLogsDto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Analytics)
    private readonly analyticsRepository: Repository<Analytics>,
    @InjectRepository(AnalyticsLogs)
    private readonly logsRepository: Repository<AnalyticsLogs>,
  ) {}

  /* Updating the analytics table with the new values. */
  async updateAnalytics(
    status: number,
    apiId: string,
    latency = 0,
  ): Promise<void> {
    try {
      const analytic = await this.analyticsRepository.findOne({
        where: { apiId },
      });

      if (!analytic) {
        throw new BadRequestException(
          ZaLaResponse.NotFoundRequest(
            'Not found',
            'Analytics not found',
            '404',
          ),
        );
      }

      const totalLatency = analytic.totalLatency + Math.round(latency);

      /* Checks if there is an existing value for successful calls, if true, calculate the average latency, else save the new value */
      const averageLatency = Math.round(
        analytic.successful_calls > 0
          ? totalLatency / (analytic.successful_calls + 1)
          : Math.round(latency),
      );

      this.analyticsRepository
        .createQueryBuilder()
        .update(Analytics)
        .set({
          total_calls: () => 'total_calls + 1',
          successful_calls: () =>
            status === 200 || status === 201
              ? 'successful_calls + 1'
              : 'successful_calls + 0',
          total_errors: () =>
            status >= 400 ? 'total_errors + 1' : 'total_errors + 0',
          averageLatency,
          totalLatency,
        })
        .where('apiId = :apiId', { apiId })
        .execute();
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  async analyticLogs(data: CreateLogsDto): Promise<void> {
    const newLog = this.logsRepository.create({
      ...data,
    });
    await this.logsRepository.save(newLog);
  }
}
