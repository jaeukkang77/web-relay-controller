import { fetcher } from './fetcher'

// ── 타입 ────────────────────────────────────────────────────
export interface ScheduleDto {
  id:        number
  deviceId:  number
  name:      string | null
  onTime:    string | null   // "HH:MM" — 서버에서 변환 후 전달
  offTime:   string | null   // "HH:MM"
  dateFrom:  string          // "YYYY-MM-DD"
  dateTo:    string          // "YYYY-MM-DD"
  enabled:   boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSchedulePayload {
  name?:    string
  onTime?:  string   // "HH:MM"
  offTime?: string   // "HH:MM"
  dateFrom: string   // "YYYY-MM-DD"
  dateTo:   string   // "YYYY-MM-DD"
}

export interface UpdateSchedulePayload {
  name?:    string | null
  onTime?:  string | null
  offTime?: string | null
  dateFrom?: string
  dateTo?:   string
}

// ── API 함수 ─────────────────────────────────────────────────
const base = (regionId: number, deviceId: number) =>
  `/regions/${regionId}/devices/${deviceId}/schedules`

export const scheduleApi = {
  getSchedules: (regionId: number, deviceId: number) =>
    fetcher.get<ScheduleDto[]>(base(regionId, deviceId)),

  createSchedule: (regionId: number, deviceId: number, payload: CreateSchedulePayload) =>
    fetcher.post<ScheduleDto>(base(regionId, deviceId), payload),

  updateSchedule: (regionId: number, deviceId: number, id: number, payload: UpdateSchedulePayload) =>
    fetcher.patch<ScheduleDto>(`${base(regionId, deviceId)}/${id}`, payload),

  deleteSchedule: (regionId: number, deviceId: number, id: number) =>
    fetcher.delete<ScheduleDto>(`${base(regionId, deviceId)}/${id}`),

  toggleSchedule: (regionId: number, deviceId: number, id: number) =>
    fetcher.patch<ScheduleDto>(`${base(regionId, deviceId)}/${id}/toggle`, {}),
}
