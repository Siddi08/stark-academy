import { useState, useMemo, useCallback } from 'react'
import { cn } from '@/utils/cn'

// ── vocabulary ────────────────────────────────────────────────────────────────

const VOCAB_WORDS = [
  // common English
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
  'to', 'of', 'and', 'in', 'that', 'have', 'it', 'for', 'on', 'with',
  'he', 'she', 'they', 'we', 'you', 'I', 'at', 'this', 'from', 'or',
  'which', 'one', 'had', 'by', 'but', 'not', 'what', 'all', 'when',
  'your', 'can', 'said', 'there', 'use', 'each', 'do', 'how', 'up',
  'out', 'about', 'who', 'get', 'go', 'me',
  // subwords
  'ing', 'ed', 'er', 'est', 'ly', 'tion', 'ness', 'ful', 'less',
  'able', 'ment', 'un', 're', 'pre', 'dis', 'over', 'under', 'out',
  'up', 'trans',
  // AI / ML
  'neural', 'network', 'model', 'token', 'data', 'train', 'learn',
  'weight', 'layer', 'embed', 'vector', 'matrix', 'gradient',
  'attention', 'transform', 'encode', 'decode', 'language', 'predict',
  'output', 'input', 'Claude', 'GPT', 'AI', 'LLM',
]

// build a Set, sorted descending by length so greedy match picks longest first
const VOCAB_SET = new Set(VOCAB_WORDS)

// all tokens we may try, sorted longest-first for greedy matching
const SORTED_VOCAB: string[] = [...VOCAB_SET].sort((a, b) => b.length - a.length)

// add individual digits 0-9
for (let d = 0; d <= 9; d++) SORTED_VOCAB.push(String(d))

// punctuation handled as single chars
const PUNCTUATION = new Set('.,!?;:\'"-()[]{}/@#$%^&*+=<>|\\`~_')

// ── tokenizer ─────────────────────────────────────────────────────────────────

function tokenize(text: string): string[] {
  const tokens: string[] = []
  let pos = 0

  while (pos < text.length) {
    const ch = text[pos]

    // whitespace — skip but emit as a token for visual spacing
    if (ch === ' ' || ch === '\t') {
      tokens.push(ch)
      pos++
      continue
    }

    // newline
    if (ch === '\n') {
      tokens.push(ch)
      pos++
      continue
    }

    // punctuation — always single
    if (PUNCTUATION.has(ch)) {
      tokens.push(ch)
      pos++
      continue
    }

    // try greedy longest match (case-sensitive first, then lowercase fallback)
    let matched = false
    for (const candidate of SORTED_VOCAB) {
      const len = candidate.length
      if (pos + len > text.length) continue

      const slice       = text.slice(pos, pos + len)
      const sliceLower  = slice.toLowerCase()

      if (slice === candidate || sliceLower === candidate) {
        // make sure this isn't just a prefix of a longer alphabetic run
        const nextCh = text[pos + len] ?? ''
        const isWord = /[a-zA-Z0-9]/.test(candidate[0])
        if (isWord && /[a-zA-Z0-9]/.test(nextCh)) {
          // don't split mid-word unless the candidate exactly equals the slice
          // (i.e. we allow splitting subwords from longer unknowns below)
          continue
        }
        tokens.push(slice)
        pos += len
        matched = true
        break
      }
    }

    if (!matched) {
      // unknown character — emit as-is
      tokens.push(ch)
      pos++
    }
  }

  return tokens
}

// ── colour cycling ────────────────────────────────────────────────────────────

// 6 accent classes cycling for display tokens
const TOKEN_COLORS = [
  'bg-phase1/20 text-phase1 border-phase1/30',
  'bg-phase2/20 text-phase2 border-phase2/30',
  'bg-phase3/20 text-phase3 border-phase3/30',
  'bg-phase4/20 text-phase4 border-phase4/30',
  'bg-phase5/20 text-phase5 border-phase5/30',
  'bg-spark-400/20 text-spark-400 border-spark-400/30',
]

// whitespace / newline render class (invisible but takes space)
const SPACE_CLASS = 'bg-transparent border-transparent text-ghost/0 select-none'

// ── preset examples ───────────────────────────────────────────────────────────

