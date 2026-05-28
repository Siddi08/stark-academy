import { useState, useEffect } from 'react'
import { Loader2, CheckCircle, XCircle, Zap } from 'lucide-react'
import { cn } from '@/utils/cn'
import { generateCheckpoint } from '@/api/anthropic'
import type { CheckpointQuestion } from '@/api/anthropic'

type State =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'question'; q: CheckpointQuestion }
  | { phase: 'answered'; q: CheckpointQuestion; answer: string }
  | { phase: 'skipped' }
  | { phase: 'error'; message: string }

interface Props {
  sectionContent: string
  workerUrl: string
}

export function CheckpointCard({ sectionContent, workerUrl }: Props) {
  const [state, setState] = useState<State>({ phase: 'idle' })

  // Load immediately on mount — don't wait for scroll position
  useEffect(() => {
    if (!workerUrl) return
    load()
  }, [workerUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  async function load() {
    setState({ phase: 'loading' })
    try {
      const q = await generateCheckpoint({ workerUrl, sectionContent })
      setState({ phase: 'question', q })
    } catch (err) {
      setState({ phase: 'error', message: err instanceof Error ? err.message : 'Failed to generate question' })
    }
  }

  function handleAnswer(option: string) {
    if (state.phase !== 'question') return
    setState({ phase: 'answered', q: state.q, answer: option })
  }

  if (!workerUrl) return null
  if (state.phase === 'skipped') return null

  return (
    <div className="my-8 rounded-2xl border border-spark-500/25 bg-spark-500/5 p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-spark-400" />
          <span className="font-heading text-xs text-spark-400 uppercase tracking-widest">Checkpoint</span>
        </div>
        {state.phase !== 'answered' && (
          <button
            onClick={() => setState({ phase: 'skipped' })}
            className="text-xs text-ghost hover:text-dim transition-colors min-h-[44px] px-2"
          >
            Skip
          </button>
        )}
      </div>

      {/* Loading */}
      {state.phase === 'loading' && (
        <div className="flex items-center gap-2 py-1">
          <Loader2 size={13} className="text-spark-400 animate-spin" />
          <span className="text-xs text-dim">Generating question…</span>
        </div>
      )}

      {/* Error */}
      {state.phase === 'error' && (
        <div className="space-y-2">
          <p className="text-xs text-fail">{state.message}</p>
          <button onClick={load} className="text-xs text-spark-300 hover:text-spark-200 underline">
            Retry
          </button>
        </div>
      )}

      {/* Question + options */}
      {(state.phase === 'question' || state.phase === 'answered') && (
        <div className="space-y-3">
          <p className="font-body text-sm text-ink leading-relaxed">{state.q.question}</p>

          <div className="space-y-2">
            {state.q.options.map(opt => {
              const isAnswered = state.phase === 'answered'
              const isSelected = isAnswered && (state as { answer: string }).answer === opt
              const isCorrect = isAnswered && opt === state.q.correctAnswer
              const isWrong   = isAnswered && isSelected && !isCorrect

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={isAnswered}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl border text-sm font-body',
                    'transition-all duration-150 min-h-[44px]',
                    !isAnswered && 'border-border bg-raised text-dim hover:border-spark-500/40 hover:text-ink cursor-pointer',
                    isCorrect  && 'border-ok/40 bg-ok/10 text-ok',
                    isWrong    && 'border-fail/40 bg-fail/10 text-fail',
                    isAnswered && !isSelected && !isCorrect && 'border-border bg-raised text-ghost opacity-40',
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isCorrect && <CheckCircle size={13} className="shrink-0" />}
                    {isWrong   && <XCircle   size={13} className="shrink-0" />}
                    {opt}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Explanation */}
          {state.phase === 'answered' && (() => {
            const correct = (state as { answer: string }).answer === state.q.correctAnswer
            return (
              <div className={cn(
                'px-4 py-3 rounded-xl border text-xs leading-relaxed',
                correct ? 'bg-ok/5 border-ok/20 text-ok' : 'bg-surface border-border text-dim',
              )}>
                {correct ? '✓ Correct — ' : `✗ Incorrect — correct answer: ${state.q.correctAnswer}. `}
                {state.q.explanation}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}
