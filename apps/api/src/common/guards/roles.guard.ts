import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { ErrorCode } from '../constants/error-code.constant';
import type { AuthUser } from '../types/auth-user.type';
import type { Request } from 'express';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // @Roles()가 없으면 인증만으로 통과
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest<Request & { user: AuthUser }>();
    const user = req.user;

    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException({
        code:    ErrorCode.FORBIDDEN,
        message: '접근 권한이 없습니다.',
      });
    }
    return true;
  }
}
