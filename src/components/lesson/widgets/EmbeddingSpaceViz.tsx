import { useState, useMemo, useRef, useCallback } from 'react'
import { cn } from '@/utils/cn'

type Cluster = 'royalty' | 'gender' | 'animals' | 'tech' | 'colors' | 'actions'

interface WordPoint {
  word: string
  x: number
  y: number
  cluster: Cluster
}

const WORDS: WordPoint[] = [
  // Royalty
  { word: 'king',     x: 0.90, y: 0.80, cluster: 'royalty' },
  { word: 'queen',    x: 0.85, y: 0.55, cluster: 'royalty' },
  { word: 'prince',   x: 0.70, y: 0.70, cluster: 'royalty' },
  { word: 'princess', x: 0.65, y: 0.50, cluster: 'royalty' },
  // Gender
  { word: 'man',      x: 0.30, y: 0.70, cluster: 'gender' },
  { word: 'woman',    x: 0.25, y: 0.45, cluster: 'gender' },
  { word: 'boy',      x: 0.15, y: 0.65, cluster: 'gender' },
  { word: 'girl',     x: 0.10, y: 0.40, cluster: 'gender' },
  // Animals
  { word: 'dog',      x: 0.50, y: 0.15, cluster: 'animals' },
  { word: 'cat',      x: 0.55, y: 0.05, cluster: 'animals' },
  { word: 'wolf',     x: 0.45, y: 0.20, cluster: 'animals' },
  { word: 'lion',     x: 0.60, y: 0.10, cluster: 'animals' },
  // Tech
  { word: 'computer', x: 0.70, y: 0.20, cluster: 'tech' },
  { word: 'code',     x: 0.75, y: 0.30, cluster: 'tech' },
  { word: 'data',     x: 0.80, y: 0.25, cluster: 'tech' },
  { word: 'model',    x: 0.85, y: 0.35, cluster: 'tech' },
  // Colors
  { word: 'red',      x: 0.10, y: 0.85, cluster: 'colors' },
  { word: 'blue',     x: 0.20, y: 0.90, cluster: 'colors' },
  { word: 'green',    x: 0.30, y: 0.85, cluster: 'colors' },
  { word: 'yellow',   x: 0.15, y: 0.95, cluster: 'colors' },
  // Actions
  { word: 'run',      x: 0.40, y: 0.50, cluster: 'actions' },
  { word: 'walk',     x: 0.35, y: 0.55, cluster: 'actions' },
  { word: 'jump',     x: 0.45, y: 0.45, cluster: 'actions' },
]

// Cluster color tokens
const CLUSTER_STROKE: Record<Cluster, string> = {
  royalty: '#FFB547', // phase4
  gender:  '#7C8FFF', // phase3
  animals: '#FF6B4A', // phase2
  tech:    '#7677FF', // spark-400
  colors:  '#00C896', // phase1
  actions: '#C278FF', // phase5
}
const CLUSTER_TEXT: Record<Cluster, string> = {
  royalty: 'text-phase4',
  gender:  'text-phase3',
  animals: 'text-phase2',
  tech:    'text-spark-400',
  colors:  'text-phase1',
  actions: 'text-phase5',
}
const CLUSTER_LABEL: Record<Cluster, string> = {
  royalty: 'Royalty',
  gender:  'Gender',
  animals: 'Animals',
  tech:    'Tech',
  colors:  'Colors',
  actions: 'Actions',
}

const SVG_W = 400
const SVG_H = 320
const PAD = 28

function toSvgX(nx: number): number {
  return PAD + nx * (SVG_W - PAD * 2)
}

function toSvgY(ny: number): number {
  // y=1 at top, y=0 at bottom
  return PAD + (1 - ny) * (SVG_H - PAD * 2)
}

function euclidean(a: WordPoint, b: WordPoint): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

function nearestNeighbors(word: WordPoint, n = 3): WordPoint[] {
  return WORDS
    .filter(w => w.word !== word.word)
    .sort((a, b) => euclidean(word, a) - euclidean(word, b))
    .slice(0, n)
}

