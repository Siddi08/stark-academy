import { useState, useRef, useCallback } from 'react'
import { cn } from '@/utils/cn'

const SVG_W = 400
const SVG_H = 300
const SCALE = 30
const OX = SVG_W / 2
const OY = SVG_H / 2

function toSVG(x: number, y: number) {
  return { sx: OX + x * SCALE, sy: OY - y * SCALE }
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v))
}

function round2(v: number) {
  return Math.round(v * 100) / 100
}

interface Vec2 { x: number; y: number }

function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker
      id={id}
      markerWidth="8"
      markerHeight="8"
      refX="6"
      refY="3"
      orient="auto"
    >
      <path d="M0,0 L0,6 L8,3 z" fill={color} />
    </marker>
  )
}

function VectorArrow({
  vec,
  color,
  markerId,
  dashed,
}: {
  vec: Vec2
  color: string
  markerId: string
  dashed?: boolean
}) {
  const { sx: ex, sy: ey } = toSVG(vec.x, vec.y)
  const len = Math.sqrt((ex - OX) ** 2 + (ey - OY) ** 2)
  if (len < 2) return null
  const ux = (ex - OX) / len
  const uy = (ey - OY) / len
  const tipX = ex - ux * 8
  const tipY = ey - uy * 8

  return (
    <>
      {/* dashed component lines */}
      {dashed && (
        <>
          <line
            x1={OX} y1={OY}
            x2={ex} y2={OY}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="4,3"
            opacity="0.4"
          />
          <line
            x1={ex} y1={OY}
            x2={ex} y2={ey}
            stroke={color}
            strokeWidth="1"
            strokeDasharray="4,3"
            opacity="0.4"
          />
        </>
      )}
      <line
        x1={OX} y1={OY}
        x2={tipX} y2={tipY}
        stroke={color}
        strokeWidth="2"
        markerEnd={`url(#${markerId})`}
      />
    </>
  )
}

function DragHandle({
  vec,
  color,
  onDrag,
}: {
  vec: Vec2
  color: string
  onDrag: (v: Vec2) => void
}) {
  const { sx, sy } = toSVG(vec.x, vec.y)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<SVGCircleElement>) => {
      e.preventDefault()
      const svg = (e.target as Element).closest('svg') as SVGSVGElement
      svgRef.current = svg

      const move = (me: MouseEvent) => {
        const rect = svg.getBoundingClientRect()
        const rawX = ((me.clientX - rect.left) / rect.width) * SVG_W
        const rawY = ((me.clientY - rect.top) / rect.height) * SVG_H
        const vx = clamp((rawX - OX) / SCALE, -5, 5)
        const vy = clamp(-(rawY - OY) / SCALE, -5, 5)
        onDrag({ x: Math.round(vx * 2) / 2, y: Math.round(vy * 2) / 2 })
      }

      const up = () => {
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    },
    [onDrag],
  )

  return (
    <circle
      cx={sx}
      cy={sy}
      r={6}
      fill={color}
      stroke="white"
      strokeWidth="1.5"
      opacity="0.9"
      style={{ cursor: 'grab' }}
      onMouseDown={handleMouseDown}
    />
  )
}

function NumInput({
  label,
  value,
  color,
  onChange,
}: {
  label: string
  value: number
  color: string
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center gap-2">
      <span className={cn('font-mono text-xs w-4 text-right', color)}>{label}</span>
      <input
        type="number"
        min={-5}
        max={5}
        step={0.5}
        value={value}
        onChange={e => onChange(clamp(Number(e.target.value), -5, 5))}
        className="w-16 bg-raised border border-border rounded-lg px-2 py-1 font-mono text-xs text-ink text-center focus:outline-none focus:border-spark-500/60 min-h-[36px]"
      />
    </label>
  )
}

