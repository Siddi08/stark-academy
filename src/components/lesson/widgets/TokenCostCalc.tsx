import { useState, useMemo } from 'react'
import { cn } from '@/utils/cn'

const MODELS = [
  { name: 'Claude Haiku 4.5',  input: 0.80,  output: 4.00  },
  { name: 'Claude Sonnet 4.5', input: 3.00,  output: 15.00 },
  { name: 'Claude Sonnet 4.6', input: 3.00,  output: 15.00 },
  { name: 'Claude Opus 4.7',   input: 15.00, output: 75.00 },
] as const

type ModelName = typeof MODELS[number]['name']

const PRESETS = [
  { label: 'Short Q&A',          inputTokens: 500,   outputTokens: 200  },
  { label: 'Document analysis',  inputTokens: 8000,  outputTokens: 1000 },
  { label: 'Long conversation',  inputTokens: 32000, outputTokens: 2000 },
]

function formatTokens(n: number): string {
  return n.toLocaleString('en-US')
}

function formatUSD(n: number): string {
  if (n < 0.0001) return `$${n.toFixed(6)}`
  if (n < 0.01)   return `$${n.toFixed(4)}`
  return `$${n.toFixed(4)}`
}

function formatUSDLarge(n: number): string {
  if (n >= 10000) return `$${(n / 1000).toFixed(2)}k`
  if (n >= 1000)  return `$${n.toFixed(2)}`
  return `$${n.toFixed(2)}`
}

