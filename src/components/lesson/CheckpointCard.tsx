import { useState, useEffect, useRef } from 'react'
import { Loader2, CheckCircle2, XCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useWorkerUrl } from '@/store/useAppStore'

interface CheckpointQuestion {
  question: string
  options: string[]
  correct: number
  explanation: string
}

interface CheckpointCardProps {
  sectionContent: string
  lessonTitle: string
  onUnlock: () => void
}

export function CheckpointCard({ sectionContent, lessonTitle, onUnlock }: CheckpointCardProps) {
  const [question, setQuestion] = useState<CheckpointQuestion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const didFetch = useRef(false)
  const workerUrl = useWorkerUrl()

  useEffect(() => {
    if (didFetch.current) return
    didFetch.current = true
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    void generateQuestion()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function generateQuestion() {
    if (!workerUrl) {
      setError('No Worker URL — set it in Settings to enable checkpoints.')
      setLoading(false)
      return
    }
    try {
      const prompt = `You are generating a multiple-choice comprehension check for a student who just read a lesson section.

Lesson: "${lessonTitle}"
Section:
${sectionContent.slice(0, 2000)}

Return ONLY valid JSON — no markdown, no extra text:
{
  "question": "A clear, conceptual question about the section (not trivial recall)",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correct": 0,
  "explanation": "One sentence explaining why the correct answer is right."
}

The "correct" field is the 0-based index of the correct option.`

      const res = await fetch(workerUrl.replace(/\/$/, ''), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 512,
          messages: [{ role: 'user', content: prompt }],
        }),
      })

      if (!res.ok) throw new Error(`Worker ${res.status}`)

      const data = await res.json() as { content?: Array<{ type: string; text?: string }> }
      const text = data.content?.find(b => b.type === 'text')?.text ?? ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Malformed response')

      setQuestion(JSON.parse(jsonMatch[0]) as CheckpointQuestion)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate question')
    } finally {
      setLoading(false)
    }
  }

  const isCorrect = revealed && selected === question?.correct

  return (
    <div
      ref={cardRef}
      className="my-8 p-6 rounded-2xl border border-spark-500/25 bg-spark-500/[0.04] animate-fade-up"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-spark-400 font-mono text-[10px] uppercase tracking-widest font-medium">
          ⚡ Checkpoint
        </span>
        <div className="flex-1 h-px bg-spark-500/20" />
      </div>

      {loading && (
        <div className="flex items-center gap-2.5 py-2">
          <Loader2 size={14} className="animate-spin text-spark-400 shrink-0" />
          <span className="text-sm text-dim">Generating question…</span>
        </div>
      )}

      {!loading && (error || !question) && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-ghost">{error ?? 'Could not load question'}</span>
          <button
            onClick={onUnlock}
            className="text-xs text-spark-400 hover:text-spark-300 ml-4 min-h-[44px] px-2 transition-colors"
          >
            Continue →
          </button>
        </div>
      )}

      {!loading && question && (
        <>
          <p className="text-ink text-sm font-medium leading-relaxed mb-4">{question.question}</p>

          <div className="space-y-2 mb-4">
            {question.options.map((opt, idx) => {
              const isSelected = selected === idx
              const isCorrectOpt = idx === question.correct

              let cls = 'border-border text-dim hover:border-spark-500/40 hover:text-ink cursor-pointer'
              if (isSelected && !revealed) cls = 'border-spark-500 text-ink bg-spark-500/10'
              if (revealed && isCorrectOpt) cls = 'border-ok text-ok bg-ok/10 cursor-default'
              if (revealed && isSelected && !isCorrectOpt) cls = 'border-fail text-fail bg-fail/10 cursor-default'
              if (revealed && !isSelected && !isCorrectOpt) cls = 'border-border text-ghost cursor-default'

              return (
                <button
                  key={idx}
                  onClick={() => !revealed && setSelected(idx)}
                  disabled={revealed}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-xl text-sm border transition-all min-h-[44px]',
                    cls,
                  )}
                >
                  {revealed && isCorrectOpt && <CheckCircle2 size={13} className="inline mr-2 mb-0.5" />}
                  {revealed && isSelected && !isCorrectOpt && <XCircle size={13} className="inline mr-2 mb-0.5" />}
                  {opt}
                </button>
              )
            })}
          </div>

          {revealed ? (
            <div className="space-y-3">
              <div className={cn(
                'text-xs px-3 py-2.5 rounded-lg leading-relaxed',
                isCorrect
                  ? 'bg-ok/10 text-ok border border-ok/20'
                  : 'bg-warn/10 text-warn border border-warn/20',
              )}>
                {isCorrect ? '✓ Correct. ' : '✗ Not quite. '}{question.explanation}
              </div>
              <button onClick={onUnlock} className="btn-primary w-full min-h-[44px] text-sm flex items-center justify-center gap-1.5">
                Continue reading <ChevronDown size={14} />
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setRevealed(true)}
                disabled={selected === null}
                className="btn-primary flex-1 min-h-[44px] text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Check Answer
              </button>
              <button onClick={onUnlock} className="btn-ghost px-4 min-h-[44px] text-sm">
                Skip
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
