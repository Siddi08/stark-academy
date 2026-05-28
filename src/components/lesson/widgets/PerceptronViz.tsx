import { useState, useRef, useEffect } from 'react'
import { cn } from '@/utils/cn'

// ── helpers ──────────────────────────────────────────────────────────────────

function round2(n: number) {
  return Math.round(n * 100) / 100
}

// ── sub-components ───────────────────────────────────────────────────────────

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
  colorClass,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  colorClass: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn('font-mono text-xs w-20 shrink-0', colorClass)}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-spark-500 h-1 min-h-[44px] cursor-pointer"
      />
      <span className="font-mono text-xs text-dim w-10 text-right shrink-0">
        {value >= 0 ? '+' : ''}{value.toFixed(1)}
      </span>
    </div>
  )
}

// ── Perceptron SVG diagram ────────────────────────────────────────────────────

const SVG_W = 360
const SVG_H = 180

const INPUT_X = 40
const SUM_X   = 180
const OUT_X   = 320

const INPUT_YS = [40, 90, 140]
const SUM_Y    = 90
const OUT_Y    = 90
const R        = 22

// Tailwind stroke colours can't be used in SVG; we use the token values directly
const SPARK_500 = '#5456F5'
const FAIL      = '#FF5263'
const BORDER    = '#252535'
const DIM       = '#9896B8'
const INK       = '#F2F1FF'
const RAISED    = '#161622'
const SURFACE   = '#0E0E14'
const PHASE5    = '#C278FF'
const OK        = '#00C896'

