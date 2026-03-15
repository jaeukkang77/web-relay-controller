import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { tokenStore } from '../api/token'
import { authApi } from '../api/auth.api'
import { DEVICE_KEYS } from './device/useDevices'

const BASE_URL        = import.meta.env.VITE_API_BASE_URL ?? '/api'
const RECONNECT_DELAY = 5_000  // ms
const TOKEN_RETRY_MAX = 2      // 토큰 갱신 재시도 횟수

interface ScheduleEventData {
  type:       string
  deviceId:   number
  deviceName: string
  action:     'on' | 'off'
  time:       string
}

function showNotification(event: ScheduleEventData): void {
  if (!('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const title = `릴레이 ${event.action === 'on' ? 'ON ▶' : 'OFF ■'} — ${event.deviceName}`
  const body  = `스케줄 자동 제어 (${event.time})`

  new Notification(title, {
    body,
    icon:     '/favicon.ico',
    tag:      `relay-schedule-${event.deviceId}`,
    renotify: true,  // 동일 tag라도 매번 팝업 표시
  })
}

/**
 * 스케줄 자동 실행 시 브라우저 푸시 알림 수신 + 장치 상태 자동 동기화.
 *
 * - GET /events (SSE) 연결 — Authorization 헤더 사용 (fetch 기반, EventSource 미사용)
 * - 서버가 20초 간격 하트비트(ping)를 전송하여 TCP 연결 유지
 * - 'schedule' 이벤트 수신 시: 브라우저 알림 표시 + 장치 쿼리 무효화 (isOn 자동 갱신)
 * - 401 수신 시: 토큰 갱신 후 재연결
 * - 연결 끊김 시 5초 후 자동 재연결
 * - 언마운트 시 연결 정리
 */
export function useScheduleNotification(): void {
  const qc = useQueryClient()

  useEffect(() => {
    let active       = true
    let abortCtrl:   AbortController | null      = null
    let reconnTimer: ReturnType<typeof setTimeout> | null = null

    async function connect(retryCount = 0) {
      if (!active) return

      const token = tokenStore.getAccess()
      if (!token) {
        // 토큰 없음 → 5초 후 재시도 (로그인 직후 타이밍 이슈 대응)
        scheduleReconnect()
        return
      }

      abortCtrl = new AbortController()

      try {
        const res = await fetch(`${BASE_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` },
          signal:  abortCtrl.signal,
        })

        // 401: 토큰 갱신 후 최대 TOKEN_RETRY_MAX 회 재시도
        if (res.status === 401 && retryCount < TOKEN_RETRY_MAX) {
          const rt = tokenStore.getRefresh()
          if (rt) {
            try {
              const result = await authApi.refresh(rt)
              tokenStore.set({ accessToken: result.accessToken, refreshToken: result.refreshToken })
            } catch { /* refresh 실패 → 일반 재연결 */ }
          }
          if (active) {
            reconnTimer = setTimeout(() => connect(retryCount + 1), 1_000)
          }
          return
        }

        if (!res.ok || !res.body) {
          scheduleReconnect()
          return
        }

        const reader  = res.body.getReader()
        const decoder = new TextDecoder()
        let   buffer  = ''

        while (active) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          // SSE 이벤트는 빈 줄(\n\n 또는 \r\n\r\n)로 구분됨
          const parts = buffer.split(/\r?\n\r?\n/)
          buffer = parts.pop() ?? ''

          for (const part of parts) {
            if (!part.trim()) continue  // 빈 파트 무시

            let eventType = ''
            let dataStr   = ''

            for (const line of part.split(/\r?\n/)) {
              if (line.startsWith('event: ')) eventType = line.slice(7).trim()
              if (line.startsWith('data: '))  dataStr   = line.slice(6).trim()
            }

            if (!dataStr) continue

            let parsed: ScheduleEventData | null = null
            try {
              parsed = JSON.parse(dataStr) as ScheduleEventData
            } catch { continue }

            // event: 필드 또는 data.type 중 하나로 'schedule' 판별 (NestJS 버전 호환)
            const isSchedule = eventType === 'schedule' || parsed.type === 'schedule'
            if (!isSchedule) continue  // ping 등 하트비트 무시

            showNotification(parsed)
            // 장치 상태 캐시 무효화 → isOn 자동 갱신
            qc.invalidateQueries({ queryKey: DEVICE_KEYS.all() })
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return
      }

      scheduleReconnect()
    }

    function scheduleReconnect() {
      if (!active) return
      reconnTimer = setTimeout(() => connect(0), RECONNECT_DELAY)
    }

    connect(0)

    return () => {
      active = false
      abortCtrl?.abort()
      if (reconnTimer) clearTimeout(reconnTimer)
    }
  }, [qc])
}

/**
 * 사용자 제스처 기반 알림 권한 요청.
 * 브라우저는 자동 requestPermission()을 차단하므로 반드시 클릭 이벤트에서 호출해야 한다.
 *
 * @returns 'granted' | 'denied' | 'default'
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  if (Notification.permission !== 'default') return Notification.permission
  return Notification.requestPermission()
}
