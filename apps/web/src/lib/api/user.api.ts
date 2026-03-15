import { fetcher } from './fetcher'

// ── 타입 ────────────────────────────────────────────────────
export interface UserDto {
  id:        string
  role:      'admin' | 'user'
  regionId:  number | null
  createdAt: string
  updatedAt: string
}

export interface UserListResult {
  users: UserDto[]
  total: number
}

export interface CreateUserPayload {
  id:        string
  password:  string
  role:      'admin' | 'user'
  regionId?: number | null
}

export interface UpdateUserPayload {
  password?: string
  role?:     'admin' | 'user'
  regionId?: number | null
}

// ── API 함수 ─────────────────────────────────────────────────
export const userApi = {
  getUsers: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams()
    if (params?.limit  != null) qs.set('limit',  String(params.limit))
    if (params?.offset != null) qs.set('offset', String(params.offset))
    const query = qs.toString()
    return fetcher.get<UserListResult>(`/users${query ? `?${query}` : ''}`)
  },

  getUser: (id: string) =>
    fetcher.get<UserDto>(`/users/${id}`),

  createUser: (payload: CreateUserPayload) =>
    fetcher.post<UserDto>('/users', payload),

  updateUser: (id: string, payload: UpdateUserPayload) =>
    fetcher.patch<UserDto>(`/users/${id}`, payload),

  deleteUser: (id: string) =>
    fetcher.delete<UserDto>(`/users/${id}`),
}
