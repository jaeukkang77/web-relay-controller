import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { createElement } from 'react'
import { tokenStore } from '../api/token'
import { getSessionRestorePromise } from './session-restore'

// ── 타입 ────────────────────────────────────────────────────

export interface AuthUser {
  id:       string
  role:     'admin' | 'user'
  regionId: number | null
}

interface AuthState {
  user:            AuthUser | null
  isAuthenticated: boolean
  isAdmin:         boolean
  initialized:     boolean  // 세션 복원 완료 여부
  setAuth:         (user: AuthUser, tokens: { accessToken: string; refreshToken: string }) => void
  clearAuth:       () => void
}

// ── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthState | null>(null)

// ── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]               = useState<AuthUser | null>(null)
  const [initialized, setInitialized] = useState(false)

  // ── 앱 시작 시 localStorage refresh token으로 세션 자동 복원 ──
  // 모듈 레벨 Promise 싱글톤 사용 → React StrictMode 이중 마운트 무관하게 1회만 실행
  useEffect(() => {
    getSessionRestorePromise().then(({ user: restoredUser }) => {
      if (restoredUser) setUser(restoredUser)
      setInitialized(true)
    })
  }, [])

  const setAuth = useCallback(
    (
      newUser: AuthUser,
      tokens:  { accessToken: string; refreshToken: string },
    ) => {
      tokenStore.set(tokens)
      setUser(newUser)
    },
    [],
  )

  const clearAuth = useCallback(() => {
    tokenStore.clear()
    setUser(null)
  }, [])

  const value: AuthState = {
    user,
    isAuthenticated: user !== null,
    isAdmin:         user?.role === 'admin',
    initialized,
    setAuth,
    clearAuth,
  }

  return createElement(AuthContext.Provider, { value }, children)
}

// ── Hook ─────────────────────────────────────────────────────

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
