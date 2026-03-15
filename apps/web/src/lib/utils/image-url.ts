/**
 * 서버에서 반환되는 imagePath ('/uploads/regions/...')에
 * API 서버 origin을 붙여 완전한 URL로 변환한다.
 *
 * - 개발: VITE_API_BASE_URL=http://localhost:3000/api  → http://localhost:3000/uploads/...
 * - 운영: 같은 origin 배포 시 VITE_API_BASE_URL 미설정  → /uploads/... (상대 경로 그대로)
 */
const _base = import.meta.env.VITE_API_BASE_URL as string | undefined

// VITE_API_BASE_URL이 절대 URL이면 origin만 추출, 아니면 빈 문자열(같은 origin)
function resolveApiOrigin(): string {
  if (!_base) return ''
  try {
    return new URL(_base).origin
  } catch {
    return ''
  }
}

const API_ORIGIN = resolveApiOrigin()

export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null
  // 이미 절대 URL이면 그대로 반환
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  return `${API_ORIGIN}${path}`
}
