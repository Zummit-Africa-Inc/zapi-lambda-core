import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { ApiRequestDto } from './dto/make-request.dto';
import { ZaLaResponse } from 'src/common/helpers/response';
import { InjectRepository } from '@nestjs/typeorm';
import { Api } from 'src/entities/api.entity';
import { Profile } from 'src/entities/profile.entity';
import { Endpoint } from 'src/entities/endpoint.entity';
import { HttpService } from '@nestjs/axios';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Subscription } from 'src/entities/subscription.entity';
import { CreateSubDto } from './dto/create-subscription.dto';
import { Tokens } from 'src/common/interfaces/subcriptionToken.interface';

@Injectable()
export class SubscriptionService {
  constructor(
    private analyticsService: AnalyticsService,
    @InjectRepository(Subscription)
    private readonly subRepository: Repository<Subscription>,
    @InjectRepository(Api)
    private readonly apiRepository: Repository<Api>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Endpoint)
    private readonly endpointRepository: Repository<Endpoint>,
    private httpService: HttpService,
    private jwtService: JwtService,
  ) {}

  /**
   * It takes a token and a body as parameters, verifies the token, finds the endpoint, makes a request
   * to the endpoint, and returns the response.
   * @param {string} token - the token that is generated for the user when they subscribe to an api
   * @param {ApiRequestDto} body - ApiRequestDto
   * @returns The data from the external api.
   */
  async apiRequest(token: string, body: ApiRequestDto): Promise<any> {
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
   * It takes in a createSubscriptionDto object, checks if the user is already subscribed to the api, if not, it creates a subscription, saves it, updates the user's and api's subscriptions array, and returns the
   * tokens.
   * @param {CreateSubDto} createSubDto - createSubscriptionDto
   * @returns The subscription object
   */

  async subscribe(createSubDto: CreateSubDto): Promise<Tokens> {
    const { profileId, apiId } = createSubDto;
    try {
      const api = await this.apiRepository.findOne({ where: { id: apiId } });
      const profile = await this.profileRepository.findOne({
        where: { id: profileId },
      });

      const subscribed = profile.subscriptions.includes(apiId);

      if (subscribed) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Existing Subscription',
            'This user is already subscribed to this api',
            '403',
          ),
        );
      } else {
        if (api && profile) {
          const token = await this.getTokens(api.id, profile.id);

          const subscription = this.subRepository.create({
            ...createSubDto,
            subscriptionToken: token,
          });
          this.subRepository.save(subscription);
          this.profileRepository.update(profile.id, {
            subscriptions: [...profile.subscriptions, api.id],
          });

          await this.apiRepository.update(api.id, {
            subscriptions: [...api.subscriptions, profile.id],
          });

          return { subscriptionToken: token };
        }
      }

      throw new NotFoundException(
        ZaLaResponse.NotFoundRequest(
          'Not Found',
          'Something went wrong',
          '404',
        ),
      );
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It takes in a createSubscriptionDto object, checks if the user is already subscribed to the api, and then unsubscribe the user
   * @param {createSubDto} createSubDto - createSubscriptionDto
   * @returns The subscription object
   */

  async unsubscribe(createSubDto: CreateSubDto): Promise<object> {
    const { profileId, apiId } = createSubDto;
    try {
      const api = await this.apiRepository.findOne({ where: { id: apiId } });
      const profile = await this.profileRepository.findOne({
        where: { id: profileId },
      });
      const isSubscribed = profile.subscriptions.includes(apiId);

      if (isSubscribed) {
        await this.profileRepository.update(profile.id, {
          subscriptions: [...profile.subscriptions].filter(
            (id) => id !== api.id,
          ),
        });

        await this.apiRepository.update(api.id, {
          subscriptions: [...api.subscriptions].filter(
            (id) => id !== profile.id,
          ),
        });

        const subscription = await this.subRepository.findOne({
          where: {
            apiId: createSubDto.apiId,
            profileId: createSubDto.profileId,
          },
        });

        await this.subRepository.delete(subscription.id);
        return ZaLaResponse.Ok('Success', 'Unsubscribe successful', '200');
      } else {
        throw new NotFoundException(
          ZaLaResponse.BadRequest(
            'Bad Request',
            'You are not subscribed to this api',
            '400',
          ),
        );
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It takes an apiId and a profileId, and returns a subscriptionToken
   * @param {string} apiId - The id of the API you want to subscribe to.
   * @param {string} profileId - The id of the profile that is subscribing to the API.
   * @returns The subscription token is being returned.
   */
  async getTokens(apiId: string, profileId: string): Promise<string> {
    const subscriptionToken = await this.jwtService.signAsync(
      {
        profileId,
        apiId,
      },
      { secret: process.env.JWT_SUBSCRIPTION_SECRET, expiresIn: 43200 },
    );
    return subscriptionToken;
  }

  /**
   * It verifies the user's subscription to the api and returns the api and the user's profile.
   * @param {string} token - the token generated by the user when they subscribe to the api
   * @returns The api and profile are being returned.
   */
  async verifySub(token: string) {
    const secret = process.env.JWT_SUBSCRIPTION_SECRET;
    try {
      const { apiId, profileId } = this.jwtService.verify(token, { secret });
      // both the API and the profile are fetched from the database
      const api = await this.apiRepository.findOneBy({ id: apiId });
      const profile = await this.profileRepository.findOneBy({ id: profileId });
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
