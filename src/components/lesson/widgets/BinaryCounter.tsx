import { useState, useEffect, useRef } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/cn'

const WEIGHTS = [8, 4, 2, 1]
const LABELS = ['2³', '2²', '2¹', '2⁰']

export function BinaryCounter() {
  const [count, setCount] = useState(0)
  const [running, setRunning] = useState(false)
  const [intervalMs, setIntervalMs] = useState(900)
  const prevCountRef = useRef(-1)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      setCount(n => (n + 1) % 16)
    }, intervalMs)
    return () => clearInterval(id)
  }, [running, intervalMs])

  const reset = () => {
    setRunning(false)
    setCount(0)
    prevCountRef.current = -1
  }

  const bits = WEIGHTS.map(w => (count & w) !== 0)
  // Track which bits changed from the previous value
  const prevBits = WEIGHTS.map(w => (prevCountRef.current & w) !== 0)

  useEffect(() => {
    prevCountRef.current = count
  })

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-phase1/25 bg-surface">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="font-heading text-xs text-phase1 uppercase tracking-widest">
            Binary Counter
          </span>
          <p className="text-xs text-ghost mt-0.5">Watch the bits flip — like an odometer in base-2</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={reset}
            className="btn-ghost text-xs px-3 min-h-[36px] flex items-center gap-1.5"
          >
            <RotateCcw size={11} />
          </button>
          <button
            onClick={() => setRunning(r => !r)}
            className="btn-primary text-xs px-4 min-h-[36px] flex items-center gap-1.5"
          >
            {running ? <><Pause size={12} /> Pause</> : <><Play size={12} /> Play</>}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 sm:gap-6">
        {/* Bit cells */}
        <div className="flex gap-2 sm:gap-3">
          {bits.map((bit, i) => {
            const changed = bit !== prevBits[i]
            return (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className={cn(
                  'font-mono text-[10px] sm:text-xs transition-colors duration-200',
                  bit ? 'text-phase1' : 'text-ghost',
                )}>
                  {LABELS[i]}
                </span>
                <div className={cn(
                  'w-12 h-12 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center border-2 transition-all duration-200',
                  bit
                    ? 'bg-phase1/15 border-phase1/60 shadow-[0_0_16px_-4px_rgba(0,200,150,0.6)]'
                    : 'bg-raised border-border',
                )}>
                  <span
                    key={`${i}-${bit}`}
                    className={cn(
                      'font-heading text-xl sm:text-2xl font-bold',
                      changed ? 'animate-spark' : '',
                      bit ? 'text-phase1' : 'text-ghost',
                    )}
                  >
                    {bit ? '1' : '0'}
                  </span>
                </div>
                <span className={cn(
                  'font-mono text-[10px] transition-colors duration-200',
                  bit ? 'text-phase1/70' : 'text-ghost/40',
                )}>
                  {WEIGHTS[i]}
                </span>
              </div>
            )
          })}
        </div>

        {/* Equals + decimal */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-ghost text-2xl font-light">=</span>
          <div className="text-center min-w-[3rem]">
            <div
              key={count}
              className="font-heading text-4xl sm:text-5xl font-bold text-ink tabular-nums animate-spark"
            >
              {count}
            </div>
            <div className="text-[10px] text-ghost mt-1">decimal</div>
          </div>
        </div>
      </div>

      {/* Active bit sum */}
      <div className="mt-4 text-center min-h-[1.25rem]">
        {count > 0 ? (
          <span className="text-xs text-dim font-mono">
            {WEIGHTS
              .filter((_, i) => bits[i])
              .join(' + ')} = {count}
          </span>
        ) : (
          <span className="text-xs text-ghost font-mono">0</span>
        )}
      </div>

      {/* Speed slider */}
      <div className="mt-4 flex items-center gap-3">
        <span className="text-[10px] text-ghost whitespace-nowrap">Slow</span>
        <input
          type="range"
          min={250}
          max={1500}
          step={50}
          value={intervalMs}
          onChange={e => setIntervalMs(Number(e.target.value))}
          className="flex-1 accent-phase1 h-1"
        />
        <span className="text-[10px] text-ghost whitespace-nowrap">Fast</span>
      </div>
    </div>
  )
}
