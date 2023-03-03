import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Api } from 'src/entities/api.entity';
import { Repository } from 'typeorm';
import { ZaLaResponse } from '../../helpers/response';

@Injectable()
export class ApiAuthorizationGuard implements CanActivate {
  constructor(
    @InjectRepository(Api)
    private readonly apiRepo: Repository<Api>,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();

      // get apiId of the request
      const idValue = request.params[`apiId`]; //apiId

      // get profileId of the authenticated user
      const profileId = request.profileId;

      const api = await this.apiRepo.findOne({ where: { id: idValue } });
      // check if the api exists
      if (!api)
        throw new BadRequestException(
          ZaLaResponse.NotFoundRequest(
            'Not Found',
            'Api does not exist',
            '404',
          ),
        );

      // check if the API owner is the one making the request
      if (profileId !== api.profileId)
        throw new ForbiddenException(
          ZaLaResponse.BadRequest(
            'Unauthorized Access',
            'You are not authorized to perform this operation. You do not own it',
          ),
        );

      return true;
    } catch (error) {
      throw new ForbiddenException(
        ZaLaResponse.BadRequest(error.error, error.message, '403'),
      );
    }
  }
}
