import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

@Injectable()
export class IdGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const requiredId = this.reflector.getAllAndOverride<string[]>('id',[
      context.getHandler(),
      context.getClass()
    ]);
    const { user } = context.switchToHttp().getRequest();

    if (user.includes(requiredId)) {
      return true;
    }
    return false;
    
  }
}
