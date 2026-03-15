# Web Relay Controller

웹 기반 릴레이 컨트롤러 시스템.
지역별 릴레이 장치를 웹에서 실시간 제어하고, 스케줄 기반 자동 운영을 지원합니다.

---

## 라이선스

이 저장소는 **Reference-Only License v1.0** 라이선스를 따릅니다.

소스 코드는 **열람 및 참고 목적**으로만 제공됩니다.

코드 또는 그 아이디어를 다른 프로젝트에서 재사용, 수정, 재배포하거나 구현하는 행위는  
명시적인 사전 허가 없이 허용되지 않습니다.

---

## 기술 스택

| 레이어 | 기술 |
|---|---|
| Frontend | <img src="https://img.shields.io/badge/React-v19-61DAFB?logo=react"/> <img src="https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript"/> <img src="https://img.shields.io/badge/Tailwind CSS-v4-06B6D4?logo=tailwindcss"/> <img src="https://img.shields.io/badge/Vite-v7-9135FF?logo=vite"/> |
| 서버 상태 | <img src="https://img.shields.io/badge/TanStak Query-v5-000000?logo=tanstack"/> |
| Backend | <img src="https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript"/> <img src="https://img.shields.io/badge/NestJS-v11-E0234E?logo=nestjs"/> |
| ORM | <img src="https://img.shields.io/badge/Prisma-v6-2D3748?logo=prisma"/> |
| DB | <img src="https://img.shields.io/badge/PostgreSQL-v18-4169E1?logo=postgresql"/> |
| 장치 통신 | <img src="https://img.shields.io/badge/TCP-gray"/> |
| 인증 | <img src="https://img.shields.io/badge/JWT (Access 15m + Refresh 30d)-gray"/>|
| 프로세스 관리 | <img src="https://img.shields.io/badge/PM2-v6-2B037A?logo=pm2"/> |

---

## 프로젝트 아키텍쳐

```
web-relay-controller/
├── apps/
│   ├── api/          # NestJS 백엔드 (PORT 3000)
│   └── web/          # React 프론트엔드
├── packages/
│   └── prisma-db/    # 공유 Prisma 패키지 (Client + 타입)
├── pnpm-workspace.yaml
└── package.json
```

### Backend (`apps/api/src/`)

```
├── common/           # Guards, Filters, Interceptors, Decorators
├── config/           # 환경변수 스키마 (Zod)
├── database/         # PrismaService
├── infra/
│   ├── relay/        # Modbus TCP 통신
│   ├── sse/          # Server-Sent Events (실시간 알림)
│   └── storage/      # 이미지 파일 저장
├── jobs/
│   ├── device-online.job.ts    # 장치 온라인 상태 주기적 체크
│   └── schedule-runner.job.ts  # 스케줄 자동 실행
└── modules/
    ├── auth/         # 로그인, 토큰 발급/갱신, IP 차단
    ├── users/        # 유저 CRUD (admin 전용)
    ├── regions/      # 지역 CRUD + 이미지 업로드
    ├── devices/      # 장치 CRUD + 릴레이 ON/OFF 제어
    ├── schedules/    # 스케줄 CRUD
    └── health/       # 헬스 체크
```

### Frontend (`apps/web/src/`)

```
├── pages/            # LoginPage, DashboardPage, DevicesPage,
│                     # RegionsPage, UsersPage, SchedulesPage 등
├── components/
│   ├── layout/       # AppLayout, ProtectedRoute, AdminRoute
│   ├── domain/       # 비즈니스 컴포넌트 (Device, Region, Schedule, User)
│   └── ui/           # 공통 UI (Modal, Badge, ConfirmDialog 등)
└── lib/
    ├── api/          # API 함수 + fetcher
    ├── hooks/        # TanStack Query 커스텀 훅
    └── utils/        # 이미지 처리, URL 변환 등
```

---

## 도메인 아키텍쳐

