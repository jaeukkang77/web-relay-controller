import { fetcher } from './fetcher'
import type { AuthUser } from '../auth/auth-store'

export interface LoginPayload {
  id:       string
  password: string
}

export interface LoginResponse {
  accessToken:  string
  refreshToken: string
  user:         AuthUser
}

export interface TokenPair {
  accessToken:  string
  refreshToken: string
}

export const authApi = {
  /** 로그인 */
  login: (payload: LoginPayload) =>
    fetcher.post<LoginResponse>('/auth/login', payload, { auth: false }),

  /** Access Token 갱신 */
  refresh: (refreshToken: string) =>
    fetcher.post<TokenPair>('/auth/refresh', { refreshToken }, { auth: false }),

  /** 로그아웃 */
  logout: (refreshToken: string) =>
    fetcher.post<void>('/auth/logout', { refreshToken }),

  /** 내 정보 */
  me: () => fetcher.get<AuthUser>('/auth/me'),
}
