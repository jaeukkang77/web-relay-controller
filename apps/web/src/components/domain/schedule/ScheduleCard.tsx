import type { ScheduleDto } from '../../../lib/api/schedule.api'

interface ScheduleCardProps {
  schedule:    ScheduleDto
  onToggle:    (schedule: ScheduleDto) => void
  onEdit:      (schedule: ScheduleDto) => void
  onDelete:    (schedule: ScheduleDto) => void
  toggling?:   boolean
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

/** "YYYY-MM-DD" → "YYYY.MM.DD" */
function fmtDate(s: string) {
  return s.replace(/-/g, '.')
}

/** 오늘 날짜 이후인지 확인 ("YYYY-MM-DD" 비교) */
function isExpired(dateTo: string) {
  const today = new Date().toISOString().split('T')[0]
  return dateTo < today
}

export default function ScheduleCard({
  schedule,
  onToggle,
  onEdit,
  onDelete,
  toggling = false,
}: ScheduleCardProps) {
  const expired = isExpired(schedule.dateTo)
  const dimmed  = !schedule.enabled || expired

  return (
    <div className={`bg-surface rounded-lg border overflow-hidden
                     shadow-[0_1px_4px_rgba(0,0,0,0.06)] transition-opacity
                     ${dimmed ? 'opacity-60' : ''}
                     ${schedule.enabled ? 'border-line' : 'border-line border-dashed'}`}>

      <div className="px-4 py-3 flex items-start gap-3">

        {/* 활성 토글 */}
        <button
          onClick={() => onToggle(schedule)}
          disabled={toggling}
          title={schedule.enabled ? '비활성화' : '활성화'}
          className={`mt-0.5 shrink-0 w-9 h-5 rounded-full transition-colors relative
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${schedule.enabled ? 'bg-primary' : 'bg-line'}`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform
                        ${schedule.enabled ? 'translate-x-[0px]' : 'translate-x-[-18px]'}`}
          />
        </button>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          {/* 이름 */}
          {schedule.name && (
            <p className="text-[13px] font-semibold text-ink truncate mb-0.5">
              {schedule.name}
            </p>
          )}

          {/* 시각 표시 */}
          <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5">
            {schedule.onTime && (
              <span className="inline-flex items-center gap-1 text-[13px]">
                <span className="text-[10px] font-bold text-success px-1.5 py-0.5 bg-green-50 rounded">ON</span>
                <span className="font-mono text-ink">{schedule.onTime}</span>
              </span>
            )}
            {schedule.offTime && (
              <span className="inline-flex items-center gap-1 text-[13px]">
                <span className="text-[10px] font-bold text-danger px-1.5 py-0.5 bg-red-50 rounded">OFF</span>
                <span className="font-mono text-ink">{schedule.offTime}</span>
              </span>
            )}
          </div>

          {/* 날짜 범위 */}
          <p className={`mt-1 text-[11px] ${expired ? 'text-danger' : 'text-ink-3'}`}>
            {fmtDate(schedule.dateFrom)} ~ {fmtDate(schedule.dateTo)}
            {expired && <span className="ml-1 font-semibold">(만료)</span>}
          </p>
        </div>

        {/* 수정/삭제 버튼 */}
        <div className="flex gap-0.5 shrink-0">
          <button
            onClick={() => onEdit(schedule)}
            title="수정"
            className="flex h-8 w-8 items-center justify-center rounded-md
                       text-ink-2 hover:bg-canvas hover:text-info transition-colors"
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => onDelete(schedule)}
            title="삭제"
            className="flex h-8 w-8 items-center justify-center rounded-md
                       text-ink-2 hover:bg-canvas hover:text-danger transition-colors"
          >
            <TrashIcon />
          </button>
        </div>

      </div>
    </div>
  )
}

// ── 스켈레톤 ────────────────────────────────────────────────
export function ScheduleCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-line overflow-hidden animate-pulse">
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="mt-0.5 h-5 w-9 bg-canvas rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="flex gap-3">
            <div className="h-4 w-20 bg-canvas rounded" />
            <div className="h-4 w-20 bg-canvas rounded" />
          </div>
          <div className="h-3 w-32 bg-canvas rounded" />
        </div>
        <div className="flex gap-1">
          <div className="h-8 w-8 bg-canvas rounded-md" />
          <div className="h-8 w-8 bg-canvas rounded-md" />
        </div>
      </div>
    </div>
  )
}
