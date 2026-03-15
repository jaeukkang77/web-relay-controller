import Modal from './Modal'

interface ConfirmDialogProps {
  open:        boolean
  onClose:     () => void
  onConfirm:   () => void
  title:       string
  description: string
  loading?:    boolean
  confirmLabel?: string
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  loading = false,
  confirmLabel = '삭제',
}: ConfirmDialogProps) {
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
            disabled={loading}
            className="
              h-10 px-4 rounded-full text-[14px] font-medium
              text-ink-2 bg-canvas hover:bg-line
              transition-colors disabled:opacity-50
            "
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              h-10 px-4 rounded-full text-[14px] font-medium
              text-white bg-danger hover:bg-red-600
              transition-colors disabled:opacity-50
              flex items-center gap-1.5
            "
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 60" />
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      }
    >
      <p className="text-[15px] text-ink-2 leading-relaxed">{description}</p>
    </Modal>
  )
}
