import { useQuery } from '@tanstack/react-query';
import { regionApi } from '../../api/region.api';

export function useRegion(id: number) {
  return useQuery({
    queryKey: ['regions', id],
    queryFn:  () => regionApi.detail(id),
    enabled:  id > 0,
  });
}
