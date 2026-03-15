import { QueryClient } from '@tanstack/react-query';
import { ApiError } from './api/api-error';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,       // 1분: 동일 데이터 재요청 방지
      gcTime: 1000 * 60 * 5,      // 5분: 미사용 캐시 유지 시간
      refetchOnWindowFocus: true,  // 탭 포커스 시 재요청
      retry: (failureCount, error) => {
        // 401/403/404는 재시도 불필요
        if (error instanceof ApiError && [401, 403, 404].includes(error.status)) {
          return false;
        }
        return failureCount < 1; // 그 외 1회 재시도
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
