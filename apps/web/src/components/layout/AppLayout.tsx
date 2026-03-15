import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '../../lib/auth/auth-store'
import { authApi } from '../../lib/api/auth.api'
import { tokenStore } from '../../lib/api/token'
import { useScheduleNotification, requestNotificationPermission } from '../../lib/hooks/useScheduleNotification'

// ── 아이콘 (24pt 기준 — 모바일 탭바 스펙) ───────────────────
function ZapIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function MapPinIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function CpuIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="7" width="10" height="10" rx="1" />
      <path d="M9 3v2M15 3v2M9 19v2M15 19v2M3 9h2M3 15h2M19 9h2M19 15h2" />
    </svg>
  )
}

function UsersIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function LogOutIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function LayoutDashboardIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  )
}

// ── 데스크톱 NavLink 스타일 ──────────────────────────────────
function desktopNavClass({ isActive }: { isActive: boolean }) {
  return [
    'flex items-center gap-3 rounded-md px-3 py-2.5 text-[15px] font-medium transition-colors',
    isActive
      ? 'bg-primary-light text-primary'
      : 'text-ink-2 hover:bg-canvas hover:text-ink',
  ].join(' ')
}

// ── 모바일 탭바 아이템 ───────────────────────────────────────
interface TabItemProps {
  to:    string
  icon:  React.ReactNode
  label: string
}
function TabItem({ to, icon, label }: TabItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex flex-1 flex-col items-center justify-center gap-1 transition-colors',
          isActive ? 'text-primary' : 'text-ink-2',
        ].join(' ')
      }
    >
      {icon}
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </NavLink>
  )
}

