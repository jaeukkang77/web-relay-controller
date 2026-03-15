import * as crypto from 'crypto';

/**
 * 고엔트로피 불투명 랜덤 토큰 생성.
 * Refresh Token의 raw 값으로 사용한다.
 */
export function generateRawToken(): string {
  return crypto.randomBytes(48).toString('hex'); // 96자 hex
}
