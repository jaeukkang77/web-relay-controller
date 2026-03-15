import { HttpStatus, Injectable } from '@nestjs/common';
import type { User } from '@repo/prisma-db';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { hashPassword } from '../../common/utils/hash.util';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersQueryDto } from './dto/users.query.dto';
import { UsersRepository } from './users.repository';

/** API 응답용 — passwordHash 제외 */
export type UserResult = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly repo: UsersRepository) {}

  // ── 목록 조회 ───────────────────────────────────────────────
  async findAll(
    query: UsersQueryDto,
  ): Promise<{ users: UserResult[]; total: number }> {
    const limit  = query.limit  ?? 20;
    const offset = query.offset ?? 0;

    const [users, total] = await this.repo.findMany({ limit, offset });
    return { users: users.map(this.sanitize), total };
  }

  // ── 단건 조회 ───────────────────────────────────────────────
  async findOne(id: string): Promise<UserResult> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new AppException('NOT_FOUND', '사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }
    return this.sanitize(user);
  }

  // ── 생성 ────────────────────────────────────────────────────
  async create(dto: CreateUserDto): Promise<UserResult> {
    const exists = await this.repo.findById(dto.id);
    if (exists) {
      throw new AppException(
        'DUPLICATE_ID',
        '이미 사용 중인 아이디입니다.',
        HttpStatus.CONFLICT,
      );
    }

    // role=admin이면 regionId 강제 null
    const regionId =
      dto.role === 'admin' ? null : (dto.regionId ?? null);

    const passwordHash = await hashPassword(dto.password);
    const user = await this.repo.create({
      id:   dto.id,
      passwordHash,
      role: dto.role,
      regionId,
    });

    return this.sanitize(user);
  }

  // ── 수정 ────────────────────────────────────────────────────
  async update(id: string, dto: UpdateUserDto): Promise<UserResult> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new AppException('NOT_FOUND', '사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    const updateData: Parameters<UsersRepository['update']>[1] = {};

    // 비밀번호: 값이 있을 때만 해시 후 변경
    if (dto.password) {
      updateData.passwordHash = await hashPassword(dto.password);
    }

    // 역할 변경
    if (dto.role !== undefined) {
      updateData.role = dto.role;
      // admin으로 변경하면 regionId 강제 null
      if (dto.role === 'admin') {
        updateData.regionId = null;
      }
    }

    // regionId 변경 (admin 아닐 때만 적용)
    const effectiveRole = dto.role ?? user.role;
    if (dto.regionId !== undefined && effectiveRole !== 'admin') {
      updateData.regionId = dto.regionId;
    }

    const updated = await this.repo.update(id, updateData);
    return this.sanitize(updated);
  }

  // ── 삭제 ────────────────────────────────────────────────────
  async remove(id: string, caller: AuthUser): Promise<UserResult> {
    if (id === caller.id) {
      throw new AppException(
        'SELF_DELETE',
        '자기 자신은 삭제할 수 없습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = await this.repo.findById(id);
    if (!user) {
      throw new AppException('NOT_FOUND', '사용자를 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    const deleted = await this.repo.delete(id);
    return this.sanitize(deleted);
  }

  // ── 내부 유틸 ───────────────────────────────────────────────
  private sanitize(user: User): UserResult {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...rest } = user;
    return rest;
  }
}
