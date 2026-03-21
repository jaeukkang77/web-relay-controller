import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ScheduledTask, schedule } from 'node-cron';
import { RelayService } from '../infra/relay/relay.service';
import { SseService } from '../infra/sse/sse.service';
import { DevicesRepository } from '../modules/devices/devices.repository';
import { SchedulesRepository } from '../modules/schedules/schedules.repository';

/**
 * Schedule Runner Job
 *
 * 1분마다 실행 — 현재 시각과 일치하는 enabled 스케줄을 찾아 릴레이 자동 제어.
 *
 * 시각 비교 규칙:
 *   - onTime/offTime: Prisma가 1970-01-01T{HH:MM}:00Z 형태로 반환
 *     → .getUTCHours() / .getUTCMinutes() = 저장된 HH:MM 값
 *     → 서버 로컬 시각 new Date().getHours() / .getMinutes() 와 비교
 *
 * 날짜 범위 비교:
 *   - dateFrom/dateTo: Prisma가 {YYYY-MM-DD}T00:00:00Z 형태로 반환
 *     → UTC ISO 문자열 'YYYY-MM-DD' 기준 비교
 */
@Injectable()
export class ScheduleRunnerJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ScheduleRunnerJob.name);
  private task: ScheduledTask | null = null;

  constructor(
    private readonly schedulesRepo: SchedulesRepository,
    private readonly devicesRepo:   DevicesRepository,
    private readonly relay:        RelayService,
    private readonly sse:           SseService,
  ) {}

  onModuleInit() {
    this.task = schedule('* * * * *', () => {
      this.run().catch((err) => {
        this.logger.error('ScheduleRunnerJob 오류', err);
      });
    });
    this.logger.log('ScheduleRunnerJob 시작 (1분 주기)');
  }

  onModuleDestroy() {
    this.task?.stop();
    this.logger.log('ScheduleRunnerJob 정지');
  }

  async run(): Promise<void> {
    const now    = new Date();
    const hour   = now.getHours();   // 서버 로컬 시각 (TZ=Asia/Seoul)
    const minute = now.getMinutes();
    // 로컬 날짜 기준으로 비교 (UTC 기반 toISOString은 자정 근처 날짜 불일치 가능)
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // 오늘 날짜 범위 내 + enabled 스케줄 조회
    const schedules = await this.schedulesRepo.findActiveToday();
    if (schedules.length === 0) return;

    // 이번 분에 실행할 액션 결정
    // deviceId → action 맵 (같은 장치에 여러 스케줄이 같은 분에 겹치면 마지막 승리)
    const actions = new Map<number, { action: 'on' | 'off'; device: typeof schedules[0]['device'] }>();

    for (const s of schedules) {
      // dateFrom <= today <= dateTo 재확인 (Repository에서 근사 필터)
      const fromStr = s.dateFrom.toISOString().split('T')[0];
      const toStr   = s.dateTo.toISOString().split('T')[0];
      if (fromStr > todayStr || toStr < todayStr) continue;

      if (s.onTime && this.matchesMinute(s.onTime, hour, minute)) {
        actions.set(s.deviceId, { action: 'on', device: s.device });
      }
      if (s.offTime && this.matchesMinute(s.offTime, hour, minute)) {
        actions.set(s.deviceId, { action: 'off', device: s.device });
      }
    }

    if (actions.size === 0) return;
    this.logger.log(`ScheduleRunnerJob: ${actions.size}개 장치 제어 예정`);

    // 각 장치별 릴레이 제어 (병렬)
    await Promise.allSettled(
      Array.from(actions.entries()).map(async ([deviceId, { action, device }]) => {
        const value = action === 'on';
        try {
          await this.relay.setRelay(device.ip, device.port, device.slaveId, device.address, value);
          await this.devicesRepo.update(deviceId, { isOn: value });
          this.logger.log(`장치 #${deviceId} ${action.toUpperCase()} 완료`);
          this.sse.emit('schedule', {
            deviceId,
            deviceName: device.name,
            action,
            time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
          });
        } catch (err) {
          this.logger.warn(`장치 #${deviceId} 제어 실패: ${err instanceof Error ? err.message : err}`);
        }
      }),
    );
  }

  // ── 내부 유틸 ─────────────────────────────────────────────

  /** Prisma Time 값과 서버 로컬 시각 비교 */
  private matchesMinute(t: Date, hour: number, minute: number): boolean {
    return t.getUTCHours() === hour && t.getUTCMinutes() === minute;
  }
}
