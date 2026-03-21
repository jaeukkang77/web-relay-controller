import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { appConfigOptions } from './config/app.config';
import { PrismaModule } from './database/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';

// ── Domain Modules ───────────────────────────────────────────
import { UsersModule }     from './modules/users/users.module';
import { RegionsModule }   from './modules/regions/regions.module';
import { DevicesModule }   from './modules/devices/devices.module';
import { SchedulesModule } from './modules/schedules/schedules.module';
// import { InternalModule }  from './modules/internal/internal.module';

// ── Infra Modules ────────────────────────────────────────────
import { StorageModule } from './infra/storage/storage.module';
import { RelayModule }   from './infra/relay/relay.module';
import { SseModule }     from './infra/sse/sse.module';

// ── Event Modules ─────────────────────────────────────────────
import { EventsModule }  from './modules/events/events.module';
// import { LoggerModule }    from './infra/logger/logger.module';
// import { SchedulerModule } from './infra/scheduler/scheduler.module';

// ── Jobs ─────────────────────────────────────────────────────
import { DeviceOnlineJob }   from './jobs/device-online.job';
import { ScheduleRunnerJob } from './jobs/schedule-runner.job';
import { TokenCleanupJob }   from './jobs/token-cleanup.job';

@Module({
  imports: [
    // ── 전역 설정 (가장 먼저 로드) ──────────────────────────
    ConfigModule.forRoot(appConfigOptions),

    // ── 전역 Rate Limiting ─────────────────────────────────
    ThrottlerModule.forRoot([{
      ttl: 60_000,   // 1분
      limit: 60,     // 요청 60회
    }]),

    // ── 전역 DB 연결 ────────────────────────────────────────
    PrismaModule,

    // ── Infra ───────────────────────────────────────────────
    // LoggerModule,
    StorageModule,
    RelayModule,
    SseModule,
    // SchedulerModule,

    // ── Domain ──────────────────────────────────────────────
    HealthModule,
    AuthModule,
    UsersModule,
    RegionsModule,
    DevicesModule,
    SchedulesModule,
    EventsModule,
    // InternalModule,
  ],

  providers: [
    // ── 전역 가드 ────────────────────────────────────────────
    // JwtAuthGuard: 모든 라우트 기본 보호, @Public()으로 예외 처리
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // RolesGuard: @Roles('admin') 데코레이터 기반 역할 검증
    { provide: APP_GUARD, useClass: RolesGuard },
    // ThrottlerGuard: 전역 요청 속도 제한 (60req/min)
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // ── Jobs ─────────────────────────────────────────────────
    DeviceOnlineJob,
    ScheduleRunnerJob,
    TokenCleanupJob,
  ],
})
export class AppModule {}
