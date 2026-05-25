// Phase 3 — full implementation
// Placeholder screen for Phase 2 router wiring
import { Link } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useProgress } from '@/store/useAppStore'
import { getLevelProgress, getLevelTitle } from '@/utils/xp'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { allModules } from '@/data/curriculum'

export default function HomeScreen() {
  const progress = useProgress()
  const { level, percent } = getLevelProgress(progress.xp)
  const levelTitle = getLevelTitle(level)

  const totalLessons = allModules.reduce((n, m) => n + m.lessons.length, 0)
  const overallPct = totalLessons > 0
    ? Math.round((progress.completedLessons.length / totalLessons) * 100)
    : 0

  return (
    <div className="px-4 py-8 max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-spark-500/20 border border-spark-500/40 flex items-center justify-center">
          <Zap size={20} className="text-spark-400" />
        </div>
        <div>
          <p className="font-heading text-xs text-ghost uppercase tracking-widest">Welcome back</p>
          <h1 className="font-heading text-xl font-bold text-ink">
            {progress.userName || 'Recruit'}
          </h1>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs text-ghost font-heading uppercase tracking-wide mb-1">Level</p>
          <p className="font-heading text-2xl font-bold text-spark-300">{level}</p>
          <p className="text-xs text-dim">{levelTitle}</p>
          <ProgressBar value={percent} color="spark" size="xs" className="mt-2" />
        </div>
        <div className="card p-4">
          <p className="text-xs text-ghost font-heading uppercase tracking-wide mb-1">Progress</p>
          <p className="font-heading text-2xl font-bold text-ink">{overallPct}%</p>
          <p className="text-xs text-dim">{progress.completedLessons.length}/{totalLessons} lessons</p>
          <ProgressBar value={overallPct} color="spark" size="xs" className="mt-2" />
        </div>
        <div className="card p-4">
          <p className="text-xs text-ghost font-heading uppercase tracking-wide mb-1">XP Earned</p>
          <p className="font-heading text-2xl font-bold text-ink">{progress.xp.toLocaleString()}</p>
          <p className="text-xs text-dim">Total experience</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-ghost font-heading uppercase tracking-wide mb-1">Streak</p>
          <p className="font-heading text-2xl font-bold text-ink">
            {progress.streak > 0 ? `${progress.streak}🔥` : '—'}
          </p>
          <p className="text-xs text-dim">{progress.streak > 0 ? 'days' : 'Start one today'}</p>
        </div>
      </div>

      {/* CTA */}
      <Link to="/curriculum" className="btn-primary w-full justify-center">
        Continue Learning →
      </Link>

      {/* Phase note */}
      <p className="text-center text-xs text-ghost">
        Full dashboard coming in Phase 3
      </p>
    </div>
  )
}
