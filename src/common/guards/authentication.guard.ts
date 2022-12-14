import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ZaLaResponse } from '../helpers/response';

declare global {
  namespace Express {
    interface Request {
      profileId?: string;
    }
  }
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers['x-zapi-auth-token'];

      const isPublic = this.reflector.get<boolean>(
        'isPublic',
        context.getHandler(),
      );

      if (isPublic) {
        return true;
      }

      if (!authHeader) {
        throw new UnauthorizedException(
          ZaLaResponse.BadRequest(
            'Authentication Error',
            'Authentication required to make this request',
            '401',
          ),
        );
      }
      const token = authHeader.split(' ')[1];
      const decodedToken = await this.jwtService.verify(token, {
        secret: process.env.ACCESS_SECRET,
      });

      if (!decodedToken) {
        throw new UnauthorizedException(
          ZaLaResponse.BadRequest(
            'Authorization Error',
            'You are not authorized to make this request',
            '401',
          ),
        );
      }
      request.profileId = decodedToken.profileId;
      return true;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