function PerceptronDiagram({
  inputs,
  weights,
  z,
  output,
  animKey,
}: {
  inputs: (0 | 1)[]
  weights: number[]
  z: number
  output: 0 | 1
  animKey: number
}) {
  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      className="w-full max-w-sm mx-auto block"
      aria-label="Perceptron diagram"
    >
      {/* connection lines */}
      {INPUT_YS.map((iy, i) => {
        const w       = weights[i]
        const absW    = Math.abs(w)
        const stroke  = w >= 0 ? SPARK_500 : FAIL
        const opacity = 0.25 + absW * 0.375  // 0.25–1.0
        const sw      = 1 + absW * 2.5       // 1–6 px

        // cubic bezier for a smooth curve
        const cx1 = INPUT_X + R + (SUM_X - R - (INPUT_X + R)) * 0.4
        const cx2 = SUM_X - R - (SUM_X - R - (INPUT_X + R)) * 0.4

        return (
          <path
            key={i}
            d={`M${INPUT_X + R},${iy} C${cx1},${iy} ${cx2},${SUM_Y} ${SUM_X - R},${SUM_Y}`}
            fill="none"
            stroke={stroke}
            strokeOpacity={opacity}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        )
      })}

      {/* line: summation → output */}
      <line
        x1={SUM_X + R} y1={SUM_Y}
        x2={OUT_X - R} y2={OUT_Y}
        stroke={output === 1 ? SPARK_500 : BORDER}
        strokeOpacity={output === 1 ? 0.8 : 0.4}
        strokeWidth={output === 1 ? 2.5 : 1.5}
      />

      {/* input nodes */}
      {INPUT_YS.map((iy, i) => (
        <g key={i}>
          <circle cx={INPUT_X} cy={iy} r={R} fill={RAISED} stroke={BORDER} strokeWidth={1.5} />
          <text x={INPUT_X} y={iy - 6} textAnchor="middle" fontSize="9" fill={DIM}>
            x{i + 1}
          </text>
          <text x={INPUT_X} y={iy + 8} textAnchor="middle" fontSize="13" fontFamily="Geist Mono, monospace"
            fill={inputs[i] === 1 ? SPARK_500 : DIM} fontWeight="700">
            {inputs[i]}
          </text>
        </g>
      ))}

      {/* weight labels */}
      {INPUT_YS.map((iy, i) => {
        const w    = weights[i]
        const midX = (INPUT_X + R + SUM_X - R) / 2
        const midY = (iy + SUM_Y) / 2
        return (
          <g key={i}>
            <rect x={midX - 14} y={midY - 8} width={28} height={13} rx={3} fill={SURFACE} />
            <text x={midX} y={midY + 3} textAnchor="middle" fontSize="8"
              fontFamily="Geist Mono, monospace"
              fill={w >= 0 ? SPARK_500 : FAIL}
            >
              {w >= 0 ? '+' : ''}{w.toFixed(1)}
            </text>
          </g>
        )
      })}

      {/* summation node */}
      <circle cx={SUM_X} cy={SUM_Y} r={R} fill={RAISED} stroke={PHASE5} strokeWidth={1.5} strokeOpacity={0.6} />
      <text x={SUM_X} y={SUM_Y - 6} textAnchor="middle" fontSize="10" fill={DIM}>Σ</text>
      <text x={SUM_X} y={SUM_Y + 8} textAnchor="middle" fontSize="10"
        fontFamily="Geist Mono, monospace" fill={INK}>
        {round2(z).toFixed(1)}
      </text>

      {/* output node */}
      <circle
        cx={OUT_X} cy={OUT_Y} r={R}
        fill={output === 1 ? `${SPARK_500}22` : RAISED}
        stroke={output === 1 ? SPARK_500 : BORDER}
        strokeWidth={output === 1 ? 2 : 1.5}
      />
      <text x={OUT_X} y={OUT_Y - 6} textAnchor="middle" fontSize="9" fill={DIM}>out</text>
      {/* use animKey as SVG key to re-trigger CSS animation */}
      <text
        key={animKey}
        x={OUT_X} y={OUT_Y + 9} textAnchor="middle" fontSize="16"
        fontFamily="Geist Mono, monospace" fontWeight="700"
        fill={output === 1 ? OK : FAIL}
        className="animate-spark"
      >
        {output}
      </text>
    </svg>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export function PerceptronViz() {
  const [inputs, setInputs]       = useState<(0 | 1)[]>([1, 0, 1])
  const [weights, setWeights]     = useState([0.6, 0.4, 0.8])
  const [bias, setBias]           = useState(0.2)
  const [threshold, setThreshold] = useState(0.5)
  const [animKey, setAnimKey]     = useState(0)

  const prevOutput = useRef<0 | 1>(-1 as unknown as 0 | 1)

  const z      = inputs.reduce<number>((acc, x, i) => acc + weights[i] * x, 0) + bias
  const output: 0 | 1 = z >= threshold ? 1 : 0

  useEffect(() => {
    if (prevOutput.current !== output) {
      setAnimKey(k => k + 1)
      prevOutput.current = output
    }
  }, [output])

  const toggleInput = (i: number) =>
    setInputs(prev => {
      const next = [...prev] as (0 | 1)[]
      next[i] = prev[i] === 0 ? 1 : 0
      return next
    })

  const setWeight = (i: number, v: number) =>
    setWeights(prev => {
      const next = [...prev]
      next[i] = v
      return next
    })

  // build the calc string
  const calcParts = weights.map((w, i) => `(${w.toFixed(1)}×${inputs[i]})`).join(' + ')
  const calcLine  = `z = ${calcParts} + ${bias.toFixed(1)} = ${round2(z).toFixed(2)} ${z >= threshold ? '≥' : '<'} ${threshold.toFixed(1)} → OUTPUT: ${output}`

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-phase5/25 bg-surface">
      {/* header */}
      <div className="mb-5">
        <span className="font-heading text-xs text-phase5 uppercase tracking-widest">
          Perceptron Visualiser
        </span>
        <p className="text-xs text-ghost mt-0.5">
          Toggle inputs and adjust weights to see how the perceptron fires
        </p>
      </div>

      {/* input toggles */}
      <div className="mb-5">
        <p className="text-[10px] uppercase tracking-wider text-ghost font-mono mb-2">Inputs</p>
        <div className="flex gap-3">
          {inputs.map((x, i) => (
            <button
              key={i}
              onClick={() => toggleInput(i)}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-xl border-2 transition-all duration-150 min-h-[44px]',
                x === 1
                  ? 'bg-spark-500/15 border-spark-500/60 shadow-[0_0_14px_-4px_rgba(84,86,245,0.5)]'
                  : 'bg-raised border-border hover:border-rim',
              )}
            >
              <span className="font-mono text-[10px] text-ghost">x{i + 1}</span>
              <span className={cn('font-heading text-lg font-bold', x === 1 ? 'text-spark-300' : 'text-ghost')}>
                {x}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* diagram */}
      <div className="mb-5">
        <PerceptronDiagram
          inputs={inputs}
          weights={weights}
          z={z}
          output={output}
          animKey={animKey}
        />
      </div>

      {/* sliders */}
      <div className="rounded-xl border border-border bg-raised p-4 mb-4 space-y-3">
        <p className="text-[10px] uppercase tracking-wider text-ghost font-mono mb-1">Weights &amp; Bias</p>
        {weights.map((w, i) => (
          <SliderRow
            key={i}
            label={`w${i + 1} (x${i + 1})`}
            value={w}
            min={-2}
            max={2}
            step={0.1}
            onChange={v => setWeight(i, v)}
            colorClass="text-spark-300"
          />
        ))}
        <SliderRow
          label="bias"
          value={bias}
          min={-2}
          max={2}
          step={0.1}
          onChange={setBias}
          colorClass="text-phase3"
        />
        <div className="border-t border-border/60 pt-3">
          <p className="text-[10px] uppercase tracking-wider text-ghost font-mono mb-2">Threshold (θ)</p>
          <SliderRow
            label="threshold"
            value={threshold}
            min={-3}
            max={3}
            step={0.1}
            onChange={setThreshold}
            colorClass="text-phase4"
          />
        </div>
      </div>

      {/* calculation breakdown */}
      <div className="rounded-xl border border-border bg-raised/60 px-4 py-3">
        <p className="text-[10px] uppercase tracking-wider text-ghost font-mono mb-1">Calculation</p>
        <p className="font-mono text-xs text-dim break-all leading-6">
          {calcLine.split('→').map((part, i) =>
            i === 0 ? (
              <span key={i}>{part}→ </span>
            ) : (
              <span key={i} className={cn(
                'font-bold text-sm',
                output === 1 ? 'text-ok' : 'text-fail',
              )}>
                OUTPUT: {output}
              </span>
            )
          )}
        </p>
      </div>
    </div>
  )
}
