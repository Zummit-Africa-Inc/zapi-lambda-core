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
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate';
import { Pricing } from 'src/entities/pricingPlan.entity';
import { StatusCode } from 'src/common/enums/httpStatusCodes.enum';
import { DynamicObject } from 'src/common/interfaces/dynamicObject.interface';

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
    @InjectRepository(Pricing)
    private readonly pricingRepo: Repository<Pricing>,
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
  async subscribe(
    apiId: string,
    pricingId: string,
    profileId: string,
  ): Promise<Tokens> {
    try {
      const activeSub = await this.subscriptionRepo.findOne({
        where: {
          apiId,
          profileId,
        },
      });

      if (activeSub) {
        throwBadRequestException(
          'Active Subscription',
          'User currently subscribed to this Api',
          StatusCode.FORBIDDEN,
        );
      }

      const [sub, api, profile, plan] = await Promise.all([
        this.subscriptionRepo.findOne({
          where: { apiId, profileId, pricingId },
        }),
        this.apiRepo.findOne({ where: { id: apiId } }),
        this.profileRepo.findOne({ where: { id: profileId } }),
        this.pricingRepo.findOne({ where: { id: pricingId } }),
      ]);

      if (sub) {
        throwBadRequestException(
          'Active Subscription',
          'User is currently subscribed to this API',
          StatusCode.BAD_REQUEST,
        );
      }

      if (profileId === api.profileId) {
        throwBadRequestException(
          'Bad request',
          "You can't subscribe to your own api",
          StatusCode.BAD_GATEWAY,
        );
      }

      if (!plan) {
        throwBadRequestException(
          'Bad request',
          'This pricing plan does not exist',
          StatusCode.NOT_FOUND,
        );
      }

      function throwBadRequestException(
        title: string,
        message: string,
        statusCode: any,
      ): void {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(title, message, statusCode),
        );
      }

      //TODO: Payment implementation

      const subscriptionToken = await this.setTokens(
        apiId,
        profileId,
        false,
        undefined,
        pricingId,
      );
      const subPayload = { apiId, profileId, subscriptionToken };
      const subToken: Tokens = { subscriptionToken };

      const userSubscription = this.subscriptionRepo.create({
        ...subPayload,
        requestLimit: plan.requestLimit,
        pricingId: plan.id,
      });

      this.profileRepo.update(profile.id, {
        subscriptions: [...profile.subscriptions, api.id],
      });

      this.apiRepo.update(api.id, {
        subscriptions: [...api.subscriptions, profile.id],
      });

      await this.subscriptionRepo.save(userSubscription);

      // make request to notification service to notify user of new subscription
      this.subNotification(apiId, api.profileId, profileId);

      return subToken;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          error.name,
          error.message,
          error.response.errorCode,
        ),
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
  async unsubscribe(
    apiId: string,
    profileId: string,
    pricingId: string,
  ): Promise<void> {
    try {
      const [sub, api, profile] = await Promise.all([
        this.subscriptionRepo.findOne({
          where: { apiId, profileId, pricingId },
        }),
        this.apiRepo.findOne({ where: { id: apiId } }),
        this.profileRepo.findOne({ where: { id: profileId } }),
      ]);

      if (!sub) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Subscription Error',
            'User is not currently subscribed to this API or Pricing plan',
            StatusCode.NOT_FOUND,
          ),
        );
      }

      await this.subscriptionRepo.delete(sub.id);

      this.profileRepo.update(profile.id, {
        subscriptions: profile.subscriptions.filter((sub) => sub !== api.id),
      });

      this.apiRepo.update(api.id, {
        subscriptions: api.subscriptions.filter((api) => api !== profile.id),
      });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          error.name,
          error.message,
          error.response.errorCode,
        ),
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
  async revokeToken(
    apiId: string,
    profileId: string,
    pricingId: string,
  ): Promise<Tokens> {
    try {
      const subscription = await this.subscriptionRepo.findOneBy({
        apiId,
        profileId,
        pricingId,
      });

      const subscriptionToken = await this.setTokens(
        apiId,
        profileId,
        true,
        subscription.subscriptionToken,
        pricingId,
      );
      this.subscriptionRepo.update(subscription.id, {
        ...subscription,
        subscriptionToken,
      });

      return {
        subscriptionToken,
      };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          error.name,
          error.message,
          error.response.errorCode,
        ),
      );
    }
  }

  /**
   * This function takes in a profileId, apiId, and pricingPlanId, and returns a JWT token that contains
   * the profileId, apiId, and pricingPlanId.
   * @param {string} apiId - string,
   * @param {string} profileId - string,
   * @param {boolean} [revoke=false] - boolean = false,
   * @param {string} [oldToken] - The old token that was generated for the user.
   * @param {string} [pricingPlanId] - string = '',
   * @returns A string
   */
  async setTokens(
    apiId: string,
    profileId: string,
    revoke: boolean = false,
    oldToken: string | undefined = '',
    pricingPlanId?: string,
  ): Promise<string> {
    /* Creating a new token with the same expiry date as the old token if revoke is true */

    const subscriptionToken = await this.jwtService.signAsync(
      revoke
        ? {
            profileId,
            apiId,
            pricingPlanId,
            exp: (
              this.jwtService.decode(oldToken, {
                complete: true,
              }) as DynamicObject
            ).payload.exp,
          }
        : { profileId, apiId, pricingPlanId },
      {
        secret: String(process.env.JWT_SUBSCRIPTION_SECRET!),
        expiresIn: String(process.env.JWT_SUBSCRIPTION_EXPIRY!),
      },
    );

    return subscriptionToken;
  }

  async apiRequest(token: string, body: ApiRequestDto): Promise<any> {
    try {
      const { apiId, profileId, pricingPlanId } = await this.verifySub(token);

      const api = await this.apiRepo.findOne({ where: { id: apiId } });
      const encodedRoute = encodeURIComponent(body.route);
      const endpoint = await this.endpointRepository.findOne({
        where: {
          apiId,
          method: body.method,
          route: encodedRoute,
        },
      });

      if (!endpoint) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Bad Request',
            'Wrong Endpoint',
            StatusCode.BAD_REQUEST,
          ),
        );
      }
      const requestProps = {
        apiId,
        pricingPlanId,
        payload: body.payload,
        profileId,
        base_url: api.base_url,
        endpoint: endpoint.route,
        secretKey: api.secretKey,
        headers: body.headers,
        method: endpoint.method.toLowerCase(),
      };

      return await this.httpCallService.call(requestProps);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Internal server error',
          error.message,
          StatusCode.INTERNAL_SERVER_ERROR,
        ),
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
   * It verifies the token, checks if the user is subscribed to the api, and if the user has exceeded
   * the request limit
   * @param {string} token - the token that was sent in the request
   * @returns an object with the api, profile and pricingPlanId.
   */
  async verifySub(token: string): Promise<DynamicObject> {
    try {
      const secret = process.env.JWT_SUBSCRIPTION_SECRET;
      const { payload } = this.jwtService.decode(token, {
        complete: true,
      }) as DynamicObject;
      const now = Date.now().valueOf() / 1000;

      if (typeof payload.exp !== 'undefined' && payload.exp < now) {
        throw new UnauthorizedException(
          ZaLaResponse.BadRequest(
            'Subscription Error',
            'Subscription expired',
            StatusCode.UNAUTHORIZED,
          ),
        );
      }

      const { apiId, profileId, pricingId } = this.jwtService.verify(token, {
        secret,
      });

      const { id, requestLimit, requestCount } =
        await this.subscriptionRepo.findOne({
          where: { apiId, profileId, pricingId },
        });

      if (!id) {
        throw new UnauthorizedException(
          ZaLaResponse.BadRequest(
            'Unauthorized',
            'User not subscribed to this api',
            StatusCode.FORBIDDEN,
          ),
        );
      }

      if (requestLimit > 0 && requestCount >= requestLimit) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Unauthorized',
            'Request limit exceeded',
            StatusCode.TOO_MANY_REQUESTS,
          ),
        );
      }

      return { apiId, profileId, pricingId };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Internal Server Error',
          error.message,
          StatusCode.INTERNAL_SERVER_ERROR,
        ),
      );
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
