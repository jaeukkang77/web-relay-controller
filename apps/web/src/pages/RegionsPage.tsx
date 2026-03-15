import { useState } from 'react'
import { useAuth } from '../lib/auth/auth-store'
import { useRegions } from '../lib/hooks/region/useRegions'
import { useDeleteRegion } from '../lib/hooks/region/useRegionMutations'
import type { Region } from '../lib/api/region.api'
import RegionList from '../components/domain/region/RegionList'
import RegionFormModal from '../components/domain/region/RegionFormModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'

export default function RegionsPage() {
  const { isAdmin } = useAuth()
  const { data, isLoading, isError } = useRegions()
  const deleteRegion = useDeleteRegion()

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editTarget,   setEditTarget]   = useState<Region | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Region | null>(null)

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    await deleteRegion.mutateAsync(deleteTarget.id)
    setDeleteTarget(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight text-ink">지역 관리</h1>
          <p className="mt-1 text-[15px] text-ink-2">지역별 릴레이 장치를 관리합니다.</p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setCreateModalOpen(true)}
            className="
              h-[44px] px-5 rounded-full
              bg-primary hover:bg-primary-dark text-white
              text-[14px] font-semibold
              transition-colors
              flex items-center gap-2
            "
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              />
            </svg>
            지역 추가
          </button>
        )}
      </div>

      {/* 지역 목록 */}
      <RegionList
        data={data}
        isLoading={isLoading}
        isError={isError}
        isAdmin={isAdmin}
        onEdit={setEditTarget}
        onDelete={setDeleteTarget}
      />

      {/* 생성 모달 */}
      <RegionFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        mode="create"
      />

      {/* 수정 모달 */}
      <RegionFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        mode="edit"
        initialData={editTarget ?? undefined}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="지역 삭제"
        description={`"${deleteTarget?.name}" 지역을 삭제하시겠습니까? 연결된 장치와 스케줄이 모두 삭제됩니다.`}
        loading={deleteRegion.isPending}
      />
    </div>
  )
}
