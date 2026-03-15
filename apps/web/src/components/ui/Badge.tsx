/**
 * Badge 컴포넌트
 *
 * 디자인 스펙: 패딩 4x10pt / 폰트 11pt/600 / radius-sm(8pt)
 *
 * @example
 * <Badge variant="online" />
 * <Badge variant="offline" />
 * <Badge variant="success" label="활성" />
 */

interface BadgeProps {
  variant:  'online' | 'offline' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  label?:   string
  dot?:     boolean
}

const VARIANT_STYLES: Record<BadgeProps['variant'], { bg: string; text: string; dot: string }> = {
  online:  { bg: 'bg-green-50',   text: 'text-success',  dot: 'bg-success'  },
  offline: { bg: 'bg-canvas',     text: 'text-ink-3',    dot: 'bg-ink-3'    },
  success: { bg: 'bg-green-50',   text: 'text-success',  dot: 'bg-success'  },
  warning: { bg: 'bg-amber-50',   text: 'text-warning',  dot: 'bg-warning'  },
  danger:  { bg: 'bg-red-50',     text: 'text-danger',   dot: 'bg-danger'   },
  info:    { bg: 'bg-blue-50',    text: 'text-info',     dot: 'bg-info'     },
  neutral: { bg: 'bg-canvas',     text: 'text-ink-2',    dot: 'bg-ink-3'    },
}

const DEFAULT_LABELS: Partial<Record<BadgeProps['variant'], string>> = {
  online:  '온라인',
  offline: '오프라인',
}

export default function Badge({ variant, label, dot = true }: BadgeProps) {
  const styles  = VARIANT_STYLES[variant]
  const display = label ?? DEFAULT_LABELS[variant] ?? variant

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-[10px] py-[4px]
        rounded-sm
        text-[11px] font-semibold
        ${styles.bg} ${styles.text}
      `}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${styles.dot}`}
        />
      )}
      {display}
    </span>
  )
}
