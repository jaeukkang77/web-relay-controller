import { Injectable } from '@nestjs/common';
import type { Device } from '@repo/prisma-db';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DevicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findManyByRegion(regionId: number): Promise<Device[]> {
    return this.prisma.device.findMany({
      where:   { regionId },
      orderBy: { id: 'asc' },
    });
  }

  findAll(): Promise<Device[]> {
    return this.prisma.device.findMany();
  }

  findById(id: number): Promise<Device | null> {
    return this.prisma.device.findUnique({ where: { id } });
  }

  create(data: {
    regionId: number;
    name:     string;
    ip:       string;
    port:     number;
    slaveId:  number;
    address:  number;
  }): Promise<Device> {
    return this.prisma.device.create({ data });
  }

  update(
    id:   number,
    data: Partial<{
      name:     string;
      ip:       string;
      port:     number;
      slaveId:  number;
      address:  number;
      isOn:     boolean;
      isOnline: boolean;
    }>,
  ): Promise<Device> {
    return this.prisma.device.update({ where: { id }, data });
  }

  /** 여러 장치의 isOnline 일괄 업데이트 */
  async bulkUpdateOnline(
    updates: Array<{ id: number; isOnline: boolean }>,
  ): Promise<void> {
    await Promise.all(
      updates.map(({ id, isOnline }) =>
        this.prisma.device.update({ where: { id }, data: { isOnline } }),
      ),
    );
  }

  /**
   * 여러 장치의 isOnline + 선택적으로 isOn 일괄 업데이트.
   * isOn이 undefined이면 해당 필드는 변경하지 않는다.
   */
  async bulkUpdateState(
    updates: Array<{ id: number; isOnline: boolean; isOn?: boolean | null }>,
  ): Promise<void> {
    await Promise.all(
      updates.map(({ id, isOnline, isOn }) => {
        const data: { isOnline: boolean; isOn?: boolean } = { isOnline };
        if (isOn !== undefined && isOn !== null) data.isOn = isOn;
        return this.prisma.device.update({ where: { id }, data });
      }),
    );
  }

  delete(id: number): Promise<Device> {
    return this.prisma.device.delete({ where: { id } });
  }
}