export function TokenCostCalc() {
  const [selectedModel, setSelectedModel] = useState<ModelName>('Claude Sonnet 4.6')
  const [inputTokens, setInputTokens] = useState(8000)
  const [outputTokens, setOutputTokens] = useState(1000)
  const [cachedInput, setCachedInput] = useState(false)

  const model = MODELS.find(m => m.name === selectedModel) ?? MODELS[1]

  const costs = useMemo(() => {
    const inputRate  = cachedInput ? model.input * 0.1 : model.input
    const inputCost  = (inputTokens  / 1_000_000) * inputRate
    const outputCost = (outputTokens / 1_000_000) * model.output
    const total      = inputCost + outputCost
    return { inputCost, outputCost, total }
  }, [model, inputTokens, outputTokens, cachedInput])

  const per1k  = costs.total * 1000
  const per1M  = costs.total * 1_000_000

  const totalForBar = costs.inputCost + costs.outputCost
  const inputPct  = totalForBar > 0 ? (costs.inputCost  / totalForBar) * 100 : 50
  const outputPct = totalForBar > 0 ? (costs.outputCost / totalForBar) * 100 : 50

  return (
    <div className="not-prose my-8 rounded-2xl border border-ok/25 bg-surface overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <span className="font-heading text-xs text-ok uppercase tracking-widest">
          Token Cost Calculator
        </span>
        <p className="text-xs text-ghost mt-0.5">Estimate Claude API costs per request</p>
      </div>

      <div className="px-5 pb-5 space-y-5">
        {/* Model selector */}
        <div>
          <div className="text-[10px] text-ghost uppercase tracking-wider mb-2 font-mono">Model</div>
          <div className="flex flex-wrap gap-2">
            {MODELS.map(m => (
              <button
                key={m.name}
                onClick={() => setSelectedModel(m.name)}
                className={cn(
                  'px-3 py-2 rounded-lg border text-xs font-mono transition-all duration-150 min-h-[44px] text-left',
                  selectedModel === m.name
                    ? 'bg-ok/10 border-ok/40 text-ok'
                    : 'border-border text-ghost hover:border-rim hover:text-dim',
                )}
              >
                <div className="font-medium">{m.name}</div>
                <div className="text-[10px] opacity-70 mt-0.5">
                  ${m.input}/${m.output} per 1M
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Presets */}
        <div>
          <div className="text-[10px] text-ghost uppercase tracking-wider mb-2 font-mono">Presets</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => { setInputTokens(p.inputTokens); setOutputTokens(p.outputTokens) }}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-xs font-mono transition-all duration-150 min-h-[36px]',
                  inputTokens === p.inputTokens && outputTokens === p.outputTokens
                    ? 'bg-ok/10 border-ok/40 text-ok'
                    : 'border-border text-ghost hover:border-rim hover:text-dim',
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input tokens slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-dim font-mono">Input tokens</span>
            <span className="text-xs text-phase3 font-mono font-bold">{formatTokens(inputTokens)} tokens</span>
          </div>
          <input
            type="range"
            min={0}
            max={100000}
            step={500}
            value={inputTokens}
            onChange={e => setInputTokens(Number(e.target.value))}
            className="w-full accent-phase3 h-1.5"
          />
          <div className="flex justify-between text-[10px] text-ghost font-mono mt-0.5">
            <span>0</span><span>100,000</span>
          </div>
        </div>

        {/* Output tokens slider */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-dim font-mono">Output tokens</span>
            <span className="text-xs text-phase2 font-mono font-bold">{formatTokens(outputTokens)} tokens</span>
          </div>
          <input
            type="range"
            min={0}
            max={10000}
            step={100}
            value={outputTokens}
            onChange={e => setOutputTokens(Number(e.target.value))}
            className="w-full accent-phase2 h-1.5"
          />
          <div className="flex justify-between text-[10px] text-ghost font-mono mt-0.5">
            <span>0</span><span>10,000</span>
          </div>
        </div>

        {/* Cached input toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none min-h-[44px]">
          <div
            onClick={() => setCachedInput(v => !v)}
            className={cn(
              'relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0',
              cachedInput ? 'bg-ok' : 'bg-border',
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200',
                cachedInput ? 'translate-x-5' : 'translate-x-0',
              )}
            />
          </div>
          <div>
            <div className="text-xs text-ink font-medium">Prompt caching enabled</div>
            <div className="text-[10px] text-ghost mt-0.5">Reduces input cost to 10% (cache hit)</div>
          </div>
        </label>

        {/* Results */}
        <div className="rounded-xl bg-raised border border-border p-4 space-y-3">
          <div className="text-[10px] text-ghost uppercase tracking-wider font-mono">Cost breakdown — per request</div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-dim font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-phase3 inline-block flex-shrink-0" />
                Input cost
                {cachedInput && <span className="text-[9px] text-ok ml-1">(cached)</span>}
              </span>
              <span className="text-ink font-mono">{formatUSD(costs.inputCost)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-dim font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-phase2 inline-block flex-shrink-0" />
                Output cost
              </span>
              <span className="text-ink font-mono">{formatUSD(costs.outputCost)}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-border pt-2">
              <span className="text-dim font-mono font-medium">Total per request</span>
              <span className="text-ok font-mono font-bold">{formatUSD(costs.total)}</span>
            </div>
          </div>

          {/* Cost comparison bar */}
          <div>
            <div className="text-[10px] text-ghost font-mono mb-1.5">Input vs output proportion</div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              <div
                className="bg-phase3 rounded-l-full transition-all duration-300"
                style={{ width: `${inputPct}%` }}
              />
              <div
                className="bg-phase2 rounded-r-full transition-all duration-300"
                style={{ width: `${outputPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-ghost font-mono mt-1">
              <span className="text-phase3">{inputPct.toFixed(0)}% input</span>
              <span className="text-phase2">{outputPct.toFixed(0)}% output</span>
            </div>
          </div>

          {/* Bulk costs */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="rounded-lg bg-surface border border-border p-2.5">
              <div className="text-[10px] text-ghost font-mono mb-0.5">Per 1,000 requests</div>
              <div className="text-sm font-mono text-phase4 font-bold">{formatUSDLarge(per1k)}</div>
            </div>
            <div className="rounded-lg bg-surface border border-border p-2.5">
              <div className="text-[10px] text-ghost font-mono mb-0.5">Per 1,000,000 requests</div>
              <div className="text-sm font-mono text-fail font-bold">{formatUSDLarge(per1M)}</div>
            </div>
          </div>
        </div>

        {/* Tip box */}
        <div className="flex gap-2 p-3 rounded-xl bg-phase4/5 border border-phase4/20 text-xs text-dim">
          <span className="flex-shrink-0">💡</span>
          <span>Output tokens are 4–5× more expensive than input. Keep responses concise for cost savings.</span>
        </div>
      </div>
    </div>
  )
}
