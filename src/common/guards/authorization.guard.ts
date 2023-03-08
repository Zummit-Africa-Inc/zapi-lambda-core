import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ZaLaResponse } from '../helpers/response';
import { InjectRepository } from '@nestjs/typeorm';
import { Api } from 'src/entities/api.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    @InjectRepository(Api)
    private readonly apiRepo?: Repository<Api>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const {
        query: { profileId: requestProfileId },
        params: { apiId },
        profileId,
      } = context.switchToHttp().getRequest();

      /* Checking if the apiId is present in the request and if it is, it is checking if the profileId
      of the api is the same as the profileId of the user. */
      if (apiId) {
        const { profileId: id } = await this.apiRepo.findOne({
          where: { id: apiId },
        });
        if (id !== profileId) {
          throw new ForbiddenException(
            ZaLaResponse.BadRequest(
              'Authorization Error',
              'Authorization required to perform this action',
              '401',
            ),
          );
        }
        return true;
      }

      /* This is checking if the profileId of the user is the same as the profileId from query. */
      if (requestProfileId !== profileId) {
        throw new ForbiddenException(
          ZaLaResponse.BadRequest(
            'Authorization Error',
            'Authorization required to perform this action',
            '401',
          ),
        );
      }

      return true;
    } catch (error) {
      if (error) {
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
}
