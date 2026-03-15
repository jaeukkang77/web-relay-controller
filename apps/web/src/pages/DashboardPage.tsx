import { useAuth } from '../lib/auth/auth-store'
import { useAllDevicesAdmin, useAllDevicesUser, type DeviceWithRegion } from '../lib/hooks/device/useAllDevices'

// ── 아이콘 ────────────────────────────────────────────────────
function BulbIcon({ on }: { on: boolean }) {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      className={on ? 'text-success' : 'text-ink-3'}>
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42
               M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  )
}

// ── 스탯 카드 ─────────────────────────────────────────────────
interface StatCardProps {
  value:    number
  label:    string
  color:    string   // tailwind text-* class
  bg:       string   // tailwind bg-* class
}
function StatCard({ value, label, color, bg }: StatCardProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1
                     rounded-xl px-6 py-4 min-w-[88px] ${bg}`}>
      <span className={`text-[28px] font-extrabold leading-none ${color}`}>{value}</span>
      <span className="text-[12px] font-medium text-ink-2">{label}</span>
    </div>
  )
}

// ── 대시보드 장치 카드 ────────────────────────────────────────
function DashboardDeviceCard({ device }: { device: DeviceWithRegion }) {
  const isOn     = device.isOn
  const isOnline = device.isOnline

  return (
    <div className={`
      rounded-xl border flex flex-col items-center gap-2 px-4 pt-5 pb-4
      transition-colors
      ${isOn
        ? 'bg-green-50 border-green-300 shadow-[0_2px_10px_rgba(34,197,94,0.18)]'
        : 'bg-surface border-line shadow-[0_1px_4px_rgba(0,0,0,0.06)]'
      }
    `}>
      {/* 전구 아이콘 */}
      <div className={`
        flex h-14 w-14 items-center justify-center rounded-full
        ${isOn ? 'bg-white/70' : 'bg-canvas'}
      `}>
        <BulbIcon on={isOn} />
      </div>

      {/* 장치명 */}
      <p className="text-[15px] font-bold text-ink text-center leading-tight">{device.name}</p>

      {/* 상태 텍스트 */}
      <p className={`text-[13px] font-bold ${isOn ? 'text-success' : 'text-ink-3'}`}>
        {isOn ? '켜짐' : '꺼짐'}
      </p>

      {/* 온/오프라인 배지 */}
      <span className={`
        inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-semibold
        ${isOnline
          ? isOn ? 'bg-white/60 text-success' : 'bg-green-50 text-success'
          : 'bg-canvas text-ink-3'
        }
      `}>
        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-success' : 'bg-ink-3'}`} />
        {isOnline ? '온라인' : '오프라인'}
      </span>

      {/* 지역명 */}
      {device.regionName && (
        <p className="text-[11px] text-ink-3 mt-0.5">{device.regionName}</p>
      )}
    </div>
  )
}

function DashboardDeviceCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-line animate-pulse
                    flex flex-col items-center gap-2 px-4 pt-5 pb-4">
      <div className="h-14 w-14 rounded-full bg-canvas" />
      <div className="h-4 w-24 rounded bg-canvas" />
      <div className="h-3 w-12 rounded bg-canvas" />
      <div className="h-5 w-16 rounded bg-canvas" />
      <div className="h-3 w-14 rounded bg-canvas" />
    </div>
  )
}

// ── 대시보드 본체 ─────────────────────────────────────────────
interface DashboardContentProps {
  devices:   DeviceWithRegion[]
  isLoading: boolean
}

function DashboardContent({ devices, isLoading }: DashboardContentProps) {
  const onCount    = devices.filter((d) => d.isOn).length
  const offCount   = devices.filter((d) => !d.isOn).length
  const totalCount = devices.length

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-[22px] font-extrabold tracking-tight text-ink">대시보드</h1>
        <p className="mt-1 text-[15px] text-ink-2">장치 전체 상태를 한눈에 확인합니다.</p>
      </div>

      {/* 요약 스탯 */}
      {isLoading ? (
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[76px] w-[88px] rounded-xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          <StatCard value={onCount}    label="켜짐"     color="text-success"    bg="bg-green-50" />
          <StatCard value={offCount}   label="꺼짐"     color="text-ink-2"      bg="bg-surface border border-line" />
          <StatCard value={totalCount} label="전체 장치" color="text-primary"    bg="bg-primary-light" />
        </div>
      )}

      {/* 구분선 */}
      <div className="border-t border-line" />

      {/* 장치 그리드 */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <DashboardDeviceCardSkeleton key={i} />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2
                        bg-surface rounded-xl border border-line border-dashed">
          <p className="text-[14px] text-ink-3">등록된 장치가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {devices.map((device) => (
            <DashboardDeviceCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Admin 뷰 ─────────────────────────────────────────────────
function AdminDashboard() {
  const { devices, isLoading } = useAllDevicesAdmin()
  return <DashboardContent devices={devices} isLoading={isLoading} />
}

// ── User 뷰 ──────────────────────────────────────────────────
function UserDashboard({ regionId }: { regionId: number }) {
  const { devices, isLoading } = useAllDevicesUser(regionId)
  return <DashboardContent devices={devices} isLoading={isLoading} />
}

// ── 메인 페이지 ──────────────────────────────────────────────
export default function DashboardPage() {
  const { isAdmin, user } = useAuth()

  if (isAdmin) return <AdminDashboard />

  if (!user?.regionId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <p className="text-[15px] text-ink-3">연결된 지역이 없습니다. 관리자에게 문의하세요.</p>
      </div>
    )
  }

  return <UserDashboard regionId={user.regionId} />
}
