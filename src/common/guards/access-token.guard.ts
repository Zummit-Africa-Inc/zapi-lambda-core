import {
  CanActivate,
  ExecutionContext
} from '@nestjs/common';


export class AccessTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log(request)

    return true
  }
}