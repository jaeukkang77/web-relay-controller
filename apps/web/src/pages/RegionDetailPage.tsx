import { Link, useParams } from 'react-router'
import { useRegion } from '../lib/hooks/region/useRegion'
import { getImageUrl } from '../lib/utils/image-url'

export default function RegionDetailPage() {
  const { regionId } = useParams<{ regionId: string }>()
  const id = Number(regionId)

  const { data: region, isLoading, isError } = useRegion(id)

  // ── 로딩 ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-canvas rounded" />
        </div>
        <div className="rounded-lg overflow-hidden border border-line">
          <div className="aspect-[3/1] w-full bg-canvas" />
          <div className="p-5 space-y-2">
            <div className="h-6 w-1/3 bg-canvas rounded" />
            <div className="h-4 w-1/4 bg-canvas rounded" />
          </div>
        </div>
      </div>
    )
  }

  // ── 에러 / 없음 ───────────────────────────────────────────
  if (isError || !region) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-[64px] font-extrabold text-ink-3 leading-none">404</p>
        <p className="text-[17px] font-semibold text-ink">지역을 찾을 수 없습니다.</p>
        <Link to="/regions" className="text-[15px] font-medium text-primary hover:underline">
          ← 지역 목록으로
        </Link>
      </div>
    )
  }

  const createdAt = new Date(region.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="flex flex-col gap-6">
      {/* 뒤로가기 */}
      <Link
        to="/regions"
        className="inline-flex items-center gap-1.5 text-[14px] text-ink-2 hover:text-primary transition-colors w-fit"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 12H5M12 19l-7-7 7-7"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        지역 목록
      </Link>

      {/* 지역 헤더 카드 */}
      <div className="bg-surface rounded-lg border border-line overflow-hidden shadow-sm">
        {/* 이미지 */}
        {region.imagePath ? (
          <div className="aspect-[3/1] w-full overflow-hidden">
            <img
              src={getImageUrl(region.imagePath)!}
              alt={region.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-[3/1] w-full bg-canvas flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-ink-3">
              <path
                d="M3 9l4-4 4 4 4-5 4 5v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        )}

        {/* 정보 */}
        <div className="px-5 py-4">
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">{region.name}</h1>
          <p className="mt-1 text-[13px] text-ink-3">등록일 {createdAt}</p>
        </div>
      </div>
    </div>
  )
}
