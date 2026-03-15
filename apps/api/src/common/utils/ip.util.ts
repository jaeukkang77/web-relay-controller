import type { Request } from 'express';

/**
 * Express Request에서 클라이언트 실제 IP 추출.
 * Nginx / iptime 리버스프록시 환경에서 X-Forwarded-For 헤더를 우선 사용.
 */
export function extractIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];

  if (forwarded) {
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return first.trim();
  }

  return req.socket?.remoteAddress ?? '0.0.0.0';
}
