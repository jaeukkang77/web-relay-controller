import type { Region } from '../../../lib/api/region.api'
import RegionCard, { RegionCardSkeleton } from './RegionCard'

interface RegionListProps {
  data?:      { regions: Region[]; total: number }
  isLoading:  boolean
  isError:    boolean
  isAdmin:    boolean
  onEdit:     (region: Region) => void
  onDelete:   (region: Region) => void
}

export default function RegionList({
  data,
  isLoading,
  isError,
  isAdmin,
  onEdit,
  onDelete,
}: RegionListProps) {

  // ── 로딩 ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <RegionCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  // ── 에러 ──────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-danger">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <p className="text-[15px] text-ink-2">데이터를 불러오는 데 실패했습니다.</p>
        <p className="text-[13px] text-ink-3">잠시 후 다시 시도해주세요.</p>
      </div>
    )
  }

  // ── 빈 목록 ───────────────────────────────────────────────
  if (!data?.regions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-2">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-ink-3">
          <path
            d="M3 9l4-4 4 4 4-5 4 5v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        <p className="text-[15px] text-ink-2">등록된 지역이 없습니다.</p>
        {isAdmin && (
          <p className="text-[13px] text-ink-3">우측 상단 버튼으로 지역을 추가하세요.</p>
        )}
      </div>
    )
  }

  // ── 목록 ──────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.regions.map((region) => (
        <RegionCard
          key={region.id}
          region={region}
          isAdmin={isAdmin}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
