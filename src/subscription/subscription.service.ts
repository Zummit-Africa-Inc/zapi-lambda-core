import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from '../common/helpers/response';
import { Api } from '../entities/api.entity';
import { Profile } from '../entities/profile.entity';
import { Repository } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { configConstant } from '../common/constants/config.constant';
import { ConfigService } from '@nestjs/config';
import { Tokens } from 'src/common/interfaces/subscriptionToken.interface';
import { Endpoint } from 'src/entities/endpoint.entity';
import { HttpService } from '@nestjs/axios';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { ApiRequestDto } from './dto/make-request.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    @InjectRepository(Endpoint)
    private readonly endpointRepository: Repository<Endpoint>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  /**
   * It takes in a CreateSubscriptionDto object, checks if the user is subscribed to the API, if not, it creates a subscription token, saves it to the database, and returns the token
   * @param {CreateSubscriptionDto} createSubDto - CreateSubscriptionDto
   * @returns The subscriptionToken
   */
  async subscribe(createSubDto: CreateSubscriptionDto): Promise<Tokens> {
    const { profileId, apiId } = createSubDto;
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const profile = await this.profileRepo.findOne({
        where: { id: profileId },
      });
      const isSubscribed = profile.subscriptions.includes(apiId);
      if (isSubscribed) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Active Subscription',
            'User is currently subscribed to this API',
            '400',
          ),
        );
      }
      if (api && profile) {
        const subscriptionToken = await this.getTokens(apiId, profileId);
        const subPayload = { apiId, profileId, subscriptionToken };
        const userSubscription = this.subscriptionRepo.create(subPayload);
        const newSub = await this.subscriptionRepo.save(userSubscription);
        const subToken: Tokens = {
          subscriptionToken: newSub.subscriptionToken,
        };
        await this.profileRepo.update(profile.id, {
          subscriptions: [...profile.subscriptions, api.id],
        });

        await this.apiRepo.update(api.id, {
          subscriptions: [...api.subscriptions, profile.id],
        });

        return subToken;
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.errorCode),
      );
    }
  }

  async getTokens(apiId: string, profileId: string): Promise<string> {
    const subscriptionToken = await this.jwtService.signAsync(
      {
        profileId,
        apiId,
      },
      {
        secret: this.configService.get(configConstant.jwt.subSecret),
        expiresIn: 43200,
      },
    );
    return subscriptionToken;
  }

  async apiRequest(token: string, body: any): Promise<any> {
    const { api, profile } = await this.verifySub(token);
    const encodedRoute = encodeURIComponent(body.route);
    const endpoint = await this.endpointRepository.findOne({
      where: {
        apiId: api.id,
        method: body.method,
        route: encodedRoute,
      },
    });

    if (!endpoint) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Server Error', 'Wrong Endpoint', '400'),
      );
    }
    // we need to check that the name, data type and requirements for each property in the
    //endpoints.payload are met explicitly

    const uniqueApiSecurityKey = api.secretKey;
    const base_url = api.base_url;
    const endRoute = decodeURIComponent(endpoint.route);
    const endMethod = endpoint.method.toLowerCase();
    const url = base_url + `${endRoute}`;
    const ref = this.httpService.axiosRef;

    try {
      /* Getting the current time in nanoseconds. */
      const startTime = process.hrtime();

      /* Making a request to the api with the payload and the secret key. */
      const axiosResponse = await ref({
        method: endMethod,
        url: url,
        data: body.payload,
        headers: { 'X-Zapi-Proxy-Secret': uniqueApiSecurityKey },
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
        profileId: profile.id,
        apiId: api.id,
        endpoint: endRoute,
        method: endMethod,
      });

      return data;
    } catch (error) {
      this.analyticsService.updateAnalytics(error.response.status, api.id);
      this.analyticsService.analyticLogs({
        status: error.response.status,
        errorMessage: error.response.statusText,
        profileId: profile.id,
        apiId: api.id,
        endpoint: endRoute,
        method: endMethod,
      });
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'External server error',
          `Message from external server: '${error.response.statusText}'`,
          error.response.status,
        ),
      );
    }
  }

  /**
   * It verifies the user's subscription to the api and returns the api and the user's profile.
   * @param {string} token - the token generated by the user when they subscribe to the api
   * @returns The api and profile are being returned.
   */
  async verifySub(token: string) {
    const secret = this.configService.get(configConstant.jwt.subSecret);
    try {
      const { apiId, profileId } = this.jwtService.verify(token, { secret });
      // both the API and the profile are fetched from the database
      const api = await this.apiRepo.findOneBy({ id: apiId });
      const profile = await this.profileRepo.findOneBy({ id: profileId });
      // the api's subscriptions column is checked if it includes this current user through its profileId

      const subscribed = api.subscriptions.includes(profile.id);
      if (!subscribed) {
        throw new UnauthorizedException(
          ZaLaResponse.BadRequest(
            'Unauthorized',
            'user not subscribed to this api',
            '401',
          ),
        );
      }
      return { api, profile };
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException(
          ZaLaResponse.BadRequest(
            'Subscription Error',
            "User's subscription has expired or is not subscribed to this api",
            '403',
          ),
        );
      } else {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server Error',
            'Something went wrong',
            '500',
          ),
        );
      }
    }
  }
}
