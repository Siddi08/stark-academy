import { useState, useCallback } from 'react'
import { cn } from '@/utils/cn'

const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))
const tanh = (x: number) => Math.tanh(x)
const relu = (x: number) => Math.max(0, x)
const leakyRelu = (x: number) => x > 0 ? x : 0.01 * x
const gelu = (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)))
const swish = (x: number) => x * sigmoid(x)

type FnId = 'sigmoid' | 'tanh' | 'relu' | 'leaky-relu' | 'gelu' | 'swish'

interface FnDef {
  id: FnId
  label: string
  fn: (x: number) => number
  stroke: string
  colorClass: string
}

const FNS: FnDef[] = [
  { id: 'sigmoid',    label: 'Sigmoid',    fn: sigmoid,   stroke: '#00C896', colorClass: 'text-phase1' },
  { id: 'tanh',       label: 'Tanh',       fn: tanh,      stroke: '#FF6B4A', colorClass: 'text-phase2' },
  { id: 'relu',       label: 'ReLU',       fn: relu,      stroke: '#7677FF', colorClass: 'text-spark-400' },
  { id: 'leaky-relu', label: 'Leaky ReLU', fn: leakyRelu, stroke: '#7C8FFF', colorClass: 'text-phase3' },
  { id: 'gelu',       label: 'GELU',       fn: gelu,      stroke: '#FFB547', colorClass: 'text-phase4' },
  { id: 'swish',      label: 'Swish',      fn: swish,     stroke: '#C278FF', colorClass: 'text-phase5' },
]

const W = 400
const H = 250
const ML = 40
const MR = 12
const MT = 12
const MB = 28
const PW = W - ML - MR
const PH = H - MT - MB

const X_MIN = -4
const X_MAX = 4
const Y_MIN = -1.5
const Y_MAX = 3

const STEPS = 200

function toSvgX(x: number) {
  return ML + ((x - X_MIN) / (X_MAX - X_MIN)) * PW
}

function toSvgY(y: number) {
  return MT + PH - ((Math.max(Y_MIN, Math.min(Y_MAX, y)) - Y_MIN) / (Y_MAX - Y_MIN)) * PH
}

function fromSvgX(sx: number) {
  return X_MIN + ((sx - ML) / PW) * (X_MAX - X_MIN)
}

function buildPath(fn: (x: number) => number): string {
  const pts: string[] = []
  for (let i = 0; i <= STEPS; i++) {
    const x = X_MIN + (i / STEPS) * (X_MAX - X_MIN)
    const y = fn(x)
    const sx = toSvgX(x)
    const sy = toSvgY(y)
    const outside = y < Y_MIN || y > Y_MAX
    if (outside || i === 0) {
      pts.push(`M${sx.toFixed(2)},${sy.toFixed(2)}`)
    } else {
      pts.push(`L${sx.toFixed(2)},${sy.toFixed(2)}`)
    }
  }
  return pts.join(' ')
}

