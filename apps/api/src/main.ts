import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import type { Env } from './config/env.schema';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ── 정적 파일 서빙 ────────────────────────────────────────
  // 업로드된 이미지를 /uploads/** URL로 접근 가능하게 서빙
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  const config = app.get(ConfigService<Env, true>);
  const port = config.get('PORT', { infer: true });
  const corsOrigin = config.get('CORS_ORIGIN', { infer: true });
  const nodeEnv = config.get('NODE_ENV', { infer: true });

  // ── Global API prefix ──────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── CORS ──────────────────────────────────────────────────
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // ── Global Exception Filter ────────────────────────────────
  // 가장 먼저 등록 (에러 포맷 통일)
  app.useGlobalFilters(new GlobalExceptionFilter());

  // ── Global Response Interceptor ───────────────────────────
  // { success: true, data: ... } 포맷 자동 적용
  app.useGlobalInterceptors(new ResponseInterceptor());

  // ── Global Validation Pipe ────────────────────────────────
  // class-validator + class-transformer 기반 DTO 검증
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // DTO에 없는 필드 자동 제거
      forbidNonWhitelisted: true, // 허용되지 않는 필드 요청 시 400 에러
      transform: true,          // 쿼리 파라미터 타입 자동 변환 (string → number 등)
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // ── Graceful Shutdown ──────────────────────────────────────
  app.enableShutdownHooks();

  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}/api [${nodeEnv}]`);
}

bootstrap();
