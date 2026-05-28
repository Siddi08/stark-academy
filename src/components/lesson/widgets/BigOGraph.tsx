import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'

const CURVES = [
  { id: 'o1',     label: 'O(1)',       colorClass: 'text-phase1',   stroke: '#00C896', fn: (_n: number) => 1 },
  { id: 'ologn',  label: 'O(log n)',   colorClass: 'text-phase3',   stroke: '#7C8FFF', fn: (n: number) => Math.log2(n) },
  { id: 'on',     label: 'O(n)',       colorClass: 'text-spark-400', stroke: '#7677FF', fn: (n: number) => n },
  { id: 'onlogn', label: 'O(n log n)', colorClass: 'text-phase4',   stroke: '#FFB547', fn: (n: number) => n * Math.log2(n) },
  { id: 'on2',    label: 'O(n²)',      colorClass: 'text-fail',     stroke: '#FF5263', fn: (n: number) => n * n },
] as const

type CurveId = typeof CURVES[number]['id']

const W = 400
const H = 220
const ML = 44
const MR = 12
const MT = 12
const MB = 36
const PW = W - ML - MR
const PH = H - MT - MB

function toSvgX(n: number, maxN: number) {
  return ML + (n / maxN) * PW
}

function toSvgY(val: number, maxY: number) {
  return MT + PH - (Math.min(val, maxY) / maxY) * PH
}

function buildPath(fn: (n: number) => number, maxN: number, maxY: number): string {
  const points: string[] = []
  for (let n = 1; n <= maxN; n++) {
    const x = toSvgX(n, maxN)
    const y = toSvgY(fn(n), maxY)
    points.push(`${n === 1 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return points.join(' ')
}

export function BigOGraph() {
  const [active, setActive] = useState<Set<CurveId>>(
    new Set(CURVES.map(c => c.id))
  )
  const [sliderN, setSliderN] = useState(20)

  const maxN = 100

  const dynamicMaxY = useMemo(() => {
    const activeCurves = CURVES.filter(c => active.has(c.id))
    if (activeCurves.length === 0) return 200
    const vals = activeCurves.map(c => c.fn(sliderN))
    const max = Math.max(...vals)
    return Math.max(max * 1.25, 10)
  }, [active, sliderN])

  const cappedMaxY = useMemo(() => {
    const activeCurves = CURVES.filter(c => active.has(c.id))
    if (activeCurves.length === 0) return 200
    const vals = activeCurves.map(c => c.fn(maxN))
    const max = Math.max(...vals)
    const soft = max * 0.25
    return Math.max(soft, 10)
  }, [active])

  const toggle = (id: CurveId) => {
    setActive(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        if (next.size > 1) next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const sliderX = toSvgX(sliderN, maxN)

  const yGridValues = [0.25, 0.5, 0.75, 1].map(f => cappedMaxY * f)

  const formatVal = (v: number) => {
    if (v >= 1e6) return `${(v / 1e6).toFixed(1)}M`
    if (v >= 1e3) return `${(v / 1e3).toFixed(1)}k`
    return v % 1 === 0 ? String(v) : v.toFixed(1)
  }

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-phase3/25 bg-surface">
      <div className="mb-4">
        <span className="font-heading text-xs text-phase3 uppercase tracking-widest">
          Big-O Complexity
        </span>
        <p className="text-xs text-ghost mt-0.5">Visualise how operations grow with input size n</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {CURVES.map(c => (
          <button
            key={c.id}
            onClick={() => toggle(c.id)}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-150 min-h-[36px]',
              active.has(c.id)
                ? cn('border-current/50 bg-current/10', c.colorClass)
                : 'border-border text-ghost hover:border-rim hover:text-dim',
            )}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: active.has(c.id) ? c.stroke : '#4A4864' }}
            />
            {c.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-[500px] block"
          aria-label="Big-O complexity graph"
        >
          {yGridValues.map((yv, i) => {
            const sy = toSvgY(yv, cappedMaxY)
            return (
              <line
                key={i}
                x1={ML} y1={sy} x2={ML + PW} y2={sy}
                stroke="#4A4864" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3"
              />
            )
          })}

          <line x1={ML} y1={MT} x2={ML} y2={MT + PH} stroke="#4A4864" strokeOpacity="0.5" strokeWidth="1" />
          <line x1={ML} y1={MT + PH} x2={ML + PW} y2={MT + PH} stroke="#4A4864" strokeOpacity="0.5" strokeWidth="1" />

          {[0, 25, 50, 75, 100].map(n => {
            const sx = toSvgX(n === 0 ? 1 : n, maxN)
            return (
              <g key={n}>
                <line x1={sx} y1={MT + PH} x2={sx} y2={MT + PH + 4} stroke="#4A4864" strokeOpacity="0.5" strokeWidth="1" />
                <text x={sx} y={MT + PH + 14} textAnchor="middle" fontSize="9" fill="#4A4864">{n === 0 ? '1' : n}</text>
              </g>
            )
          })}

          {yGridValues.map((yv, i) => {
            const sy = toSvgY(yv, cappedMaxY)
            return (
              <text key={i} x={ML - 4} y={sy + 3} textAnchor="end" fontSize="9" fill="#4A4864">
                {formatVal(yv)}
              </text>
            )
          })}

          <text
            x={ML + PW / 2} y={H - 2}
            textAnchor="middle" fontSize="9" fill="#9896B8"
          >
            n (input size)
          </text>

          <text
            x={8} y={MT + PH / 2}
            textAnchor="middle" fontSize="9" fill="#9896B8"
            transform={`rotate(-90, 8, ${MT + PH / 2})`}
          >
            Operations
          </text>

          {CURVES.filter(c => active.has(c.id)).map(c => (
            <path
              key={c.id}
              d={buildPath(c.fn, maxN, cappedMaxY)}
              fill="none"
              stroke={c.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          <line
            x1={sliderX} y1={MT} x2={sliderX} y2={MT + PH}
            stroke="#F2F1FF" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 3"
          />

          {CURVES.filter(c => active.has(c.id)).map(c => {
            const val = c.fn(sliderN)
            const sy = toSvgY(val, cappedMaxY)
            const clamped = sy >= MT && sy <= MT + PH
            if (!clamped) return null
            return (
              <circle
                key={c.id}
                cx={sliderX}
                cy={sy}
                r={3.5}
                fill={c.stroke}
                stroke="#0E0E14"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-[10px] text-ghost whitespace-nowrap font-mono">n=1</span>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={sliderN}
          onChange={e => setSliderN(Number(e.target.value))}
          className="flex-1 accent-phase3 h-1"
        />
        <span className="text-[10px] text-ghost whitespace-nowrap font-mono">n=100</span>
      </div>

      <div className="mt-3 p-3 rounded-xl bg-raised border border-border">
        <div className="text-[10px] text-ghost font-mono mb-2 uppercase tracking-wider">At n = {sliderN}</div>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {CURVES.filter(c => active.has(c.id)).map(c => (
            <span key={c.id} className={cn('text-xs font-mono', c.colorClass)}>
              {c.label} = {formatVal(c.fn(sliderN))}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
