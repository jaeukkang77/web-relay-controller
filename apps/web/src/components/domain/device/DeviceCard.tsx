import type { DeviceDto } from '../../../lib/api/device.api'

interface DeviceCardProps {
  device:          DeviceDto
  isAdmin:         boolean
  relayLoading:    boolean
  syncLoading?:    boolean
  onToggleRelay:   (device: DeviceDto) => void
  onSync?:         (device: DeviceDto) => void   // 수동 상태 동기화
  onEdit:          (device: DeviceDto) => void
  onDelete:        (device: DeviceDto) => void
  onSchedule?:     (device: DeviceDto) => void   // 스케줄 페이지 이동
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={spinning ? 'animate-spin' : undefined}>
      <path d="M23 4v6h-6" />
      <path d="M1 20v-6h6" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  )
}

export default function DeviceCard({
  device,
  isAdmin,
  relayLoading,
  syncLoading,
  onToggleRelay,
  onSync,
  onEdit,
  onDelete,
  onSchedule,
}: DeviceCardProps) {
  return (
    <div className="bg-surface rounded-lg border border-line
                    shadow-[0_1px_4px_rgba(0,0,0,0.06)]
                    flex flex-col gap-0 overflow-hidden">

      {/* 상단: 이름 + 상태 배지 */}
      <div className="px-4 pt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[16px] font-semibold text-ink truncate">{device.name}</p>
          <p className="mt-0.5 text-[12px] text-ink-3">
            {device.ip}:{device.port} · R{device.address}
          </p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* 온라인 배지 */}
          <span
            className={`inline-flex items-center gap-1 px-[10px] py-[4px]
              rounded-sm text-[11px] font-semibold
              ${device.isOnline
                ? 'bg-green-50 text-success'
                : 'bg-canvas text-ink-3'
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full
              ${device.isOnline ? 'bg-success' : 'bg-ink-3'}`}
            />
            {device.isOnline ? '온라인' : '오프라인'}
          </span>
        </div>
      </div>

      {/* 구분선 */}
      <div className="mx-4 mt-3 mb-0 border-t border-line" />

      {/* 하단: ON/OFF 토글 + 액션 버튼 */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        {/* ON/OFF 토글 버튼 */}
        <button
          onClick={() => onToggleRelay(device)}
          disabled={relayLoading || !device.isOnline}
          className={`
            flex-1 h-[44px] rounded-full text-[15px] font-bold
            transition-all duration-200
            disabled:opacity-40 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
            ${device.isOn
              ? 'bg-success text-white shadow-[0_2px_8px_rgba(34,197,94,0.35)] hover:bg-green-600'
              : 'bg-canvas text-ink-2 border border-line hover:bg-line'
            }
          `}
          title={!device.isOnline ? '장치가 오프라인 상태입니다' : undefined}
        >
          {relayLoading ? (
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor"
                strokeWidth="3" strokeDasharray="30 60" />
            </svg>
          ) : (
            <>
              <span className={`w-2.5 h-2.5 rounded-full ${device.isOn ? 'bg-white' : 'bg-ink-3'}`} />
              {device.isOn ? 'ON' : 'OFF'}
            </>
          )}
        </button>

        {/* 액션 버튼 영역 */}
        <div className="flex gap-1">
          {/* 동기화 버튼 */}
          {onSync && (
            <button
              onClick={() => onSync(device)}
              disabled={syncLoading}
              title="하드웨어 상태 동기화"
              className="flex h-9 w-9 items-center justify-center rounded-md
                         text-ink-2 hover:bg-canvas hover:text-primary
                         disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshIcon spinning={syncLoading} />
            </button>
          )}

          {/* 스케줄 버튼 (전달된 경우에만 표시) */}
          {onSchedule && (
            <button
              onClick={() => onSchedule(device)}
              title="스케줄"
              className="flex h-9 w-9 items-center justify-center rounded-md
                         text-ink-2 hover:bg-canvas hover:text-primary transition-colors"
            >
              <CalendarIcon />
            </button>
          )}

          {/* admin 전용: 수정/삭제 */}
          {isAdmin && (
            <>
              <button onClick={() => onEdit(device)}
                title="수정"
                className="flex h-9 w-9 items-center justify-center rounded-md
                           text-ink-2 hover:bg-canvas hover:text-info transition-colors">
                <PencilIcon />
              </button>
              <button onClick={() => onDelete(device)}
                title="삭제"
                className="flex h-9 w-9 items-center justify-center rounded-md
                           text-ink-2 hover:bg-canvas hover:text-danger transition-colors">
                <TrashIcon />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── 스켈레톤 ────────────────────────────────────────────────
export function DeviceCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-line overflow-hidden animate-pulse">
      <div className="px-4 pt-4 flex justify-between">
        <div className="space-y-1.5">
          <div className="h-4 w-32 bg-canvas rounded" />
          <div className="h-3 w-24 bg-canvas rounded" />
        </div>
        <div className="h-6 w-16 bg-canvas rounded-sm" />
      </div>
      <div className="mx-4 mt-3 border-t border-line" />
      <div className="px-4 py-3">
        <div className="h-[44px] bg-canvas rounded-full" />
      </div>
    </div>
  )
}
