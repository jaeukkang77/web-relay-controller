import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthUser } from '../types/auth-user.type';

/**
 * 컨트롤러 파라미터 데코레이터.
 * JwtAuthGuard가 req.user에 세팅한 AuthUser를 꺼낸다.
 *
 * @example
 * login(@CurrentUser() user: AuthUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const req = ctx.switchToHttp().getRequest<Request & { user: AuthUser }>();
    return req.user;
  },
);
