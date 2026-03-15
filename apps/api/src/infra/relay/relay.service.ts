import * as net from 'net';
import { Injectable, Logger } from '@nestjs/common';

/**
 * SG-3021TIL TCP 프로토콜 기반 릴레이 서비스
 * ─────────────────────────────────────────────────────────
 * 읽기 명령:  {relayNo}-   → 응답: 0(Close/OFF) | 1(Open/ON) | E(Error)
 * 쓰기 명령:  {relayNo}{0|1}.  → 응답: O(OK) | E(Error)
 *
 * 주의: 명령은 한 번에 하나씩만 처리 (복수 명령 불가)
 *
 * ── 온라인 판정 정책 ──────────────────────────────────────
 * TCP 연결 성공 여부로만 isOnline 판정.
 * 연결 성공 후 릴레이 읽기 실패는 isOnline: true + isOn: null 로 처리.
 */

const CONNECT_TIMEOUT = 5_000; // ms — TCP 핸드셰이크
const READ_TIMEOUT    = 3_000; // ms — 응답 대기

export type OnlineReadResult =
  | { isOnline: true;  isOn: boolean }
  | { isOnline: true;  isOn: null }   // TCP 연결 OK, 릴레이 읽기 실패
  | { isOnline: false; isOn: null };  // TCP 연결 실패

@Injectable()
export class RelayService {
  private readonly logger = new Logger(RelayService.name);

  // ── 공개 API ─────────────────────────────────────────────

  /** 릴레이 제어: {relayNo}{0|1}. → O(OK) */
  async setRelay(
    ip:       string,
    port:     number,
    _slaveId: number,  // TCP 프로토콜 미사용 (DB 스키마 호환 유지)
    relayNo:  number,
    value:    boolean,
  ): Promise<void> {
    const cmd = `${relayNo}${value ? '1' : '0'}.`;
    const res = await this.sendCommand(ip, port, cmd);
    if (res !== `${relayNo}O`) {
      throw new Error(`릴레이 제어 실패 (응답: ${res})`);
    }
  }

  /** 릴레이 상태 읽기: {relayNo}- → 0(Close) | 1(Open) */
  async readRelay(
    ip:       string,
    port:     number,
    _slaveId: number,
    relayNo:  number,
  ): Promise<boolean> {
    const cmd = `${relayNo}-`;
    const res = await this.sendCommand(ip, port, cmd);
    if (res === `${relayNo}1`) return true;
    if (res === `${relayNo}0`) return false;
    throw new Error(`릴레이 읽기 실패 (응답: ${res})`);
  }

  /**
   * 온라인 확인 + 릴레이 상태 읽기.
   *
   * 1단계: TCP 연결 시도 (isOnline 판정)
   *   - 실패 → { isOnline: false, isOn: null }
   *   - 성공 → isOnline: true 확정, 2단계로 진행
   *
   * 2단계: 릴레이 상태 읽기 (isOn 판정)
   *   - 성공 → { isOnline: true, isOn: boolean }
   *   - 실패 → { isOnline: true, isOn: null }  ← 오프라인 아님
   */
  async checkOnlineAndRead(
    ip:       string,
    port:     number,
    _slaveId: number,
    relayNo:  number,
  ): Promise<OnlineReadResult> {
    // ── 1단계: TCP 연결 가능 여부 ─────────────────────────
    try {
      await this.testConnection(ip, port);
    } catch {
      return { isOnline: false, isOn: null };
    }

    // ── 2단계: 릴레이 상태 읽기 ───────────────────────────
    try {
      const isOn = await this.readRelay(ip, port, _slaveId, relayNo);
      return { isOnline: true, isOn };
    } catch (err) {
      this.logger.warn(
        `릴레이 읽기 실패 (${ip}:${port} relay=${relayNo}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      return { isOnline: true, isOn: null };
    }
  }

  // ── 내부 헬퍼 ────────────────────────────────────────────

  /** TCP 소켓으로 명령 전송 후 응답 수신 */
  private sendCommand(ip: string, port: number, cmd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let response = '';
      let settled = false;

      const done = (err?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        if (err) reject(err);
        else resolve(response.trim());
      };

      const timer = setTimeout(
        () => done(new Error(`응답 타임아웃 (${READ_TIMEOUT}ms): ${ip}:${port}`)),
        READ_TIMEOUT,
      );

      socket.connect({ host: ip, port }, () => {
        socket.write(cmd);
      });

      socket.on('data', (chunk) => {
        response += chunk.toString();
        done();
      });

      socket.on('error', (err) => done(err));
      socket.on('close', () => {
        if (!settled) done(new Error('연결 종료 (응답 없음)'));
      });
    });
  }

  /** TCP 연결 가능 여부만 확인 (명령 미전송) */
  private testConnection(ip: string, port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();
      let settled = false;

      const done = (err?: Error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        socket.destroy();
        if (err) reject(err);
        else resolve();
      };

      const timer = setTimeout(
        () => done(new Error(`연결 타임아웃 (${CONNECT_TIMEOUT}ms): ${ip}:${port}`)),
        CONNECT_TIMEOUT,
      );

      socket.connect({ host: ip, port }, () => done());
      socket.on('error', (err) => done(err));
    });
  }
}
