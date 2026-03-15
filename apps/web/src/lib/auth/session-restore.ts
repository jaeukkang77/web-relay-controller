/**
 * 앱 시작 시 localStorage의 refresh token으로 세션을 자동 복원한다.
 *
 * ── 왜 모듈 레벨 Promise 싱글톤인가? ──────────────────────────
 * React 18 StrictMode는 컴포넌트를 mount → unmount → remount 한다.
 * useRef/useState 등 React 훅은 이 사이클에서 리셋되어
 * useEffect가 두 번 실행될 때 /auth/refresh 중복 호출이 발생한다.
 *
 * 모듈 레벨 Promise는 React 라이프사이클과 무관하게 단 한 번만 생성된다.
 * AuthProvider가 몇 번 remount되더라도 같은 Promise를 반환하므로
 * refresh API는 정확히 1회만 호출된다.
 */

import { tokenStore } from '../api/token'
import { authApi }    from '../api/auth.api'
import type { AuthUser } from './auth-store'

export interface RestoredSession {
  user:        AuthUser | null
  initialized: true
}

let _promise: Promise<RestoredSession> | null = null

/** 세션 복원 Promise (최초 1회 생성, 이후 동일 Promise 반환) */
export function getSessionRestorePromise(): Promise<RestoredSession> {
  if (!_promise) {
    _promise = restoreSession()
  }
  return _promise
}

async function restoreSession(): Promise<RestoredSession> {
  const rt = tokenStore.getRefresh()
  if (!rt) return { user: null, initialized: true }

  try {
    const { accessToken, refreshToken: newRt } = await authApi.refresh(rt)
    tokenStore.set({ accessToken, refreshToken: newRt })
    const user = await authApi.me()
    return { user, initialized: true }
  } catch {
    tokenStore.clear()
    return { user: null, initialized: true }
  }
}
