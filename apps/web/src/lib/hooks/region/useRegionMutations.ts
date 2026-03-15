import { useMutation, useQueryClient } from '@tanstack/react-query';
import { regionApi } from '../../api/region.api';

export function useCreateRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: regionApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
  });
}

export function useUpdateRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: { name?: string } }) =>
      regionApi.update(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
  });
}

export function useUploadRegionImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      regionApi.uploadImage(id, file),
    onSuccess: (_data, { id }) =>
      queryClient.invalidateQueries({ queryKey: ['regions', id] }),
  });
}

export function useDeleteRegion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: regionApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['regions'] }),
  });
}
