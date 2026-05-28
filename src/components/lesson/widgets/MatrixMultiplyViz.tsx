import { useState } from 'react'
import { RotateCcw, ArrowLeftRight } from 'lucide-react'
import { cn } from '@/utils/cn'

type Matrix2x2 = [[number, number], [number, number]]

const CELLS_ORDER: [number, number][] = [
  [0, 0], [0, 1],
  [1, 0], [1, 1],
]

function multiply(A: Matrix2x2, B: Matrix2x2): Matrix2x2 {
  return [
    [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
    [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
  ]
}

function clampInt(v: number) {
  return Math.max(-9, Math.min(9, Math.round(v)))
}

function MatrixGrid({
  label,
  data,
  editable,
  highlightRow,
  highlightCol,
  highlightColor,
  onCellChange,
  revealMask,
  animKey,
}: {
  label: string
  labelColor?: string
  data: Matrix2x2
  editable: boolean
  highlightRow?: number
  highlightCol?: number
  highlightColor?: string
  onCellChange?: (r: number, c: number, v: number) => void
  revealMask?: boolean[][]
  animKey?: number
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className={cn('font-mono text-xs tracking-widest', highlightColor ?? 'text-dim')}>{label}</span>
      <div className="grid grid-cols-2 gap-1">
        {([0, 1] as const).map(r =>
          ([0, 1] as const).map(c => {
            const isHighlightedRow = highlightRow === r
            const isHighlightedCol = highlightCol === c
            const revealed = revealMask ? revealMask[r][c] : true
            const isResult = revealMask !== undefined
            const isActive = isResult && revealed

            let bg = 'bg-raised border-border'
            if (isHighlightedRow && !isResult) bg = 'bg-spark-400/20 border-spark-400/40'
            if (isHighlightedCol && !isResult) bg = 'bg-phase1/20 border-phase1/40'
            if (isActive) bg = 'bg-phase3/20 border-phase3/50'

            return (
              <div
                key={`${r}-${c}`}
                className={cn(
                  'w-12 h-12 rounded-lg border flex items-center justify-center transition-colors duration-200',
                  bg,
                )}
              >
                {editable ? (
                  <input
                    type="number"
                    min={-9}
                    max={9}
                    step={1}
                    value={data[r][c]}
                    onChange={e => onCellChange?.(r, c, clampInt(Number(e.target.value)))}
                    className="w-full h-full bg-transparent font-mono text-sm text-ink text-center focus:outline-none tabular-nums min-h-[44px]"
                  />
                ) : (
                  <span
                    key={isActive ? `${r}-${c}-${animKey}` : `${r}-${c}-hidden`}
                    className={cn(
                      'font-mono text-sm tabular-nums',
                      isActive && 'animate-spark text-phase3',
                      !isActive && !isResult && 'text-ink',
                      !isActive && isResult && 'text-ghost',
                    )}
                  >
                    {isResult ? (revealed ? data[r][c] : '?') : data[r][c]}
                  </span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function buildFormula(A: Matrix2x2, B: Matrix2x2, i: number, j: number): string {
  const r0 = A[i][0]
  const r1 = A[i][1]
  const c0 = B[0][j]
  const c1 = B[1][j]
  const t0 = r0 * c0
  const t1 = r1 * c1
  const total = t0 + t1
  return `C[${i}][${j}] = (${r0}×${c0}) + (${r1}×${c1}) = ${t0} + ${t1} = ${total}`
}

export function MatrixMultiplyViz() {
  const [matA, setMatA] = useState<Matrix2x2>([[2, 3], [1, 4]])
  const [matB, setMatB] = useState<Matrix2x2>([[1, 0], [5, 2]])
  const [step, setStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)

  const C = multiply(matA, matB)
  const totalCells = 4

  const revealMask: boolean[][] = [
    [step > 0, step > 1],
    [step > 2, step > 3],
  ]

  const activeCell: [number, number] | null =
    step > 0 && step <= totalCells ? CELLS_ORDER[step - 1] : null

  const activeRow = activeCell?.[0]
  const activeCol = activeCell?.[1]

  const formulaCell: [number, number] | null =
    step > 0 ? CELLS_ORDER[Math.min(step - 1, totalCells - 1)] : null

  const updateA = (r: number, c: number, v: number) => {
    setMatA(m => {
      const n: Matrix2x2 = [[m[0][0], m[0][1]], [m[1][0], m[1][1]]]
      n[r][c] = v
      return n
    })
    setStep(0)
  }

  const updateB = (r: number, c: number, v: number) => {
    setMatB(m => {
      const n: Matrix2x2 = [[m[0][0], m[0][1]], [m[1][0], m[1][1]]]
      n[r][c] = v
      return n
    })
    setStep(0)
  }

  const nextStep = () => {
    if (step < totalCells) {
      setStep(s => s + 1)
      setAnimKey(k => k + 1)
    }
  }

  const reset = () => {
    setStep(0)
    setAnimKey(0)
  }

  const revealAll = () => {
    setStep(totalCells)
    setAnimKey(k => k + 1)
  }

  const swapAB = () => {
    setMatA(matB)
    setMatB(matA)
    setStep(0)
  }

  return (
    <div className="not-prose my-8 rounded-2xl border border-spark-500/25 bg-surface overflow-hidden">
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
        <div>
          <span className="font-heading text-xs text-spark-400 uppercase tracking-widest">Matrix Multiply Visualizer</span>
          <p className="text-xs text-ghost mt-0.5">Step through each output cell — see the row × column dot product</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={reset}
            className="btn-ghost text-xs px-3 min-h-[36px] flex items-center gap-1.5"
            title="Reset"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={swapAB}
            className="btn-ghost text-xs px-3 min-h-[36px] flex items-center gap-1.5"
            title="Swap A and B"
          >
            <ArrowLeftRight size={12} />
            <span className="hidden sm:inline">Swap A↔B</span>
          </button>
        </div>
      </div>

      {/* Dimensions + FLOPs */}
      <div className="px-5 pb-3 flex items-center gap-3 flex-wrap">
        <span className="font-mono text-xs text-dim bg-raised px-3 py-1 rounded-lg border border-border">
          2×2 · 2×2 → 2×2
        </span>
        <span className="font-mono text-xs text-ghost">
          8 multiplications, 4 additions
        </span>
      </div>

      {/* Matrix display */}
      <div className="px-5 pb-4 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
        <MatrixGrid
          label="A"
          labelColor="text-spark-400"
          data={matA}
          editable
          highlightRow={activeRow}
          highlightColor="text-spark-400"
          onCellChange={updateA}
        />

        <span className="font-heading text-2xl text-ghost mt-5">×</span>

        <MatrixGrid
          label="B"
          labelColor="text-phase1"
          data={matB}
          editable
          highlightCol={activeCol}
          highlightColor="text-phase1"
          onCellChange={updateB}
        />

        <span className="font-heading text-2xl text-ghost mt-5">=</span>

        <MatrixGrid
          label="C"
          labelColor="text-phase3"
          data={C}
          editable={false}
          highlightColor="text-phase3"
          revealMask={revealMask}
          animKey={animKey}
        />
      </div>

      {/* Formula for active cell */}
      <div className="px-5 pb-3 min-h-[2.5rem]">
        {formulaCell ? (
          <div
            key={animKey}
            className="bg-raised border border-phase3/20 rounded-xl px-4 py-2 font-mono text-xs text-dim animate-fade-in"
          >
            <span className="text-phase3">{formulaCell[0] !== undefined && buildFormula(matA, matB, formulaCell[0], formulaCell[1])}</span>
          </div>
        ) : (
          <div className="bg-raised border border-border rounded-xl px-4 py-2 font-mono text-xs text-ghost">
            Click <span className="text-ink">Next Step</span> to reveal cells one by one
          </div>
        )}
      </div>

      {/* Commutativity note */}
      <div className="px-5 pb-4">
        <div className="bg-raised border border-phase2/20 rounded-xl px-4 py-2 text-xs text-dim">
          <span className="text-phase2 font-semibold">Note:</span> Matrix multiply is{' '}
          <span className="text-ink font-semibold">NOT</span> commutative —{' '}
          <span className="font-mono text-spark-400">A×B</span>{' '}
          <span className="text-ghost">≠</span>{' '}
          <span className="font-mono text-phase1">B×A</span>
          {(() => {
            const BA = multiply(matB, matA)
            const AB = multiply(matA, matB)
            const same = AB[0][0] === BA[0][0] && AB[0][1] === BA[0][1] && AB[1][0] === BA[1][0] && AB[1][1] === BA[1][1]
            return same
              ? <span className="text-ok ml-2">(equal for this input — try swapping!)</span>
              : <span className="text-phase2 ml-2">(verified: different results)</span>
          })()}
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 pb-5 flex gap-2 flex-wrap">
        <button
          onClick={nextStep}
          disabled={step >= totalCells}
          className={cn(
            'btn-primary text-xs px-5 min-h-[44px] flex-1 sm:flex-none',
            step >= totalCells && 'opacity-40 cursor-not-allowed',
          )}
        >
          {step === 0 ? 'Start Step-Through' : step >= totalCells ? 'All revealed' : `Next Step (${step}/${totalCells})`}
        </button>
        <button
          onClick={revealAll}
          disabled={step >= totalCells}
          className={cn(
            'btn-secondary text-xs px-5 min-h-[44px]',
            step >= totalCells && 'opacity-40 cursor-not-allowed',
          )}
        >
          Reveal All
        </button>
        <button onClick={reset} className="btn-ghost text-xs px-4 min-h-[44px]">
          Reset
        </button>
      </div>
    </div>
  )
}
