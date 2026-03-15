import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 모든 성공 응답을 공통 포맷으로 감싸는 인터셉터.
 *
 * 컨트롤러 반환값 → { success: true, data: <반환값> }
 * 컨트롤러가 undefined/null 반환 시 → { success: true }
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => {
        if (data === undefined || data === null) {
          return { success: true };
        }
        return { success: true, data };
      }),
    );
  }
}
