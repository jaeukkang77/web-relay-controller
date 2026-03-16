import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  SetMetadata,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** SSE 등 RAW 응답이 필요한 핸들러에 적용 — ResponseInterceptor 래핑을 건너뜀 */
export const RAW_RESPONSE_KEY = 'RAW_RESPONSE';
export const RawResponse = () => SetMetadata(RAW_RESPONSE_KEY, true);

/**
 * 모든 성공 응답을 공통 포맷으로 감싸는 인터셉터.
 *
 * 컨트롤러 반환값 → { success: true, data: <반환값> }
 * 컨트롤러가 undefined/null 반환 시 → { success: true }
 *
 * @RawResponse() 데코레이터가 붙은 핸들러는 래핑하지 않음 (SSE 등)
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isRaw = Reflect.getMetadata(RAW_RESPONSE_KEY, context.getHandler());
    if (isRaw) return next.handle();

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
