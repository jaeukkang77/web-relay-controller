import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ScheduledTask, schedule } from 'node-cron';
import { RelayService } from '../infra/relay/relay.service';
import { DevicesRepository } from '../modules/devices/devices.repository';

@Injectable()
export class DeviceOnlineJob implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DeviceOnlineJob.name);
  private task: ScheduledTask | null = null;

  constructor(
    private readonly devicesRepo: DevicesRepository,
    private readonly modbus:      RelayService,
  ) {}

  onModuleInit() {
    this.task = schedule('* * * * *', () => {
      this.run().catch((err) => this.logger.error('DeviceOnlineJob 오류', err));
    });
    this.logger.log('DeviceOnlineJob 시작 (1분 주기)');
  }

  onModuleDestroy() {
    this.task?.stop();
    this.logger.log('DeviceOnlineJob 정지');
  }

  async run(): Promise<void> {
    const devices = await this.devicesRepo.findAll();
    if (devices.length === 0) return;

    this.logger.debug(`온라인 체크 시작 — 장치 ${devices.length}개`);

    type DeviceStateUpdate = { id: number; isOnline: boolean; isOn?: boolean };

    const results = await Promise.allSettled(
      devices.map(async (d): Promise<DeviceStateUpdate> => {
        const result = await this.modbus.checkOnlineAndRead(
          d.ip, d.port, d.slaveId, d.address,
        );

        // 장치별 상태 로그
        if (!result.isOnline) {
          this.logger.warn(`[${d.name}] 오프라인 (${d.ip}:${d.port})`);
        } else if (result.isOn === null) {
          this.logger.debug(`[${d.name}] 온라인 — 릴레이 상태 읽기 실패 (${d.ip}:${d.port})`);
        } else {
          this.logger.debug(`[${d.name}] 온라인 — ${result.isOn ? 'ON' : 'OFF'} (${d.ip}:${d.port})`);
        }

        const update: DeviceStateUpdate = { id: d.id, isOnline: result.isOnline };
        if (result.isOn !== null) update.isOn = result.isOn;
        return update;
      }),
    );

    const updates = results
      .filter((r): r is PromiseFulfilledResult<DeviceStateUpdate> => r.status === 'fulfilled')
      .map((r) => r.value);

    if (updates.length > 0) {
      await this.devicesRepo.bulkUpdateState(updates);
    }

    const online  = updates.filter(u => u.isOnline).length;
    const offline = updates.filter(u => !u.isOnline).length;
    this.logger.debug(`온라인 체크 완료 — 온라인 ${online}개 / 오프라인 ${offline}개`);
  }
}
