import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'

// ── math helpers ──────────────────────────────────────────────────────────────

function dot(a: number[], b: number[]): number {
  return a.reduce((sum, v, i) => sum + v * b[i], 0)
}

function softmax(scores: number[]): number[] {
  const max  = Math.max(...scores)
  const exps = scores.map(s => Math.exp(s - max))
  const sum  = exps.reduce((a, b) => a + b, 0)
  return exps.map(e => e / sum)
}

// ── fixed Q / K vectors (d_k = 4) ────────────────────────────────────────────
//   "The"  "cat"  "sat"  "on"
const Q: number[][] = [
  [1, 0, 1, 0],
  [0, 1, 1, 0],
  [0, 0, 1, 1],
  [1, 0, 0, 1],
]

const K: number[][] = [
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [1, 1, 0, 0],
  [0, 0, 1, 1],
]

const D_K   = 4
const SCALE = 1 / Math.sqrt(D_K)   // 0.5

const TOKENS = ['The', 'cat', 'sat', 'on']

// Precompute full 4×4 attention matrix
function computeAttentionMatrix(): number[][] {
  return Q.map(qi => {
    const scores = K.map(kj => dot(qi, kj) * SCALE)
    return softmax(scores)
  })
}

const ATTN_MATRIX = computeAttentionMatrix()

// ── colour helpers ────────────────────────────────────────────────────────────

// spark-500 at varying opacity — for the heatmap cells
function weightToStyle(w: number): React.CSSProperties {
  // w ∈ [0,1]; map to opacity 0.06–0.90
  const opacity = 0.06 + w * 0.84
  return { backgroundColor: `rgba(84,86,245,${opacity.toFixed(3)})` }
}

// ── component ─────────────────────────────────────────────────────────────────

export function AttentionViz() {
  const [selectedQuery, setSelectedQuery] = useState<number | null>(0)
  const [hoveredCell, setHoveredCell]     = useState<[number, number] | null>(null)

  const queryWeights: number[] | null = useMemo(
    () => (selectedQuery !== null ? ATTN_MATRIX[selectedQuery] : null),
    [selectedQuery],
  )

  const handleTokenClick = (i: number) => {
    setSelectedQuery(prev => (prev === i ? null : i))
  }

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-phase3/25 bg-surface">
      {/* header */}
      <div className="mb-5">
        <span className="font-heading text-xs text-phase3 uppercase tracking-widest">
          Attention Visualiser
        </span>
        <p className="text-xs text-ghost mt-0.5">
          Click a token to use it as a query and see what it attends to
        </p>
      </div>

      {/* meta */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mb-5">
        <span className="font-mono text-[11px] text-dim">
          d<sub className="text-[9px]">k</sub> = {D_K}
        </span>
        <span className="font-mono text-[11px] text-dim">
          Scale = 1/√{D_K} = {SCALE.toFixed(2)}
        </span>
        <span className="font-mono text-[11px] text-dim">
          score(Q,K) = (Q·Kᵀ) × {SCALE.toFixed(2)}
        </span>
      </div>

      {/* token row */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TOKENS.map((tok, i) => {
          const w           = queryWeights?.[i]
          const isSelected  = selectedQuery === i
          const isKeyActive = hoveredCell !== null && hoveredCell[1] === i

          return (
            <button
              key={i}
              onClick={() => handleTokenClick(i)}
              className={cn(
                'flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 transition-all duration-200 min-h-[44px]',
                isSelected
                  ? 'border-phase3 bg-phase3/15 shadow-[0_0_14px_-4px_rgba(124,143,255,0.5)]'
                  : isKeyActive
                    ? 'border-phase3/40 bg-phase3/8'
                    : 'border-border bg-raised hover:border-rim',
              )}
              style={
                w !== undefined && !isSelected
                  ? { backgroundColor: `rgba(84,86,245,${(0.05 + w * 0.35).toFixed(3)})` }
                  : undefined
              }
            >
              <span className={cn(
                'font-heading text-sm font-semibold',
                isSelected ? 'text-phase3' : 'text-ink',
              )}>
                {tok}
              </span>
              {w !== undefined && (
                <span className="font-mono text-[10px] text-dim tabular-nums">
                  {w.toFixed(2)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* selected query info */}
      {selectedQuery !== null && queryWeights !== null && (
        <div className="mb-5 p-3 rounded-xl bg-raised border border-phase3/20 animate-fade-in">
          <p className="text-[10px] uppercase tracking-wider text-ghost font-mono mb-2">
            Query: <span className="text-phase3">"{TOKENS[selectedQuery]}"</span> attends to…
          </p>
          <div className="flex flex-wrap gap-2">
            {TOKENS.map((tok, j) => (
              <span key={j} className="flex items-center gap-1.5 font-mono text-xs">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: `rgba(84,86,245,${(0.25 + queryWeights[j] * 0.75).toFixed(3)})` }}
                />
                <span className="text-ink">"{tok}"</span>
                <span className="text-dim">{(queryWeights[j] * 100).toFixed(0)}%</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* heatmap */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-ghost font-mono mb-3">
          Full Attention Heatmap — row = query, col = key
        </p>
        <div className="overflow-x-auto">
          <table className="text-xs font-mono border-collapse mx-auto">
            <thead>
              <tr>
                <th className="w-10" />
                {TOKENS.map((tok, j) => (
                  <th
                    key={j}
                    className={cn(
                      'px-2 pb-1 text-center font-normal text-[11px] transition-colors',
                      hoveredCell !== null && hoveredCell[1] === j
                        ? 'text-phase3'
                        : 'text-dim',
                    )}
                  >
                    {tok}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOKENS.map((rowTok, i) => (
                <tr key={i}>
                  <td
                    className={cn(
                      'pr-2 text-right text-[11px] font-normal transition-colors',
                      hoveredCell !== null && hoveredCell[0] === i
                        ? 'text-phase3'
                        : selectedQuery === i
                          ? 'text-phase3/70'
                          : 'text-dim',
                    )}
                  >
                    {rowTok}
                  </td>
                  {ATTN_MATRIX[i].map((w, j) => {
                    const isHovered    = hoveredCell?.[0] === i && hoveredCell?.[1] === j
                    const isActiveRow  = selectedQuery === i
                    return (
                      <td
                        key={j}
                        onMouseEnter={() => setHoveredCell([i, j])}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={cn(
                          'p-0 transition-all duration-150 cursor-default',
                        )}
                      >
                        <div
                          className={cn(
                            'w-12 h-10 flex items-center justify-center rounded-lg text-[11px] tabular-nums transition-all duration-200 border',
                            isHovered
                              ? 'border-phase3/60 scale-105'
                              : isActiveRow
                                ? 'border-phase3/20'
                                : 'border-transparent',
                          )}
                          style={weightToStyle(w)}
                        >
                          <span className={cn(w > 0.3 ? 'text-ink' : 'text-dim')}>
                            {w.toFixed(2)}
                          </span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-ghost font-mono mt-2 text-center">
          Darker = higher attention weight
        </p>
      </div>

      {/* hover callout */}
      {hoveredCell !== null && (
        <div className="mt-4 p-3 rounded-xl bg-raised border border-phase3/20 animate-fade-in">
          <p className="font-mono text-[11px] text-dim">
            <span className="text-phase3">"{TOKENS[hoveredCell[0]]}"</span> attending to{' '}
            <span className="text-phase3">"{TOKENS[hoveredCell[1]]}"</span>
            {' '}→ weight{' '}
            <span className="text-ink font-semibold">
              {ATTN_MATRIX[hoveredCell[0]][hoveredCell[1]].toFixed(4)}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
