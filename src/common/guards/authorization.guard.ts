import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ZaLaResponse } from '../helpers/response';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const requestProfileId = request.query['profileId'];
      const profileId = request.profileId;

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
      console.log(error);
      
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
