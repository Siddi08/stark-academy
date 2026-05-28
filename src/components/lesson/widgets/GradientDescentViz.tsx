import { useState, useEffect, useRef, useCallback } from 'react'
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react'
import { cn } from '@/utils/cn'

const SVG_W = 400
const SVG_H = 220
const X_MIN = -4
const X_MAX = 4
const PADDING = { left: 36, right: 12, top: 12, bottom: 28 }
const PLOT_W = SVG_W - PADDING.left - PADDING.right
const PLOT_H = SVG_H - PADDING.top - PADDING.bottom

const DEFAULT_START = 3.5
const HISTORY_LEN = 15
const AUTO_STEP_MS = 600

function f(x: number): number {
  return 0.5 * x * x + 2 * Math.sin(2 * x)
}

function df(x: number): number {
  return x + 4 * Math.cos(2 * x)
}

function round3(v: number) {
  return Math.round(v * 1000) / 1000
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function xToSVG(x: number, yMin: number, yMax: number) {
  const px = ((x - X_MIN) / (X_MAX - X_MIN)) * PLOT_W + PADDING.left
  return px
}

function yToSVG(y: number, yMin: number, yMax: number) {
  const py = ((yMax - y) / (yMax - yMin)) * PLOT_H + PADDING.top
  return py
}

function buildCurvePath(yMin: number, yMax: number): string {
  const steps = 200
  const points: string[] = []
  for (let i = 0; i <= steps; i++) {
    const x = X_MIN + (i / steps) * (X_MAX - X_MIN)
    const y = f(x)
    const px = xToSVG(x, yMin, yMax)
    const py = yToSVG(y, yMin, yMax)
    points.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`)
  }
  return points.join(' ')
}

function computeYRange() {
  const steps = 200
  let yMin = Infinity
  let yMax = -Infinity
  for (let i = 0; i <= steps; i++) {
    const x = X_MIN + (i / steps) * (X_MAX - X_MIN)
    const y = f(x)
    if (y < yMin) yMin = y
    if (y > yMax) yMax = y
  }
  const pad = (yMax - yMin) * 0.12
  return { yMin: yMin - pad, yMax: yMax + pad }
}

const { yMin: Y_MIN, yMax: Y_MAX } = computeYRange()
const CURVE_PATH = buildCurvePath(Y_MIN, Y_MAX)

function buildGradientFillPath(): string {
  const zero = yToSVG(Y_MIN, Y_MIN, Y_MAX)
  const steps = 200
  const parts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const x = X_MIN + (i / steps) * (X_MAX - X_MIN)
    const y = f(x)
    const px = xToSVG(x, Y_MIN, Y_MAX)
    const py = yToSVG(y, Y_MIN, Y_MAX)
    parts.push(`${i === 0 ? 'M' : 'L'}${px.toFixed(2)},${py.toFixed(2)}`)
  }
  const x0 = xToSVG(X_MIN, Y_MIN, Y_MAX)
  const x1 = xToSVG(X_MAX, Y_MIN, Y_MAX)
  parts.push(`L${x1.toFixed(2)},${zero.toFixed(2)} L${x0.toFixed(2)},${zero.toFixed(2)} Z`)
  return parts.join(' ')
}

const FILL_PATH = buildGradientFillPath()

function isLocalMin(x: number): boolean {
  const g = df(x)
  return Math.abs(g) < 0.05
}

export function GradientDescentViz() {
  const [pos, setPos] = useState(DEFAULT_START)
  const [lr, setLr] = useState(0.1)
  const [steps, setSteps] = useState(0)
  const [history, setHistory] = useState<number[]>([DEFAULT_START])
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const doStep = useCallback((currentPos: number, currentLr: number) => {
    const grad = df(currentPos)
    const next = clamp(currentPos - currentLr * grad, X_MIN, X_MAX)
    return next
  }, [])

  const stepOnce = useCallback(() => {
    setPos(p => {
      const next = doStep(p, lr)
      setHistory(h => [...h.slice(-HISTORY_LEN + 1), next])
      setSteps(s => s + 1)
      return next
    })
  }, [doStep, lr])

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(stepOnce, AUTO_STEP_MS)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [playing, stepOnce])

  const reset = () => {
    setPlaying(false)
    setPos(DEFAULT_START)
    setHistory([DEFAULT_START])
    setSteps(0)
  }

  const randomStart = () => {
    setPlaying(false)
    const x = Math.round((Math.random() * (X_MAX - X_MIN) + X_MIN) * 10) / 10
    setPos(x)
    setHistory([x])
    setSteps(0)
  }

  const loss = f(pos)
  const grad = df(pos)
  const stepSize = -lr * grad
  const stuck = isLocalMin(pos) && steps > 0
  const highLR = lr > 0.4

  const dotX = xToSVG(pos, Y_MIN, Y_MAX)
  const dotY = yToSVG(loss, Y_MIN, Y_MAX)

  const arrowEndX = xToSVG(clamp(pos + stepSize * 4, X_MIN, X_MAX), Y_MIN, Y_MAX)

  return (
    <div className="not-prose my-8 rounded-2xl border border-spark-500/25 bg-surface overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <span className="font-heading text-xs text-spark-400 uppercase tracking-widest">Gradient Descent</span>
          <p className="text-xs text-ghost mt-0.5">f(x) = 0.5x² + 2·sin(2x) — adjust the learning rate to escape local minima</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button onClick={reset} className="btn-ghost text-xs px-3 min-h-[36px] flex items-center gap-1.5" title="Reset">
            <RotateCcw size={12} />
          </button>
          <button onClick={randomStart} className="btn-ghost text-xs px-3 min-h-[36px] flex items-center gap-1.5" title="Random start">
            <Shuffle size={12} />
          </button>
        </div>
      </div>

      {/* SVG Plot */}
      <div className="px-4 pb-2">
        <svg
          width={SVG_W}
          height={SVG_H}
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="rounded-xl border border-border bg-void w-full"
        >
          <defs>
            <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5456F5" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#5456F5" stopOpacity="0" />
            </linearGradient>
            <marker id="gradArrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <path d="M0,0 L0,6 L6,3 z" fill="#FFB547" />
            </marker>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Clip region */}
          <clipPath id="plotClip">
            <rect x={PADDING.left} y={PADDING.top} width={PLOT_W} height={PLOT_H} />
          </clipPath>

          {/* Gradient fill under curve */}
          <path d={FILL_PATH} fill="url(#curveFill)" clipPath="url(#plotClip)" />

          {/* Axes */}
          <line
            x1={PADDING.left} y1={PADDING.top + PLOT_H}
            x2={PADDING.left + PLOT_W} y2={PADDING.top + PLOT_H}
            stroke="#4A4864" strokeWidth="1"
          />
          <line
            x1={PADDING.left} y1={PADDING.top}
            x2={PADDING.left} y2={PADDING.top + PLOT_H}
            stroke="#4A4864" strokeWidth="1"
          />

          {/* X axis labels */}
          {[-4, -2, 0, 2, 4].map(v => (
            <text
              key={v}
              x={xToSVG(v, Y_MIN, Y_MAX)}
              y={PADDING.top + PLOT_H + 14}
              textAnchor="middle"
              fontSize="9"
              fill="#4A4864"
            >
              {v}
            </text>
          ))}

          {/* Curve */}
          <path d={CURVE_PATH} fill="none" stroke="#5456F5" strokeWidth="2" clipPath="url(#plotClip)" />

          {/* History trail */}
          {history.slice(0, -1).map((hx, i) => {
            const opacity = 0.15 + (i / (history.length - 1)) * 0.45
            const hpx = xToSVG(hx, Y_MIN, Y_MAX)
            const hpy = yToSVG(f(hx), Y_MIN, Y_MAX)
            return (
              <circle
                key={i}
                cx={hpx}
                cy={hpy}
                r={3}
                fill="#7C8FFF"
                opacity={opacity}
                clipPath="url(#plotClip)"
              />
            )
          })}

          {/* Step arrow (negative gradient direction) */}
          {Math.abs(stepSize) > 0.01 && (
            <line
              x1={dotX}
              y1={dotY}
              x2={arrowEndX}
              y2={dotY}
              stroke="#FFB547"
              strokeWidth="1.5"
              markerEnd="url(#gradArrow)"
              opacity="0.8"
              clipPath="url(#plotClip)"
            />
          )}

          {/* Glowing dot */}
          <circle
            cx={dotX}
            cy={dotY}
            r={7}
            fill="#5456F5"
            opacity="0.25"
            filter="url(#glow)"
            style={{ transition: 'cx 0.3s ease, cy 0.3s ease' }}
          />
          <circle
            cx={dotX}
            cy={dotY}
            r={5}
            fill="#7677FF"
            stroke="#F2F1FF"
            strokeWidth="1.5"
            style={{ transition: 'cx 0.3s ease, cy 0.3s ease' }}
          />

          {/* Y axis label */}
          <text x={PADDING.left - 2} y={PADDING.top + 6} textAnchor="end" fontSize="9" fill="#4A4864">f(x)</text>
        </svg>
      </div>

      {/* Stats row */}
      <div className="px-5 pb-3">
        <div className="bg-raised border border-border rounded-xl px-4 py-2.5 font-mono text-xs">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-dim">
            <span><span className="text-spark-400">x</span> = {round3(pos)}</span>
            <span><span className="text-phase1">loss</span> = {round3(loss)}</span>
            <span><span className="text-phase2">∇</span> = {round3(grad)}</span>
            <span><span className="text-phase4">step</span> = −lr×∇ = {round3(stepSize)}</span>
            <span className="ml-auto text-ghost">steps: <span className="text-ink">{steps}</span></span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      <div className="px-5 pb-2 min-h-[2rem]">
        {stuck && (
          <div
            key={`stuck-${steps}`}
            className="text-xs text-warn font-mono animate-fade-in"
          >
            Stuck in local minimum! Try a higher learning rate.
          </div>
        )}
        {highLR && !stuck && (
          <div className="text-xs text-phase2 font-mono">
            High learning rate — may oscillate!
          </div>
        )}
      </div>

      {/* Learning rate slider */}
      <div className="px-5 pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-ghost w-6">0.01</span>
          <input
            type="range"
            min={0.01}
            max={0.8}
            step={0.01}
            value={lr}
            onChange={e => setLr(Number(e.target.value))}
            className={cn('flex-1 h-1', lr > 0.4 ? 'accent-phase2' : 'accent-spark-500')}
          />
          <span className="font-mono text-[10px] text-ghost w-6">0.8</span>
          <span className={cn('font-mono text-xs w-10 text-right', lr > 0.4 ? 'text-phase2' : 'text-spark-400')}>
            {lr.toFixed(2)}
          </span>
          <span className="font-mono text-[10px] text-ghost">lr</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 pb-5 flex gap-2 flex-wrap">
        <button
          onClick={() => setPlaying(p => !p)}
          className="btn-primary text-xs px-5 min-h-[44px] flex items-center gap-2 flex-1 sm:flex-none justify-center"
        >
          {playing ? <><Pause size={13} /> Pause</> : <><Play size={13} /> Play</>}
        </button>
        <button
          onClick={stepOnce}
          disabled={playing}
          className={cn(
            'btn-secondary text-xs px-5 min-h-[44px]',
            playing && 'opacity-40 cursor-not-allowed',
          )}
        >
          Step
        </button>
        <button onClick={reset} className="btn-ghost text-xs px-4 min-h-[44px]">
          Reset
        </button>
        <button onClick={randomStart} className="btn-ghost text-xs px-4 min-h-[44px] flex items-center gap-1.5">
          <Shuffle size={12} /> Random
        </button>
      </div>
    </div>
  )
}
