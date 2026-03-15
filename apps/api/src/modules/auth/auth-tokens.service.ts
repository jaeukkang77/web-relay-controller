import { Injectable, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-code.constant';
import { hashToken } from '../../common/utils/hash.util';
import { AuthRepository } from './auth.repository';
import type { TokenPair } from './types/auth-result.type';
import type { AuthUser } from '../../common/types/auth-user.type';
import type { JwtPayload } from '../../common/types/jwt-payload.type';
import type { Env } from '../../config/env.schema';

@Injectable()
export class AuthTokensService {
  private readonly refreshSecret:    string;
  private readonly refreshExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly repo:        AuthRepository,
    config:                        ConfigService<Env, true>,
  ) {
    this.refreshSecret    = config.get('JWT_REFRESH_SECRET',     { infer: true });
    this.refreshExpiresIn = config.get('JWT_REFRESH_EXPIRES_IN', { infer: true });
  }

  /**
   * Access Token + Refresh Token 신규 발급.
   * - Access Token : JWT (ACCESS_SECRET, .env의 JWT_ACCESS_EXPIRES_IN)
   * - Refresh Token: JWT (REFRESH_SECRET, .env의 JWT_REFRESH_EXPIRES_IN)
   *   → SHA-256 해시를 DB에 저장 (@unique 조회용)
   */
  async issueTokenPair(user: AuthUser): Promise<TokenPair> {
    // jti: 랜덤 UUID — 동일 유저를 동일 초에 복수 발급해도 hash 충돌 없음
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub:      user.id,
      role:     user.role,
      regionId: user.regionId,
      jti:      randomUUID(),
    };

    // ── Access Token (JwtModule 기본 설정 사용) ────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessToken = this.jwtService.sign(payload as any);

    // ── Refresh Token (별도 secret + expiresIn, 별도 jti) ──
    const refreshPayload = { ...payload, jti: randomUUID() };
    const rawRefreshToken = this.jwtService.sign(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refreshPayload as any,
      {
        secret:    this.refreshSecret,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expiresIn: this.refreshExpiresIn as any,
      },
    );

    const tokenHash = hashToken(rawRefreshToken);
    const expiresAt = this.calcRefreshExpiry();

    await this.repo.createRefreshToken({ userId: user.id, tokenHash, expiresAt });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  /**
   * Refresh Token Rotation.
   * 유효한 Refresh Token을 폐기하고 새 토큰 쌍을 발급한다.
   *
   * Token Reuse Detection:
   * 이미 폐기된 토큰이 재사용되면 해당 유저의 모든 세션을 무효화한다.
   */
  async rotate(rawRefreshToken: string): Promise<TokenPair> {
    // 1) JWT 서명 / 만료 검증
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(rawRefreshToken, {
        secret: this.refreshSecret,
      });
    } catch (err: unknown) {
      const name = (err as Error)?.name;
      if (name === 'TokenExpiredError') {
        throw new AppException(
          ErrorCode.TOKEN_EXPIRED,
          '세션이 만료됐습니다. 다시 로그인해주세요.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      throw new AppException(
        ErrorCode.TOKEN_INVALID,
        '유효하지 않은 토큰입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 2) DB에서 토큰 조회
    const tokenHash = hashToken(rawRefreshToken);
    const record    = await this.repo.findRefreshTokenByHash(tokenHash);

    if (!record) {
      throw new AppException(
        ErrorCode.TOKEN_INVALID,
        '유효하지 않은 토큰입니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 3) Token Reuse Detection
    if (record.revokedAt !== null) {
      await this.repo.revokeAllUserRefreshTokens(record.userId);
      throw new AppException(
        ErrorCode.TOKEN_REUSED,
        '비정상적인 접근이 감지됐습니다. 모든 세션이 종료됐습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 4) DB 만료 이중 검사
    if (record.expiresAt < new Date()) {
      throw new AppException(
        ErrorCode.TOKEN_EXPIRED,
        '세션이 만료됐습니다. 다시 로그인해주세요.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 5) 기존 토큰 폐기 + 새 쌍 발급
    await this.repo.revokeRefreshToken(record.id);

    return this.issueTokenPair({
      id:       payload.sub,
      role:     payload.role,
      regionId: payload.regionId ?? null,
    });
  }

  /** 로그아웃: 해당 Refresh Token 단일 폐기 */
  async revokeOne(rawRefreshToken: string): Promise<void> {
    const tokenHash = hashToken(rawRefreshToken);
    const record    = await this.repo.findRefreshTokenByHash(tokenHash);
    if (record && !record.revokedAt) {
      await this.repo.revokeRefreshToken(record.id);
    }
  }

  // ── Private ───────────────────────────────────────────────

  /** refreshExpiresIn 문자열('30d', '7d', '1h' 등)을 Date로 변환 */
  private calcRefreshExpiry(): Date {
    const match = this.refreshExpiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const value = parseInt(match[1], 10);
    const ms: Record<string, number> = {
      s: 1_000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return new Date(Date.now() + value * ms[match[2]]);
  }
}
