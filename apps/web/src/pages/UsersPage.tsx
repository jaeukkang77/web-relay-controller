import { useState } from 'react'
import { useAuth } from '../lib/auth/auth-store'
import { useUsers } from '../lib/hooks/user/useUsers'
import { useUserMutations } from '../lib/hooks/user/useUserMutations'
import { useRegions } from '../lib/hooks/region/useRegions'
import type { UserDto, CreateUserPayload, UpdateUserPayload } from '../lib/api/user.api'
import UserFormModal from '../components/domain/user/UserFormModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

// ── 아이콘 ──────────────────────────────────────────────────
function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

// ── 역할 배지 ────────────────────────────────────────────────
function RoleBadge({ role }: { role: 'admin' | 'user' }) {
  return role === 'admin' ? (
    <span className="inline-flex items-center px-[10px] py-[4px] rounded-sm
                     text-[11px] font-semibold bg-primary-light text-primary">
      관리자
    </span>
  ) : (
    <span className="inline-flex items-center px-[10px] py-[4px] rounded-sm
                     text-[11px] font-semibold bg-canvas text-ink-2">
      사용자
    </span>
  )
}

// ── 날짜 포맷 ────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  })
}

// ── 컴포넌트 ────────────────────────────────────────────────
export default function UsersPage() {
  const { user: me }   = useAuth()
  const { data, isLoading, isError } = useUsers({ limit: 100 })
  const { data: regionsData }        = useRegions({ limit: 100 })
  const regions = regionsData?.regions ?? []

  const { createUser, updateUser, deleteUser } = useUserMutations()

  // ── 모달 상태 ──────────────────────────────────────────────
  const [formOpen,     setFormOpen]     = useState(false)
  const [editTarget,   setEditTarget]   = useState<UserDto | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<UserDto | null>(null)

  // ── 생성/수정 제출 ─────────────────────────────────────────
  async function handleSubmit(payload: CreateUserPayload | UpdateUserPayload) {
    if (editTarget) {
      await updateUser.mutateAsync({ id: editTarget.id, payload: payload as UpdateUserPayload })
    } else {
      await createUser.mutateAsync(payload as CreateUserPayload)
    }
  }

  function openCreate() {
    setEditTarget(undefined)
    setFormOpen(true)
  }

  function openEdit(u: UserDto) {
    setEditTarget(u)
    setFormOpen(true)
  }

  // ── 삭제 ──────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return
    await deleteUser.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  const users = data?.users ?? []
  const total = data?.total ?? 0

  const regionName = (regionId: number | null) => {
    if (!regionId) return '-'
    return regions.find(r => r.id === regionId)?.name ?? `#${regionId}`
  }

  // ── 렌더 ──────────────────────────────────────────────────
  return (
    <div>
      {/* 헤더 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">
            사용자 관리
          </h1>
          <p className="mt-1 text-[15px] text-ink-2">
            계정을 생성하고 역할을 관리합니다.{' '}
            <span className="text-[13px] text-ink-3">({total}명)</span>
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex shrink-0 items-center gap-2 h-[44px] px-4
                     rounded-full bg-primary hover:bg-primary-dark text-white
                     text-[14px] font-semibold transition-colors"
        >
          <PlusIcon />
          <span className="hidden sm:block">사용자 추가</span>
        </button>
      </div>

      {/* 본문 */}
      <div className="mt-6">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-[15px] text-ink-3">
            불러오는 중…
          </div>
        ) : isError ? (
          <div className="flex h-40 items-center justify-center text-[15px] text-danger">
            데이터를 불러올 수 없습니다.
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-40 items-center justify-center
                          rounded-lg border border-line bg-surface
                          text-[15px] text-ink-3">
            등록된 사용자가 없습니다.
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-line bg-surface
                          shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
            {/* 데스크톱 테이블 헤더 */}
            <div className="hidden md:grid grid-cols-[1fr_100px_140px_120px_88px]
                            px-5 py-3 bg-canvas border-b border-line
                            text-[12px] font-semibold text-ink-2 uppercase tracking-wide">
              <span>아이디</span>
              <span>역할</span>
              <span>담당 지역</span>
              <span>생성일</span>
              <span />
            </div>

            <ul>
              {users.map((u, i) => (
                <li
                  key={u.id}
                  className={i < users.length - 1 ? 'border-b border-line' : ''}
                >
                  {/* 데스크톱 행 */}
                  <div className="hidden md:grid grid-cols-[1fr_100px_140px_120px_88px]
                                  items-center px-5 py-3.5 hover:bg-canvas transition-colors">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center
                                      rounded-full bg-primary-light
                                      text-[13px] font-bold text-primary">
                        {u.id.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate text-[15px] font-medium text-ink">{u.id}</span>
                      {u.id === me?.id && (
                        <span className="shrink-0 text-[11px] text-ink-3">(나)</span>
                      )}
                    </div>

                    <RoleBadge role={u.role} />

                    <span className="text-[14px] text-ink-2 truncate">
                      {regionName(u.regionId)}
                    </span>

                    <span className="text-[13px] text-ink-3">
                      {formatDate(u.createdAt)}
                    </span>

                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(u)}
                        title="수정"
                        className="flex h-8 w-8 items-center justify-center rounded-md
                                   text-ink-2 hover:bg-canvas hover:text-info transition-colors"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.id === me?.id}
                        title={u.id === me?.id ? '자기 자신은 삭제할 수 없습니다' : '삭제'}
                        className="flex h-8 w-8 items-center justify-center rounded-md
                                   text-ink-2 hover:bg-canvas hover:text-danger transition-colors
                                   disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>

                  {/* 모바일 행 */}
                  <div className="flex md:hidden items-center gap-3 px-4 py-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center
                                    rounded-full bg-primary-light
                                    text-[13px] font-bold text-primary">
                      {u.id.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[15px] font-medium text-ink truncate">{u.id}</span>
                        {u.id === me?.id && (
                          <span className="shrink-0 text-[11px] text-ink-3">(나)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <RoleBadge role={u.role} />
                        {u.regionId && (
                          <span className="text-[12px] text-ink-2">{regionName(u.regionId)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-0.5">
                      <button
                        onClick={() => openEdit(u)}
                        className="flex h-8 w-8 items-center justify-center rounded-md
                                   text-ink-2 active:bg-canvas active:text-info"
                      >
                        <PencilIcon />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        disabled={u.id === me?.id}
                        className="flex h-8 w-8 items-center justify-center rounded-md
                                   text-ink-2 active:bg-canvas active:text-danger
                                   disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 생성/수정 모달 */}
      <UserFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        regions={regions}
        user={editTarget}
        loading={createUser.isPending || updateUser.isPending}
      />

      {/* 삭제 확인 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="사용자 삭제"
        description={`'${deleteTarget?.id}' 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        loading={deleteUser.isPending}
        confirmLabel="삭제"
      />
    </div>
  )
}
