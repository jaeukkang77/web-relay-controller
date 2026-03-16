import { HttpStatus, Injectable } from '@nestjs/common';
import type { Device } from '@repo/prisma-db';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { RelayService } from '../../infra/relay/relay.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesRepository } from './devices.repository';

@Injectable()
export class DevicesService {
  constructor(
    private readonly repo:   DevicesRepository,
    private readonly relay: RelayService,
  ) {}

  // ── 목록 조회 ───────────────────────────────────────────────
  async findAll(regionId: number, user: AuthUser): Promise<Device[]> {
    this.assertRegionAccess(regionId, user);
    return this.repo.findManyByRegion(regionId);
  }

  // ── 단건 조회 ───────────────────────────────────────────────
  async findOne(regionId: number, id: number, user: AuthUser): Promise<Device> {
    this.assertRegionAccess(regionId, user);
    return this.assertDevice(regionId, id);
  }

  // ── 생성 (admin only) ───────────────────────────────────────
  async create(regionId: number, dto: CreateDeviceDto): Promise<Device> {
    return this.repo.create({
      regionId,
      name:    dto.name,
      ip:      dto.ip,
      port:    dto.port    ?? 4001,
      slaveId: dto.slaveId ?? 1,
      address: dto.address,
    });
  }

  // ── 수정 (admin only) ───────────────────────────────────────
  async update(
    regionId: number,
    id:       number,
    dto:      UpdateDeviceDto,
  ): Promise<Device> {
    await this.assertDevice(regionId, id);
    return this.repo.update(id, dto);
  }

  // ── 삭제 (admin only) ───────────────────────────────────────
  async remove(regionId: number, id: number): Promise<Device> {
    await this.assertDevice(regionId, id);
    return this.repo.delete(id);
  }

  // ── 릴레이 제어 (admin + user) ─────────────────────────────
  async controlRelay(
    regionId: number,
    id:       number,
    action:   'on' | 'off',
    user:     AuthUser,
  ): Promise<Device> {
    this.assertRegionAccess(regionId, user);
    const device = await this.assertDevice(regionId, id);

    const value = action === 'on';

    try {
      await this.relay.setRelay(
        device.ip,
        device.port,
        device.slaveId,
        device.address,
        value,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : '알 수 없는 오류';
      throw new AppException(
        'RELAY_ERROR',
        `릴레이 제어 실패: ${msg}`,
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    return this.repo.update(id, { isOn: value });
  }

  // ── 장치 상태 수동 동기화 (admin + user) ──────────────────
  async syncDeviceState(
    regionId: number,
    id:       number,
    user:     AuthUser,
  ): Promise<Device> {
    this.assertRegionAccess(regionId, user);
    const device = await this.assertDevice(regionId, id);

    const result = await this.relay.checkOnlineAndRead(
      device.ip,
      device.port,
      device.slaveId,
      device.address,
    );

    const data: { isOnline: boolean; isOn?: boolean } = {
      isOnline: result.isOnline,
    };
    // isOn이 null(읽기 실패)이면 DB 값 유지
    if (result.isOn !== null) {
      data.isOn = result.isOn;
    }

    return this.repo.update(id, data);
  }

  // ── 내부 유틸 ───────────────────────────────────────────────
  private assertRegionAccess(regionId: number, user: AuthUser): void {
    if (user.role !== 'admin' && user.regionId !== regionId) {
      throw new AppException('FORBIDDEN', '접근 권한이 없습니다.', HttpStatus.FORBIDDEN);
    }
  }

  private async assertDevice(regionId: number, id: number): Promise<Device> {
    const device = await this.repo.findById(id);
    if (!device || device.regionId !== regionId) {
      throw new AppException('NOT_FOUND', '장치를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return device;
  }
}
