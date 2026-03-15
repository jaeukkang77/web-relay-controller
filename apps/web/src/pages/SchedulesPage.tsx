import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { useDevices } from '../lib/hooks/device/useDevices'
import { useSchedules } from '../lib/hooks/schedule/useSchedules'
import { useScheduleMutations } from '../lib/hooks/schedule/useScheduleMutations'
import ScheduleCard, { ScheduleCardSkeleton } from '../components/domain/schedule/ScheduleCard'
import ScheduleFormModal from '../components/domain/schedule/ScheduleFormModal'
import type { ScheduleDto, CreateSchedulePayload, UpdateSchedulePayload } from '../lib/api/schedule.api'

export default function SchedulesPage() {
  const { regionId, deviceId } = useParams<{ regionId: string; deviceId: string }>()
  const rId = Number(regionId)
  const dId = Number(deviceId)

  // ── 데이터 ─────────────────────────────────────────────────
  const { data: devices } = useDevices(rId)
  const device = devices?.find(d => d.id === dId)

  const { data: schedules, isLoading } = useSchedules(rId, dId)

  const { createSchedule, updateSchedule, deleteSchedule, toggleSchedule } =
    useScheduleMutations(rId, dId)

  // ── 모달 상태 ──────────────────────────────────────────────
  const [formOpen,   setFormOpen]   = useState(false)
  const [editTarget, setEditTarget] = useState<ScheduleDto | null>(null)

  // ── 핸들러 ────────────────────────────────────────────────
  const handleAdd = () => {
    setEditTarget(null)
    setFormOpen(true)
  }

  const handleEdit = (s: ScheduleDto) => {
    setEditTarget(s)
    setFormOpen(true)
  }

  const handleDelete = (s: ScheduleDto) => {
    const label = s.name ? `"${s.name}" ` : ''
    if (!confirm(`${label}스케줄을 삭제하시겠습니까?`)) return
    deleteSchedule.mutate(s.id)
  }

  const handleToggle = (s: ScheduleDto) => {
    toggleSchedule.mutate(s.id)
  }

  const handleFormSubmit = async (payload: CreateSchedulePayload | UpdateSchedulePayload) => {
    if (editTarget) {
      await new Promise<void>((resolve, reject) =>
        updateSchedule.mutate(
          { id: editTarget.id, payload: payload as UpdateSchedulePayload },
          { onSuccess: () => { setFormOpen(false); resolve() }, onError: reject },
        ),
      )
    } else {
      await new Promise<void>((resolve, reject) =>
        createSchedule.mutate(payload as CreateSchedulePayload, {
          onSuccess: () => { setFormOpen(false); resolve() },
          onError:   reject,
        }),
      )
    }
  }

  return (
    <div className="flex flex-col gap-6">

      {/* 뒤로가기 */}
      <Link
        to="/devices"
        className="inline-flex items-center gap-1.5 text-[14px] text-ink-2 hover:text-primary transition-colors w-fit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19l-7-7 7-7"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        장치 목록
      </Link>

      {/* 헤더 */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">스케줄 관리</h1>
          {device ? (
            <p className="mt-1 text-[14px] text-ink-2">
              <span className="font-semibold">{device.name}</span>
              <span className="mx-1.5 text-ink-3">·</span>
              <span className="font-mono text-ink-3 text-[12px]">{device.ip}:{device.port}</span>
            </p>
          ) : (
            <p className="mt-1 text-[14px] text-ink-3">장치 #{dId}</p>
          )}
        </div>

        <button
          onClick={handleAdd}
          className="shrink-0 inline-flex items-center gap-1.5 px-4 h-[44px] rounded-full
                     bg-primary text-white text-[14px] font-semibold
                     hover:bg-primary-dark transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          스케줄 추가
        </button>
      </div>

      {/* 스케줄 목록 */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => <ScheduleCardSkeleton key={i} />)}
        </div>
      ) : !schedules || schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2
                        bg-surface rounded-lg border border-line">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-ink-3">
            <rect x="3" y="4" width="18" height="18" rx="2"
              stroke="currentColor" strokeWidth="1.5" />
            <path d="M16 2v4M8 2v4M3 10h18"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-[14px] text-ink-3">등록된 스케줄이 없습니다.</p>
          <p className="text-[12px] text-ink-3">스케줄을 추가하면 자동으로 릴레이를 제어합니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {schedules.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onToggle={handleToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              toggling={toggleSchedule.isPending && toggleSchedule.variables === s.id}
            />
          ))}
        </div>
      )}

      {/* 스케줄 추가/수정 모달 */}
      <ScheduleFormModal
        open={formOpen}
        schedule={editTarget ?? undefined}
        loading={createSchedule.isPending || updateSchedule.isPending}
        onSubmit={handleFormSubmit}
        onClose={() => setFormOpen(false)}
      />

    </div>
  )
}
