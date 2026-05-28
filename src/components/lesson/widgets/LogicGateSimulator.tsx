import { useState, useEffect, useRef } from 'react'
import { cn } from '@/utils/cn'

type GateType = 'NOT' | 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR'

const GATES: GateType[] = ['NOT', 'AND', 'OR', 'XOR', 'NAND', 'NOR']

function computeOutput(gate: GateType, a: 0 | 1, b: 0 | 1): 0 | 1 {
  switch (gate) {
    case 'NOT':  return a === 0 ? 1 : 0
    case 'AND':  return a === 1 && b === 1 ? 1 : 0
    case 'OR':   return a === 1 || b === 1 ? 1 : 0
    case 'XOR':  return a !== b ? 1 : 0
    case 'NAND': return !(a === 1 && b === 1) ? 1 : 0
    case 'NOR':  return !(a === 1 || b === 1) ? 1 : 0
  }
}

function buildTruthTable(gate: GateType): { a: 0 | 1; b?: 0 | 1; out: 0 | 1 }[] {
  if (gate === 'NOT') {
    return [
      { a: 0, out: computeOutput('NOT', 0, 0) },
      { a: 1, out: computeOutput('NOT', 1, 0) },
    ]
  }
  const rows: { a: 0 | 1; b: 0 | 1; out: 0 | 1 }[] = []
  for (const a of [0, 1] as const) {
    for (const b of [0, 1] as const) {
      rows.push({ a, b, out: computeOutput(gate, a, b) })
    }
  }
  return rows
}

function BitValue({ value, animated }: { value: 0 | 1; animated: boolean }) {
  return (
    <span
      key={`${value}-${animated}`}
      className={cn(
        'font-heading text-2xl font-bold',
        animated && 'animate-spark',
        value === 1 ? 'text-spark-400' : 'text-ghost',
      )}
    >
      {value}
    </span>
  )
}

export function LogicGateSimulator() {
  const [gate, setGate] = useState<GateType>('AND')
  const [a, setA] = useState<0 | 1>(0)
  const [b, setB] = useState<0 | 1>(0)
  const [animKey, setAnimKey] = useState(0)
  const prevOutputRef = useRef<0 | 1>(-1 as unknown as 0 | 1)

  const output = computeOutput(gate, a, b)
  const truthTable = buildTruthTable(gate)

  useEffect(() => {
    if (prevOutputRef.current !== output) {
      setAnimKey(k => k + 1)
      prevOutputRef.current = output
    }
  }, [output])

  const handleGateChange = (g: GateType) => {
    setGate(g)
    setA(0)
    setB(0)
  }

  const activeRowIndex = gate === 'NOT'
    ? a
    : a * 2 + b

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-spark-500/25 bg-surface">
      <div className="flex items-center justify-between mb-4 sm:mb-5">
        <div>
          <span className="font-heading text-xs text-spark-500 uppercase tracking-widest">Logic Gate Simulator</span>
          <p className="text-xs text-ghost mt-0.5">Toggle inputs and observe the output in real time</p>
        </div>
      </div>

      {/* Gate selector */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {GATES.map(g => (
          <button
            key={g}
            onClick={() => handleGateChange(g)}
            className={cn(
              'font-mono text-xs px-3 py-1.5 rounded-lg border transition-all min-h-[36px]',
              gate === g
                ? 'border-spark-500/60 bg-spark-500/15 text-spark-300'
                : 'border-border text-ghost hover:border-rim hover:text-dim',
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Circuit diagram area */}
      <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
        {/* Inputs */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-[10px] text-dim uppercase">A</span>
            <button
              onClick={() => setA(v => (v === 0 ? 1 : 0))}
              className={cn(
                'w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-150 min-h-[44px]',
                a === 1
                  ? 'bg-spark-500/15 border-spark-500/60 shadow-[0_0_16px_-4px_rgba(84,86,245,0.5)]'
                  : 'bg-raised border-border hover:border-rim',
              )}
            >
              <BitValue value={a} animated={false} />
            </button>
          </div>
          {gate !== 'NOT' && (
            <div className="flex flex-col items-center gap-1.5">
              <span className="font-mono text-[10px] text-dim uppercase">B</span>
              <button
                onClick={() => setB(v => (v === 0 ? 1 : 0))}
                className={cn(
                  'w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-150 min-h-[44px]',
                  b === 1
                    ? 'bg-spark-500/15 border-spark-500/60 shadow-[0_0_16px_-4px_rgba(84,86,245,0.5)]'
                    : 'bg-raised border-border hover:border-rim',
                )}
              >
                <BitValue value={b} animated={false} />
              </button>
            </div>
          )}
        </div>

        {/* Arrow right */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 sm:w-12 h-px bg-border" />
          {gate !== 'NOT' && <div className="w-8 sm:w-12 h-px bg-border mt-[52px]" />}
        </div>

        {/* Gate box */}
        <div className="flex flex-col items-center">
          <div className="px-4 py-3 rounded-xl border-2 border-spark-500/40 bg-spark-500/10 min-w-[64px] text-center">
            <span className="font-heading text-sm font-bold text-spark-300 tracking-wide">{gate}</span>
          </div>
        </div>

        {/* Arrow + output */}
        <div className="flex items-center gap-3">
          <div className="w-8 sm:w-12 h-px bg-border" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="font-mono text-[10px] text-dim uppercase">Out</span>
            <div
              className={cn(
                'w-14 h-14 rounded-xl border-2 flex items-center justify-center transition-all duration-150',
                output === 1
                  ? 'bg-spark-500/20 border-spark-500 shadow-[0_0_20px_-4px_rgba(84,86,245,0.7)]'
                  : 'bg-raised border-border',
              )}
            >
              <span
                key={animKey}
                className={cn(
                  'font-heading text-2xl font-bold animate-spark',
                  output === 1 ? 'text-spark-300' : 'text-ghost',
                )}
              >
                {output}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Truth table */}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="bg-raised border-b border-border">
              <th className="text-left px-3 py-2 text-dim font-normal">A</th>
              {gate !== 'NOT' && <th className="text-left px-3 py-2 text-dim font-normal">B</th>}
              <th className="text-left px-3 py-2 text-dim font-normal">Output</th>
            </tr>
          </thead>
          <tbody>
            {truthTable.map((row, i) => (
              <tr
                key={i}
                className={cn(
                  'border-b border-border/50 last:border-0 transition-colors duration-150',
                  i === activeRowIndex
                    ? 'bg-spark-500/10'
                    : i % 2 === 0 ? 'bg-surface' : 'bg-raised/40',
                )}
              >
                <td className={cn('px-3 py-2', row.a === 1 ? 'text-spark-400' : 'text-ghost')}>
                  {row.a}
                </td>
                {gate !== 'NOT' && (
                  <td className={cn('px-3 py-2', row.b === 1 ? 'text-spark-400' : 'text-ghost')}>
                    {row.b}
                  </td>
                )}
                <td className={cn('px-3 py-2 font-bold', row.out === 1 ? 'text-spark-300' : 'text-ghost')}>
                  {row.out}
                  {i === activeRowIndex && (
                    <span className="ml-2 text-[10px] text-spark-500/70 not-italic">← active</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
