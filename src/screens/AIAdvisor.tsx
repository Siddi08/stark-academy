import { useState, useRef, useEffect, useMemo } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Sparkles, Send, Loader2, RotateCcw } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useClaude } from '@/hooks/useClaude'
import { useWorkerUrl, useProgress } from '@/store/useAppStore'
import { allModules } from '@/data/curriculum'
import { ARC_META } from '@/types'
import type { ChatMessage } from '@/types'

// ─── System prompt ────────────────────────────────────────────────────────────

function buildSystemPrompt(completedLessons: string[]): string {
  const curriculumSummary = Object.entries(ARC_META)
    .map(([arcNum, meta]) => {
      const mods = allModules.filter(m => m.arc === Number(arcNum))
      const modLines = mods
        .map(m => `  - Module ${m.number}: ${m.title} — ${m.description}`)
        .join('\n')
      return `Arc ${arcNum}: ${meta.title} (${meta.subtitle})\n${modLines}`
    })
    .join('\n\n')

  const completedCount = completedLessons.length
  const totalLessons = allModules.reduce((n, m) => n + m.lessons.length, 0)

  return `You are a career advisor for Stark Academy, a hands-on AI engineering curriculum. \
You help students translate their learning into real career outcomes.

## About the student
The student is Anthony — 24, RAAF (Royal Australian Air Force) background, studying maritime archaeology. \
They are building AI/software engineering skills through this curriculum to open up new career paths.
They have completed ${completedCount} of ${totalLessons} lessons so far.

## Stark Academy curriculum (26 modules across 5 arcs)

${curriculumSummary}

## Your role
- Answer career questions concisely and practically: job roles, required skills, resume/portfolio advice, \
interview prep, salary expectations (AU/global), industry trends, and how the curriculum maps to real jobs.
- When relevant, connect your advice to specific modules or arcs the student is studying or should prioritise.
- You can discuss: AI/ML engineering, data science, software engineering, defence tech, maritime tech, \
autonomous systems, remote sensing, and adjacent fields.
- Be direct and specific — no filler. If you don't know something precisely, say so.
- Keep responses focused: 2–4 short paragraphs max unless a detailed breakdown is genuinely needed.`
}

// ─── Suggested starters ───────────────────────────────────────────────────────

const STARTERS = [
  'What AI/ML roles should I target with this curriculum?',
  'How do I build a portfolio that gets noticed?',
  'What skills gap should I close first for a junior ML role?',
  'How does my RAAF background help in AI careers?',
  'What arc should I focus on for defence-tech jobs?',
  'How does maritime archaeology translate into AI roles?',
]

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AIAdvisorScreen() {
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const workerUrl = useWorkerUrl()
  const progress = useProgress()

  const systemPrompt = useMemo(
    () => buildSystemPrompt(progress.completedLessons),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [progress.completedLessons.length],
  )

  const { send, streaming, error, reset } = useClaude({
    system: systemPrompt,
    maxTokens: 1024,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history.length, streaming])

  async function handleSend(text = draft.trim()) {
    if (!text || streaming) return

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }
    setHistory(prev => [...prev, userMsg])
    setDraft('')
    reset()

    const reply = await send(text, history)

    if (reply) {
      setHistory(prev => [
        ...prev,
        { role: 'assistant', content: reply, timestamp: new Date().toISOString() },
      ])
      reset()
    }
  }

  function handleClear() {
    setHistory([])
    reset()
  }

  const showWelcome = history.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-spark-500/20 flex items-center justify-center">
            <Sparkles size={14} className="text-spark-400" />
          </div>
          <div>
            <h1 className="font-heading text-sm font-bold text-ink leading-tight">Career Advisor</h1>
            <p className="text-[10px] text-ghost leading-tight">AI-powered, curriculum-aware</p>
          </div>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-ghost hover:text-dim min-h-[44px] px-2 transition-colors"
          >
            <RotateCcw size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {!workerUrl && (
          <div className="px-3 py-2.5 rounded-xl bg-fail/10 border border-fail/20 text-xs text-fail leading-relaxed">
            No Worker URL set. Go to <strong>Settings → AI Tutor</strong> and paste your Cloudflare Worker URL.
          </div>
        )}

        {showWelcome && (
          <div className="animate-fade-up">
            <div className="card-glow p-4 mb-5">
              <p className="font-heading text-xs text-ghost uppercase tracking-widest mb-1">Career Advisor</p>
              <p className="text-sm text-dim leading-relaxed">
                Ask me anything about AI careers, the job market, your portfolio, or how this curriculum connects to real roles.
                I know your full Stark Academy curriculum and your background.
              </p>
            </div>

            <p className="text-[10px] text-ghost uppercase tracking-widest mb-3 font-heading">Suggested questions</p>
            <div className="space-y-2">
              {STARTERS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-surface hover:bg-raised border border-border hover:border-spark-500/30 text-xs text-dim hover:text-ink transition-all min-h-[44px]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {history.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[90%] animate-fade-up',
              msg.role === 'user' ? 'ml-auto' : 'mr-auto',
            )}
          >
            <div
              className={cn(
                'px-3 py-2.5 rounded-2xl text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-spark-500/20 text-ink rounded-tr-sm'
                  : 'bg-raised text-dim rounded-tl-sm',
              )}
            >
              {msg.role === 'assistant' ? (
                <div className="prose-iron text-sm [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:mb-2 [&_pre]:my-2">
                  <Markdown remarkPlugins={[remarkGfm]}>{msg.content}</Markdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="mr-auto max-w-[90%]">
            <div className="px-3 py-2.5 rounded-2xl rounded-tl-sm bg-raised text-dim text-sm">
              <span className="inline-flex gap-1 items-center text-ghost text-xs">
                <Loader2 size={11} className="animate-spin" />
                Thinking…
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="text-xs text-fail px-3 py-2 bg-fail/10 rounded-xl border border-fail/20">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask a career question…"
            className="input flex-1 text-sm py-2"
            disabled={streaming}
          />
          <button
            onClick={() => handleSend()}
            disabled={!draft.trim() || streaming}
            className="btn-primary px-3 shrink-0 min-h-[44px]"
          >
            {streaming
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} />
            }
          </button>
        </div>
      </div>
    </div>
  )
}
