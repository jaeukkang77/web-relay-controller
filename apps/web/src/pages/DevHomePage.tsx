import { useQuery } from '@tanstack/react-query'
import { fetcher } from '../lib/api/fetcher'
import { ApiError } from '../lib/api/api-error'

// ── 타입 ────────────────────────────────────────────────────
interface HealthData {
  status: 'ok' | 'error'
  info: Record<string, { status: string }>
  error: Record<string, unknown>
  details: Record<string, { status: string }>
}

// ── 상태 뱃지 ────────────────────────────────────────────────
function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />
      {ok ? 'UP' : 'DOWN'}
    </span>
  )
}

// ── 항목 행 ──────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

// ── 메인 페이지 ──────────────────────────────────────────────
export default function DevHomePage() {
  const apiBase = import.meta.env.VITE_API_BASE_URL ?? '/api'

  const { data, error, isLoading, isFetching, dataUpdatedAt } = useQuery<HealthData>({
    queryKey: ['health'],
    queryFn: () => fetcher.get<HealthData>('/health', { auth: false }),
    refetchInterval: 5000,   // 5초마다 자동 폴링
    retry: 0,
  })

  const isServerUp = !!data && !error
  const isDbUp = data?.info?.database?.status === 'up'
  const lastChecked = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('ko-KR')
    : '-'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6">
      {/* 개발용 배너 */}
      <div className="mb-6 rounded-md bg-yellow-50 px-4 py-2 text-xs text-yellow-700 ring-1 ring-yellow-200">
        개발용 임시 페이지 — 서버 연결 확인용
      </div>

      <div className="w-full max-w-md rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h1 className="text-base font-semibold text-gray-900">릴레이 컨트롤러 API</h1>
          <div className="flex items-center gap-2">
            {isFetching && (
              <span className="text-xs text-gray-400">확인 중…</span>
            )}
            <StatusBadge ok={isServerUp} />
          </div>
        </div>

        {/* 정보 */}
        <div className="px-6 py-4">
          <InfoRow label="API Base URL" value={<code className="text-xs">{apiBase}</code>} />
          <InfoRow label="서버 상태" value={<StatusBadge ok={isServerUp} />} />
          <InfoRow
            label="DB 상태"
            value={
              isLoading
                ? <span className="text-xs text-gray-400">확인 중…</span>
                : <StatusBadge ok={isDbUp} />
            }
          />
          <InfoRow label="마지막 확인" value={lastChecked} />
          <InfoRow
            label="폴링 주기"
            value={<span className="text-xs text-gray-500">5초</span>}
          />
        </div>

        {/* 에러 상세 */}
        {error && (
          <div className="border-t border-red-100 bg-red-50 px-6 py-4">
            <p className="text-xs font-medium text-red-600">연결 실패</p>
            <p className="mt-1 text-xs text-red-500">
              {error instanceof ApiError
                ? `[${error.code}] ${error.message}`
                : '서버에 연결할 수 없습니다.'}
            </p>
          </div>
        )}

        {/* 바로가기 */}
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="mb-2 text-xs text-gray-400">바로가기</p>
          <div className="flex gap-2">
            <a
              href="/login"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700"
            >
              로그인 페이지
            </a>
            <a
              href={`${apiBase}/health`}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200"
            >
              Health JSON ↗
            </a>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Auth 구현 후 이 페이지는 삭제하세요.
      </p>
    </div>
  )
}
