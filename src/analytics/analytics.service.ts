import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { AnalyticsLogs } from 'src/entities/analyticsLogs.entity';
import { Repository } from 'typeorm';
import { Analytics } from '../entities/analytics.entity';
import { CreateLogsDto } from './dto/createLogsDto.dto';
import {
  FilterOperator,
  PaginateQuery,
  paginate,
  Paginated,
} from 'nestjs-paginate';

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
      const a = async (): Promise<Analytics> => {
        const analytic = await this.analyticsRepository.findOne({
          where: { apiId },
        });

        if (analytic) {
          return analytic;
        } else {
          const newAnalytic = this.analyticsRepository.create({ apiId });
          return await this.analyticsRepository.save(newAnalytic);
        }
      };

      const analytic = await a();

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

  /**
   * It creates a new analytics log and saves it to the database
   * @param {CreateLogsDto} data - CreateLogsDto
   */

  async analyticLogs(data: CreateLogsDto): Promise<void> {
    try {
      const newLog = this.logsRepository.create({
        ...data,
      });
      await this.logsRepository.save(newLog);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It returns the analytics of an API
   * @param {string} apiId - string - The id of the API
   * @returns The analytics object
   */
  async getAnalytics(apiId: string): Promise<Analytics> {
    try {
      return this.analyticsRepository.findOne({ where: { apiId } });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It takes a query object, and returns a paginated object of AnalyticsLogs
   * @param {PaginateQuery} query - PaginateQuery - This is the query object that is passed to the API.
   * @returns A paginated object of AnalyticsLogs
   */
  async getAnalyticLogs(
    query: PaginateQuery,
  ): Promise<Paginated<AnalyticsLogs>> {
    try {
      return paginate(query, this.logsRepository, {
        sortableColumns: [
          'createdOn',
          'status',
          'latency',
          'method',
          'endpoint',
          'errorMessage',
        ],
        defaultSortBy: [['id', 'DESC']],
        filterableColumns: {
          method: [FilterOperator.EQ],
          status: [FilterOperator.EQ, FilterOperator.GTE, FilterOperator.LTE],
          createdOn: [FilterOperator.GTE, FilterOperator.LTE],
          latency: [FilterOperator.GTE, FilterOperator.LTE],
          endpoint: [FilterOperator.EQ],
          profileId: [FilterOperator.EQ],
          apiId: [FilterOperator.EQ],
        },
      });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
