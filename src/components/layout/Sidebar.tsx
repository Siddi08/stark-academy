import { NavLink } from 'react-router-dom'
import {
  Home, BookOpen, FlaskConical, BarChart2, Settings, Zap,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { useProgress } from '@/store/useAppStore'
import { getLevelProgress, getLevelTitle } from '@/utils/xp'
import { ProgressBar } from '@/components/ui/ProgressBar'

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { to: '/',           icon: Home,         label: 'Home' },
  { to: '/curriculum', icon: BookOpen,      label: 'Curriculum' },
  { to: '/projects',   icon: FlaskConical,  label: 'Projects' },
  { to: '/progress',   icon: BarChart2,     label: 'Progress' },
  { to: '/settings',   icon: Settings,      label: 'Settings' },
] as const

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const progress = useProgress()
  const { level, current, needed, percent } = getLevelProgress(progress.xp)
  const levelTitle = getLevelTitle(level)

  return (
    <aside className="w-[260px] h-full flex flex-col bg-void border-r border-border">
      {/* ── Brand ── */}
      <div className="px-6 pt-7 pb-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-spark-500/20 border border-spark-500/40 flex items-center justify-center">
          <Zap size={16} className="text-spark-400" />
        </div>
        <div>
          <p className="font-heading text-sm font-bold text-ink tracking-wider">STARK</p>
          <p className="font-heading text-[10px] text-ghost tracking-[0.2em] uppercase">Academy</p>
        </div>
      </div>

      {/* ── Nav links ── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group min-h-[44px]',
                isActive
                  ? 'bg-spark-500/15 text-spark-300 border border-spark-500/25'
                  : 'text-ghost hover:text-dim hover:bg-raised border border-transparent',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={cn(
                    'transition-colors',
                    isActive ? 'text-spark-400' : 'text-ghost group-hover:text-dim',
                  )}
                />
                <span className="font-heading text-sm">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-border" />

      {/* ── XP / Level ── */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-heading text-xs text-spark-400 tracking-wide uppercase">
              {levelTitle}
            </p>
            <p className="font-heading text-[10px] text-ghost tracking-wide">
              Level {level}
            </p>
          </div>
          <span className="font-mono text-xs text-dim bg-raised border border-border px-2 py-0.5 rounded-lg">
            {progress.xp.toLocaleString()} XP
          </span>
        </div>
        <ProgressBar value={percent} color="spark" size="xs" />
        <p className="text-[10px] text-ghost mt-1.5 font-mono text-right">
          {current}/{needed} to next level
        </p>

        {/* Streak */}
        {progress.streak > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <span className="text-sm">🔥</span>
            <span className="text-xs text-dim font-body">
              {progress.streak}-day streak
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}
