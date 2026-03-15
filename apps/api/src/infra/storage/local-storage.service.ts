import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class LocalStorageService {
  /**
   * 버퍼를 디스크에 저장하고 정적 서빙 URL 경로를 반환한다.
   *
   * @param dir       저장 디렉터리 (예: 'uploads/regions')
   * @param filename  저장 파일명 (예: 'region-1-1741234567890.jpg')
   * @param buffer    파일 내용
   * @returns         정적 URL 경로 (예: '/uploads/regions/region-1-...')
   */
  async save(dir: string, filename: string, buffer: Buffer): Promise<string> {
    try {
      const absDir = join(process.cwd(), dir);
      await fs.mkdir(absDir, { recursive: true });
      await fs.writeFile(join(absDir, filename), buffer);
      return `/${dir}/${filename}`;
    } catch (err) {
      throw new InternalServerErrorException(
        `파일 저장 실패: ${(err as Error).message}`,
      );
    }
  }

  /**
   * 파일을 삭제한다. 파일이 없으면 무시한다.
   *
   * @param filePath  정적 URL 경로 (예: '/uploads/regions/...')
   */
  async delete(filePath: string): Promise<void> {
    try {
      // URL 경로 ('/uploads/...') → 절대 경로
      const absPath = join(process.cwd(), filePath.replace(/^\//, ''));
      await fs.unlink(absPath);
    } catch (err: unknown) {
      // 파일이 없으면 무시
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
        // 다른 에러는 조용히 무시 (이미지 삭제 실패가 비즈니스 흐름을 막아선 안 됨)
      }
    }
  }
}