// ── 컴포넌트 ────────────────────────────────────────────────
export default function AppLayout() {
  const navigate                     = useNavigate()
  const { isAdmin, user, clearAuth } = useAuth()

  useScheduleNotification()

  // ── 알림 권한 상태 추적 ──────────────────────────────────────
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied',
  )
  useEffect(() => {
    if (!('Notification' in window)) return
    setNotifPerm(Notification.permission)
  }, [])

  async function handleRequestNotif() {
    const perm = await requestNotificationPermission()
    setNotifPerm(perm)
  }

  async function handleLogout() {
    const refreshToken = tokenStore.getRefresh()
    if (refreshToken) {
      try { await authApi.logout(refreshToken) } catch { /* 서버 오류 무시 */ }
    }
    clearAuth()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-full bg-canvas">

      {/* ════════════════════════════════════════════════════════
          데스크톱 사이드바 (md 이상에서만 표시)
      ════════════════════════════════════════════════════════ */}
      <aside
        className="hidden md:flex w-[220px] shrink-0 flex-col bg-surface"
        style={{ borderRight: '1px solid var(--color-line)' }}
      >
        {/* 브랜드 */}
        <div className="px-5 py-5" style={{ borderBottom: '1px solid var(--color-line)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
              <ZapIcon size={16} />
            </div>
            <span className="text-[17px] font-semibold tracking-tight text-ink">
              릴레이 컨트롤러
            </span>
          </div>
        </div>

        {/* 네비게이션 */}
        <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
          {/* 대시보드 — 모든 역할 */}
          <NavLink to="/dashboard" className={desktopNavClass}>
            <LayoutDashboardIcon size={17} />
            대시보드
          </NavLink>

          {/* 장치 제어/관리 — 모든 역할 */}
          <NavLink to="/devices" className={desktopNavClass}>
            <CpuIcon size={17} />
            {isAdmin ? '장치 관리' : '장치 제어'}
          </NavLink>

          {/* admin 전용 메뉴 */}
          {isAdmin && (
            <>
              <NavLink to="/regions" className={desktopNavClass}>
                <MapPinIcon size={17} />
                지역 관리
              </NavLink>
              <NavLink to="/users" className={desktopNavClass}>
                <UsersIcon size={17} />
                사용자 관리
              </NavLink>
            </>
          )}
        </nav>

        {/* 유저 정보 + 로그아웃 */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--color-line)' }}>
          <div className="mb-1.5 flex items-center gap-3 rounded-md px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                            bg-primary-light text-[13px] font-bold text-primary">
              {user?.id?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-semibold text-ink">{user?.id ?? '-'}</p>
              <p className="text-[11px] text-ink-2">
                {user?.role === 'admin' ? '관리자' : '사용자'}
              </p>
            </div>
          </div>

          {/* 알림 권한 버튼 — default 상태일 때만 노출 */}
          {'Notification' in window && notifPerm === 'default' && (
            <button
              onClick={handleRequestNotif}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 mb-0.5
                         text-[14px] font-medium text-amber-600 bg-amber-50
                         hover:bg-amber-100 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              알림 허용
            </button>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2.5
                       text-[15px] font-medium text-ink-2 transition-colors
                       hover:bg-canvas hover:text-danger"
          >
            <LogOutIcon size={16} />
            로그아웃
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════════════════════════════
          메인 콘텐츠
          - 모바일: 하단 탭바 높이(83px)만큼 패딩 확보
          - 데스크톱: 패딩 없음
      ════════════════════════════════════════════════════════ */}
      <main className="flex-1 overflow-y-auto">
        {/* 모바일: 상단 헤더 바 */}
        <header
          className="sticky top-0 z-10 flex items-center gap-3 px-4 h-14 bg-surface md:hidden"
          style={{ borderBottom: '1px solid var(--color-line)' }}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-white">
            <ZapIcon size={16} />
          </div>
          <span className="text-[17px] font-semibold tracking-tight text-ink">
            릴레이 컨트롤러
          </span>
          {/* 알림 권한 버튼 (모바일, default 상태일 때만) */}
          {'Notification' in window && notifPerm === 'default' && (
            <button
              onClick={handleRequestNotif}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-full
                         bg-amber-100 text-amber-600"
              title="알림 허용"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          )}

          {/* 유저 아바타 */}
          <div className={`flex h-8 w-8 items-center justify-center rounded-full
                          bg-primary-light text-[13px] font-bold text-primary
                          ${'Notification' in window && notifPerm === 'default' ? '' : 'ml-auto'}`}>
            {user?.id?.charAt(0).toUpperCase() ?? '?'}
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <div className="px-4 py-5 md:px-8 md:py-8 pb-[83px] md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* ════════════════════════════════════════════════════════
          모바일 하단 탭바 (md 미만에서만 표시)
          스펙: 높이 83pt, 아이콘 24pt, 레이블 10pt/500
               Surface 95% opacity + blur(20pt), 활성: Primary
      ════════════════════════════════════════════════════════ */}
      <nav
        className="fixed bottom-0 inset-x-0 z-20 flex md:hidden"
        style={{
          height: '83px',
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--color-line)',
        }}
      >
        {/* 대시보드 탭 — 모든 역할 */}
        <TabItem
          to="/dashboard"
          icon={<LayoutDashboardIcon size={24} />}
          label="대시보드"
        />

        {/* 장치 탭 — 모든 역할 */}
        <TabItem
          to="/devices"
          icon={<CpuIcon size={24} />}
          label={isAdmin ? '장치 관리' : '장치 제어'}
        />

        {/* admin 전용 탭 */}
        {isAdmin && (
          <>
            <TabItem
              to="/regions"
              icon={<MapPinIcon size={24} />}
              label="지역 관리"
            />
            <TabItem
              to="/users"
              icon={<UsersIcon size={24} />}
              label="사용자 관리"
            />
          </>
        )}

        {/* 로그아웃 탭 */}
        <button
          onClick={handleLogout}
          className="flex flex-1 flex-col items-center justify-center gap-1
                     text-ink-2 transition-colors active:text-danger"
        >
          <LogOutIcon size={24} />
          <span className="text-[10px] font-medium leading-none">로그아웃</span>
        </button>
      </nav>

    </div>
  )
}