const PRESETS: { label: string; text: string }[] = [
  {
    label: 'Simple sentence',
    text: 'The neural network learns from data.',
  },
  {
    label: 'Code snippet',
    text: 'def forward(x):\n    return torch.relu(x)',
  },
  {
    label: 'Number sequence',
    text: 'The year 2024 saw 1.5 trillion tokens processed',
  },
  {
    label: 'Edge cases',
    text: 'tokenization TokeniZATION TOKENIZATION',
  },
]

// ── component ─────────────────────────────────────────────────────────────────

export function TokenizerDemo() {
  const [text, setText] = useState(PRESETS[0].text)

  const tokens = useMemo(() => tokenize(text), [text])

  // visible tokens = everything except plain spaces/newlines (for count)
  const visibleTokens = useMemo(
    () => tokens.filter(t => t !== ' ' && t !== '\t' && t !== '\n'),
    [tokens],
  )

  const charCount   = text.length
  const tokenCount  = visibleTokens.length
  const ratio       = charCount > 0 ? (tokenCount / charCount).toFixed(2) : '0.00'

  const handlePreset = useCallback((preset: string) => setText(preset), [])

  // assign colours to visible tokens only; spaces get transparent
  let colourIdx = 0
  const colouredTokens = tokens.map(t => {
    if (t === ' ' || t === '\t' || t === '\n') return SPACE_CLASS
    const cls = TOKEN_COLORS[colourIdx % TOKEN_COLORS.length]
    colourIdx++
    return cls
  })

  return (
    <div className="not-prose my-8 p-5 sm:p-6 rounded-2xl border border-phase4/25 bg-surface">
      {/* header */}
      <div className="mb-5">
        <span className="font-heading text-xs text-phase4 uppercase tracking-widest">
          Tokeniser Demo
        </span>
        <p className="text-xs text-ghost mt-0.5">
          See how text is split into tokens using a greedy vocabulary match
        </p>
      </div>

      {/* preset buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {PRESETS.map(p => (
          <button
            key={p.label}
            onClick={() => handlePreset(p.text)}
            className={cn(
              'font-mono text-xs px-3 py-1.5 rounded-lg border transition-all duration-150 min-h-[36px]',
              text === p.text
                ? 'border-phase4/60 bg-phase4/15 text-phase4'
                : 'border-border text-ghost hover:border-rim hover:text-dim',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* textarea */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        rows={3}
        placeholder="Type anything…"
        className={cn(
          'w-full bg-raised border border-border rounded-xl px-4 py-3',
          'text-ink placeholder:text-ghost font-mono text-sm',
          'focus:outline-none focus:border-phase4 focus:ring-1 focus:ring-phase4/30',
          'transition-colors resize-y min-h-[44px]',
        )}
      />

      {/* stats row */}
      <div className="flex flex-wrap gap-4 my-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-ghost font-mono">Tokens</span>
          <span className="font-heading text-2xl font-bold text-phase4">{tokenCount}</span>
        </div>
        <div className="w-px bg-border" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-ghost font-mono">Chars</span>
          <span className="font-heading text-2xl font-bold text-dim">{charCount}</span>
        </div>
        <div className="w-px bg-border" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-ghost font-mono">Tokens/char</span>
          <span className="font-heading text-2xl font-bold text-dim">{ratio}</span>
        </div>
      </div>

      {/* tokenized output */}
      <div className="rounded-xl border border-border bg-raised p-4 min-h-[60px] mb-4">
        <p className="text-[10px] uppercase tracking-wider text-ghost font-mono mb-3">Tokens</p>
        <div className="flex flex-wrap gap-1.5 leading-relaxed">
          {tokens.map((tok, i) => {
            if (tok === '\n') {
              return <div key={i} className="w-full h-0" />
            }
            return (
              <span
                key={i}
                className={cn(
                  'inline-block px-1.5 py-0.5 rounded border text-xs font-mono transition-colors',
                  colouredTokens[i],
                )}
              >
                {tok === ' ' || tok === '\t' ? ' ' : tok}
              </span>
            )
          })}
        </div>
      </div>

      {/* disclaimer */}
      <p className="text-[11px] text-ghost/70 font-mono leading-5">
        ⚠ This is a simplified approximation of BPE — real tokenizers use learned merge rules.
      </p>
    </div>
  )
}
