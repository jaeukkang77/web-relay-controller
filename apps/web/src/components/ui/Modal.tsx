import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open:      boolean
  onClose:   () => void
  title:     string
  children:  React.ReactNode
  footer?:   React.ReactNode
}

export default function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  // 스크롤 잠금
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onMouseDown={(e) => {
        // 딤 영역 클릭 시 닫기
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div
        className="
          w-full max-w-md
          bg-surface rounded-xl shadow-xl
          flex flex-col
          animate-in fade-in zoom-in-95 duration-200
        "
        style={{ maxHeight: 'calc(100vh - 2rem)' }}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="text-[18px] font-bold text-ink">{title}</h2>
          <button
            onClick={onClose}
            className="
              flex items-center justify-center w-8 h-8 rounded-full
              text-ink-2 hover:bg-canvas transition-colors
            "
            aria-label="닫기"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* 푸터 */}
        {footer && (
          <div className="px-5 py-4 border-t border-line">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
