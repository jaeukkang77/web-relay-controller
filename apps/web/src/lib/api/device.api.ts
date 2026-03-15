import { fetcher } from './fetcher'

// ── 타입 ────────────────────────────────────────────────────
export interface DeviceDto {
  id:        number
  regionId:  number
  name:      string
  ip:        string
  port:      number
  slaveId:   number
  address:   number
  isOn:      boolean
  isOnline:  boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDevicePayload {
  name:     string
  ip:       string
  port?:    number
  slaveId?: number
  address:  number
}

export interface UpdateDevicePayload {
  name?:    string
  ip?:      string
  port?:    number
  slaveId?: number
  address?: number
}

// ── API 함수 ─────────────────────────────────────────────────
export const deviceApi = {
  getDevices: (regionId: number) =>
    fetcher.get<DeviceDto[]>(`/regions/${regionId}/devices`),

  getDevice: (regionId: number, id: number) =>
    fetcher.get<DeviceDto>(`/regions/${regionId}/devices/${id}`),

  createDevice: (regionId: number, payload: CreateDevicePayload) =>
    fetcher.post<DeviceDto>(`/regions/${regionId}/devices`, payload),

  updateDevice: (regionId: number, id: number, payload: UpdateDevicePayload) =>
    fetcher.patch<DeviceDto>(`/regions/${regionId}/devices/${id}`, payload),

  deleteDevice: (regionId: number, id: number) =>
    fetcher.delete<DeviceDto>(`/regions/${regionId}/devices/${id}`),

  controlRelay: (regionId: number, id: number, action: 'on' | 'off') =>
    fetcher.post<DeviceDto>(`/regions/${regionId}/devices/${id}/relay`, { action }),

  syncDevice: (regionId: number, id: number) =>
    fetcher.post<DeviceDto>(`/regions/${regionId}/devices/${id}/sync`, {}),
}
