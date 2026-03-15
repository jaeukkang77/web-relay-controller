import { useQuery } from '@tanstack/react-query';
import { regionApi } from '../../api/region.api';

export function useRegions(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ['regions', params],
    queryFn:  () => regionApi.list(params),
  });
}
