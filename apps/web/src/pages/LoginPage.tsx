import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../lib/auth/auth-store'
import { authApi } from '../lib/api/auth.api'
import { tokenStore, savedId } from '../lib/api/token'
import { ApiError } from '../lib/api/api-error'

// ── 에러 메시지 매핑 ────────────────────────────────────────
function resolveErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    switch (err.code) {
      case 'INVALID_CREDENTIALS':
        return '아이디 또는 비밀번호가 올바르지 않습니다.'
      case 'IP_BLOCKED':
        return '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
      default:
        return err.message
    }
  }
  return '로그인 중 오류가 발생했습니다.'
}

// ── 아이콘 ──────────────────────────────────────────────────
function ZapIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
    </svg>
  )
}

// ── 커스텀 체크박스 ──────────────────────────────────────────
interface CheckboxProps {
  id:       string
  checked:  boolean
  onChange: (checked: boolean) => void
  label:    string
  disabled?: boolean
}

function Checkbox({ id, checked, onChange, label, disabled }: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center gap-2 select-none
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={`w-[18px] h-[18px] rounded-[5px] border-2 transition-colors
            ${checked
              ? 'bg-primary border-primary'
              : 'bg-surface border-line'
            }`}
        >
          {checked && (
            <svg
              className="absolute inset-0 m-auto" width="10" height="10"
              viewBox="0 0 12 12" fill="none"
            >
              <path
                d="M2 6l3 3 5-5"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span className="text-[13px] text-ink-2">{label}</span>
    </label>
  )
}

// ── 컴포넌트 ────────────────────────────────────────────────
export default function LoginPage() {
  const navigate    = useNavigate()
  const { setAuth } = useAuth()

  const [id,        setId]        = useState('')
  const [password,  setPassword]  = useState('')
  const [saveId,    setSaveId]    = useState(false)
  const [keepLogin, setKeepLogin] = useState(false)
  const [error,     setError]     = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)

  // 저장된 아이디 복원
  useEffect(() => {
    const stored = savedId.get()
    if (stored) {
      setId(stored)
      setSaveId(true)
    }
  }, [])

  const canSubmit = id.trim().length > 0 && password.length > 0 && !loading

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setError(null)
    setLoading(true)

    try {
      const result = await authApi.login({ id: id.trim(), password })

      // 아이디 저장 처리
      if (saveId) {
        savedId.save(id.trim())
      } else {
        savedId.clear()
      }

      // 토큰 저장: "로그인 유지" 여부에 따라 저장 위치 분기
      setAuth(result.user, {
        accessToken:  result.accessToken,
        refreshToken: result.refreshToken,
      })
      if (keepLogin) {
        tokenStore.persist(result.refreshToken)        // localStorage (브라우저 재시작 후에도 유지)
      } else {
        tokenStore.persistSession(result.refreshToken) // sessionStorage (탭 닫으면 소멸)
      }

      navigate('/regions', { replace: true })
    } catch (err) {
      setError(resolveErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-[400px]">

        {/* 브랜드 헤더 */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white"
            style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.4)' }}
          >
            <ZapIcon />
          </div>
          <div className="text-center">
            <h1 className="text-[28px] font-extrabold tracking-tight text-ink">
              릴레이 컨트롤러
            </h1>
            <p className="mt-1 text-[15px] text-ink-2">
              계정에 로그인하세요
            </p>
          </div>
        </div>

        {/* 로그인 카드 */}
        <div
          className="rounded-lg bg-surface px-8 py-8"
          style={{ border: '1px solid #E5E5EA', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

            {/* 아이디 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="id" className="text-[13px] font-semibold text-ink">
                아이디
              </label>
              <input
                id="id"
                type="text"
                autoComplete="username"
                autoFocus
                value={id}
                onChange={(e) => setId(e.target.value)}
                disabled={loading}
                placeholder="아이디를 입력하세요"
                className="h-[52px] w-full rounded-md border border-line bg-surface px-4
                           text-[15px] text-ink placeholder:text-ink-3
                           outline-none transition-colors
                           focus:border-primary focus:ring-2 focus:ring-primary-light
                           disabled:bg-canvas disabled:text-ink-3"
              />
            </div>

            {/* 비밀번호 */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[13px] font-semibold text-ink">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="비밀번호를 입력하세요"
                className="h-[52px] w-full rounded-md border border-line bg-surface px-4
                           text-[15px] text-ink placeholder:text-ink-3
                           outline-none transition-colors
                           focus:border-primary focus:ring-2 focus:ring-primary-light
                           disabled:bg-canvas disabled:text-ink-3"
              />
            </div>

            {/* 체크박스 행 */}
            <div className="flex items-center justify-between">
              <Checkbox
                id="save-id"
                checked={saveId}
                onChange={setSaveId}
                label="아이디 저장"
                disabled={loading}
              />
              <Checkbox
                id="keep-login"
                checked={keepLogin}
                onChange={setKeepLogin}
                label="로그인 유지"
                disabled={loading}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div
                role="alert"
                className="rounded-md bg-red-50 px-4 py-3 text-[13px] font-medium text-danger"
              >
                {error}
              </div>
            )}

            {/* 로그인 버튼 */}
            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-1 flex h-[52px] w-full items-center justify-center gap-2
                         rounded-full bg-primary text-[16px] font-bold text-white
                         transition-colors hover:bg-primary-dark active:bg-primary-dark
                         disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <LoadingSpinner />
                  로그인 중...
                </>
              ) : (
                '로그인'
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}
