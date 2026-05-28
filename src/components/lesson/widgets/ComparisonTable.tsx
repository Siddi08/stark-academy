import { cn } from '@/utils/cn'

export interface ComparisonRow {
  property: string
  left: string
  right: string
  winner?: 'left' | 'right' | 'tie' | 'none'
}

export interface ComparisonTableProps {
  title: string
  subtitle?: string
  leftLabel: string
  rightLabel: string
  rows: ComparisonRow[]
  accentColor?: 'spark' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5'
  leftColor?: 'spark' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5'
  rightColor?: 'spark' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5'
}

const COLOR_TEXT: Record<string, string> = {
  spark:  'text-spark-400',
  phase1: 'text-phase1',
  phase2: 'text-phase2',
  phase3: 'text-phase3',
  phase4: 'text-phase4',
  phase5: 'text-phase5',
}

const COLOR_BORDER: Record<string, string> = {
  spark:  'border-spark-500/25',
  phase1: 'border-phase1/25',
  phase2: 'border-phase2/25',
  phase3: 'border-phase3/25',
  phase4: 'border-phase4/25',
  phase5: 'border-phase5/25',
}

const COLOR_HEADER_BG: Record<string, string> = {
  spark:  'bg-spark-500/10',
  phase1: 'bg-phase1/10',
  phase2: 'bg-phase2/10',
  phase3: 'bg-phase3/10',
  phase4: 'bg-phase4/10',
  phase5: 'bg-phase5/10',
}

export function ComparisonTable({
  title,
  subtitle,
  leftLabel,
  rightLabel,
  rows,
  accentColor = 'spark',
  leftColor = 'phase1',
  rightColor = 'phase2',
}: ComparisonTableProps) {
  return (
    <div className={cn('not-prose my-8 p-5 sm:p-6 rounded-2xl border bg-surface', COLOR_BORDER[accentColor])}>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <span className={cn('font-heading text-xs uppercase tracking-widest', COLOR_TEXT[accentColor])}>{title}</span>
          {subtitle && <p className="text-xs text-ghost mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[400px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-3 py-2.5 text-dim font-normal text-xs w-[30%]">Property</th>
              <th className={cn('text-left px-3 py-2.5 font-heading text-xs font-bold uppercase tracking-wide w-[35%]', COLOR_HEADER_BG[leftColor], COLOR_TEXT[leftColor])}>
                {leftLabel}
              </th>
              <th className={cn('text-left px-3 py-2.5 font-heading text-xs font-bold uppercase tracking-wide w-[35%]', COLOR_HEADER_BG[rightColor], COLOR_TEXT[rightColor])}>
                {rightLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  'border-b border-border/40 last:border-0 transition-colors duration-100 group',
                  i % 2 === 0 ? 'bg-surface' : 'bg-raised/40',
                  'hover:bg-raised',
                )}
              >
                <td className="px-3 py-2.5 text-dim text-xs font-medium align-top">
                  {row.property}
                </td>
                <td className={cn(
                  'px-3 py-2.5 text-xs align-top transition-colors duration-100',
                  row.winner === 'left' && 'bg-ok/10 text-ok',
                  row.winner === 'tie' && 'bg-warn/10 text-warn',
                  row.winner !== 'left' && row.winner !== 'tie' && 'text-ink',
                )}>
                  {row.winner === 'left' && <span className="mr-1 text-ok">✓</span>}
                  {row.left}
                </td>
                <td className={cn(
                  'px-3 py-2.5 text-xs align-top transition-colors duration-100',
                  row.winner === 'right' && 'bg-ok/10 text-ok',
                  row.winner === 'tie' && 'bg-warn/10 text-warn',
                  row.winner !== 'right' && row.winner !== 'tie' && 'text-ink',
                )}>
                  {row.winner === 'right' && <span className="mr-1 text-ok">✓</span>}
                  {row.right}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
