import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants/jwt.constant';
import { ZaLaResponse } from '../helpers/response';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private jwTokenService: JwtService,
    private configService: ConfigService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    if(!authHeader) {
      throw new BadRequestException( ZaLaResponse.BadRequest('bad request', 'Not Authorized', '401'));
    }
    const token = authHeader.split(' ')[1];
    const decodedtoken = await this.jwTokenService.verify(token, {
      secret: await this.configService.get(jwtConstants.access_secret) } )
      if(!decodedtoken) {
        throw new BadRequestException( ZaLaResponse.BadRequest('bad request', 'Not Authorized', '401'))
      }

    return true
  }
}