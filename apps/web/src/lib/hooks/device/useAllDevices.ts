import { useQueries, useQuery } from '@tanstack/react-query'
import { deviceApi, type DeviceDto } from '../../api/device.api'
import { regionApi, type Region } from '../../api/region.api'
import { DEVICE_KEYS } from './useDevices'

export interface DeviceWithRegion extends DeviceDto {
  regionName:      string
  regionImagePath: string | null
}

// ── 관리자: 전체 지역 × 전체 장치 ─────────────────────────────
export function useAllDevicesAdmin(): {
  devices:   DeviceWithRegion[]
  isLoading: boolean
} {
  const { data: regionData, isLoading: regionsLoading } = useQuery({
    queryKey: ['regions'],
    queryFn:  () => regionApi.list({ limit: 200 }),
  })
  const regions: Region[] = regionData?.regions ?? []

  const deviceQueries = useQueries({
    queries: regions.map((r) => ({
      queryKey: DEVICE_KEYS.byRegion(r.id),
      queryFn:  () => deviceApi.getDevices(r.id),
      enabled:  regions.length > 0,
      refetchInterval: 30_000,
    })),
  })

  const isLoading = regionsLoading || deviceQueries.some((q) => q.isLoading)

  const devices: DeviceWithRegion[] = deviceQueries.flatMap((q, i) => {
    if (!q.data) return []
    const r = regions[i]
    return q.data.map((d) => ({
      ...d,
      regionName:      r?.name      ?? '',
      regionImagePath: r?.imagePath ?? null,
    }))
  })

  return { devices, isLoading }
}

// ── 일반 사용자: 자기 지역 장치만 ─────────────────────────────
export function useAllDevicesUser(regionId: number): {
  devices:   DeviceWithRegion[]
  isLoading: boolean
} {
  const { data: region, isLoading: regionLoading } = useQuery({
    queryKey: ['region', regionId],
    queryFn:  () => regionApi.detail(regionId),
    enabled:  regionId > 0,
  })

  const { data: deviceList, isLoading: devicesLoading } = useQuery({
    queryKey:        DEVICE_KEYS.byRegion(regionId),
    queryFn:         () => deviceApi.getDevices(regionId),
    enabled:         regionId > 0,
    refetchInterval: 30_000,
  })

  const isLoading = regionLoading || devicesLoading

  const devices: DeviceWithRegion[] = (deviceList ?? []).map((d) => ({
    ...d,
    regionName:      region?.name      ?? '',
    regionImagePath: region?.imagePath ?? null,
  }))

  return { devices, isLoading }
}
