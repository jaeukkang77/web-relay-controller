import { HttpStatus, Injectable } from '@nestjs/common';
import type { Schedule } from '@repo/prisma-db';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { DevicesRepository } from '../devices/devices.repository';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulesRepository } from './schedules.repository';

// ── 직렬화 타입 ────────────────────────────────────────────────

export interface ScheduleResponse {
  id:        number;
  deviceId:  number;
  name:      string | null;
  onTime:    string | null;   // "HH:MM"
  offTime:   string | null;   // "HH:MM"
  dateFrom:  string;          // "YYYY-MM-DD"
  dateTo:    string;          // "YYYY-MM-DD"
  enabled:   boolean;
  createdAt: string;
  updatedAt: string;
}

// ── 시각/날짜 변환 유틸 ────────────────────────────────────────

/** "HH:MM" → 1970-01-01T{HH:MM}:00.000Z (Prisma Time용) */
function toTimeDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date(0);
  d.setUTCHours(h, m, 0, 0);
  return d;
}

/** "YYYY-MM-DD" → 해당일 자정 UTC Date (Prisma Date용) */
function toDateOnly(yyyymmdd: string): Date {
  return new Date(`${yyyymmdd}T00:00:00.000Z`);
}

/** Prisma Time Date → "HH:MM" */
function timeToStr(d: Date | null): string | null {
  if (!d) return null;
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Prisma Date → "YYYY-MM-DD" */
function dateToStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

/** Schedule 모델 → 클라이언트 응답 형태 */
function serialize(s: Schedule): ScheduleResponse {
  return {
    id:        s.id,
    deviceId:  s.deviceId,
    name:      s.name,
    onTime:    timeToStr(s.onTime),
    offTime:   timeToStr(s.offTime),
    dateFrom:  dateToStr(s.dateFrom),
    dateTo:    dateToStr(s.dateTo),
    enabled:   s.enabled,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

@Injectable()
export class SchedulesService {
  constructor(
    private readonly repo:        SchedulesRepository,
    private readonly devicesRepo: DevicesRepository,
  ) {}

  // ── 목록 조회 ───────────────────────────────────────────────
  async findAll(
    regionId: number,
    deviceId: number,
    user:     AuthUser,
  ): Promise<ScheduleResponse[]> {
    await this.assertDeviceAccess(regionId, deviceId, user);
    const rows = await this.repo.findManyByDevice(deviceId);
    return rows.map(serialize);
  }

  // ── 생성 ────────────────────────────────────────────────────
  async create(
    regionId: number,
    deviceId: number,
    dto:      CreateScheduleDto,
    user:     AuthUser,
  ): Promise<ScheduleResponse> {
    await this.assertDeviceAccess(regionId, deviceId, user);
    this.assertTimeProvided(dto.onTime, dto.offTime);

    const row = await this.repo.create({
      deviceId,
      name:     dto.name    ?? null,
      onTime:   dto.onTime  ? toTimeDate(dto.onTime)  : null,
      offTime:  dto.offTime ? toTimeDate(dto.offTime) : null,
      dateFrom: toDateOnly(dto.dateFrom),
      dateTo:   toDateOnly(dto.dateTo),
      enabled:  dto.enabled ?? true,
    });
    return serialize(row);
  }

  // ── 수정 ────────────────────────────────────────────────────
  async update(
    regionId: number,
    deviceId: number,
    id:       number,
    dto:      UpdateScheduleDto,
    user:     AuthUser,
  ): Promise<ScheduleResponse> {
    await this.assertDeviceAccess(regionId, deviceId, user);
    const schedule = await this.assertSchedule(deviceId, id);

    // onTime/offTime 최종 값 검증
    const nextOnTime  = 'onTime'  in dto ? dto.onTime  : (schedule.onTime  ? 'keep' : null);
    const nextOffTime = 'offTime' in dto ? dto.offTime : (schedule.offTime ? 'keep' : null);
    const willHaveTime =
      (nextOnTime  !== null && nextOnTime  !== undefined) ||
      (nextOffTime !== null && nextOffTime !== undefined);
    if (!willHaveTime) {
      throw new AppException(
        'SCHEDULE_TIME_REQUIRED',
        'onTime 또는 offTime 중 하나 이상은 필수입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const data: Parameters<typeof this.repo.update>[1] = {};
    if ('name'     in dto) data.name     = dto.name     ?? null;
    if ('onTime'   in dto) data.onTime   = dto.onTime   ? toTimeDate(dto.onTime)  : null;
    if ('offTime'  in dto) data.offTime  = dto.offTime  ? toTimeDate(dto.offTime) : null;
    if ('dateFrom' in dto && dto.dateFrom) data.dateFrom = toDateOnly(dto.dateFrom);
    if ('dateTo'   in dto && dto.dateTo)   data.dateTo   = toDateOnly(dto.dateTo);
    if ('enabled'  in dto && dto.enabled !== undefined) data.enabled = dto.enabled;

    const row = await this.repo.update(id, data);
    return serialize(row);
  }

  // ── 삭제 ────────────────────────────────────────────────────
  async remove(
    regionId: number,
    deviceId: number,
    id:       number,
    user:     AuthUser,
  ): Promise<ScheduleResponse> {
    await this.assertDeviceAccess(regionId, deviceId, user);
    await this.assertSchedule(deviceId, id);
    const row = await this.repo.delete(id);
    return serialize(row);
  }

  // ── 활성화 토글 ──────────────────────────────────────────────
  async toggle(
    regionId: number,
    deviceId: number,
    id:       number,
    user:     AuthUser,
  ): Promise<ScheduleResponse> {
    await this.assertDeviceAccess(regionId, deviceId, user);
    const schedule = await this.assertSchedule(deviceId, id);
    const row = await this.repo.update(id, { enabled: !schedule.enabled });
    return serialize(row);
  }

  // ── 내부 유틸 ───────────────────────────────────────────────

  /** 지역 접근 권한 + 장치 소속 지역 검증 */
  private async assertDeviceAccess(
    regionId: number,
    deviceId: number,
    user:     AuthUser,
  ): Promise<void> {
    if (user.role !== 'admin' && user.regionId !== regionId) {
      throw new AppException('FORBIDDEN', '접근 권한이 없습니다.', HttpStatus.FORBIDDEN);
    }
    const device = await this.devicesRepo.findById(deviceId);
    if (!device || device.regionId !== regionId) {
      throw new AppException('NOT_FOUND', '장치를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
  }

  /** 스케줄 존재 + 장치 소속 검증 */
  private async assertSchedule(deviceId: number, id: number): Promise<Schedule> {
    const schedule = await this.repo.findById(id);
    if (!schedule || schedule.deviceId !== deviceId) {
      throw new AppException('NOT_FOUND', '스케줄을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return schedule;
  }

  /** onTime/offTime 중 하나 이상 필수 */
  private assertTimeProvided(onTime?: string, offTime?: string): void {
    if (!onTime && !offTime) {
      throw new AppException(
        'SCHEDULE_TIME_REQUIRED',
        'onTime 또는 offTime 중 하나 이상은 필수입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
