import { Injectable } from '@nestjs/common';
import type { User } from '@repo/prisma-db';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(opts: {
    limit:  number;
    offset: number;
  }): Promise<[User[], number]> {
    return this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'asc' },
        take:    opts.limit,
        skip:    opts.offset,
      }),
      this.prisma.user.count(),
    ]);
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  create(data: {
    id:           string;
    passwordHash: string;
    role:         'admin' | 'user';
    regionId?:    number | null;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  update(
    id: string,
    data: {
      passwordHash?: string;
      role?:         'admin' | 'user';
      regionId?:     number | null;
    },
  ): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: string): Promise<User> {
    return this.prisma.user.delete({ where: { id } });
  }
}
