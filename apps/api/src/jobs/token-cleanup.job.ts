import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ScheduledTask, schedule } from 'node-cron';
import { AuthRepository } from '../modules/auth/auth.repository';

/**
 * Token Cleanup Job
 *
 * 매일 03:00에 실행 — 만료 또는 폐기된 Refresh Token을 DB에서 삭제.
 * DB 무한 증가를 방지하고 조회 성능을 유지한다.
 */
@Injectable()
export class TokenCleanupJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TokenCleanupJob.name);
  private task: ScheduledTask | null = null;

  constructor(private readonly authRepo: AuthRepository) {}

  onModuleInit() {
    this.task = schedule('0 3 * * *', () => {
      this.run().catch((err) => {
        this.logger.error('TokenCleanupJob 오류', err);
      });
    });
    this.logger.log('TokenCleanupJob 시작 (매일 03:00)');
  }

  onModuleDestroy() {
    this.task?.stop();
    this.logger.log('TokenCleanupJob 정지');
  }

  async run(): Promise<void> {
    const count = await this.authRepo.purgeExpiredTokens();
    if (count > 0) {
      this.logger.log(`만료/폐기 토큰 ${count}건 정리 완료`);
    }
  }
}
