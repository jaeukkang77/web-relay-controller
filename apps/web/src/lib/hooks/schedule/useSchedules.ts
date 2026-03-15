import { useQuery } from '@tanstack/react-query'
import { scheduleApi } from '../../api/schedule.api'

export const SCHEDULE_KEYS = {
  all:      () => ['schedules'] as const,
  byDevice: (regionId: number, deviceId: number) =>
    ['schedules', 'device', regionId, deviceId] as const,
}

export function useSchedules(regionId: number, deviceId: number) {
  return useQuery({
    queryKey: SCHEDULE_KEYS.byDevice(regionId, deviceId),
    queryFn:  () => scheduleApi.getSchedules(regionId, deviceId),
    enabled:  regionId > 0 && deviceId > 0,
  })
}
