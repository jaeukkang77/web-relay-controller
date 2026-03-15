import { Injectable } from '@nestjs/common';
import { MessageEvent } from '@nestjs/common';
import { interval, merge, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

/** SSE 하트비트 주기 (ms) — TCP 타임아웃(보통 30~60s)보다 짧게 설정 */
const HEARTBEAT_INTERVAL_MS = 20_000;

@Injectable()
export class SseService {
  private readonly subject = new Subject<MessageEvent>();

  /** 연결된 모든 SSE 클라이언트에 이벤트 브로드캐스트 */
  emit(type: string, data: object): void {
    // type 필드를 data 안에도 포함 → 클라이언트 파싱 호환성 확보
    this.subject.next({ type, data: { type, ...data } });
  }

  /**
   * @Sse 컨트롤러에서 구독할 Observable 반환
   *
   * 실제 이벤트 스트림과 20초 주기 하트비트를 병합하여 반환.
   * 하트비트는 TCP 연결이 유휴 상태에서 끊기는 것을 방지한다.
   */
  stream(): Observable<MessageEvent> {
    const heartbeat$ = interval(HEARTBEAT_INTERVAL_MS).pipe(
      map(() => ({ type: 'ping', data: '' }) as MessageEvent),
    );
    return merge(this.subject.asObservable(), heartbeat$);
  }
}
