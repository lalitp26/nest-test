import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    console.log('AuthGuard: Checking authentication...');
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    console.log(`AuthGuard: Required roles: ${roles}`);
    const request = context.switchToHttp().getRequest();
    console.log(`AuthGuard: User:`, request['user']);
    return validateRequest(request);
  }
}

function validateRequest(request: Request): boolean {
  return true;
}
