import { useState } from 'react'
import { Shuffle } from 'lucide-react'
import { cn } from '@/utils/cn'

const WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1]

function numberToBits(n: number): boolean[] {
  return WEIGHTS.map(w => (n & w) !== 0)
}

function bitsToNumber(bits: boolean[]): number {
  return bits.reduce((acc, bit, i) => acc + (bit ? WEIGHTS[i] : 0), 0)
}

const PRESETS = [
  { label: '0', value: 0 },
  { label: '42', value: 42 },
  { label: '127', value: 127 },
  { label: '170', value: 170 },   // 10101010 — checkerboard pattern
  { label: '255', value: 255 },
]

export function BitToggler() {
  const [bits, setBits] = useState<boolean[]>(Array(8).fill(false))
  const decimal = bitsToNumber(bits)
  const hex = decimal.toString(16).toUpperCase().padStart(2, '0')
  const binary = bits.map(b => b ? '1' : '0').join('')

  const toggle = (i: number) => {
    setBits(prev => prev.map((b, j) => (j === i ? !b : b)))
  }

  const setPreset = (n: number) => setBits(numberToBits(n))
  const increment = () => setPreset(decimal === 255 ? 0 : decimal + 1)
  const decrement = () => setPreset(decimal === 0 ? 255 : decimal - 1)
  const random = () => setPreset(Math.floor(Math.random() * 256))

  const activeBits = WEIGHTS.filter((_, i) => bits[i])

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-spark-500/25 bg-surface">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="font-heading text-xs text-spark-400 uppercase tracking-widest">
            Bit Toggler
          </span>
          <p className="text-xs text-ghost mt-0.5">Click any bit to flip it — watch the values update</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={random}
            className="btn-ghost text-xs px-3 min-h-[36px] flex items-center gap-1.5"
            title="Random value"
          >
            <Shuffle size={12} />
          </button>
        </div>
      </div>

      {/* Bit cells */}
      <div className="flex gap-1 sm:gap-1.5 justify-center overflow-x-auto pb-1">
        {bits.map((bit, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className={cn(
              'flex-shrink-0 flex flex-col items-center w-[38px] sm:w-[52px] py-2.5 rounded-xl border-2 transition-all duration-150 min-h-[70px] sm:min-h-[80px]',
              bit
                ? 'bg-spark-500/15 border-spark-500/60 shadow-[0_0_14px_-4px_rgba(84,86,245,0.6)]'
                : 'bg-raised border-border hover:border-rim',
            )}
          >
            <span className={cn(
              'font-mono text-[9px] sm:text-[10px] mb-1 leading-none',
              bit ? 'text-spark-400' : 'text-ghost',
            )}>
              {WEIGHTS[i]}
            </span>
            <span
              key={`${i}-${bit}`}
              className={cn(
                'font-heading text-lg sm:text-2xl font-bold animate-spark leading-none',
                bit ? 'text-spark-300' : 'text-ghost',
              )}
            >
              {bit ? '1' : '0'}
            </span>
          </button>
        ))}
      </div>

      {/* Active bit sum breakdown */}
      <div className="mt-3 text-center min-h-[1.25rem]">
        {decimal > 0 ? (
          <span className="text-xs text-dim font-mono">
            {activeBits.join(' + ')} = {decimal}
          </span>
        ) : (
          <span className="text-xs text-ghost font-mono">all bits off = 0</span>
        )}
      </div>

      {/* Value display */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
        <div className="bg-raised rounded-xl p-3 text-center">
          <div className="font-mono text-xl sm:text-2xl font-bold text-ink tabular-nums">
            {decimal}
          </div>
          <div className="text-[10px] text-ghost mt-1">decimal</div>
        </div>
        <div className="bg-raised rounded-xl p-3 text-center">
          <div className="font-mono text-xl sm:text-2xl font-bold text-phase3 tabular-nums">
            0x{hex}
          </div>
          <div className="text-[10px] text-ghost mt-1">hex</div>
        </div>
        <div className="bg-raised rounded-xl p-3 text-center overflow-hidden">
          <div className="font-mono text-[11px] sm:text-sm font-bold text-dim leading-tight pt-1 break-all">
            {binary.slice(0, 4)}&thinsp;{binary.slice(4)}
          </div>
          <div className="text-[10px] text-ghost mt-1">binary</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        <div className="flex gap-1 mr-auto">
          <button
            onClick={decrement}
            className="font-mono text-sm px-3 py-1.5 rounded-lg border border-border text-ghost hover:border-rim hover:text-dim transition-all min-h-[36px]"
          >
            −1
          </button>
          <button
            onClick={increment}
            className="font-mono text-sm px-3 py-1.5 rounded-lg border border-border text-ghost hover:border-rim hover:text-dim transition-all min-h-[36px]"
          >
            +1
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {PRESETS.map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setPreset(value)}
              className={cn(
                'font-mono text-xs px-2.5 py-1.5 rounded-lg border transition-all min-h-[36px]',
                decimal === value
                  ? 'border-spark-500/60 bg-spark-500/10 text-spark-300'
                  : 'border-border text-ghost hover:border-rim hover:text-dim',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
