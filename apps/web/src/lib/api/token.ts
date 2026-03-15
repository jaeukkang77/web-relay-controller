/**
 * 토큰 저장소
 *
 * Access Token  — 보안상 localStorage 금지, 모듈 변수에만 보관
 * Refresh Token — 저장 위치는 로그인 방식에 따라 결정
 *   · 기본 로그인         → sessionStorage (새로고침 OK, 탭 닫으면 소멸)
 *   · "로그인 유지" 선택  → localStorage   (브라우저 재시작 후에도 유지)
 */

const STORAGE_KEY_REFRESH  = 'rrctrl_rt'
const STORAGE_KEY_SAVED_ID = 'rrctrl_id'

// ── 토큰 ─────────────────────────────────────────────────────
let accessToken:  string | null = null
// 앱 시작 시 sessionStorage → localStorage 순서로 복원 (둘 중 하나에 존재)
let refreshToken: string | null =
  sessionStorage.getItem(STORAGE_KEY_REFRESH) ??
  localStorage.getItem(STORAGE_KEY_REFRESH)

export const tokenStore = {
  getAccess:  () => accessToken,
  getRefresh: () => refreshToken,

  /** 토큰 저장. Token Rotation 시 기존 저장 위치에 맞게 자동 갱신 */
  set: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken  = tokens.accessToken
    refreshToken = tokens.refreshToken
    if (localStorage.getItem(STORAGE_KEY_REFRESH)) {
      localStorage.setItem(STORAGE_KEY_REFRESH, tokens.refreshToken)
    } else if (sessionStorage.getItem(STORAGE_KEY_REFRESH)) {
      sessionStorage.setItem(STORAGE_KEY_REFRESH, tokens.refreshToken)
    }
  },

  /** 기본 로그인: sessionStorage에 저장 (탭 세션 동안 유지) */
  persistSession: (rt: string) => {
    sessionStorage.setItem(STORAGE_KEY_REFRESH, rt)
  },

  /** "로그인 유지" 선택 시: localStorage에 영속화 */
  persist: (rt: string) => {
    sessionStorage.removeItem(STORAGE_KEY_REFRESH)
    localStorage.setItem(STORAGE_KEY_REFRESH, rt)
  },

  clear: () => {
    accessToken  = null
    refreshToken = null
    sessionStorage.removeItem(STORAGE_KEY_REFRESH)
    localStorage.removeItem(STORAGE_KEY_REFRESH)
  },
}

// ── 아이디 저장 ───────────────────────────────────────────────
export const savedId = {
  get:   ()         => localStorage.getItem(STORAGE_KEY_SAVED_ID),
  save:  (id: string) => localStorage.setItem(STORAGE_KEY_SAVED_ID, id),
  clear: ()         => localStorage.removeItem(STORAGE_KEY_SAVED_ID),
}
