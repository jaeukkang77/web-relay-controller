import { Controller, Sse } from '@nestjs/common';
import { Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';
import { SseService } from '../../infra/sse/sse.service';

@Controller()
export class EventsController {
  constructor(private readonly sseService: SseService) {}

  /**
   * GET /events — SSE 스트림
   *
   * 스케줄 자동 제어 실행 시 'schedule' 타입 이벤트를 브로드캐스트.
   * JwtAuthGuard 전역 가드로 보호됨 (Authorization: Bearer {token} 필요).
   * 프론트엔드는 fetch() + ReadableStream으로 연결 (EventSource는 헤더 미지원).
   */
  @Sse('events')
  stream(): Observable<MessageEvent> {
    return this.sseService.stream();
  }
}
