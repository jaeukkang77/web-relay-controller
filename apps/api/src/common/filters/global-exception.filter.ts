import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Prisma } from '@repo/prisma-db';
import { AppException } from '../exceptions/app.exception';

// HTTP 상태코드 → API 에러 코드 매핑 (api_spec.md 기준)
const STATUS_CODE_MAP: Record<number, string> = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'UNPROCESSABLE_ENTITY',
  429: 'TOO_MANY_REQUESTS',
  500: 'INTERNAL_SERVER_ERROR',
  503: 'SERVICE_UNAVAILABLE',
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, code, message } = this.resolve(exception);

    // 5xx는 스택 포함, 4xx는 warn
    if (status >= 500) {
      this.logger.error(
        `[${request.method}] ${request.url} → ${status} ${code}: ${message}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} → ${status} ${code}: ${message}`,
      );
    }

    response.status(status).json({
      success: false,
      error: { code, message },
    });
  }

  // ── Exception 분류 ─────────────────────────────────────────
  private resolve(exception: unknown): {
    status: number;
    code: string;
    message: string;
  } {
    // 1) 커스텀 AppException — 도메인 에러 코드 포함
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        code: exception.code,
        message: exception.message,
      };
    }

    // 2) NestJS HttpException (NotFoundException, BadRequestException 등)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const code = STATUS_CODE_MAP[status] ?? 'UNKNOWN_ERROR';

      // ValidationPipe가 생성하는 배열 메시지 처리
      let message: string;
      if (typeof res === 'string') {
        message = res;
      } else if (Array.isArray((res as any).message)) {
        message = (res as any).message.join(', ');
      } else {
        message = (res as any).message ?? exception.message;
      }

      return { status, code, message };
    }

    // 3) Prisma 알려진 에러
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.resolvePrismaError(exception);
    }

    // 4) Prisma 유효성 에러 (잘못된 쿼리)
    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'BAD_REQUEST',
        message: '잘못된 데이터 형식입니다.',
      };
    }

    // 5) 알 수 없는 에러
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 오류가 발생했습니다.',
    };
  }

  // ── Prisma 에러코드 → HTTP 응답 매핑 ──────────────────────
  private resolvePrismaError(e: Prisma.PrismaClientKnownRequestError): {
    status: number;
    code: string;
    message: string;
  } {
    switch (e.code) {
      case 'P2002': // Unique constraint violation
        return {
          status: HttpStatus.CONFLICT,
          code: 'CONFLICT',
          message: '이미 존재하는 데이터입니다.',
        };
      case 'P2025': // Record not found
        return {
          status: HttpStatus.NOT_FOUND,
          code: 'NOT_FOUND',
          message: '데이터를 찾을 수 없습니다.',
        };
      case 'P2003': // Foreign key constraint
        return {
          status: HttpStatus.BAD_REQUEST,
          code: 'BAD_REQUEST',
          message: '참조하는 데이터가 존재하지 않습니다.',
        };
      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          code: 'DATABASE_ERROR',
          message: '데이터베이스 오류가 발생했습니다.',
        };
    }
  }
}
