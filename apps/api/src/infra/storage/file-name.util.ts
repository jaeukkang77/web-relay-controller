import { extname } from 'path';

/**
 * 도메인별 업로드 디렉터리 경로를 반환한다.
 * 예: 'region' → 'uploads/regions'
 */
export function getUploadDir(domain: string): string {
  return `uploads/${domain}s`;
}

/**
 * 디스크에 저장할 파일명을 생성한다.
 * 형식: {domain}-{id}-{timestamp}{ext}
 * 예: region-1-1741234567890.jpg
 */
export function buildFileName(
  domain: string,
  id: number,
  originalName: string,
): string {
  const ext = extname(originalName).toLowerCase() || '.bin';
  return `${domain}-${id}-${Date.now()}${ext}`;
}
