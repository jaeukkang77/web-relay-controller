import { Injectable } from '@nestjs/common';
import type { Region } from '@repo/prisma-db';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RegionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 목록 조회 (페이지네이션)
   * - admin: 전체 지역
   * - user: user.regionId에 해당하는 지역 1건
   */
  async findMany(opts: {
    role: string;
    regionId?: number | null;
    limit: number;
    offset: number;
  }): Promise<[Region[], number]> {
    const where =
      opts.role === 'admin'
        ? {}
        : { id: opts.regionId ?? -1 };

    return this.prisma.$transaction([
      this.prisma.region.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take:  opts.limit,
        skip:  opts.offset,
      }),
      this.prisma.region.count({ where }),
    ]);
  }

  findById(id: number): Promise<Region | null> {
    return this.prisma.region.findUnique({ where: { id } });
  }

  findByName(name: string): Promise<Region | null> {
    return this.prisma.region.findUnique({ where: { name } });
  }

  create(data: { name: string }): Promise<Region> {
    return this.prisma.region.create({ data });
  }

  update(
    id: number,
    data: { name?: string; imagePath?: string | null },
  ): Promise<Region> {
    return this.prisma.region.update({ where: { id }, data });
  }

  delete(id: number): Promise<Region> {
    return this.prisma.region.delete({ where: { id } });
  }
}
