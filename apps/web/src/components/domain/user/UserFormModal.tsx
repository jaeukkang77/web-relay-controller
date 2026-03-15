import { useEffect, useState } from 'react'
import Modal from '../../ui/Modal'
import type { UserDto, CreateUserPayload, UpdateUserPayload } from '../../../lib/api/user.api'
import type { Region } from '../../../lib/api/region.api'

interface UserFormModalProps {
  open:      boolean
  onClose:   () => void
  onSubmit:  (payload: CreateUserPayload | UpdateUserPayload) => Promise<void>
  regions:   Region[]
  user?:     UserDto        // 수정 시 전달, 없으면 생성 모드
  loading?:  boolean
}

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  regions,
  user,
  loading = false,
}: UserFormModalProps) {
  const isEdit = !!user

  // ── 폼 상태 ────────────────────────────────────────────────
  const [id,       setId]       = useState('')
  const [password, setPassword] = useState('')
  const [role,     setRole]     = useState<'admin' | 'user'>('user')
  const [regionId, setRegionId] = useState<number | ''>('')
  const [error,    setError]    = useState('')

  // 수정 모드 초기값 주입
  useEffect(() => {
    if (!open) return
    if (user) {
      setId(user.id)
      setPassword('')
      setRole(user.role)
      setRegionId(user.regionId ?? '')
    } else {
      setId('')
      setPassword('')
      setRole('user')
      setRegionId('')
    }
    setError('')
  }, [open, user])

  // role 변경 시 regionId 초기화
  const handleRoleChange = (newRole: 'admin' | 'user') => {
    setRole(newRole)
    if (newRole === 'admin') setRegionId('')
  }

  // ── 유효성 ─────────────────────────────────────────────────
  const canSubmit = (() => {
    if (!isEdit && !id.trim())       return false
    if (!isEdit && !password.trim()) return false
    if (role === 'user' && regionId === '') return false
    return true
  })()

  // ── 제출 ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit || loading) return
    setError('')

    try {
      if (isEdit) {
        const payload: UpdateUserPayload = {}
        if (password) payload.password = password
        if (role !== user!.role) payload.role = role
        const newRegionId = role === 'admin' ? null : (regionId === '' ? null : Number(regionId))
        if (newRegionId !== user!.regionId) payload.regionId = newRegionId
        await onSubmit(payload)
      } else {
        const payload: CreateUserPayload = {
          id:       id.trim(),
          password: password,
          role,
          regionId: role === 'admin' ? null : (regionId === '' ? null : Number(regionId)),
        }
        await onSubmit(payload)
      }
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '오류가 발생했습니다.'
      setError(msg)
    }
  }

  // ── 렌더 ───────────────────────────────────────────────────
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '사용자 수정' : '사용자 추가'}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-4 rounded-full text-[14px] font-medium
                       text-ink-2 bg-canvas hover:bg-line
                       transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            form="user-form"
            disabled={!canSubmit || loading}
            className="h-10 px-5 rounded-full text-[14px] font-semibold
                       text-white bg-primary hover:bg-primary-dark
                       transition-colors disabled:opacity-40
                       flex items-center gap-1.5"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor"
                  strokeWidth="3" strokeDasharray="30 60" />
              </svg>
            )}
            {isEdit ? '저장' : '추가'}
          </button>
        </div>
      }
    >
      <form id="user-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 아이디 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink">
            아이디 {!isEdit && <span className="text-danger">*</span>}
          </label>
          <input
            type="text"
            value={id}
            onChange={e => setId(e.target.value)}
            disabled={isEdit || loading}
            placeholder="영문/숫자/_ (3~30자)"
            className="h-[52px] rounded-md border border-line bg-surface
                       px-4 text-[15px] text-ink placeholder:text-ink-3
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light
                       disabled:bg-canvas disabled:text-ink-3"
          />
        </div>

        {/* 비밀번호 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink">
            비밀번호{isEdit && <span className="ml-1 text-[12px] font-normal text-ink-2">(미입력 시 변경 없음)</span>}
            {!isEdit && <span className="text-danger"> *</span>}
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
            placeholder={isEdit ? '변경하려면 입력' : '비밀번호 입력'}
            className="h-[52px] rounded-md border border-line bg-surface
                       px-4 text-[15px] text-ink placeholder:text-ink-3
                       focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light
                       disabled:bg-canvas disabled:text-ink-3"
          />
        </div>

        {/* 역할 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-semibold text-ink">
            역할 <span className="text-danger">*</span>
          </label>
          <div className="flex gap-3">
            {(['user', 'admin'] as const).map(r => (
              <label
                key={r}
                className={`flex flex-1 items-center justify-center gap-2 h-[52px]
                  rounded-md border cursor-pointer text-[15px] font-medium
                  transition-colors select-none
                  ${role === r
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-line bg-surface text-ink-2 hover:bg-canvas'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value={r}
                  checked={role === r}
                  onChange={() => handleRoleChange(r)}
                  disabled={loading}
                  className="sr-only"
                />
                {r === 'admin' ? '관리자' : '사용자'}
              </label>
            ))}
          </div>
        </div>

        {/* 지역 (role=user 일 때만) */}
        {role === 'user' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-ink">
              담당 지역 <span className="text-danger">*</span>
            </label>
            <select
              value={regionId}
              onChange={e => setRegionId(e.target.value === '' ? '' : Number(e.target.value))}
              disabled={loading}
              className="h-[52px] rounded-md border border-line bg-surface
                         px-4 text-[15px] text-ink
                         focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light
                         disabled:bg-canvas disabled:text-ink-3"
            >
              <option value="">지역 선택</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <p className="rounded-md bg-red-50 px-4 py-2.5 text-[13px] text-danger">
            {error}
          </p>
        )}
      </form>
    </Modal>
  )
}
