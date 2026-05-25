import { useNavigate } from 'react-router-dom'
import { Lock, CheckCircle, Circle, PlayCircle, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { allModules } from '@/data/curriculum'
import { ARC_META, type ArcNumber, type Module } from '@/types'
import { useProgress } from '@/store/useAppStore'
import { ProgressBar } from '@/components/ui/ProgressBar'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModuleStatus = 'complete' | 'in_progress' | 'available' | 'locked'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getModuleStatus(
  module: Module,
  completedLessons: string[],
): ModuleStatus {
  const lessonIds = module.lessons.map(l => l.id)
  const done = lessonIds.filter(id => completedLessons.includes(id)).length

  if (done === lessonIds.length && lessonIds.length > 0) return 'complete'
  if (done > 0) return 'in_progress'
  if (!module.prerequisiteModuleId) return 'available'

  const prereq = allModules.find(m => m.id === module.prerequisiteModuleId)
  if (!prereq) return 'available'

  const prereqDone = prereq.lessons.every(l => completedLessons.includes(l.id))
  return prereqDone ? 'available' : 'locked'
}

function getLessonProgress(module: Module, completedLessons: string[]): number {
  const total = module.lessons.length
  if (total === 0) return 0
  const done = module.lessons.filter(l => completedLessons.includes(l.id)).length
  return Math.round((done / total) * 100)
}

// ─── Arc colour helpers ────────────────────────────────────────────────────────

const arcPhaseClass: Record<ArcNumber, string> = {
  1: 'text-phase1',
  2: 'text-phase2',
  3: 'text-phase3',
  4: 'text-phase4',
  5: 'text-phase5',
}

const arcBorderClass: Record<ArcNumber, string> = {
  1: 'border-phase1/20',
  2: 'border-phase2/20',
  3: 'border-phase3/20',
  4: 'border-phase4/20',
  5: 'border-phase5/20',
}

const arcBgClass: Record<ArcNumber, string> = {
  1: 'bg-phase1/5',
  2: 'bg-phase2/5',
  3: 'bg-phase3/5',
  4: 'bg-phase4/5',
  5: 'bg-phase5/5',
}

const arcProgressColor: Record<ArcNumber, 'phase1'|'phase2'|'phase3'|'phase4'|'phase5'> = {
  1: 'phase1', 2: 'phase2', 3: 'phase3', 4: 'phase4', 5: 'phase5',
}

// ─── Module card ──────────────────────────────────────────────────────────────

interface ModuleCardProps {
  module: Module
  status: ModuleStatus
  progress: number
}

function ModuleCard({ module, status, progress }: ModuleCardProps) {
  const navigate = useNavigate()
  const arc = module.arc
  const isLocked = status === 'locked'
  const isComplete = status === 'complete'
  const isActive = status === 'in_progress'
  const isFinal = !!module.finalExam

  return (
    <button
      onClick={() => !isLocked && navigate(`/module/${module.id}`)}
      disabled={isLocked}
      className={cn(
        'w-full text-left card p-4 transition-all duration-200 group',
        'min-h-[44px] relative overflow-hidden',
        !isLocked && 'hover:border-spark-500/30 hover:bg-raised cursor-pointer',
        isLocked && 'opacity-50 cursor-not-allowed',
        isComplete && 'border-ok/20 bg-ok/5',
        isActive && 'border-spark-500/25',
      )}
    >
      {/* Active glow pulse */}
      {isActive && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-spark-500 animate-pulse-slow" />
      )}

      {/* Arc final indicator */}
      {isFinal && !isLocked && (
        <div className={cn(
          'absolute top-0 right-0 text-[9px] font-heading font-bold px-1.5 py-0.5 rounded-bl-lg',
          arcBgClass[arc],
          arcPhaseClass[arc],
        )}>
          ARC FINAL
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Status icon */}
        <div className="shrink-0 mt-0.5">
          {isComplete && <CheckCircle size={16} className="text-ok" />}
          {isActive   && <PlayCircle  size={16} className="text-spark-400 animate-pulse-slow" />}
          {status === 'available' && <Circle size={16} className={arcPhaseClass[arc]} />}
          {isLocked   && <Lock size={14} className="text-ghost" />}
        </div>

        {/* Module info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-[10px] text-ghost">M{module.number}</span>
            {isComplete && (
              <span className="font-heading text-[9px] text-ok uppercase tracking-wide">Done</span>
            )}
          </div>
          <p className={cn(
            'font-heading text-sm font-semibold leading-snug',
            isLocked ? 'text-ghost' : 'text-ink',
          )}>
            {module.title}
          </p>

          {/* Lesson progress bar */}
          {!isLocked && progress > 0 && progress < 100 && (
            <div className="mt-2">
              <ProgressBar value={progress} color={arcProgressColor[arc]} size="xs" />
              <p className="text-[10px] text-ghost mt-1 font-mono">{progress}% complete</p>
            </div>
          )}
        </div>

        {/* Arrow */}
        {!isLocked && (
          <ChevronRight
            size={14}
            className="shrink-0 text-ghost group-hover:text-dim transition-colors mt-1"
          />
        )}
      </div>
    </button>
  )
}

// ─── Arc section ──────────────────────────────────────────────────────────────

interface ArcSectionProps {
  arc: ArcNumber
  completedLessons: string[]
}

function ArcSection({ arc, completedLessons }: ArcSectionProps) {
  const meta = ARC_META[arc]
  const arcModules = allModules.filter(m => m.arc === arc)

  // Arc-level stats
  const totalLessons  = arcModules.reduce((n, m) => n + m.lessons.length, 0)
  const doneLessons   = arcModules.reduce(
    (n, m) => n + m.lessons.filter(l => completedLessons.includes(l.id)).length,
    0,
  )
  const arcPercent = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0
  const completeCount = arcModules.filter(m =>
    getModuleStatus(m, completedLessons) === 'complete',
  ).length

  return (
    <section className={cn(
      'rounded-2xl border p-5',
      arcBorderClass[arc],
      arcBgClass[arc],
    )}>
      {/* Arc header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={cn('font-heading text-xs uppercase tracking-widest font-bold', arcPhaseClass[arc])}>
              Arc {arc}
            </span>
            <span className="font-mono text-[10px] text-ghost">
              {completeCount}/{arcModules.length} modules
            </span>
          </div>
          <h2 className="font-heading text-lg font-bold text-ink">{meta.title}</h2>
          <p className="text-xs text-dim mt-0.5">{meta.subtitle}</p>
        </div>
        <span className={cn('font-heading text-2xl font-bold tabular-nums', arcPhaseClass[arc])}>
          {arcPercent}%
        </span>
      </div>

      {/* Arc progress bar */}
      <ProgressBar
        value={arcPercent}
        color={arcProgressColor[arc]}
        size="xs"
        className="mb-4"
      />

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {arcModules.map(m => (
          <ModuleCard
            key={m.id}
            module={m}
            status={getModuleStatus(m, completedLessons)}
            progress={getLessonProgress(m, completedLessons)}
          />
        ))}
      </div>
    </section>
  )
}

// ─── ArcMap ───────────────────────────────────────────────────────────────────

export function ArcMap() {
  const { completedLessons, xp } = useProgress()

  const totalLessons = allModules.reduce((n, m) => n + m.lessons.length, 0)
  const doneCount    = completedLessons.length
  const overallPct   = totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Overall summary strip */}
      <div className="card p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-heading text-xs text-dim uppercase tracking-wide">Overall Progress</span>
            <span className="font-mono text-xs text-spark-300">{doneCount}/{totalLessons} lessons</span>
          </div>
          <ProgressBar value={overallPct} color="spark" size="sm" />
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-sm text-spark-300">{xp.toLocaleString()}</p>
          <p className="text-[10px] text-ghost font-body">XP earned</p>
        </div>
      </div>

      {/* Arc sections */}
      {([1, 2, 3, 4, 5] as ArcNumber[]).map(arc => (
        <ArcSection key={arc} arc={arc} completedLessons={completedLessons} />
      ))}
    </div>
  )
}
