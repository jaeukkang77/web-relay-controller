// JWT 만료 시간은 .env (JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN) 에서 주입
export const IP_BLOCK_LIMIT      = 5;   // 로그인 실패 허용 횟수
export const IP_BLOCK_WINDOW_MIN = 15;  // 차단 시간 (분)
