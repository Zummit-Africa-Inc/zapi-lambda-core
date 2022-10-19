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

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.zapi_auth_token;
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
            'Unauthorized',
            'You are not authorized to make this request',
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
            'Unauthorized',
            'Wrong or invalid token',
            '401',
          ),
        );
      }
      return true;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
