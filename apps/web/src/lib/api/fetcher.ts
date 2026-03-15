import { tokenStore } from './token';
import { ApiError } from './api-error';

// ── 환경변수 ────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

// ── 타입 ────────────────────────────────────────────────────
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
  /** 토큰 자동 첨부 여부 (기본 true) */
  auth?: boolean;
}

// ── 토큰 갱신 중복 방지 ──────────────────────────────────────
// 여러 요청이 동시에 401을 받아도 refresh 요청은 1번만 발생
let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) throw new ApiError('UNAUTHORIZED', '로그인이 필요합니다.', 401);

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    tokenStore.clear();
    throw new ApiError('TOKEN_EXPIRED', '세션이 만료됐습니다. 다시 로그인해주세요.', 401);
  }

  tokenStore.set(json.data);
}

// ── 핵심 fetch 래퍼 ─────────────────────────────────────────
async function request<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options;

  // body가 FormData이면 Content-Type 헤더를 직접 설정하지 않는다.
  // 브라우저가 multipart/form-data; boundary=... 를 자동으로 설정한다.
  const isFormData = body instanceof FormData;

  const buildHeaders = (): Record<string, string> => {
    const h: Record<string, string> = isFormData
      ? { ...headers }
      : { 'Content-Type': 'application/json', ...headers };
    if (auth) {
      const token = tokenStore.getAccess();
      if (token) h['Authorization'] = `Bearer ${token}`;
    }
    return h;
  };

  const execute = () =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers: buildHeaders(),
      ...(body !== undefined
        ? { body: isFormData ? (body as FormData) : JSON.stringify(body) }
        : {}),
    });

  let res = await execute();

  // ── 401: 토큰 갱신 후 1회 재시도 ───────────────────────────
  if (res.status === 401 && auth) {
    try {
      // 동시 401이 여러 개여도 refresh는 1번만
      if (!refreshPromise) {
        refreshPromise = refreshTokens().finally(() => {
          refreshPromise = null;
        });
      }
      await refreshPromise;
    } catch {
      // refresh 실패 → 로그인 페이지로
      window.location.href = '/login';
      throw new ApiError('UNAUTHORIZED', '다시 로그인해주세요.', 401);
    }

    // 새 토큰으로 원본 요청 재시도
    res = await execute();
  }

  // ── 응답 파싱 ───────────────────────────────────────────────
  const json = await res.json().catch(() => null);

  if (!json) {
    throw new ApiError('UNKNOWN_ERROR', '응답을 파싱할 수 없습니다.', res.status);
  }

  if (!json.success) {
    throw new ApiError(
      json.error?.code ?? 'UNKNOWN_ERROR',
      json.error?.message ?? '알 수 없는 오류가 발생했습니다.',
      res.status,
    );
  }

  // { success: true } 혹은 { success: true, data: T }
  return (json.data ?? undefined) as T;
}

// ── 공개 API ─────────────────────────────────────────────────
export const fetcher = {
  get: <T>(path: string, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body }),

  /** multipart/form-data 업로드 전용 (Content-Type 헤더를 브라우저에 위임) */
  postForm: <T>(path: string, form: FormData, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'POST', body: form }),

  patch: <T>(path: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, options?: Omit<FetchOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
