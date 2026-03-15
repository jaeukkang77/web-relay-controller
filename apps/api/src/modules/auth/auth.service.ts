import { Injectable, HttpStatus } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { ErrorCode } from '../../common/constants/error-code.constant';
import { comparePassword } from '../../common/utils/hash.util';
import { AuthRepository } from './auth.repository';
import { AuthAttemptService } from './auth-attempt.service';
import { AuthTokensService } from './auth-tokens.service';
import type { LoginResult, TokenPair } from './types/auth-result.type';

export interface MeResult {
  id:        string;
  role:      string;
  regionId:  number | null;
  createdAt: Date;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly repo:           AuthRepository,
    private readonly attemptService: AuthAttemptService,
    private readonly tokensService:  AuthTokensService,
  ) {}

  // ── 로그인 ─────────────────────────────────────────────────

  async login(ip: string, id: string, password: string): Promise<LoginResult> {
    // 1) IP 차단 확인
    if (await this.attemptService.isBlocked(ip)) {
      await this.attemptService.recordAttempt(ip, id, false, 'IP_BLOCKED');
      throw new AppException(
        ErrorCode.IP_BLOCKED,
        '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // 2) 유저 조회
    const user = await this.repo.findUserById(id);
    if (!user) {
      await this.attemptService.recordAttempt(ip, null, false, 'USER_NOT_FOUND');
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        '아이디 또는 비밀번호가 올바르지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 3) 비밀번호 검증
    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      await this.attemptService.recordAttempt(ip, id, false, 'INVALID_PASSWORD');
      throw new AppException(
        ErrorCode.INVALID_CREDENTIALS,
        '아이디 또는 비밀번호가 올바르지 않습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // 4) 성공 기록 + 토큰 발급
    await this.attemptService.recordAttempt(ip, id, true);
    const tokens = await this.tokensService.issueTokenPair({
      id:       user.id,
      role:     user.role,
      regionId: user.regionId,
    });

    return {
      ...tokens,
      user: {
        id:       user.id,
        role:     user.role,
        regionId: user.regionId,
      },
    };
  }

  // ── 토큰 갱신 ──────────────────────────────────────────────

  refresh(rawRefreshToken: string): Promise<TokenPair> {
    return this.tokensService.rotate(rawRefreshToken);
  }

  // ── 로그아웃 ───────────────────────────────────────────────

  logout(rawRefreshToken: string): Promise<void> {
    return this.tokensService.revokeOne(rawRefreshToken);
  }

  // ── 내 정보 조회 ───────────────────────────────────────────

  async me(userId: string): Promise<MeResult> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new AppException(
        ErrorCode.UNAUTHORIZED,
        '사용자를 찾을 수 없습니다.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return {
      id:        user.id,
      role:      user.role,
      regionId:  user.regionId,
      createdAt: user.createdAt,
    };
  }
}
