import { useEffect, useState } from 'react'
import Modal from '../../ui/Modal'
import type { ScheduleDto, CreateSchedulePayload, UpdateSchedulePayload } from '../../../lib/api/schedule.api'

interface ScheduleFormModalProps {
  open:        boolean
  onClose:     () => void
  onSubmit:    (payload: CreateSchedulePayload | UpdateSchedulePayload) => Promise<void>
  schedule?:   ScheduleDto   // undefined = 생성 모드
  loading?:    boolean
}

/** 오늘 날짜를 "YYYY-MM-DD" 형태로 */
function today() {
  return new Date().toISOString().split('T')[0]
}

/** 30일 후 날짜를 "YYYY-MM-DD" 형태로 */
function in30Days() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().split('T')[0]
}

export default function ScheduleFormModal({
  open,
  onClose,
  onSubmit,
  schedule,
  loading = false,
}: ScheduleFormModalProps) {
  const isEdit = !!schedule

  const [name,     setName]     = useState('')
  const [useOn,    setUseOn]    = useState(false)
  const [onTime,   setOnTime]   = useState('08:00')
  const [useOff,   setUseOff]   = useState(false)
  const [offTime,  setOffTime]  = useState('18:00')
  const [dateFrom, setDateFrom] = useState(today())
  const [dateTo,   setDateTo]   = useState(in30Days())
  const [error,    setError]    = useState('')

  // 모달 열릴 때 초기값 세팅
  useEffect(() => {
    if (!open) return
    if (schedule) {
      setName(schedule.name ?? '')
      setUseOn(!!schedule.onTime)
      setOnTime(schedule.onTime ?? '08:00')
      setUseOff(!!schedule.offTime)
      setOffTime(schedule.offTime ?? '18:00')
      setDateFrom(schedule.dateFrom)
      setDateTo(schedule.dateTo)
    } else {
      setName('')
      setUseOn(false)
      setOnTime('08:00')
      setUseOff(false)
      setOffTime('18:00')
      setDateFrom(today())
      setDateTo(in30Days())
    }
    setError('')
  }, [open, schedule])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!useOn && !useOff) {
      setError('ON 시각 또는 OFF 시각 중 하나 이상을 입력해 주세요.')
      return
    }
    if (dateFrom > dateTo) {
      setError('시작일이 종료일보다 늦을 수 없습니다.')
      return
    }

    const payload: CreateSchedulePayload | UpdateSchedulePayload = {
      name:     name.trim() || undefined,
      onTime:   useOn  ? onTime  : (isEdit ? null : undefined),
      offTime:  useOff ? offTime : (isEdit ? null : undefined),
      dateFrom,
      dateTo,
    }

    try {
      await onSubmit(payload)
    } catch {
      setError('저장 중 오류가 발생했습니다.')
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? '스케줄 수정' : '스케줄 추가'}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="h-10 px-4 rounded-lg border border-line text-[14px] font-medium
                       text-ink-2 hover:bg-canvas transition-colors disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="submit"
            form="schedule-form"
            disabled={loading}
            className="h-10 px-5 rounded-lg bg-primary text-white text-[14px] font-semibold
                       hover:bg-primary-dark transition-colors disabled:opacity-50
                       flex items-center gap-2"
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
      <form id="schedule-form" onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* 이름 (선택) */}
        <div>
          <label className="block text-[13px] font-semibold text-ink mb-1.5">
            스케줄 이름 <span className="text-ink-3 font-normal">(선택)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={50}
            placeholder="예: 낮 시간 자동 ON/OFF"
            className="w-full h-10 px-3 rounded-lg border border-line bg-canvas
                       text-[14px] text-ink placeholder:text-ink-3
                       focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* ON 시각 */}
        <div className="rounded-lg border border-line bg-canvas/50 p-3 flex flex-col gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useOn}
              onChange={e => setUseOn(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-[13px] font-semibold text-ink">ON 시각 설정</span>
            <span className="ml-auto text-[10px] font-bold text-success px-1.5 py-0.5 bg-green-50 rounded">ON</span>
          </label>
          {useOn && (
            <input
              type="time"
              value={onTime}
              onChange={e => setOnTime(e.target.value)}
              required={useOn}
              className="w-full h-10 px-3 rounded-lg border border-line bg-white
                         text-[14px] text-ink font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          )}
        </div>

        {/* OFF 시각 */}
        <div className="rounded-lg border border-line bg-canvas/50 p-3 flex flex-col gap-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={useOff}
              onChange={e => setUseOff(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-[13px] font-semibold text-ink">OFF 시각 설정</span>
            <span className="ml-auto text-[10px] font-bold text-danger px-1.5 py-0.5 bg-red-50 rounded">OFF</span>
          </label>
          {useOff && (
            <input
              type="time"
              value={offTime}
              onChange={e => setOffTime(e.target.value)}
              required={useOff}
              className="w-full h-10 px-3 rounded-lg border border-line bg-white
                         text-[14px] text-ink font-mono
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          )}
        </div>

        {/* 날짜 범위 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">시작일</label>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg border border-line bg-canvas
                         text-[14px] text-ink
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-ink mb-1.5">종료일</label>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              required
              min={dateFrom}
              className="w-full h-10 px-3 rounded-lg border border-line bg-canvas
                         text-[14px] text-ink
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* 에러 */}
        {error && (
          <p className="text-[13px] text-danger font-medium">{error}</p>
        )}

      </form>
    </Modal>
  )
}
