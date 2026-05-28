import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'

type Mode = 'params' | 'compute'

// SVG chart dimensions
const CW = 380
const CH = 180
const CML = 48
const CMR = 16
const CMT = 14
const CMB = 32
const CPW = CW - CML - CMR
const CPH = CH - CMT - CMB

// Reference points: [label, N_billions, C_log10]
const REF_POINTS: { label: string; n: number; c: number }[] = [
  { label: 'GPT-3',       n: 175e9, c: Math.log10(3e23) },
  { label: 'Llama-2 7B',  n: 7e9,   c: Math.log10(1e23) },
  { label: 'Llama-2 70B', n: 70e9,  c: Math.log10(6.9e23) },
]

const MIN_C_LOG = 19
const MAX_C_LOG = 24
const MIN_N = 1e9
const MAX_N = 1e11

function cxFromN(n: number): number {
  return CML + ((Math.log10(n) - Math.log10(MIN_N)) / (Math.log10(MAX_N) - Math.log10(MIN_N))) * CPW
}

function cyFromC(cLog: number): number {
  return CMT + CPH - ((cLog - MIN_C_LOG) / (MAX_C_LOG - MIN_C_LOG)) * CPH
}

function formatExp(val: number): string {
  if (val === 0) return '0'
  const exp = Math.floor(Math.log10(Math.abs(val)))
  const mant = val / Math.pow(10, exp)
  const mantStr = mant % 1 === 0 ? mant.toFixed(0) : mant.toFixed(2).replace(/\.?0+$/, '')
  return `${mantStr}×10^${exp}`
}

function formatN(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(0)}T`
  if (n >= 1e9)  return `${(n / 1e9).toFixed(0)}B`
  if (n >= 1e6)  return `${(n / 1e6).toFixed(0)}M`
  return String(n)
}

function formatLargeNum(n: number): string {
  if (n >= 1e12) return `${(n / 1e12).toFixed(1)}T`
  if (n >= 1e9)  return `${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6)  return `${(n / 1e6).toFixed(1)}M`
  return n.toFixed(0)
}

// GPU-days on A100: ~312 TFLOPS = 312e12 FLOPS/s = 312e12 * 86400 per day
const A100_FLOPS_PER_DAY = 312e12 * 86400

interface ParamsResult {
  n: number
  d: number
  c: number
  gpuDays: number
}

function calcFromParams(n: number): ParamsResult {
  const d = 20 * n
  const c = 6 * n * d
  const gpuDays = c / A100_FLOPS_PER_DAY
  return { n, d, c, gpuDays }
}

interface ComputeResult {
  c: number
  n: number
  d: number
  gpuDays: number
}

function calcFromCompute(cLog: number): ComputeResult {
  const c = Math.pow(10, cLog)
  const n = Math.sqrt(c / 120)
  const d = 20 * n
  const gpuDays = c / A100_FLOPS_PER_DAY
  return { c, n, d, gpuDays }
}

// Pareto frontier path: sweep N from MIN_N to MAX_N, derive C = 6*N*(20*N)=120*N²
function buildFrontierPath(): string {
  const steps = 80
  const pts: string[] = []
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const logN = Math.log10(MIN_N) + t * (Math.log10(MAX_N) - Math.log10(MIN_N))
    const n = Math.pow(10, logN)
    const c = 120 * n * n
    const cLog = Math.log10(c)
    if (cLog < MIN_C_LOG || cLog > MAX_C_LOG) continue
    const cx = cxFromN(n)
    const cy = cyFromC(cLog)
    pts.push(`${i === 0 ? 'M' : 'L'}${cx.toFixed(2)},${cy.toFixed(2)}`)
  }
  return pts.join(' ')
}

const FRONTIER_PATH = buildFrontierPath()

const PARAM_PRESETS = [
  { label: '1B',  n: 1e9 },
  { label: '7B',  n: 7e9 },
  { label: '13B', n: 13e9 },
  { label: '70B', n: 70e9 },
]

const COMPUTE_PRESETS = [
  { label: 'GPT-3 era',   cLog: Math.log10(3e23) },
  { label: 'Llama-2 7B',  cLog: Math.log10(1e23) },
  { label: 'Haiku est.',  cLog: Math.log10(5e21) },
]

