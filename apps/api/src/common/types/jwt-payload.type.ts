export interface JwtPayload {
  sub:       string;        // userId
  role:      string;
  regionId?: number | null;
  jti?:      string;        // JWT ID — 랜덤 UUID, 동일 초 발급 시 hash 충돌 방지
  iat?:      number;
  exp?:      number;
}
