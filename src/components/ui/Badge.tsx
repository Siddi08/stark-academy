import { cn } from '@/utils/cn'

type BadgeVariant =
  | 'spark' | 'ok' | 'warn' | 'fail' | 'dim'
  | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  spark:  'bg-spark-500/15 text-spark-300 border border-spark-500/30',
  ok:     'bg-ok/10 text-ok border border-ok/25',
  warn:   'bg-warn/10 text-warn border border-warn/25',
  fail:   'bg-fail/10 text-fail border border-fail/25',
  dim:    'bg-raised text-dim border border-border',
  phase1: 'bg-phase1/10 text-phase1 border border-phase1/25',
  phase2: 'bg-phase2/10 text-phase2 border border-phase2/25',
  phase3: 'bg-phase3/10 text-phase3 border border-phase3/25',
  phase4: 'bg-phase4/10 text-phase4 border border-phase4/25',
  phase5: 'bg-phase5/10 text-phase5 border border-phase5/25',
}

const sizeStyles = {
  sm: 'text-[10px] px-2 py-0.5',
  md: 'text-xs px-2.5 py-1',
}

export function Badge({ children, variant = 'dim', size = 'md', className }: BadgeProps) {
  return (
    <span className={cn('badge', variantStyles[variant], sizeStyles[size], className)}>
      {children}
    </span>
  )
}
