import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  scheduleApi,
  type CreateSchedulePayload,
  type UpdateSchedulePayload,
} from '../../api/schedule.api'
import { SCHEDULE_KEYS } from './useSchedules'

export function useScheduleMutations(regionId: number, deviceId: number) {
  const qc = useQueryClient()

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: SCHEDULE_KEYS.byDevice(regionId, deviceId) })

  // ── 생성 ──────────────────────────────────────────────────
  const createSchedule = useMutation({
    mutationFn: (payload: CreateSchedulePayload) =>
      scheduleApi.createSchedule(regionId, deviceId, payload),
    onSuccess: invalidate,
  })

  // ── 수정 ──────────────────────────────────────────────────
  const updateSchedule = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSchedulePayload }) =>
      scheduleApi.updateSchedule(regionId, deviceId, id, payload),
    onSuccess: invalidate,
  })

  // ── 삭제 ──────────────────────────────────────────────────
  const deleteSchedule = useMutation({
    mutationFn: (id: number) =>
      scheduleApi.deleteSchedule(regionId, deviceId, id),
    onSuccess: invalidate,
  })

  // ── 활성화 토글 ────────────────────────────────────────────
  const toggleSchedule = useMutation({
    mutationFn: (id: number) =>
      scheduleApi.toggleSchedule(regionId, deviceId, id),
    onSuccess: invalidate,
  })

  return { createSchedule, updateSchedule, deleteSchedule, toggleSchedule }
}
