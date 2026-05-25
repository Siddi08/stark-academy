import { cn } from '@/utils/cn'

type ProgressColor = 'spark' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5' | 'ok'
type ProgressSize  = 'xs' | 'sm' | 'md'

interface ProgressBarProps {
  /** 0–100 */
  value: number
  color?: ProgressColor
  size?: ProgressSize
  showLabel?: boolean
  label?: string
  className?: string
  trackClassName?: string
}

const colorMap: Record<ProgressColor, string> = {
  spark:  'bg-spark-500',
  phase1: 'bg-phase1',
  phase2: 'bg-phase2',
  phase3: 'bg-phase3',
  phase4: 'bg-phase4',
  phase5: 'bg-phase5',
  ok:     'bg-ok',
}

const sizeMap: Record<ProgressSize, string> = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
}

export function ProgressBar({
  value,
  color = 'spark',
  size = 'sm',
  showLabel = false,
  label,
  className,
  trackClassName,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-dim font-body">{label}</span>}
          {showLabel && <span className="text-xs text-ghost font-mono">{clamped}%</span>}
        </div>
      )}
      <div className={cn('progress-track', sizeMap[size], trackClassName)}>
        <div
          className={cn('progress-fill', colorMap[color], sizeMap[size])}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
