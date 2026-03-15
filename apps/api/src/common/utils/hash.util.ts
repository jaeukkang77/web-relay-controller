import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const BCRYPT_ROUNDS = 12;

/** 비밀번호 bcrypt 해시 생성 */
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

/** 비밀번호 bcrypt 해시 비교 */
export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * 토큰 SHA-256 해시.
 * Refresh Token은 고엔트로피 랜덤값이므로 bcrypt 대신 SHA-256으로
 * 결정론적 해시를 생성해 DB @unique 조회에 사용한다.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}
