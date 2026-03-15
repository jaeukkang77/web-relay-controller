import { fetcher } from './fetcher';

// ── 타입 ────────────────────────────────────────────────────
export interface Region {
  id:        number
  name:      string
  imagePath: string | null
  createdAt: string
  updatedAt: string
}

export interface RegionListResponse {
  regions: Region[]
  total:   number
}

// ── API ─────────────────────────────────────────────────────
export const regionApi = {
  list: (params?: { limit?: number; offset?: number }) => {
    const qs = new URLSearchParams()
    if (params?.limit  !== undefined) qs.set('limit',  String(params.limit))
    if (params?.offset !== undefined) qs.set('offset', String(params.offset))
    const query = qs.toString() ? `?${qs.toString()}` : ''
    return fetcher.get<RegionListResponse>(`/regions${query}`)
  },

  detail: (id: number) =>
    fetcher.get<Region>(`/regions/${id}`),

  create: (body: { name: string }) =>
    fetcher.post<Region>('/regions', body),

  update: (id: number, body: { name?: string }) =>
    fetcher.patch<Region>(`/regions/${id}`, body),

  uploadImage: (id: number, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return fetcher.postForm<{ imagePath: string }>(`/regions/${id}/image`, form)
  },

  delete: (id: number) =>
    fetcher.delete<void>(`/regions/${id}`),
}
