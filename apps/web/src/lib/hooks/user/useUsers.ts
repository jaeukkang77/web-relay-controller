import { useQuery } from '@tanstack/react-query'
import { userApi } from '../../api/user.api'

export const USER_KEYS = {
  all:    () => ['users'] as const,
  lists:  () => [...USER_KEYS.all(), 'list'] as const,
  list:   (p: { limit?: number; offset?: number }) =>
    [...USER_KEYS.lists(), p] as const,
  detail: (id: string) => [...USER_KEYS.all(), 'detail', id] as const,
}

export function useUsers(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: USER_KEYS.list(params ?? {}),
    queryFn:  () => userApi.getUsers(params),
  })
}
