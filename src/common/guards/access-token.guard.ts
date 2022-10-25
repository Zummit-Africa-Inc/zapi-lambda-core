import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { request } from 'express';
import { ZaLaResponse } from '../helpers/response';

declare module 'express-serve-static-core' {
  interface Request {
    profileId?: string;
  }
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers['x-zapi-auth-token'];

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
      req.profileId = decodedToken.profileId;
      return true;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }
}
