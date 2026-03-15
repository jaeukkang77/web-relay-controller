import { useNavigate } from 'react-router'
import type { Region } from '../../../lib/api/region.api'
import { getImageUrl } from '../../../lib/utils/image-url'

interface RegionCardProps {
  region:    Region
  isAdmin:   boolean
  onEdit:    (region: Region) => void
  onDelete:  (region: Region) => void
}

export default function RegionCard({ region, isAdmin, onEdit, onDelete }: RegionCardProps) {
  const navigate = useNavigate()

  const createdAt = new Date(region.createdAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/regions/${region.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/regions/${region.id}`)}
      className="
        group relative bg-surface rounded-lg border border-line shadow-sm
        hover:shadow-md hover:border-primary transition-all duration-200
        cursor-pointer overflow-hidden
      "
    >
      {/* 이미지 영역 */}
      <div className="aspect-video w-full bg-canvas overflow-hidden">
        {region.imagePath ? (
          <img
            src={getImageUrl(region.imagePath)!}
            alt={region.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-ink-3">
              <path
                d="M3 9l4-4 4 4 4-5 4 5v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"
                stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="px-4 py-3">
        <p className="text-[16px] font-semibold text-ink truncate">{region.name}</p>
        <p className="mt-0.5 text-[12px] text-ink-3">{createdAt}</p>
      </div>

      {/* admin 전용 버튼 */}
      {/* 모바일: 항상 노출 / 데스크톱: 카드 hover 시에만 노출 */}
      {isAdmin && (
        <div
          className="
            absolute top-2 right-2
            flex gap-1
            opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity
          "
          onClick={(e) => e.stopPropagation()}
        >
          {/* 수정 버튼 */}
          <button
            onClick={() => onEdit(region)}
            className="
              w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm
              flex items-center justify-center
              text-ink-2 hover:text-primary hover:bg-primary-light
              transition-colors shadow-sm border border-line
            "
            aria-label="수정"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
          {/* 삭제 버튼 */}
          <button
            onClick={() => onDelete(region)}
            className="
              w-8 h-8 rounded-full bg-surface/90 backdrop-blur-sm
              flex items-center justify-center
              text-ink-2 hover:text-danger hover:bg-red-50
              transition-colors shadow-sm border border-line
            "
            aria-label="삭제"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ── 스켈레톤 ────────────────────────────────────────────────
export function RegionCardSkeleton() {
  return (
    <div className="bg-surface rounded-lg border border-line overflow-hidden animate-pulse">
      <div className="aspect-video w-full bg-canvas" />
      <div className="px-4 py-3 space-y-2">
        <div className="h-4 bg-canvas rounded w-3/4" />
        <div className="h-3 bg-canvas rounded w-1/2" />
      </div>
    </div>
  )
}
