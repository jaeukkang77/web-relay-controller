import { Injectable } from '@nestjs/common';
import type { User, RefreshToken, AuthAttemptLog } from '@repo/prisma-db';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ── User ──────────────────────────────────────────────────

  findUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  // ── RefreshToken ──────────────────────────────────────────

  findRefreshTokenByHash(tokenHash: string): Promise<RefreshToken | null> {
    return this.prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  createRefreshToken(data: {
    userId:    string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return this.prisma.refreshToken.create({ data });
  }

  revokeRefreshToken(id: bigint): Promise<RefreshToken> {
    return this.prisma.refreshToken.update({
      where: { id },
      data:  { revokedAt: new Date() },
    });
  }

  /** Token Reuse Detection: 해당 유저의 모든 미폐기 토큰 폐기 */
  revokeAllUserRefreshTokens(userId: string): Promise<{ count: number }> {
    return this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data:  { revokedAt: new Date() },
    });
  }

  // ── AuthAttemptLog ────────────────────────────────────────

  createAuthAttemptLog(data: {
    userId?:   string | null;
    ipAddress: string;
    success:   boolean;
    reason?:   string | null;
  }): Promise<AuthAttemptLog> {
    return this.prisma.authAttemptLog.create({ data });
  }

  /**
   * 최근 windowMin분 내 특정 IP의 실패 횟수 조회.
   * IP 기반 로그인 차단 판정에 사용한다.
   */
  countRecentFailures(ip: string, windowMin: number): Promise<number> {
    const since = new Date(Date.now() - windowMin * 60 * 1000);
    return this.prisma.authAttemptLog.count({
      where: {
        ipAddress: ip,
        success:   false,
        createdAt: { gte: since },
      },
    });
  }
}
