import { useEffect, useRef, useState } from 'react'
import { processRegionImage } from '../../../lib/utils/image-process'
import Modal from '../../ui/Modal'
import type { Region } from '../../../lib/api/region.api'
import {
  useCreateRegion,
  useUpdateRegion,
  useUploadRegionImage,
} from '../../../lib/hooks/region/useRegionMutations'
import { ApiError } from '../../../lib/api/api-error'
import { getImageUrl } from '../../../lib/utils/image-url'

interface RegionFormModalProps {
  open:         boolean
  onClose:      () => void
  mode:         'create' | 'edit'
  initialData?: Region
}

export default function RegionFormModal({
  open,
  onClose,
  mode,
  initialData,
}: RegionFormModalProps) {
  const [name, setName]       = useState('')
  const [nameError, setNameError] = useState('')
  const [imageFile, setImageFile]       = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const createMutation      = useCreateRegion()
  const updateMutation      = useUpdateRegion()
  const uploadImageMutation = useUploadRegionImage()

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadImageMutation.isPending ||
    imageProcessing

  // 모달 열릴 때 초기값 세팅
  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setNameError('')
      setImageFile(null)
      setImagePreview(null)
    }
  }, [open, initialData])

  // 이미지 파일 선택 → 투명 여백 제거 + 리사이즈 전처리
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // input 초기화 (같은 파일 재선택 허용)
    e.target.value = ''

    setImageProcessing(true)
    try {
      const processed = await processRegionImage(file)
      setImageFile(processed)
      // 기존 preview URL 해제 후 새로 생성
      setImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(processed)
      })
    } catch {
      // 전처리 실패 시 원본 그대로 사용
      setImageFile(file)
      setImagePreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(file)
      })
    } finally {
      setImageProcessing(false)
    }
  }

  // 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setNameError('')

    const trimmed = name.trim()
    if (!trimmed) {
      setNameError('지역 이름을 입력하세요.')
      return
    }

    try {
      if (mode === 'create') {
        const created = await createMutation.mutateAsync({ name: trimmed })
        // 이미지가 있으면 추가 업로드
        if (imageFile) {
          await uploadImageMutation.mutateAsync({ id: created.id, file: imageFile })
        }
      } else {
        // edit
        await updateMutation.mutateAsync({ id: initialData!.id, body: { name: trimmed } })
        if (imageFile) {
          await uploadImageMutation.mutateAsync({ id: initialData!.id, file: imageFile })
        }
      }
      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.code === 'DUPLICATE_NAME') {
        setNameError('이미 사용 중인 지역 이름입니다.')
      } else {
        setNameError('오류가 발생했습니다. 다시 시도해주세요.')
      }
    }
  }

  const title = mode === 'create' ? '지역 추가' : '지역 수정'

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="
              h-10 px-4 rounded-full text-[14px] font-medium
              text-ink-2 bg-canvas hover:bg-line
              transition-colors disabled:opacity-50
            "
          >
            취소
          </button>
          <button
            type="submit"
            form="region-form"
            disabled={isPending}
            className="
              h-10 px-5 rounded-full text-[14px] font-semibold
              text-white bg-primary hover:bg-primary-dark
              transition-colors disabled:opacity-50
              flex items-center gap-1.5
            "
          >
            {isPending && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
              </svg>
            )}
            {mode === 'create' ? '추가' : '저장'}
          </button>
        </div>
      }
    >
      <form id="region-form" onSubmit={handleSubmit} className="space-y-4">
        {/* 이름 필드 */}
        <div>
          <label className="block text-[13px] font-medium text-ink mb-1.5">
            지역 이름 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError('') }}
            placeholder="지역 이름을 입력하세요"
            maxLength={150}
            disabled={isPending}
            className={`
              w-full h-[48px] px-3.5 rounded-md text-[15px] text-ink
              border bg-surface outline-none
              focus:border-primary focus:ring-2 focus:ring-primary-light
              transition-colors disabled:opacity-50
              ${nameError ? 'border-danger focus:border-danger focus:ring-red-100' : 'border-line'}
            `}
          />
          {nameError && (
            <p className="mt-1 text-[13px] text-danger">{nameError}</p>
          )}
        </div>

        {/* 이미지 업로드 (edit 모드 + create 모드 모두 지원) */}
        <div>
          <label className="block text-[13px] font-medium text-ink mb-1.5">
            지역 이미지 <span className="text-[12px] text-ink-3 font-normal">(선택, jpg/png/gif/webp)</span>
          </label>

          {/* 미리보기 */}
          {(imagePreview || initialData?.imagePath) && (
            <div className="mb-2 rounded-md overflow-hidden border border-line aspect-video">
              <img
                src={imagePreview ?? getImageUrl(initialData?.imagePath) ?? ''}
                alt="미리보기"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isPending}
            className="
              w-full h-[44px] rounded-md text-[14px] font-medium
              text-ink-2 border border-line border-dashed
              hover:border-primary hover:text-primary hover:bg-primary-light
              transition-colors disabled:opacity-50
              flex items-center justify-center gap-2
            "
          >
            {imageProcessing ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor"
                    strokeWidth="3" strokeDasharray="30 60" />
                </svg>
                이미지 처리 중…
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
                {imageFile ? imageFile.name : '이미지 파일 선택'}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}
