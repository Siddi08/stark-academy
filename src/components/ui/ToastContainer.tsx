import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useToasts, useAppStore } from '@/store/useAppStore'
import type { ToastItem } from '@/types'

// ─── Single toast ─────────────────────────────────────────────────────────────

const variantStyles: Record<ToastItem['variant'], string> = {
  achievement: 'border-spark-500/40 bg-surface shadow-[0_0_24px_-4px_rgba(84,86,245,0.35)]',
  success:     'border-ok/30 bg-surface',
  error:       'border-fail/30 bg-surface',
  info:        'border-border bg-surface',
  sync:        'border-ok/30 bg-surface',
}

const variantIcon: Record<ToastItem['variant'], string> = {
  achievement: '⚡',
  success:     '✓',
  error:       '✕',
  info:        'ℹ',
  sync:        '↻',
}

const variantIconColor: Record<ToastItem['variant'], string> = {
  achievement: 'text-spark-400',
  success:     'text-ok',
  error:       'text-fail',
  info:        'text-dim',
  sync:        'text-ok',
}

function Toast({ toast }: { toast: ToastItem }) {
  const removeToast = useAppStore(s => s.removeToast)

  return (
    <div
      className={cn(
        'flex items-start gap-3 px-4 py-3.5 rounded-2xl border',
        'w-[320px] max-w-[calc(100vw-2rem)] animate-fade-up',
        variantStyles[toast.variant],
      )}
      role="alert"
    >
      {/* Icon or emoji */}
      <span className={cn('text-lg leading-none mt-0.5 shrink-0', variantIconColor[toast.variant])}>
        {toast.emoji ?? variantIcon[toast.variant]}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-heading text-sm font-semibold text-ink leading-snug">
          {toast.title}
        </p>
        {toast.body && (
          <p className="text-xs text-dim mt-0.5 leading-relaxed">{toast.body}</p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-ghost hover:text-dim transition-colors min-h-[44px] min-w-[44px] -mr-2 -mt-1 flex items-center justify-center"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// ─── Container ────────────────────────────────────────────────────────────────

export function ToastContainer() {
  const toasts = useToasts()

  return (
    <div
      className="fixed bottom-20 lg:bottom-6 right-4 z-50 flex flex-col-reverse gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} />
        </div>
      ))}
    </div>
  )
}