export function ScalingLawCalc() {
  const [mode, setMode] = useState<Mode>('params')

  // Params mode state
  const [paramN, setParamN] = useState(7e9)

  // Compute mode state: store as log10 for slider linearity
  const [computeLog, setComputeLog] = useState(Math.log10(1e23))

  const paramsResult = useMemo(() => calcFromParams(paramN), [paramN])
  const computeResult = useMemo(() => calcFromCompute(computeLog), [computeLog])

  // Current selection for chart highlight
  const selN = mode === 'params' ? paramsResult.n : computeResult.n
  const selC = mode === 'params' ? paramsResult.c : computeResult.c
  const selCLog = Math.log10(selC)
  const selCx = cxFromN(selN)
  const selCy = cyFromC(selCLog)
  const selInBounds =
    selCLog >= MIN_C_LOG && selCLog <= MAX_C_LOG &&
    selN >= MIN_N && selN <= MAX_N

  return (
    <div className="not-prose my-8 rounded-2xl border border-phase4/25 bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <span className="font-heading text-xs text-phase4 uppercase tracking-widest">
          Chinchilla Scaling Law Calculator
        </span>
        <p className="text-xs text-ghost mt-0.5">Explore compute-optimal training trade-offs</p>
      </div>

      {/* Mode tabs */}
      <div className="px-5 mb-4 flex gap-2">
        {(['params', 'compute'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              'px-4 py-2 rounded-lg text-xs font-heading uppercase tracking-wider border transition-all duration-150 min-h-[44px]',
              mode === m
                ? 'bg-phase4/15 border-phase4/40 text-phase4'
                : 'bg-transparent border-border text-ghost hover:border-rim hover:text-dim',
            )}
          >
            {m === 'params' ? 'Parameters' : 'Compute Budget'}
          </button>
        ))}
      </div>

      <div className="px-5 pb-5 space-y-5">
        {mode === 'params' ? (
          <>
            {/* Param presets */}
            <div className="flex flex-wrap gap-2">
              {PARAM_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setParamN(p.n)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150 min-h-[36px]',
                    paramN === p.n
                      ? 'bg-phase4/15 border-phase4/50 text-phase4'
                      : 'border-border text-ghost hover:border-rim hover:text-dim',
                  )}
                >
                  {p.label} params
                </button>
              ))}
            </div>

            {/* N slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-dim font-mono">Model parameters (N)</span>
                <span className="text-xs text-phase4 font-mono font-bold">{formatN(paramN)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={0.1}
                value={((Math.log10(paramN) - Math.log10(MIN_N)) / (Math.log10(MAX_N) - Math.log10(MIN_N))) * 100}
                onChange={e => {
                  const t = Number(e.target.value) / 100
                  setParamN(Math.pow(10, Math.log10(MIN_N) + t * (Math.log10(MAX_N) - Math.log10(MIN_N))))
                }}
                className="w-full accent-phase4 h-1.5"
              />
              <div className="flex justify-between text-[10px] text-ghost font-mono mt-0.5">
                <span>1B</span><span>100B</span>
              </div>
            </div>

            {/* Result card */}
            <div className="rounded-xl bg-raised border border-border p-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-ghost uppercase tracking-wider mb-0.5">Model size</div>
                <div className="text-sm font-mono text-ink">{formatN(paramsResult.n)} parameters</div>
              </div>
              <div>
                <div className="text-[10px] text-ghost uppercase tracking-wider mb-0.5">Optimal training data</div>
                <div className="text-sm font-mono text-ok">{formatLargeNum(paramsResult.d)} tokens</div>
              </div>
              <div>
                <div className="text-[10px] text-ghost uppercase tracking-wider mb-0.5">Estimated compute</div>
                <div className="text-sm font-mono text-phase4">{formatExp(paramsResult.c)} FLOPs</div>
              </div>
              <div>
                <div className="text-[10px] text-ghost uppercase tracking-wider mb-0.5">GPU-days (A100)</div>
                <div className="text-sm font-mono text-phase3">
                  {paramsResult.gpuDays >= 1000
                    ? `~${(paramsResult.gpuDays / 1000).toFixed(1)}k`
                    : `~${paramsResult.gpuDays.toFixed(0)}`}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Compute presets */}
            <div className="flex flex-wrap gap-2">
              {COMPUTE_PRESETS.map(p => (
                <button
                  key={p.label}
                  onClick={() => setComputeLog(p.cLog)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150 min-h-[36px]',
                    Math.abs(computeLog - p.cLog) < 0.05
                      ? 'bg-phase4/15 border-phase4/50 text-phase4'
                      : 'border-border text-ghost hover:border-rim hover:text-dim',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Compute slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-dim font-mono">Compute budget (C)</span>
                <span className="text-xs text-phase4 font-mono font-bold">{formatExp(computeResult.c)} FLOPs</span>
              </div>
              <input
                type="range"
                min={MIN_C_LOG}
                max={MAX_C_LOG}
                step={0.05}
                value={computeLog}
                onChange={e => setComputeLog(Number(e.target.value))}
                className="w-full accent-phase4 h-1.5"
              />
              <div className="flex justify-between text-[10px] text-ghost font-mono mt-0.5">
                <span>10^19</span><span>10^24</span>
              </div>
            </div>

            {/* Result card */}
            <div className="rounded-xl bg-raised border border-border p-4 grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] text-ghost uppercase tracking-wider mb-0.5">Optimal model size</div>
                <div className="text-sm font-mono text-phase4">{formatN(computeResult.n)} parameters</div>
              </div>
              <div>
                <div className="text-[10px] text-ghost uppercase tracking-wider mb-0.5">Optimal training tokens</div>
                <div className="text-sm font-mono text-ok">{formatLargeNum(computeResult.d)} tokens</div>
              </div>
              <div>
                <div className="text-[10px] text-ghost uppercase tracking-wider mb-0.5">Compute budget</div>
                <div className="text-sm font-mono text-ink">{formatExp(computeResult.c)} FLOPs</div>
              </div>
              <div>
                <div className="text-[10px] text-ghost uppercase tracking-wider mb-0.5">GPU-days (A100)</div>
                <div className="text-sm font-mono text-phase3">
                  {computeResult.gpuDays >= 1000
                    ? `~${(computeResult.gpuDays / 1000).toFixed(1)}k`
                    : `~${computeResult.gpuDays.toFixed(1)}`}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Pareto frontier chart */}
        <div>
          <div className="text-[10px] text-ghost uppercase tracking-wider mb-2 font-mono">
            Pareto frontier — compute vs. optimal parameters
          </div>
          <div className="overflow-x-auto">
            <svg
              viewBox={`0 0 ${CW} ${CH}`}
              className="w-full max-w-[480px] block rounded-xl border border-border bg-void"
              aria-label="Scaling law Pareto frontier"
            >
              {/* Grid lines */}
              {[19, 20, 21, 22, 23, 24].map(cl => {
                const y = cyFromC(cl)
                return (
                  <line key={cl} x1={CML} y1={y} x2={CML + CPW} y2={y}
                    stroke="#4A4864" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
                )
              })}
              {/* Y axis labels (log C) */}
              {[19, 21, 23].map(cl => (
                <text key={cl} x={CML - 4} y={cyFromC(cl) + 3}
                  textAnchor="end" fontSize="8" fill="#4A4864">
                  10^{cl}
                </text>
              ))}
              {/* X axis labels (log N) */}
              {[1e9, 1e10, 1e11].map(n => (
                <text key={n} x={cxFromN(n)} y={CMT + CPH + 12}
                  textAnchor="middle" fontSize="8" fill="#4A4864">
                  {formatN(n)}
                </text>
              ))}
              {/* Axes */}
              <line x1={CML} y1={CMT} x2={CML} y2={CMT + CPH} stroke="#4A4864" strokeOpacity="0.5" strokeWidth="1" />
              <line x1={CML} y1={CMT + CPH} x2={CML + CPW} y2={CMT + CPH} stroke="#4A4864" strokeOpacity="0.5" strokeWidth="1" />

              {/* Axis labels */}
              <text x={CML + CPW / 2} y={CH - 2} textAnchor="middle" fontSize="8" fill="#9896B8">
                Model params (N)
              </text>
              <text x={9} y={CMT + CPH / 2} textAnchor="middle" fontSize="8" fill="#9896B8"
                transform={`rotate(-90, 9, ${CMT + CPH / 2})`}>
                Compute (C)
              </text>

              {/* Frontier path */}
              <path d={FRONTIER_PATH} fill="none" stroke="#FFB547" strokeWidth="2"
                strokeLinecap="round" strokeOpacity="0.8" />

              {/* Reference points */}
              {REF_POINTS.map(rp => {
                const rx = cxFromN(rp.n)
                const ry = cyFromC(rp.c)
                if (rx < CML || rx > CML + CPW || ry < CMT || ry > CMT + CPH) return null
                return (
                  <g key={rp.label}>
                    <circle cx={rx} cy={ry} r={4} fill="#9896B8" stroke="#0E0E14" strokeWidth="1.5" />
                    <text x={rx + 6} y={ry + 3} fontSize="8" fill="#9896B8">{rp.label}</text>
                  </g>
                )
              })}

              {/* Current selection highlight */}
              {selInBounds && (
                <g>
                  <circle cx={selCx} cy={selCy} r={6} fill="#FFB547" stroke="#0E0E14" strokeWidth="2"
                    className="animate-spark" />
                  <circle cx={selCx} cy={selCy} r={10} fill="none" stroke="#FFB547" strokeWidth="1"
                    strokeOpacity="0.4" />
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex gap-2 p-3 rounded-xl bg-raised border border-warn/20 text-xs text-dim">
          <span className="text-warn flex-shrink-0">⚠</span>
          <span>Simplified model for illustration — real scaling laws vary by architecture and data quality.</span>
        </div>
      </div>
    </div>
  )
}
