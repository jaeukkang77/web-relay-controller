import { HttpStatus, Injectable } from '@nestjs/common';
import type { Region } from '@repo/prisma-db';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { LocalStorageService } from '../../infra/storage/local-storage.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { RegionsQueryDto } from './dto/regions.query.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionsImageService } from './regions.image.service';
import { RegionsRepository } from './regions.repository';

@Injectable()
export class RegionsService {
  constructor(
    private readonly repo:         RegionsRepository,
    private readonly imageService: RegionsImageService,
    private readonly storage:      LocalStorageService,
  ) {}

  // ── 목록 조회 ───────────────────────────────────────────────
  async findAll(
    user: AuthUser,
    query: RegionsQueryDto,
  ): Promise<{ regions: Region[]; total: number }> {
    const limit  = query.limit  ?? 20;
    const offset = query.offset ?? 0;

    const [regions, total] = await this.repo.findMany({
      role:     user.role,
      regionId: user.regionId,
      limit,
      offset,
    });

    return { regions, total };
  }

  // ── 단건 조회 ───────────────────────────────────────────────
  async findOne(id: number, user: AuthUser): Promise<Region> {
    const region = await this.repo.findById(id);
    if (!region) {
      throw new AppException('NOT_FOUND', '지역을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // user 역할이면 자기 지역만 접근 가능
    if (user.role !== 'admin' && user.regionId !== id) {
      throw new AppException('FORBIDDEN', '접근 권한이 없습니다.', HttpStatus.FORBIDDEN);
    }

    return region;
  }

  // ── 생성 ────────────────────────────────────────────────────
  async create(dto: CreateRegionDto): Promise<Region> {
    const exists = await this.repo.findByName(dto.name);
    if (exists) {
      throw new AppException(
        'DUPLICATE_NAME',
        '이미 사용 중인 지역 이름입니다.',
        HttpStatus.CONFLICT,
      );
    }

    return this.repo.create({ name: dto.name });
  }

  // ── 수정 ────────────────────────────────────────────────────
  async update(id: number, dto: UpdateRegionDto): Promise<Region> {
    const region = await this.repo.findById(id);
    if (!region) {
      throw new AppException('NOT_FOUND', '지역을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 이름 변경 시 중복 확인
    if (dto.name && dto.name !== region.name) {
      const duplicate = await this.repo.findByName(dto.name);
      if (duplicate) {
        throw new AppException(
          'DUPLICATE_NAME',
          '이미 사용 중인 지역 이름입니다.',
          HttpStatus.CONFLICT,
        );
      }
    }

    return this.repo.update(id, { name: dto.name });
  }

  // ── 이미지 업로드 ────────────────────────────────────────────
  async uploadImage(
    id: number,
    file: Express.Multer.File,
  ): Promise<{ imagePath: string }> {
    const region = await this.repo.findById(id);
    if (!region) {
      throw new AppException('NOT_FOUND', '지역을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    const imagePath = await this.imageService.upload(id, region.imagePath, file);
    await this.repo.update(id, { imagePath });

    return { imagePath };
  }

  // ── 삭제 ────────────────────────────────────────────────────
  async remove(id: number): Promise<Region> {
    const region = await this.repo.findById(id);
    if (!region) {
      throw new AppException('NOT_FOUND', '지역을 찾을 수 없습니다.', HttpStatus.NOT_FOUND);
    }

    // 이미지 파일 삭제 (실패 무시)
    if (region.imagePath) {
      await this.storage.delete(region.imagePath);
    }

    return this.repo.delete(id);
  }
}
