import {
  BadRequestException,
  Inject,
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
import { Tokens } from 'src/common/interfaces/subscriptionToken.interface';
import { Endpoint } from 'src/entities/endpoint.entity';
import { HttpService } from '@nestjs/axios';
import { ApiRequestDto, DevTestRequestDto } from './dto/make-request.dto';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { ClientProxy } from '@nestjs/microservices';
import { HttpCallService } from './httpCall.service';
import { FreeApis } from './apis';
import { DevTesting } from 'src/entities/devTesting.entity';
import { HttpMethod } from 'src/common/enums/httpMethods.enum';
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';

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
    @InjectRepository(DevTesting)
    private readonly devTestingRepo: Repository<DevTesting>,
    private jwtService: JwtService,
    private httpService: HttpService,
    private readonly httpCallService: HttpCallService,
    private readonly configService: ConfigService,
    @Inject('NOTIFY_SERVICE') private readonly n_client: ClientProxy,
  ) {}

  /**
   * it makes a request to the notification service about a new subscription
   * @param apiId : string
   * @param profileId : string
   * @param subscriberId : string
   */
  async subNotification(
    apiId: string,
    profileId: string,
    subscriberId: string,
  ) {
    try {
      const payload = {
        apiId: apiId,
        profileId: profileId,
        subscriberId: subscriberId,
      };

      this.n_client.emit('subscription', payload);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }

  /**
   * sends an axios post request to the notification service to notify user of new subscriptions
   * @param apiId : string
   * @param profileId : string
   * @param subscriberId : string
   * @returns : Axios response object
   */
  async subscriptionNotification(
    apiId: string,
    profileId: string,
    subscriberId: string,
  ): Promise<AxiosResponse<any>> {
    const url = `${this.configService.get(
      'NOTIFICATION_URL',
    )}/ws-notify/subscription-event`;
    const payload = {
      apiId: apiId,
      profileId: profileId,
      subscriberId: subscriberId,
    };

    return await lastValueFrom(this.httpService.post(url, payload));
  }
  /**
   * It takes in an apiId and a profileId, checks if the user is subscribed to the API, if not, it creates a subscription token, saves it to the database, and returns the token
   * @param {apiId} string
   * @param {profileId} string
   * @returns The subscriptionToken
   */
  async subscribe(apiId: string, profileId: string): Promise<Tokens> {
    try {
      const sub = await this.subscriptionRepo.findOne({
        where: { apiId, profileId },
      });
      if (sub) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Active Subscription',
            'User is currently subscribed to this API',
            '400',
          ),
        );
      }
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const profile = await this.profileRepo.findOne({
        where: { id: profileId },
      });

      if (profileId === api.profileId) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Bad request',
            "You can't subscribe to your own api",
            '400',
          ),
        );
      }

      const subscriptionToken = await this.setTokens(apiId, profileId);
      const subPayload = { apiId, profileId, subscriptionToken };
      const subToken: Tokens = { subscriptionToken };

      this.profileRepo.update(profile.id, {
        subscriptions: [...profile.subscriptions, api.id],
      });

      this.apiRepo.update(api.id, {
        subscriptions: [...api.subscriptions, profile.id],
      });

      const userSubscription = this.subscriptionRepo.create(subPayload);
      await this.subscriptionRepo.save(userSubscription);

      // make request to notification service to notify user of new subscription
      this.subNotification(apiId, api.profileId, profileId);

      return subToken;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.errorCode),
      );
    }
  }
  /**
   * It takes an apiId and a profileId, finds the api and profile, checks if the profile is subscribed to
   * the api, if not, it throws an error, if so, it removes the apiId from the profile's subscriptions
   * and the profileId from the api's subscriptions, and then deletes the subscription.
   * @param {string} apiId - string, profileId: string
   * @param {string} profileId - The id of the profile that is subscribing to the API
   */
  async unsubscribe(apiId: string, profileId: string): Promise<void> {
    try {
      const sub = await this.subscriptionRepo.findOne({
        where: {
          apiId,
          profileId,
        },
      });

      if (!sub) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'In Subscription',
            'User is not currently subscribed to this API',
            '400',
          ),
        );
      }

      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const profile = await this.profileRepo.findOne({
        where: { id: profileId },
      });

      await this.subscriptionRepo.delete(sub.id);

      this.profileRepo.update(profile.id, {
        subscriptions: profile.subscriptions.filter((sub) => sub !== api.id),
      });

      this.apiRepo.update(api.id, {
        subscriptions: api.subscriptions.filter((api) => api !== profile.id),
      });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.errorCode),
      );
    }
  }

  /**
   * It takes an apiId and profileId, finds the api and subscription, then updates the subscription
   * with a new token
   * @param {string} apiId - string, profileId: string
   * @param {string} profileId - string
   * @returns The subscriptionToken is being returned.
   */
  async revokeToken(apiId: string, profileId: string): Promise<Tokens> {
    try {
      const subscription = await this.subscriptionRepo.findOneBy({
        apiId,
        profileId,
      });

      const subscriptionToken = await this.setTokens(apiId, profileId);
      this.subscriptionRepo.update(subscription.id, {
        ...subscription,
        subscriptionToken,
      });

      return {
        subscriptionToken,
      };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.errorCode),
      );
    }
  }

  /**
   * It takes an apiId and a profileId, and returns a subscriptionToken
   * @param {string} apiId - The id of the API
   * @param {string} profileId - The id of the profile that is subscribing to the API
   * @returns A JWT token
   */
  async setTokens(apiId: string, profileId: string): Promise<string> {
    const subscriptionToken = await this.jwtService.signAsync(
      {
        profileId,
        apiId,
      },
      {
        secret: process.env.JWT_SUBSCRIPTION_SECRET,
        expiresIn: '30d',
      },
    );
    return subscriptionToken;
  }

  async apiRequest(token: string, body: ApiRequestDto): Promise<any> {
    try {
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

      const requestProps = {
        apiId: api.id,
        payload: body.payload,
        profileId: profile.id,
        base_url: api.base_url,
        endpoint: endpoint.route,
        secretKey: api.secretKey,
        headers: body.headers,
        method: endpoint.method.toLowerCase(),
      };

      return await this.httpCallService.call(requestProps);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal server error', error.message, '500'),
      );
    }
  }

  /**
   * It takes a token, payload, and apiId as arguments, and returns a promise of an object
   * @param {string} token - the token that was generated by the jwtService.sign() method
   * @param {any} payload - any
   * @param {string} apiId - the id of the api you want to call
   * @returns The response from the API call.
   */
  async freeApiRequest(token: string, body: any, apiId: string): Promise<any> {
    try {
      const secret = process.env.JWT_SUBSCRIPTION_SECRET;
      const { profileId } = await this.jwtService.verify(token, { secret });
      const api = FreeApis.find((api) => api.id === apiId);

      const requestProps = {
        profileId,
        apiId: api.id,
        endpoint: api.route,
        payload: body.payload,
        base_url: api.base_url,
        secretKey: api.secretKey,
        method: api.method.toLowerCase(),
      };
      return await this.httpCallService.call(requestProps);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal server error', error.message, '500'),
      );
    }
  }

  /**
   * It verifies the user's subscription to the api and returns the api and the user's profile.
   * @param {string} token - the token generated by the user when they subscribe to the api
   * @returns The api and profile are being returned.
   */
  async verifySub(token: string): Promise<any> {
    try {
      const secret = process.env.JWT_SUBSCRIPTION_SECRET;
      const { apiId, profileId } = this.jwtService.verify(token, { secret });
      const api = await this.apiRepo.findOneBy({ id: apiId });
      const profile = await this.profileRepo.findOneBy({ id: profileId });

      /* Finding a subscription by apiId and profileId. */
      const subscription = this.subscriptionRepo.findOne({
        where: { apiId, profileId },
      });
      if (!subscription) {
        throw new UnauthorizedException(
          ZaLaResponse.BadRequest(
            'Unauthorized',
            'User not subscribed to this api',
            '401',
          ),
        );
      }
      return { api, profile };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
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
            error.message,
            '500',
          ),
        );
      }
    }
  }

  /**
   * It returns a list of all the APIs that a user is subscribed to
   * @param {string} profileId - string - The id of the profile you want to get the subscriptions for
   * @returns An array of Api objects.
   */
  async getUserSubscriptions(profileId: string): Promise<Api[]> {
    const subscribedApis = (
      await this.subscriptionRepo.find({ where: { profileId } })
    ).map((sub) => this.apiRepo.find({ where: { id: sub.apiId } }));
    return (await Promise.all(subscribedApis)).flatMap((api) => api);
  }

  /**
   * it removes all subscriptions from a particular api
   * @param apiId - string - the id of the api
   */
  async removeAllApiSubscriptions(apiId: string): Promise<void> {
    try {
      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const subscriptionProfiles = api.subscriptions;

      await this.apiRepo.update(apiId, { subscriptions: [] });

      //delete subscriptions
      for (let i = 0; i <= subscriptionProfiles.length - 1; i++) {
        await this.subscriptionRepo.delete({
          profileId: subscriptionProfiles[i],
        });
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.errorCode),
      );
    }
  }

  /* Developer test endpoint for making requests to an external server */
  async devTest(testId: string): Promise<any> {
    try {
      const test = await this.devTestingRepo.findOne({ where: { id: testId } });
      const api = await this.apiRepo.findOne({ where: { id: test.apiId } });
      const encodedRoute = encodeURIComponent(test.route);
      const endpoint = await this.endpointRepository.findOne({
        where: {
          apiId: api.id,
          method: test.method,
          route: encodedRoute,
        },
      });

      if (!endpoint) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Internal Server Error',
            'Wrong Endpoint',
            '400',
          ),
        );
      }

      const base_url = api.base_url;
      const method = test.method;
      try {
        /* Making a request to the api with the payload and the secret key. */
        const ref = this.httpService.axiosRef;
        const axiosResponse = await ref({
          method,
          url: `${base_url}${endpoint.route}`,
          data: test.payload,
          headers: { 'X-Zapi-Proxy-Secret': api.secretKey },
        });

        return axiosResponse.data;
      } catch (error) {
        return ZaLaResponse.Ok(
          '',
          error.response.statusText ?? error.message,
          error.response.status ?? 'Unknown error code',
        );
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal server error', error.message, '500'),
      );
    }
  }

  /* Finding a record in the database that matches the apiId, method, and route. */
  async saveTest(
    profileId: string,
    body: DevTestRequestDto,
  ): Promise<DevTesting> {
    try {
      const newTest = this.devTestingRepo.create({
        ...body,
        profileId,
      });

      return await this.devTestingRepo.save(newTest);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }

  /**
   * It takes a query object, and returns a paginated list of DevTesting objects
   * @param {PaginateQuery} query - PaginateQuery - This is the query object that is passed in from the
   * controller.
   * @returns Paginated<DevTesting>
   */

  async getTests(query: PaginateQuery): Promise<Paginated<DevTesting>> {
    try {
      return paginate(query, this.devTestingRepo, {
        sortableColumns: ['createdOn', 'name', 'method', 'route'],
        searchableColumns: ['name', 'route', 'payload', 'method'],
        defaultSortBy: [['id', 'DESC']],
        filterableColumns: {
          endpointId: [FilterOperator.EQ],
          route: [FilterOperator.EQ],
          profileId: [FilterOperator.EQ],
          apiId: [FilterOperator.EQ],
          name: [FilterOperator.IN],
          payload: [FilterOperator.IN],
        },
      });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }

  /**
   * This function deletes a test from the database.
   * @param {string} testId - The id of the test you want to delete.
   */
  async deleteTest(testId: string): Promise<void> {
    try {
      this.devTestingRepo.delete(testId);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
