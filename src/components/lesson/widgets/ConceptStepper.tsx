import { useState, useEffect, useRef } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

export interface StepperStep {
  label: string
  description: string
  detail?: string
  icon?: string
}

export interface ConceptStepperProps {
  title: string
  subtitle?: string
  steps: StepperStep[]
  accentColor?: 'spark' | 'phase1' | 'phase2' | 'phase3' | 'phase4' | 'phase5'
}

const ACCENT_MAP = {
  spark:  { border: 'border-spark-500/25', headerText: 'text-spark-500', activeBorder: 'border-spark-500', activeBg: 'bg-spark-500/10', activeNum: 'text-spark-400', activeShadow: 'shadow-[0_0_16px_-4px_rgba(84,86,245,0.4)]', doneBorder: 'border-ok/30', progressBg: 'bg-spark-500' },
  phase1: { border: 'border-phase1/25',    headerText: 'text-phase1',    activeBorder: 'border-phase1',    activeBg: 'bg-phase1/10',    activeNum: 'text-phase1',    activeShadow: 'shadow-[0_0_16px_-4px_rgba(0,200,150,0.4)]',    doneBorder: 'border-ok/30', progressBg: 'bg-phase1' },
  phase2: { border: 'border-phase2/25',    headerText: 'text-phase2',    activeBorder: 'border-phase2',    activeBg: 'bg-phase2/10',    activeNum: 'text-phase2',    activeShadow: 'shadow-[0_0_16px_-4px_rgba(255,107,74,0.4)]',    doneBorder: 'border-ok/30', progressBg: 'bg-phase2' },
  phase3: { border: 'border-phase3/25',    headerText: 'text-phase3',    activeBorder: 'border-phase3',    activeBg: 'bg-phase3/10',    activeNum: 'text-phase3',    activeShadow: 'shadow-[0_0_16px_-4px_rgba(124,143,255,0.4)]',    doneBorder: 'border-ok/30', progressBg: 'bg-phase3' },
  phase4: { border: 'border-phase4/25',    headerText: 'text-phase4',    activeBorder: 'border-phase4',    activeBg: 'bg-phase4/10',    activeNum: 'text-phase4',    activeShadow: 'shadow-[0_0_16px_-4px_rgba(255,181,71,0.4)]',    doneBorder: 'border-ok/30', progressBg: 'bg-phase4' },
  phase5: { border: 'border-phase5/25',    headerText: 'text-phase5',    activeBorder: 'border-phase5',    activeBg: 'bg-phase5/10',    activeNum: 'text-phase5',    activeShadow: 'shadow-[0_0_16px_-4px_rgba(194,120,255,0.4)]',    doneBorder: 'border-ok/30', progressBg: 'bg-phase5' },
} as const

const AUTO_PLAY_MS = 1800

export function ConceptStepper({ title, subtitle, steps, accentColor = 'spark' }: ConceptStepperProps) {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const accent = ACCENT_MAP[accentColor]

  const goTo = (index: number) => {
    setActive(index)
    setAnimKey(k => k + 1)
  }

  const prev = () => goTo(active === 0 ? steps.length - 1 : active - 1)
  const next = () => goTo((active + 1) % steps.length)

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setActive(i => {
          const next = (i + 1) % steps.length
          setAnimKey(k => k + 1)
          return next
        })
      }, AUTO_PLAY_MS)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [playing, steps.length])

  const currentStep = steps[active]

  return (
    <div className={cn('not-prose my-8 p-5 sm:p-6 rounded-2xl border bg-surface', accent.border)}>
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <span className={cn('font-heading text-xs uppercase tracking-widest', accent.headerText)}>{title}</span>
          {subtitle && <p className="text-xs text-ghost mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] text-ghost font-mono tabular-nums">{active + 1}/{steps.length}</span>
        </div>
      </div>

      {/* Step boxes */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        {steps.map((step, i) => {
          const isActive = i === active
          const isDone = i < active
          return (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => { setPlaying(false); goTo(i) }}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 min-h-[44px] text-left',
                  isActive && [accent.activeBorder, accent.activeBg, accent.activeShadow, 'scale-[1.04]'],
                  isDone && [accent.doneBorder, 'bg-raised/50 opacity-70'],
                  !isActive && !isDone && 'border-border bg-raised text-ghost hover:border-rim',
                )}
              >
                <span
                  key={isActive ? `active-${animKey}` : `inactive-${i}`}
                  className={cn(
                    'font-heading text-sm font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 leading-none',
                    isActive ? [accent.activeNum, 'animate-spark'] : isDone ? 'text-ok/60' : 'text-ghost',
                  )}
                >
                  {step.icon ?? (i + 1)}
                </span>
                <span className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-ink' : isDone ? 'text-dim' : 'text-ghost',
                )}>
                  {step.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <ChevronRight size={12} className="text-ghost/40 shrink-0" />
              )}
            </div>
          )
        })}
      </div>

      {/* Description panel */}
      <div
        key={`panel-${active}`}
        className={cn(
          'rounded-xl border p-4 mb-4 animate-fade-in',
          accent.activeBorder, accent.activeBg,
        )}
      >
        <div className="flex items-start gap-3">
          {currentStep.icon && (
            <span className="text-xl leading-none shrink-0 mt-0.5">{currentStep.icon}</span>
          )}
          <div className="min-w-0">
            <p className={cn('font-heading text-sm font-bold mb-1', accent.activeNum)}>{currentStep.label}</p>
            <p className="text-sm text-ink leading-relaxed">{currentStep.description}</p>
            {currentStep.detail && (
              <p className="text-xs text-dim mt-2 leading-relaxed">{currentStep.detail}</p>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={prev}
          className="btn-ghost flex items-center gap-1.5 text-xs px-3 min-h-[44px]"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <button
          onClick={() => setPlaying(p => !p)}
          className="btn-primary flex items-center gap-1.5 text-xs px-4 min-h-[44px]"
        >
          {playing ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
        </button>
        <button
          onClick={next}
          className="btn-ghost flex items-center gap-1.5 text-xs px-3 min-h-[44px]"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
