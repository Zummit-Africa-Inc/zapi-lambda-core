import { BadRequestException, Injectable } from '@nestjs/common';
import { ZaLaResponse } from '../common/helpers/response';
import { HttpService } from '@nestjs/axios';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { requestProp } from 'src/common/interfaces/requestProps.interface';

@Injectable()
export class HttpCallService {
  constructor(
    private httpService: HttpService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async call({
    apiId,
    base_url,
    payload,
    profileId,
    endpoint,
    secretKey,
    method,
  }: requestProp): Promise<any> {
    try {
      /* Getting the current time in nanoseconds. */
      const startTime = process.hrtime();

      /* Making a request to the api with the payload and the secret key. */
      const ref = this.httpService.axiosRef;
      const axiosResponse = await ref({
        method,
        url: `${base_url}${endpoint}`,
        data: payload,
        headers: { 'X-Zapi-Proxy-Secret': secretKey },
      });

      /* Calculating the time it takes to make a request to the api. */
      const totalTime = process.hrtime(startTime);
      const totalTimeInMs = totalTime[0] * 1000 + totalTime[1] / 1e6;

      const data = axiosResponse.data;

      // this.analyticsService.updateAnalytics(
      //   axiosResponse.status,
      //   apiId,
      //   totalTimeInMs,
      // );
      this.analyticsService.analyticLogs({
        status: axiosResponse.status,
        latency: Math.round(totalTimeInMs),
        profileId,
        apiId,
        endpoint,
        method,
      });

      return data;
    } catch (error) {
      // this.analyticsService.updateAnalytics(
      //   error.response.status ?? 'Unknown error',
      //   apiId,
      // );
      this.analyticsService.analyticLogs({
        status: error.response.status ?? 'Unknown error',
        errorMessage: error.response.statusText,
        profileId,
        apiId,
        endpoint,
        method,
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
