import { ConfigService } from '@nestjs/config';
import { JwtModuleAsyncOptions } from '@nestjs/jwt';
import type { Env } from './env.schema';

/**
 * JwtModule.registerAsync용 옵션 팩토리.
 * Access Token 서명에 사용하는 기본 JwtModule 설정.
 * Refresh Token 서명은 AuthTokensService에서 별도 secret으로 처리한다.
 */
export const jwtModuleOptions: JwtModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService<Env, true>) => ({
    secret:      config.get('JWT_ACCESS_SECRET',     { infer: true }),
    signOptions: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expiresIn: config.get('JWT_ACCESS_EXPIRES_IN', { infer: true }) as any,
    },
  }),
};
