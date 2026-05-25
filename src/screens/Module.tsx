import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, CheckCircle, Lock,
  Circle, PlayCircle, BookOpen, ClipboardList, Star,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { allModules } from '@/data/curriculum'
import { ARC_META } from '@/types'
import { useProgress } from '@/store/useAppStore'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Badge } from '@/components/ui/Badge'

const arcProgressColor = {
  1: 'phase1', 2: 'phase2', 3: 'phase3', 4: 'phase4', 5: 'phase5',
} as const

const arcPhaseClass = {
  1: 'text-phase1', 2: 'text-phase2', 3: 'text-phase3', 4: 'text-phase4', 5: 'text-phase5',
} as const

export default function ModuleScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const module = allModules.find(m => m.id === id)
  const { completedLessons, quizAttempts } = useProgress()

  if (!module) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-dim">Module not found.</p>
        <Link to="/curriculum" className="btn-ghost mt-4 inline-flex">← Curriculum</Link>
      </div>
    )
  }

  const arc = module.arc
  const meta = ARC_META[arc]

  // Progress stats
  const lessonIds = module.lessons.map(l => l.id)
  const doneLessons = lessonIds.filter(id => completedLessons.includes(id)).length
  const progressPct = lessonIds.length > 0 ? Math.round((doneLessons / lessonIds.length) * 100) : 0

  // Quiz helpers
  const lessonQuizzes = module.quizzes.filter(q => q.type === 'lesson')
  const moduleFinal   = module.quizzes.find(q => q.type === 'module_final')
  const arcFinal      = module.finalExam

  function bestScore(quizId: string): number | null {
    const attempts = quizAttempts.filter(a => a.quizId === quizId)
    if (!attempts.length) return null
    return Math.max(...attempts.map(a => a.score))
  }
  function passed(quizId: string): boolean {
    return quizAttempts.some(a => a.quizId === quizId && a.passed)
  }

  // Prerequisite check
  const prereq = module.prerequisiteModuleId
    ? allModules.find(m => m.id === module.prerequisiteModuleId)
    : null
  const prereqDone = prereq
    ? prereq.lessons.every(l => completedLessons.includes(l.id))
    : true
  const isLocked = !prereqDone

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto animate-fade-up">
      {/* Back */}
      <Link to="/curriculum" className="btn-ghost inline-flex gap-2 -ml-3 mb-5">
        <ChevronLeft size={16} /> Curriculum
      </Link>

      {/* Module header */}
      <div className="card-glow p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={cn('font-heading text-xs uppercase tracking-widest font-bold', arcPhaseClass[arc])}>
                Arc {arc} · {meta.title}
              </span>
              {module.finalExam && (
                <Badge variant={`phase${arc}`} size="sm">Arc Final</Badge>
              )}
            </div>
            <h1 className="font-heading text-2xl font-bold text-ink">{module.title}</h1>
          </div>
          <span className="font-mono text-3xl font-bold text-border shrink-0">
            M{module.number}
          </span>
        </div>

        <p className="text-sm text-dim leading-relaxed mb-4">{module.description}</p>

        <ProgressBar value={progressPct} color={arcProgressColor[arc]} size="sm" />
        <p className="text-xs text-ghost mt-1.5 font-mono">
          {doneLessons}/{lessonIds.length} lessons complete
        </p>
      </div>

      {/* Locked state */}
      {isLocked && prereq && (
        <div className="card p-4 flex items-center gap-3 mb-4 border-warn/20 bg-warn/5">
          <Lock size={16} className="text-warn shrink-0" />
          <p className="text-sm text-dim">
            Complete{' '}
            <Link to={`/module/${prereq.id}`} className="text-spark-300 underline">
              M{prereq.number}: {prereq.title}
            </Link>{' '}
            to unlock this module.
          </p>
        </div>
      )}

      {/* ── Lessons ── */}
      <section className="mb-6">
        <h2 className="font-heading text-xs uppercase tracking-widest text-dim flex items-center gap-2 mb-3">
          <BookOpen size={14} /> Lessons
        </h2>
        <div className="space-y-2">
          {module.lessons.map((lesson, i) => {
            const done = completedLessons.includes(lesson.id)
            const quizForLesson = lessonQuizzes[i]
            const quizDone = quizForLesson ? passed(quizForLesson.id) : false

            return (
              <div key={lesson.id} className="card overflow-hidden">
                {/* Lesson row */}
                <button
                  onClick={() => !isLocked && navigate(`/lesson/${lesson.id}`)}
                  disabled={isLocked}
                  className="w-full flex items-center gap-3 px-4 py-3.5 min-h-[44px] group hover:bg-raised transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {done
                    ? <CheckCircle size={16} className="text-ok shrink-0" />
                    : isLocked
                    ? <Lock size={14} className="text-ghost shrink-0" />
                    : <Circle size={16} className={cn(arcPhaseClass[arc], 'shrink-0')} />
                  }
                  <div className="flex-1 min-w-0 text-left">
                    <p className={cn(
                      'font-heading text-sm',
                      done ? 'text-dim' : 'text-ink',
                    )}>
                      {lesson.number} — {lesson.title}
                    </p>
                    <p className="text-xs text-ghost">{lesson.duration} min</p>
                  </div>
                  {!isLocked && <ChevronRight size={14} className="text-ghost group-hover:text-dim transition-colors shrink-0" />}
                </button>

                {/* Lesson quiz row */}
                {quizForLesson && (
                  <button
                    onClick={() => !isLocked && navigate(`/quiz/${quizForLesson.id}`)}
                    disabled={isLocked || !done}
                    className="w-full flex items-center gap-3 px-4 py-2.5 min-h-[44px] border-t border-border/50 bg-raised/50 hover:bg-raised transition-colors disabled:opacity-40 disabled:cursor-not-allowed group"
                  >
                    <ClipboardList size={14} className={cn(
                      'shrink-0',
                      quizDone ? 'text-ok' : 'text-ghost',
                    )} />
                    <span className="flex-1 text-left text-xs text-ghost font-body">
                      Quiz · {quizForLesson.questions.length} questions
                    </span>
                    {bestScore(quizForLesson.id) !== null && (
                      <span className={cn(
                        'font-mono text-xs',
                        quizDone ? 'text-ok' : 'text-warn',
                      )}>
                        {bestScore(quizForLesson.id)}%
                      </span>
                    )}
                    {!isLocked && done && <ChevronRight size={12} className="text-ghost group-hover:text-dim transition-colors shrink-0" />}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Module Final ── */}
      {moduleFinal && (
        <section className="mb-6">
          <h2 className="font-heading text-xs uppercase tracking-widest text-dim flex items-center gap-2 mb-3">
            <ClipboardList size={14} /> Module Final
          </h2>
          <button
            onClick={() => !isLocked && progressPct === 100 && navigate(`/quiz/${moduleFinal.id}`)}
            disabled={isLocked || progressPct < 100}
            className={cn(
              'w-full card p-4 flex items-center gap-4 min-h-[44px] transition-all',
              !isLocked && progressPct === 100 && 'hover:border-spark-500/30 hover:bg-raised cursor-pointer',
              (isLocked || progressPct < 100) && 'opacity-50 cursor-not-allowed',
            )}
          >
            {passed(moduleFinal.id)
              ? <CheckCircle size={18} className="text-ok shrink-0" />
              : progressPct < 100
              ? <Lock size={16} className="text-ghost shrink-0" />
              : <PlayCircle size={18} className="text-spark-400 shrink-0" />
            }
            <div className="flex-1 text-left">
              <p className="font-heading text-sm text-ink">{moduleFinal.title}</p>
              <p className="text-xs text-ghost">
                {moduleFinal.questions.length} questions · Pass mark: {moduleFinal.passMark}%
                {progressPct < 100 && ' · Complete all lessons first'}
              </p>
            </div>
            {bestScore(moduleFinal.id) !== null && (
              <span className={cn('font-mono text-sm', passed(moduleFinal.id) ? 'text-ok' : 'text-warn')}>
                {bestScore(moduleFinal.id)}%
              </span>
            )}
          </button>
        </section>
      )}

      {/* ── Arc Final ── */}
      {arcFinal && (
        <section className="mb-6">
          <h2 className={cn(
            'font-heading text-xs uppercase tracking-widest flex items-center gap-2 mb-3',
            arcPhaseClass[arc],
          )}>
            <Star size={14} /> Arc Final Exam
          </h2>
          <button
            onClick={() => passed(moduleFinal?.id ?? '') && navigate(`/quiz/${arcFinal.id}`)}
            disabled={!passed(moduleFinal?.id ?? '')}
            className={cn(
              'w-full card p-5 flex items-center gap-4 min-h-[44px] transition-all',
              `border-phase${arc}/20 bg-phase${arc}/5`,
              passed(moduleFinal?.id ?? '') && 'hover:bg-raised cursor-pointer',
              !passed(moduleFinal?.id ?? '') && 'opacity-50 cursor-not-allowed',
            )}
          >
            {passed(arcFinal.id)
              ? <CheckCircle size={20} className="text-ok shrink-0" />
              : !passed(moduleFinal?.id ?? '')
              ? <Lock size={16} className="text-ghost shrink-0" />
              : <Star size={20} className={cn(arcPhaseClass[arc], 'shrink-0')} />
            }
            <div className="flex-1 text-left">
              <p className="font-heading text-sm text-ink">{arcFinal.title}</p>
              <p className="text-xs text-ghost">
                {arcFinal.questions.length} questions · Pass mark: {arcFinal.passMark}%
                {!passed(moduleFinal?.id ?? '') && ' · Pass the module final first'}
              </p>
            </div>
            {bestScore(arcFinal.id) !== null && (
              <span className={cn(
                'font-mono text-sm',
                passed(arcFinal.id) ? 'text-ok' : 'text-warn',
              )}>
                {bestScore(arcFinal.id)}%
              </span>
            )}
          </button>
        </section>
      )}

      {/* ── Project ── */}
      <section>
        <h2 className="font-heading text-xs uppercase tracking-widest text-dim flex items-center gap-2 mb-3">
          🔧 Project
        </h2>
        <Link
          to="/projects"
          className="card p-5 flex items-center gap-4 hover:border-spark-500/30 hover:bg-raised transition-all group"
        >
          <span className="text-3xl">{module.project.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm text-ink">{module.project.name}</p>
            <p className="text-xs text-ghost">{module.project.xpReward} XP · {module.project.rubric.length} rubric items</p>
          </div>
          <ChevronRight size={16} className="text-ghost group-hover:text-dim transition-colors shrink-0" />
        </Link>
      </section>
    </div>
  )
}