export function VectorPlayground() {
  const [vecA, setVecA] = useState<Vec2>({ x: 3, y: 2 })
  const [vecB, setVecB] = useState<Vec2>({ x: 1, y: -2 })

  const magA = Math.sqrt(vecA.x ** 2 + vecA.y ** 2)
  const magB = Math.sqrt(vecB.x ** 2 + vecB.y ** 2)
  const dot = vecA.x * vecB.x + vecA.y * vecB.y
  const cosTheta = magA > 0 && magB > 0 ? dot / (magA * magB) : 0
  const thetaDeg = Math.acos(clamp(cosTheta, -1, 1)) * (180 / Math.PI)
  const isOrthogonal = Math.abs(cosTheta) < 0.05 && magA > 0 && magB > 0

  const gridLines: React.ReactNode[] = []
  for (let i = -6; i <= 6; i++) {
    const x = OX + i * SCALE
    const y = OY + i * SCALE
    gridLines.push(
      <line key={`v${i}`} x1={x} y1={0} x2={x} y2={SVG_H} stroke="#4A4864" strokeWidth="0.5" opacity="0.4" />,
      <line key={`h${i}`} x1={0} y1={y} x2={SVG_W} y2={y} stroke="#4A4864" strokeWidth="0.5" opacity="0.4" />,
    )
  }

  const axisLabels: React.ReactNode[] = []
  for (let i = -4; i <= 4; i++) {
    if (i === 0) continue
    axisLabels.push(
      <text key={`xl${i}`} x={OX + i * SCALE} y={OY + 14} textAnchor="middle" fontSize="8" fill="#4A4864">{i}</text>,
      <text key={`yl${i}`} x={OX - 10} y={OY - i * SCALE + 3} textAnchor="end" fontSize="8" fill="#4A4864">{i}</text>,
    )
  }

  return (
    <div className="not-prose my-8 rounded-2xl border border-spark-500/25 bg-surface overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div>
          <span className="font-heading text-xs text-spark-400 uppercase tracking-widest">Vector Playground</span>
          <p className="text-xs text-ghost mt-0.5">Drag arrowheads or use inputs — watch the dot product update</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-0">
        {/* SVG Canvas */}
        <div className="flex-shrink-0 flex items-center justify-center px-4 pb-2">
          <svg
            width={SVG_W}
            height={SVG_H}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="rounded-xl border border-border bg-void max-w-full"
            style={{ touchAction: 'none' }}
          >
            <defs>
              <ArrowMarker id="arrowA" color="#7677FF" />
              <ArrowMarker id="arrowB" color="#00C896" />
              <ArrowMarker id="arrowAxis" color="#4A4864" />
            </defs>

            {/* Grid */}
            {gridLines}

            {/* Axes */}
            <line x1={0} y1={OY} x2={SVG_W - 10} y2={OY} stroke="#4A4864" strokeWidth="1" markerEnd="url(#arrowAxis)" />
            <line x1={OX} y1={SVG_H} x2={OX} y2={10} stroke="#4A4864" strokeWidth="1" markerEnd="url(#arrowAxis)" />
            <text x={SVG_W - 8} y={OY + 12} fontSize="10" fill="#4A4864">x</text>
            <text x={OX + 6} y={14} fontSize="10" fill="#4A4864">y</text>
            {axisLabels}

            {/* Vector A dashed components */}
            <VectorArrow vec={vecA} color="#7677FF" markerId="arrowA" dashed />
            {/* Vector B dashed components */}
            <VectorArrow vec={vecB} color="#00C896" markerId="arrowB" dashed />

            {/* Drag handles */}
            <DragHandle vec={vecA} color="#7677FF" onDrag={setVecA} />
            <DragHandle vec={vecB} color="#00C896" onDrag={setVecB} />

            {/* Origin dot */}
            <circle cx={OX} cy={OY} r={3} fill="#9896B8" />

            {/* Vector labels */}
            {(() => {
              const { sx, sy } = toSVG(vecA.x, vecA.y)
              return <text x={sx + 8} y={sy - 5} fontSize="11" fill="#7677FF" fontWeight="bold">A</text>
            })()}
            {(() => {
              const { sx, sy } = toSVG(vecB.x, vecB.y)
              return <text x={sx + 8} y={sy - 5} fontSize="11" fill="#00C896" fontWeight="bold">B</text>
            })()}
          </svg>
        </div>

        {/* Controls + Stats */}
        <div className="flex-1 px-5 pb-5 lg:pt-5 flex flex-col gap-4 min-w-0">
          {/* Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-raised rounded-xl p-3 border border-spark-400/20">
              <div className="font-mono text-xs text-spark-400 mb-2">Vector A</div>
              <div className="flex flex-col gap-2">
                <NumInput label="x" value={vecA.x} color="text-spark-400" onChange={x => setVecA(v => ({ ...v, x }))} />
                <NumInput label="y" value={vecA.y} color="text-spark-400" onChange={y => setVecA(v => ({ ...v, y }))} />
              </div>
            </div>
            <div className="bg-raised rounded-xl p-3 border border-phase1/20">
              <div className="font-mono text-xs text-phase1 mb-2">Vector B</div>
              <div className="flex flex-col gap-2">
                <NumInput label="x" value={vecB.x} color="text-phase1" onChange={x => setVecB(v => ({ ...v, x }))} />
                <NumInput label="y" value={vecB.y} color="text-phase1" onChange={y => setVecB(v => ({ ...v, y }))} />
              </div>
            </div>
          </div>

          {/* Stats panel */}
          <div className="bg-raised rounded-xl border border-border p-3 space-y-2">
            <div className="font-mono text-xs text-dim">
              <span className="text-spark-400">|A|</span>
              <span className="text-ghost"> = √({vecA.x}²+{vecA.y}²) = </span>
              <span className="text-ink">{round2(magA)}</span>
            </div>
            <div className="font-mono text-xs text-dim">
              <span className="text-phase1">|B|</span>
              <span className="text-ghost"> = </span>
              <span className="text-ink">{round2(magB)}</span>
            </div>
            <div className="font-mono text-xs text-dim">
              <span className="text-spark-400">A</span>
              <span className="text-ghost">·</span>
              <span className="text-phase1">B</span>
              <span className="text-ghost"> = {vecA.x}×{vecB.x} + {vecA.y}×{vecB.y} = </span>
              <span className="text-ink">{round2(dot)}</span>
            </div>
            <div className="font-mono text-xs text-dim">
              <span className="text-ghost">cos θ = </span>
              <span className="text-ink">{round2(cosTheta)}</span>
              <span className="text-ghost"> → θ = </span>
              <span className="text-phase3">{round2(thetaDeg)}°</span>
            </div>
            {isOrthogonal && (
              <div
                key={`${vecA.x}-${vecA.y}-${vecB.x}-${vecB.y}`}
                className="font-mono text-xs text-ok font-bold animate-spark pt-1"
              >
                ⊥ Orthogonal!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
