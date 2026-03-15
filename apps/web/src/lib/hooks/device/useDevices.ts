import { useQuery } from '@tanstack/react-query'
import { deviceApi } from '../../api/device.api'

export const DEVICE_KEYS = {
  all:    ()           => ['devices'] as const,
  byRegion: (regionId: number) => ['devices', 'region', regionId] as const,
  detail: (regionId: number, id: number) => ['devices', 'region', regionId, id] as const,
}

export function useDevices(regionId: number) {
  return useQuery({
    queryKey: DEVICE_KEYS.byRegion(regionId),
    queryFn:  () => deviceApi.getDevices(regionId),
    enabled:  regionId > 0,
    // 릴레이 상태 갱신을 위해 30초마다 자동 refetch
    refetchInterval: 30_000,
  })
}
