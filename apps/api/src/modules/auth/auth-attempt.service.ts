import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import {
  IP_BLOCK_LIMIT,
  IP_BLOCK_WINDOW_MIN,
} from '../../common/constants/auth.constant';

@Injectable()
export class AuthAttemptService {
  constructor(private readonly repo: AuthRepository) {}

  /** 해당 IP가 현재 차단 상태인지 확인 */
  async isBlocked(ip: string): Promise<boolean> {
    const count = await this.repo.countRecentFailures(ip, IP_BLOCK_WINDOW_MIN);
    return count >= IP_BLOCK_LIMIT;
  }

  /** 로그인 시도 로그 기록 */
  async recordAttempt(
    ip:      string,
    userId:  string | null,
    success: boolean,
    reason?: string,
  ): Promise<void> {
    await this.repo.createAuthAttemptLog({
      ipAddress: ip,
      userId:    userId ?? null,
      success,
      reason:    reason ?? null,
    });
  }
}
