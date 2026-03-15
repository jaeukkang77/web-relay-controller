import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Env } from '../../../config/env.schema';
import type { JwtPayload } from '../../../common/types/jwt-payload.type';
import type { AuthUser } from '../../../common/types/auth-user.type';

/**
 * Access Token 검증 전략.
 * Authorization: Bearer <access_token> 헤더에서 토큰을 추출하고
 * 서명 / 만료를 검증한 후 AuthUser를 req.user에 세팅한다.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<Env, true>) {
    super({
      jwtFromRequest:   ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:      config.get('JWT_ACCESS_SECRET', { infer: true }),
    });
  }

  validate(payload: JwtPayload): AuthUser {
    return {
      id:       payload.sub,
      role:     payload.role,
      regionId: payload.regionId ?? null,
    };
  }
}
