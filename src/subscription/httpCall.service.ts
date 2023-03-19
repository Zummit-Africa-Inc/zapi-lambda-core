import { BadRequestException, Injectable } from '@nestjs/common';
import { ZaLaResponse } from '../common/helpers/response';
import { HttpService } from '@nestjs/axios';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { requestProp } from 'src/common/interfaces/requestProps.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Subscription } from 'src/entities/subscription.entity';
import { Repository } from 'typeorm';
import { StatusCode } from 'src/common/enums/httpStatusCodes.enum';

@Injectable()
export class HttpCallService {
  constructor(
    private httpService: HttpService,
    private readonly analyticsService: AnalyticsService,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
  ) {}

  async call({
    apiId,
    base_url,
    payload,
    profileId,
    endpoint,
    secretKey,
    method,
    headers,
    pricingPlanId,
  }: requestProp): Promise<any> {
    const requestHeaders: any = {};
    headers?.forEach(({ name, value }) => {
      requestHeaders[name] = value;
    });

    try {
      /* Getting the current time in nanoseconds. */
      const startTime = process.hrtime();

      /* Making a request to the api with the payload and the secret key. */
      const { data, status } = await this.httpService.axiosRef({
        method,
        url: `${base_url}${endpoint}`,
        data: payload,
        headers: { 'X-Zapi-Proxy-Secret': secretKey, ...requestHeaders },
      });

      /* Calculating the time it takes to make a request to the api. */
      const totalTime = process.hrtime(startTime);
      const totalTimeInMs = totalTime[0] * 1000 + totalTime[1] / 1e6;

      const responseStatus = /^[45]\d{2}$/.test(status.toString());
      !responseStatus && this.requestTracker(apiId, profileId, pricingPlanId);

      this.analyticsService.updateAnalytics(status, apiId, totalTimeInMs);
      this.analyticsService.analyticLogs({
        status,
        latency: Math.round(totalTimeInMs),
        profileId,
        apiId,
        endpoint,
        method,
      });

      return data;
    } catch (error) {
      this.analyticsService.updateAnalytics(
        error.response.status ?? 'Unknown error',
        apiId,
      );
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
          StatusCode.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  }

  async requestTracker(
    apiId: string,
    profileId: string,
    pricingId: string,
  ): Promise<any> {
    try {
      const subscription = await this.subscriptionRepo.findOne({
        where: { profileId, pricingId, apiId },
      });
      subscription.requestCount += 1;
      await this.subscriptionRepo.save(subscription);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'External server error',
          error.message,
          StatusCode.INTERNAL_SERVER_ERROR,
        ),
      );
    }
  }
}
