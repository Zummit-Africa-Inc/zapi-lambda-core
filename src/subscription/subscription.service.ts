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
import { Tokens } from 'src/common/interfaces/subscriptionToken.interface';
import { Endpoint } from 'src/entities/endpoint.entity';
import { HttpService } from '@nestjs/axios';
import { ApiRequestDto } from './dto/make-request.dto';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpCallService } from './httpCall.service';
import { FreeApis } from './apis';

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
    private readonly httpCallService: HttpCallService,
    private readonly configService: ConfigService,
  ) {}

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
        const subscriptionToken = await this.setTokens(apiId, profileId);
        const subPayload = { apiId, profileId, subscriptionToken };
        const userSubscription = this.subscriptionRepo.create(subPayload);
        const newSub = await this.subscriptionRepo.save(userSubscription);
        const subToken: Tokens = {
          subscriptionToken: newSub.subscriptionToken,
        };

        // make request to notification service to notify user of new subscription
        await this.subscriptionNotification(apiId, api.profileId, profileId);

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
  async freeApiRequest(
    token: string,
    payload: any,
    apiId: string,
  ): Promise<any> {
    try {
      const secret = process.env.JWT_SUBSCRIPTION_SECRET;
      const { profileId } = await this.jwtService.verify(token, { secret });
      const api = FreeApis.find((api) => api.id === apiId);

      const requestProps = {
        payload,
        profileId,
        apiId: api.id,
        endpoint: api.route,
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

      /* Checking if the user is subscribed to the api. */
      const subscribed = api.subscriptions.includes(profile.id);
      if (!subscribed) {
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
}
