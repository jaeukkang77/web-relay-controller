import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  userApi,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '../../api/user.api'
import { USER_KEYS } from './useUsers'

export function useUserMutations() {
  const qc = useQueryClient()

  const invalidate = () => qc.invalidateQueries({ queryKey: USER_KEYS.all() })

  const createUser = useMutation({
    mutationFn: (payload: CreateUserPayload) => userApi.createUser(payload),
    onSuccess:  invalidate,
  })

  const updateUser = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      userApi.updateUser(id, payload),
    onSuccess: invalidate,
  })

  const deleteUser = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess:  invalidate,
  })

  return { createUser, updateUser, deleteUser }
}
