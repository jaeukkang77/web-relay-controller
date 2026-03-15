import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  deviceApi,
  type CreateDevicePayload,
  type UpdateDevicePayload,
  type DeviceDto,
} from '../../api/device.api'
import { DEVICE_KEYS } from './useDevices'
import { playRelaySound, vibrateRelay } from '../../utils/relay-feedback'

export function useDeviceMutations(regionId: number) {
  const qc = useQueryClient()

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: DEVICE_KEYS.byRegion(regionId) })

  // ── 생성 ──────────────────────────────────────────────────
  const createDevice = useMutation({
    mutationFn: (payload: CreateDevicePayload) =>
      deviceApi.createDevice(regionId, payload),
    onSuccess: invalidate,
  })

  // ── 수정 ──────────────────────────────────────────────────
  const updateDevice = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDevicePayload }) =>
      deviceApi.updateDevice(regionId, id, payload),
    onSuccess: async (_data, { id }) => {
      // 수정 후 실제 장치 상태 (isOnline/isOn) 자동 동기화
      await deviceApi.syncDevice(regionId, id).catch(() => {/* 오프라인이어도 무시 */})
      invalidate()
    },
  })

  // ── 삭제 ──────────────────────────────────────────────────
  const deleteDevice = useMutation({
    mutationFn: (id: number) => deviceApi.deleteDevice(regionId, id),
    onSuccess: invalidate,
  })

  // ── 릴레이 제어 (낙관적 업데이트) ──────────────────────────
  const controlRelay = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'on' | 'off' }) =>
      deviceApi.controlRelay(regionId, id, action),

    // 낙관적 업데이트: 서버 응답 전에 캐시 즉시 변경
    onMutate: async ({ id, action }) => {
      await qc.cancelQueries({ queryKey: DEVICE_KEYS.byRegion(regionId) })
      const previous = qc.getQueryData<DeviceDto[]>(DEVICE_KEYS.byRegion(regionId))

      qc.setQueryData<DeviceDto[]>(DEVICE_KEYS.byRegion(regionId), (old) =>
        old?.map((d) => d.id === id ? { ...d, isOn: action === 'on' } : d) ?? [],
      )
      return { previous }
    },

    // 실패 시 롤백
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(DEVICE_KEYS.byRegion(regionId), context.previous)
      }
    },

    // 성공 시 소리 + 진동 피드백
    onSuccess: (_data, { action }) => {
      playRelaySound(action)
      vibrateRelay(action)
    },

    // 성공/실패 모두 서버 상태로 동기화
    onSettled: invalidate,
  })

  // ── 수동 상태 동기화 ────────────────────────────────────────
  const syncDevice = useMutation({
    mutationFn: (id: number) => deviceApi.syncDevice(regionId, id),
    onSuccess:  invalidate,
  })

  return { createDevice, updateDevice, deleteDevice, controlRelay, syncDevice }
}