// Vector arithmetic examples
interface ArithmeticExample {
  label: string
  a: string   // source word
  b: string   // minus word
  c: string   // plus word
  result: string // expected result word
}

const ARITHMETIC_EXAMPLES: ArithmeticExample[] = [
  { label: 'king − man + woman ≈ queen', a: 'king', b: 'man', c: 'woman', result: 'queen' },
  { label: 'dog − wolf + lion ≈ cat',    a: 'dog',  b: 'wolf', c: 'lion', result: 'cat'  },
]

function getWord(w: string): WordPoint {
  return WORDS.find(p => p.word === w)!
}

export function EmbeddingSpaceViz() {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)
  const [clickedWord, setClickedWord] = useState<string | null>(null)
  const [arithMode, setArithMode] = useState(false)
  const [arithIdx, setArithIdx] = useState(0)
  const animKeyRef = useRef(0)
  const [animKey, setAnimKey] = useState(0)

  const hoveredPoint = useMemo(
    () => hoveredWord ? WORDS.find(w => w.word === hoveredWord) ?? null : null,
    [hoveredWord],
  )
  const clickedPoint = useMemo(
    () => clickedWord ? WORDS.find(w => w.word === clickedWord) ?? null : null,
    [clickedWord],
  )

  const neighbors = useMemo(
    () => clickedPoint ? nearestNeighbors(clickedPoint) : hoveredPoint ? nearestNeighbors(hoveredPoint, 3) : [],
    [clickedPoint, hoveredPoint],
  )

  const activePoint = clickedPoint ?? hoveredPoint

  const arithEx = ARITHMETIC_EXAMPLES[arithIdx]
  const arithA = getWord(arithEx.a)
  const arithB = getWord(arithEx.b)
  const arithC = getWord(arithEx.c)
  const arithResult = getWord(arithEx.result)

  // Computed result vector: A - B + C
  const computedRx = arithA.x - arithB.x + arithC.x
  const computedRy = arithA.y - arithB.y + arithC.y

  const handleWordClick = useCallback((word: string) => {
    setClickedWord(prev => prev === word ? null : word)
  }, [])

  const handleArithToggle = () => {
    if (!arithMode) {
      animKeyRef.current += 1
      setAnimKey(animKeyRef.current)
    }
    setArithMode(v => !v)
    setClickedWord(null)
  }

  const handleArithSwitch = (idx: number) => {
    setArithIdx(idx)
    animKeyRef.current += 1
    setAnimKey(animKeyRef.current)
  }

  return (
    <div className="not-prose my-8 rounded-2xl border border-phase3/25 bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <span className="font-heading text-xs text-phase3 uppercase tracking-widest">
            Embedding Space Visualizer
          </span>
          <p className="text-xs text-ghost mt-0.5">
            Hover to see neighbors · Click to pin · Toggle arithmetic mode
          </p>
        </div>
        <button
          onClick={handleArithToggle}
          className={cn(
            'px-3 py-2 rounded-lg border text-xs font-mono transition-all duration-150 min-h-[44px] flex-shrink-0',
            arithMode
              ? 'bg-phase3/15 border-phase3/50 text-phase3'
              : 'border-border text-ghost hover:border-rim hover:text-dim',
          )}
        >
          {arithMode ? '✕ Vector math' : '＋ Vector math'}
        </button>
      </div>

      <div className="px-5 pb-5 space-y-4">
        {/* Vector arithmetic mode switcher */}
        {arithMode && (
          <div className="flex flex-wrap gap-2 animate-fade-in">
            {ARITHMETIC_EXAMPLES.map((ex, i) => (
              <button
                key={i}
                onClick={() => handleArithSwitch(i)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150 min-h-[36px]',
                  arithIdx === i
                    ? 'bg-ok/10 border-ok/40 text-ok'
                    : 'border-border text-ghost hover:border-rim hover:text-dim',
                )}
              >
                {ex.label}
              </button>
            ))}
          </div>
        )}

        {/* SVG plot */}
        <div className="overflow-x-auto">
          <svg
            key={arithMode ? `arith-${animKey}` : 'normal'}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className="w-full max-w-[500px] block rounded-xl border border-border bg-void"
            aria-label="2D word embedding space"
            onMouseLeave={() => setHoveredWord(null)}
          >
            {/* Axis labels */}
            <text x={SVG_W / 2} y={SVG_H - 4} textAnchor="middle" fontSize="8" fill="#4A4864">
              Semantic dimension 1
            </text>
            <text x={8} y={SVG_H / 2} textAnchor="middle" fontSize="8" fill="#4A4864"
              transform={`rotate(-90, 8, ${SVG_H / 2})`}>
              Semantic dimension 2
            </text>

            {/* Neighbor dashed lines */}
            {activePoint && neighbors.map(nb => (
              <line
                key={nb.word}
                x1={toSvgX(activePoint.x)} y1={toSvgY(activePoint.y)}
                x2={toSvgX(nb.x)} y2={toSvgY(nb.y)}
                stroke={CLUSTER_STROKE[activePoint.cluster]}
                strokeWidth="1"
                strokeDasharray="4 3"
                strokeOpacity="0.5"
              />
            ))}

            {/* Vector arithmetic arrows */}
            {arithMode && (() => {
              const ax = toSvgX(arithA.x), ay = toSvgY(arithA.y)
              const bx = toSvgX(arithB.x), by = toSvgY(arithB.y)
              const cx = toSvgX(arithC.x), cy = toSvgY(arithC.y)
              const rx = toSvgX(computedRx), ry = toSvgY(computedRy)

              return (
                <g>
                  <defs>
                    <marker id="arrowPhase4" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L7,3 z" fill="#FFB547" />
                    </marker>
                    <marker id="arrowPhase3" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L7,3 z" fill="#7C8FFF" />
                    </marker>
                    <marker id="arrowOk" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L7,3 z" fill="#00C896" />
                    </marker>
                  </defs>
                  {/* man→king vector */}
                  <line
                    x1={bx} y1={by} x2={ax} y2={ay}
                    stroke="#FFB547" strokeWidth="2" markerEnd="url(#arrowPhase4)"
                    strokeDasharray="5 0"
                    style={{ animation: 'fadeIn 0.4s ease forwards' }}
                  />
                  {/* woman→result vector (offset from woman) */}
                  <line
                    x1={cx} y1={cy} x2={rx} y2={ry}
                    stroke="#7C8FFF" strokeWidth="2" markerEnd="url(#arrowPhase3)"
                    strokeDasharray="5 0"
                    style={{ animation: 'fadeIn 0.7s ease forwards', opacity: 0 }}
                  />
                  {/* Result dot */}
                  <circle
                    cx={rx} cy={ry} r={8}
                    fill="#00C896" stroke="#0E0E14" strokeWidth="2" fillOpacity="0.3"
                    style={{ animation: 'fadeIn 1.0s ease forwards', opacity: 0 }}
                  />
                  <circle
                    cx={rx} cy={ry} r={4}
                    fill="#00C896" stroke="#0E0E14" strokeWidth="1.5"
                    style={{ animation: 'fadeIn 1.0s ease forwards', opacity: 0 }}
                  />
                  <text
                    x={rx + 8} y={ry - 6}
                    fontSize="9" fill="#00C896" fontWeight="bold"
                    style={{ animation: 'fadeIn 1.1s ease forwards', opacity: 0 }}
                  >
                    ≈ {arithEx.result}
                  </text>
                </g>
              )
            })()}

            {/* Word dots */}
            {WORDS.map(wp => {
              const sx = toSvgX(wp.x)
              const sy = toSvgY(wp.y)
              const isHovered = hoveredWord === wp.word
              const isClicked = clickedWord === wp.word
              const isNeighbor = neighbors.some(n => n.word === wp.word)
              const isArithKey = arithMode && (
                wp.word === arithEx.a || wp.word === arithEx.b ||
                wp.word === arithEx.c || wp.word === arithEx.result
              )
              const r = isHovered || isClicked ? 6 : isNeighbor || isArithKey ? 5 : 4
              const opacity = activePoint && !isHovered && !isClicked && !isNeighbor && !isArithKey
                ? 0.35
                : 1

              return (
                <g
                  key={wp.word}
                  style={{ cursor: 'pointer', opacity }}
                  onMouseEnter={() => setHoveredWord(wp.word)}
                  onMouseLeave={() => setHoveredWord(null)}
                  onClick={() => handleWordClick(wp.word)}
                >
                  {(isHovered || isClicked) && (
                    <circle
                      cx={sx} cy={sy} r={r + 5}
                      fill={CLUSTER_STROKE[wp.cluster]}
                      fillOpacity="0.15"
                    />
                  )}
                  <circle
                    cx={sx} cy={sy} r={r}
                    fill={CLUSTER_STROKE[wp.cluster]}
                    stroke="#0E0E14"
                    strokeWidth={isHovered || isClicked ? 2 : 1}
                  />
                  {(isHovered || isClicked || isArithKey) && (
                    <text
                      x={sx + r + 4} y={sy + 4}
                      fontSize="9"
                      fill={CLUSTER_STROKE[wp.cluster]}
                      fontWeight={isHovered || isClicked ? 'bold' : 'normal'}
                    >
                      {wp.word}
                    </text>
                  )}
                  {!isHovered && !isClicked && !isArithKey && (
                    <text
                      x={sx + r + 3} y={sy + 3}
                      fontSize="8"
                      fill="#9896B8"
                      opacity="0.6"
                    >
                      {wp.word}
                    </text>
                  )}
                </g>
              )
            })}
          </svg>
        </div>

        {/* Tooltip / neighbor info */}
        <div
          className={cn(
            'rounded-xl bg-raised border p-3 transition-all duration-200',
            activePoint ? 'border-border opacity-100' : 'border-transparent opacity-0 pointer-events-none',
          )}
          aria-live="polite"
        >
          {activePoint && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: CLUSTER_STROKE[activePoint.cluster] }}
                />
                <span className={cn('font-heading text-sm font-bold', CLUSTER_TEXT[activePoint.cluster])}>
                  {activePoint.word}
                </span>
                <span className="text-xs text-ghost">
                  — {CLUSTER_LABEL[activePoint.cluster]} cluster
                </span>
                {clickedWord && (
                  <span className="ml-auto text-[10px] text-dim font-mono">pinned</span>
                )}
              </div>
              <div className="text-[10px] text-ghost font-mono mb-1.5 uppercase tracking-wider">
                3 nearest neighbors
              </div>
              <div className="flex flex-wrap gap-2">
                {neighbors.map(nb => (
                  <span key={nb.word} className="flex items-center gap-1.5 text-xs font-mono">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: CLUSTER_STROKE[nb.cluster] }}
                    />
                    <span className="text-ink">{nb.word}</span>
                    <span className="text-ghost">
                      ({euclidean(activePoint, nb).toFixed(3)})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
          {!activePoint && <div className="h-4" />}
        </div>

        {/* Legend */}
        <div>
          <div className="text-[10px] text-ghost uppercase tracking-wider mb-2 font-mono">Clusters</div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            {(Object.keys(CLUSTER_LABEL) as Cluster[]).map(cl => (
              <span key={cl} className="flex items-center gap-1.5 text-xs font-mono">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: CLUSTER_STROKE[cl] }}
                />
                <span className="text-dim">{CLUSTER_LABEL[cl]}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Arithmetic explanation */}
        {arithMode && (
          <div className="flex gap-2 p-3 rounded-xl bg-ok/5 border border-ok/20 text-xs text-dim animate-fade-in">
            <span className="text-ok flex-shrink-0 font-mono font-bold">⟳</span>
            <span>
              <span className="text-phase4 font-mono">man→king</span> vector is applied from{' '}
              <span className="text-phase3 font-mono">{arithEx.c}</span> — the result lands near{' '}
              <span className="text-ok font-mono">≈ {arithEx.result}</span>.
              This is the classic word2vec analogy: <span className="text-ink font-mono">{arithEx.label}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