```
User → Region → Device → Schedule
```

| 도메인 | 설명 |
|---|---|
| User | admin / user 역할 분리 |
| Region | 장치 그룹화 단위 (이미지 업로드 가능) |
| Device | 릴레이 장치 (isOn, isOnline 상태, TCP) |
| Schedule | 시간 기반 자동 ON/OFF 규칙 |

---

## 권한 매트릭스

| 기능 | admin | user |
|---|---|---|
| 유저 / 지역 / 장치 CRUD | ✅ | ❌ |
| 장치 목록 조회 | 전체 | 자기 지역만 |
| 릴레이 ON/OFF | ✅ | ✅ (자기 지역) |
| 스케줄 CRUD | ✅ | ✅ (자기 지역) |
| 이미지 업로드 | ✅ | ❌ |

---

## 인증 아키텍쳐

- **Access Token**: 15분, 클라이언트 메모리 저장 (localStorage 미사용)
- **Refresh Token**: 30일, DB에 bcrypt 해시 저장
- **Refresh Token Rotation**: 사용 시 기존 폐기 + 새 발급
- **Token Reuse Detection**: 폐기된 토큰 재사용 시 전체 세션 무효화
- **IP 차단**: 로그인 5회 실패 → 15분 차단

---

## 시작하기 (개발 환경)

### 사전 요구사항
- Node.js LTS
- pnpm
- PostgreSQL
- Docker (선택, DB 컨테이너 사용 시)

### 환경변수 설정

```bash
# apps/api/.env
cp apps/api/.env.example apps/api/.env

# packages/prisma-db/.env
cp packages/prisma-db/.env.example packages/prisma-db/.env
```

`apps/api/.env` 주요 항목:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/relay_db
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CORS_ORIGIN=http://localhost:5173
```

`packages/prisma-db/.env`:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/relay_db
```

### 설치 및 실행

```bash
# 의존성 설치
pnpm install

# DB 시작 (Docker 사용 시)
pnpm db:up

# Prisma Client 생성
pnpm -F @repo/prisma-db prisma:generate

# DB 마이그레이션
pnpm db:migrate

# 초기 admin 계정 생성
pnpm -F @repo/prisma-db prisma:seed

# 개발 서버 실행 (api + web 동시)
pnpm dev
```

| 서버 | 주소 |
|---|---|
| API | http://localhost:3000/api |
| Web | http://localhost:5173 |

---

## 빌드 및 배포 (프로덕션)

```bash
# 1. Prisma Client 생성
pnpm -F @repo/prisma-db prisma:generate

# 2. prisma-db 패키지 빌드
pnpm -F @repo/prisma-db build

# 3. DB 마이그레이션 적용
pnpm -F @repo/prisma-db prisma:deploy

# 4. API 빌드
pnpm -F @repo/api build

# 5. Web 빌드
pnpm --filter "./apps/web" build

# 6. API 서버 실행 (PM2)
cd apps/api && pm2 start dist/main.js --name relay-api && pm2 save
```

Web은 `apps/web/dist/`를 nginx 등 정적 서버로 서빙합니다.

### nginx 설정 예시

```nginx
events { worker_connections 1024; }

http {
    include mime.types;

    server {
        listen 443 ssl;
        server_name yourdomain.com;

        ssl_certificate     /path/to/cert.pem;
        ssl_certificate_key /path/to/privkey.pem;

        location / {
            root /path/to/apps/web/dist;
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Connection '';
            proxy_buffering off;
        }

        location /uploads/ {
            alias /path/to/apps/api/uploads/;
        }
    }
}
```

---

## API 응답 형식

```json
// 성공
{ "success": true, "data": { ... } }

// 실패
{ "success": false, "error": { "code": "ERROR_CODE", "message": "설명" } }
```

---

## 대상 장치

**SG-3021TIL** — TCP, PORT 4001
릴레이 주소: R1 = 1, R2 = 2
