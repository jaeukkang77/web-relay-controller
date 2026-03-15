import { Injectable } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { LocalStorageService } from '../../infra/storage/local-storage.service';
import { buildFileName, getUploadDir } from '../../infra/storage/file-name.util';
import { AppException } from '../../common/exceptions/app.exception';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

@Injectable()
export class RegionsImageService {
  constructor(private readonly storage: LocalStorageService) {}

  /**
   * 이미지를 디스크에 저장하고 새 URL 경로를 반환한다.
   * 기존 이미지가 있으면 삭제한다.
   *
   * @param regionId  지역 ID (파일명 생성에 사용)
   * @param oldPath   기존 imagePath (있으면 삭제)
   * @param file      multer 메모리 버퍼
   * @returns         새 imagePath ('/uploads/regions/...')
   */
  async upload(
    regionId: number,
    oldPath: string | null,
    file: Express.Multer.File,
  ): Promise<string> {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new AppException(
        'BAD_REQUEST',
        'jpg, png, gif, webp 형식만 허용됩니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const dir      = getUploadDir('region');
    const filename = buildFileName('region', regionId, file.originalname);

    let newPath: string;
    try {
      newPath = await this.storage.save(dir, filename, file.buffer);
    } catch {
      throw new AppException(
        'UPLOAD_FAILED',
        '이미지 업로드에 실패했습니다.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // 기존 이미지 삭제 (실패해도 무시)
    if (oldPath) {
      await this.storage.delete(oldPath);
    }

    return newPath;
  }
}
