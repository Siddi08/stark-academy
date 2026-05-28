import { useState, useEffect, useRef } from 'react'
import { Loader2, CheckCircle2, XCircle, ChevronDown, Send } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useWorkerUrl } from '@/store/useAppStore'

interface CheckpointData {
  question: string
  idealAnswer: string
}

interface GradeResult {
  pass: boolean
  feedback: string
}

interface CheckpointCardProps {
  sectionContent: string
  lessonTitle: string
  onUnlock: () => void
}

export function CheckpointCard({ sectionContent, lessonTitle, onUnlock }: CheckpointCardProps) {
  const [checkpoint, setCheckpoint] = useState<CheckpointData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answer, setAnswer] = useState('')
  const [grading, setGrading] = useState(false)
  const [grade, setGrade] = useState<GradeResult | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const didFetch = useRef(false)
  const workerUrl = useWorkerUrl()

  useEffect(() => {
    if (didFetch.current) return
    didFetch.current = true
    cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    void generateQuestion()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function callWorker(prompt: string, maxTokens: number) {
    if (!workerUrl) throw new Error('No Worker URL')
    const res = await fetch(workerUrl.replace(/\/$/, ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) throw new Error(`Worker ${res.status}`)
    const data = await res.json() as { content?: Array<{ type: string; text?: string }> }
    return data.content?.find(b => b.type === 'text')?.text ?? ''
  }

  async function generateQuestion() {
    if (!workerUrl) {
      setError('No Worker URL — set it in Settings to enable checkpoints.')
      setLoading(false)
      return
    }
    try {
      const text = await callWorker(
        `Generate a short-answer comprehension question for a student who just read this lesson section.

Lesson: "${lessonTitle}"
Section:
${sectionContent.slice(0, 2000)}

Return ONLY valid JSON — no markdown, no extra text:
{
  "question": "A clear conceptual question that requires understanding, not trivial recall. 1–2 sentences.",
  "idealAnswer": "A concise ideal answer covering the key concepts. 1–3 sentences."
}`,
        256,
      )

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Malformed response')
      setCheckpoint(JSON.parse(jsonMatch[0]) as CheckpointData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate question')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!answer.trim() || !checkpoint || grading) return
    setGrading(true)
    try {
      const text = await callWorker(
        `You are grading a student's short answer.

Question: ${checkpoint.question}
Ideal answer: ${checkpoint.idealAnswer}
Student's answer: ${answer.trim()}

Grade the student's answer. Be generous — reward correct concepts even if imperfectly worded.
Return ONLY valid JSON:
{
  "pass": true or false,
  "feedback": "One or two sentences of specific feedback. If pass, affirm what they got right. If fail, explain what key concept was missing or wrong."
}`,
        200,
      )
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('Malformed grading response')
      setGrade(JSON.parse(jsonMatch[0]) as GradeResult)
    } catch (err) {
      setGrade({ pass: true, feedback: 'Could not grade — continuing.' })
    } finally {
      setGrading(false)
    }
  }

  function handleRetry() {
    setAnswer('')
    setGrade(null)
    setTimeout(() => textareaRef.current?.focus(), 50)
  }

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

      {!loading && (error || !checkpoint) && (
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

      {!loading && checkpoint && (
        <>
          <p className="text-ink text-sm font-medium leading-relaxed mb-4">{checkpoint.question}</p>

          {/* Answer area */}
          {!grade && (
            <>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void handleSubmit()
                }}
                disabled={grading}
                placeholder="Type your answer… (⌘↵ to submit)"
                rows={3}
                className="w-full bg-void border border-border rounded-xl px-4 py-3 text-sm text-ink placeholder:text-ghost resize-none focus:outline-none focus:border-spark-500/60 transition-colors mb-3 disabled:opacity-50"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => void handleSubmit()}
                  disabled={!answer.trim() || grading}
                  className="btn-primary flex-1 min-h-[44px] text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {grading
                    ? <><Loader2 size={13} className="animate-spin" /> Grading…</>
                    : <><Send size={13} /> Submit</>
                  }
                </button>
                <button onClick={onUnlock} className="btn-ghost px-4 min-h-[44px] text-sm">
                  Skip
                </button>
              </div>
            </>
          )}

          {/* Grade result */}
          {grade && (
            <div className="space-y-3">
              <div className={cn(
                'flex items-start gap-2.5 text-sm px-4 py-3 rounded-xl border leading-relaxed',
                grade.pass
                  ? 'bg-ok/10 text-ok border-ok/20'
                  : 'bg-warn/10 text-warn border-warn/20',
              )}>
                {grade.pass
                  ? <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
                  : <XCircle size={15} className="shrink-0 mt-0.5" />
                }
                <span>{grade.feedback}</span>
              </div>

              {grade.pass ? (
                <button onClick={onUnlock} className="btn-primary w-full min-h-[44px] text-sm flex items-center justify-center gap-1.5">
                  Continue reading <ChevronDown size={14} />
                </button>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleRetry} className="btn-primary flex-1 min-h-[44px] text-sm">
                    Try again
                  </button>
                  <button onClick={onUnlock} className="btn-ghost px-4 min-h-[44px] text-sm">
                    Continue anyway
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
