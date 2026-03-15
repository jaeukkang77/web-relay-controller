import { Injectable } from '@nestjs/common';
import type { Schedule } from '@repo/prisma-db';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SchedulesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByDevice(deviceId: number): Promise<Schedule[]> {
    return this.prisma.schedule.findMany({
      where:   { deviceId },
      orderBy: [{ dateFrom: 'asc' }, { onTime: 'asc' }],
    });
  }

  findById(id: number): Promise<Schedule | null> {
    return this.prisma.schedule.findUnique({ where: { id } });
  }

  /**
   * ScheduleRunnerJob용: 오늘 날짜가 dateFrom~dateTo 범위 내이고 enabled=true인
   * 모든 스케줄 (device 정보 포함)
   */
  findActiveToday(): Promise<(Schedule & { device: import('@repo/prisma-db').Device })[]> {
    const todayStr = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
    const today    = new Date(`${todayStr}T00:00:00.000Z`);
    const tomorrow = new Date(today.getTime() + 86_400_000);

    return this.prisma.schedule.findMany({
      where: {
        enabled:  true,
        dateFrom: { lte: tomorrow }, // dateFrom <= today (Date 비교 근사)
        dateTo:   { gte: today },    // dateTo   >= today
      },
      include: { device: true },
    }) as Promise<(Schedule & { device: import('@repo/prisma-db').Device })[]>;
  }

  create(data: {
    deviceId: number;
    name:     string | null;
    onTime:   Date | null;
    offTime:  Date | null;
    dateFrom: Date;
    dateTo:   Date;
    enabled:  boolean;
  }): Promise<Schedule> {
    return this.prisma.schedule.create({ data });
  }

  update(
    id:   number,
    data: Partial<{
      name:     string | null;
      onTime:   Date | null;
      offTime:  Date | null;
      dateFrom: Date;
      dateTo:   Date;
      enabled:  boolean;
    }>,
  ): Promise<Schedule> {
    return this.prisma.schedule.update({ where: { id }, data });
  }

  delete(id: number): Promise<Schedule> {
    return this.prisma.schedule.delete({ where: { id } });
  }
}
