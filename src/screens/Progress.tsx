// Phase 3 — full progress + achievements implementation
import { useProgress } from '@/store/useAppStore'
import { getLevelProgress, getLevelTitle } from '@/utils/xp'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { allModules } from '@/data/curriculum'
import { achievements } from '@/data/achievements'

export default function ProgressScreen() {
  const progress = useProgress()
  const { level, current, needed, percent } = getLevelProgress(progress.xp)
  const levelTitle = getLevelTitle(level)

  const totalLessons = allModules.reduce((n, m) => n + m.lessons.length, 0)
  const passedQuizzes = progress.quizAttempts.filter(a => a.passed).length
  const verifiedProjects = Object.values(progress.projectStatuses).filter(s => s === 'verified').length

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto space-y-6 animate-fade-up">
      <h1 className="font-heading text-2xl font-bold text-ink">Progress</h1>

      {/* Level card */}
      <div className="card-glow p-5">
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="font-heading text-xs text-ghost uppercase tracking-widest">Level {level}</p>
            <h2 className="font-heading text-2xl font-bold text-spark-300">{levelTitle}</h2>
          </div>
          <span className="font-mono text-sm text-dim">{progress.xp.toLocaleString()} XP</span>
        </div>
        <ProgressBar value={percent} color="spark" size="md" showLabel />
        <p className="text-xs text-ghost mt-2 font-mono">{current}/{needed} XP to level {level + 1}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Lessons Done',     value: `${progress.completedLessons.length}/${totalLessons}` },
          { label: 'Quizzes Passed',   value: passedQuizzes },
          { label: 'Projects Verified',value: verifiedProjects },
          { label: 'Best Streak',      value: `${progress.streak}🔥` },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-ghost uppercase tracking-wide font-heading mb-1">{label}</p>
            <p className="font-heading text-xl font-bold text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div>
        <h2 className="font-heading text-sm uppercase tracking-widest text-dim mb-3">
          Achievements — {progress.achievements.length}/{achievements.length}
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {achievements.map(a => {
            const unlocked = progress.achievements.includes(a.id)
            return (
              <div
                key={a.id}
                className={`card p-3 flex items-center gap-3 transition-opacity ${unlocked ? '' : 'opacity-40'}`}
              >
                <span className="text-xl">{a.emoji}</span>
                <div>
                  <p className={`font-heading text-sm ${unlocked ? 'text-ink' : 'text-ghost'}`}>
                    {a.title}
                  </p>
                  <p className="text-xs text-ghost">{a.description}</p>
                </div>
                {unlocked && (
                  <span className="ml-auto text-ok text-xs font-heading">✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