export function ActivationPlotter() {
  const [active, setActive] = useState<Set<FnId>>(new Set(['relu', 'gelu']))
  const [sliderX, setSliderX] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const toggle = (id: FnId) => {
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

  const getSvgX = useCallback((e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const rawSvgX = ((clientX - rect.left) / rect.width) * W
    const clamped = Math.max(ML, Math.min(ML + PW, rawSvgX))
    return fromSvgX(clamped)
  }, [])

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging && e.buttons === 0) {
      setSliderX(getSvgX(e))
    } else if (isDragging) {
      setSliderX(getSvgX(e))
    } else {
      setSliderX(getSvgX(e))
    }
  }

  const handleMouseLeave = () => {
    if (!isDragging) setSliderX(null)
  }

  const svgLineX = sliderX !== null ? toSvgX(sliderX) : null

  const yAxisX = toSvgX(0)
  const xAxisY = toSvgY(0)

  const yGridVals = [-1, 0, 1, 2]
  const xGridVals = [-4, -3, -2, -1, 0, 1, 2, 3, 4]

  const formatFx = (v: number) => {
    if (!isFinite(v)) return '—'
    return v.toFixed(3)
  }

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-phase5/25 bg-surface">
      <div className="mb-4">
        <span className="font-heading text-xs text-phase5 uppercase tracking-widest">
          Activation Functions
        </span>
        <p className="text-xs text-ghost mt-0.5">
          Compare non-linearities used in neural networks — hover the plot to inspect values
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FNS.map(f => (
          <button
            key={f.id}
            onClick={() => toggle(f.id)}
            className={cn(
              'inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all duration-150 min-h-[36px]',
              active.has(f.id)
                ? cn('border-current/50 bg-current/10', f.colorClass)
                : 'border-border text-ghost hover:border-rim hover:text-dim',
            )}
          >
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: active.has(f.id) ? f.stroke : '#4A4864' }}
            />
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full max-w-[520px] block cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          aria-label="Activation function plot"
        >
          {xGridVals.map(xv => {
            const sx = toSvgX(xv)
            return (
              <line
                key={xv}
                x1={sx} y1={MT} x2={sx} y2={MT + PH}
                stroke="#4A4864"
                strokeOpacity={xv === 0 ? '0' : '0.25'}
                strokeWidth="1"
                strokeDasharray={xv === 0 ? '' : '3 3'}
              />
            )
          })}

          {yGridVals.map(yv => {
            const sy = toSvgY(yv)
            return (
              <line
                key={yv}
                x1={ML} y1={sy} x2={ML + PW} y2={sy}
                stroke={yv === 0 ? '#4A4864' : '#4A4864'}
                strokeOpacity={yv === 0 ? '0' : '0.25'}
                strokeWidth={yv === 0 ? '0' : '1'}
                strokeDasharray={yv === 0 ? '' : '3 3'}
              />
            )
          })}

          <line
            x1={yAxisX} y1={MT} x2={yAxisX} y2={MT + PH}
            stroke="#9896B8" strokeOpacity="0.6" strokeWidth="1.5"
            strokeDasharray="5 3"
          />
          <line
            x1={ML} y1={xAxisY} x2={ML + PW} y2={xAxisY}
            stroke="#9896B8" strokeOpacity="0.6" strokeWidth="1.5"
            strokeDasharray="5 3"
          />

          {xGridVals.map(xv => (
            <text key={xv} x={toSvgX(xv)} y={H - 8} textAnchor="middle" fontSize="9" fill="#4A4864">
              {xv}
            </text>
          ))}

          {yGridVals.filter(y => y !== 0).map(yv => (
            <text key={yv} x={ML - 4} y={toSvgY(yv) + 3} textAnchor="end" fontSize="9" fill="#4A4864">
              {yv}
            </text>
          ))}

          <text x={ML - 4} y={xAxisY + 3} textAnchor="end" fontSize="9" fill="#9896B8">0</text>
          <text x={yAxisX} y={MT + PH + 16} textAnchor="middle" fontSize="9" fill="#9896B8">0</text>

          <rect x={ML} y={MT} width={PW} height={PH} fill="none" stroke="#252535" strokeWidth="1" />

          {FNS.filter(f => active.has(f.id)).map(f => (
            <path
              key={f.id}
              d={buildPath(f.fn)}
              fill="none"
              stroke={f.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {svgLineX !== null && (
            <line
              x1={svgLineX} y1={MT} x2={svgLineX} y2={MT + PH}
              stroke="#F2F1FF" strokeOpacity="0.5" strokeWidth="1.5" strokeDasharray="4 3"
            />
          )}

          {svgLineX !== null && FNS.filter(f => active.has(f.id)).map(f => {
            const y = f.fn(sliderX!)
            if (!isFinite(y)) return null
            const sy = toSvgY(y)
            if (sy < MT || sy > MT + PH) return null
            return (
              <circle
                key={f.id}
                cx={svgLineX}
                cy={sy}
                r={3.5}
                fill={f.stroke}
                stroke="#0E0E14"
                strokeWidth="1.5"
              />
            )
          })}
        </svg>
      </div>

      {sliderX !== null && (
        <div className="mt-3 p-3 rounded-xl bg-raised border border-border animate-fade-in">
          <div className="text-[10px] text-ghost font-mono mb-2 uppercase tracking-wider">
            x = {sliderX.toFixed(2)}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {FNS.filter(f => active.has(f.id)).map(f => (
              <span key={f.id} className={cn('text-xs font-mono', f.colorClass)}>
                {f.label}({sliderX.toFixed(2)}) = {formatFx(f.fn(sliderX))}
              </span>
            ))}
          </div>
        </div>
      )}

      {sliderX === null && (
        <p className="mt-3 text-[10px] text-ghost text-center">
          Hover over the plot to inspect f(x) values
        </p>
      )}
    </div>
  )
}
