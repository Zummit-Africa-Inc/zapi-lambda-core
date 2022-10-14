import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from '../common/helpers/response';
import { Api } from '../entities/api.entity';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { HttpService } from '@nestjs/axios';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { requestProp } from 'src/common/interfaces/freeApis.interface';

@Injectable()
export class HttpCallService {
  constructor(
    private httpService: HttpService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async call({ api, profileId, endpoint, payload }: requestProp): Promise<any> {
    try {
      /* Getting the current time in nanoseconds. */
      const startTime = process.hrtime();

      /* Making a request to the api with the payload and the secret key. */
      const ref = this.httpService.axiosRef;
      const axiosResponse = await ref({
        method: endpoint.method.toLowerCase(),
        url: `${api.base_url}${endpoint.route}`,
        data: payload,
        headers: { 'X-Zapi-Proxy-Secret': api.secretKey },
      });

      /* Calculating the time it takes to make a request to the api. */
      const totalTime = process.hrtime(startTime);
      const totalTimeInMs = totalTime[0] * 1000 + totalTime[1] / 1e6;

      const data = axiosResponse.data;

      this.analyticsService.updateAnalytics(
        axiosResponse.status,
        api.id,
        totalTimeInMs,
      );
      this.analyticsService.analyticLogs({
        status: axiosResponse.status,
        latency: Math.round(totalTimeInMs),
        profileId,
        apiId: api.id,
        endpoint: endpoint.route,
        method: endpoint.method.toLowerCase(),
      });

      return data;
    } catch (error) {
      this.analyticsService.updateAnalytics(error.response.status, api.id);
      this.analyticsService.analyticLogs({
        status: error.response.status,
        errorMessage: error.response.statusText,
        profileId,
        apiId: api.id,
        endpoint: endpoint.route,
        method: endpoint.method.toLowerCase(),
      });

      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'External server error',
          `Message from external server: '${error.message}'`,
          '500',
        ),
      );
    }
  }
}
