import { useState, useRef, useEffect } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { MessageCircle, X, Send, Loader2, ChevronRight } from 'lucide-react'
import 'highlight.js/styles/atom-one-dark.css'
import { cn } from '@/utils/cn'
import { useClaude } from '@/hooks/useClaude'
import { useWorkerUrl } from '@/store/useAppStore'
import type { Lesson, Module, ChatMessage } from '@/types'

// ─── AI Tutor panel ───────────────────────────────────────────────────────────

interface TutorPanelProps {
  lesson: Lesson
  module: Module
  onClose: () => void
}

function TutorPanel({ lesson, module, onClose }: TutorPanelProps) {
  const [history, setHistory] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const workerUrl = useWorkerUrl()

  const systemPrompt = `You are an AI tutor for Stark Academy.
The student is reading Lesson ${lesson.number}: "${lesson.title}" (Module ${module.number}: "${module.title}").

Lesson content:
${lesson.content.slice(0, 6000)}

Rules:
- Be precise and direct — no filler phrases
- Use code examples when they clarify better than words
- If the question goes beyond this lesson, answer it well but note which future module covers it
- When the student is confused, probe their mental model before correcting`

  const { send, output, streaming, error, reset } = useClaude({
    system: systemPrompt,
    maxTokens: 1024,
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [output, history.length])

  async function handleSend() {
    const text = draft.trim()
    if (!text || streaming) return

    const userMsg: ChatMessage = {
      role: 'user', content: text,
      timestamp: new Date().toISOString(),
    }
    setHistory(prev => [...prev, userMsg])
    setDraft('')
    reset()

    // send() returns the full accumulated text — never stale
    const reply = await send(text, history)

    // Only add to history if we got a reply — keeps the error visible if send() failed
    if (reply) {
      setHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          content: reply,
          timestamp: new Date().toISOString(),
        },
      ])
      reset()
    }
    // If reply is empty, leave the error message visible so the user can see it
  }

  // While waiting for response, show a typing placeholder
  const displayHistory = streaming
    ? [...history, { role: 'assistant' as const, content: '…', timestamp: '' }]
    : history

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-void border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-spark-400 text-sm">⚡</span>
          <span className="font-heading text-sm text-ink">AI Tutor</span>
        </div>
        <button
          onClick={onClose}
          className="text-ghost hover:text-dim min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-4">
        {!workerUrl && (
          <div className="mx-2 mt-2 px-3 py-2.5 rounded-xl bg-fail/10 border border-fail/20 text-xs text-fail leading-relaxed">
            No Worker URL set. Go to <strong>Settings → AI Tutor</strong> and paste your Cloudflare Worker URL.
          </div>
        )}

        {displayHistory.length === 0 && (
          <div className="text-center py-8">
            <p className="text-dim text-sm">Ask anything about this lesson.</p>
            <div className="mt-4 space-y-2">
              {['Explain this in simpler terms', 'Give me a real-world example', 'What should I know next?'].map(s => (
                <button
                  key={s}
                  onClick={() => setDraft(s)}
                  className="block w-full text-left text-xs text-ghost hover:text-dim px-3 py-2 rounded-lg hover:bg-raised transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {displayHistory.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'max-w-[90%]',
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
                  <Markdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </Markdown>
                  {streaming && i === displayHistory.length - 1 && (
                    <span className="inline-block w-1 h-3.5 bg-spark-400 ml-0.5 animate-pulse" />
                  )}
                </div>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}

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
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask about this lesson…"
            className="input flex-1 text-sm py-2"
            disabled={streaming}
          />
          <button
            onClick={handleSend}
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

// ─── LessonReader ─────────────────────────────────────────────────────────────

interface LessonReaderProps {
  lesson: Lesson
  module: Module
  isCompleted: boolean
  onComplete: () => void
  /** Called once when the bottom of the lesson content enters the viewport */
  onReachEnd?: () => void
  /** True when the sticky bottom nav bar is visible — moves the tutor button up */
  navVisible?: boolean
}

export function LessonReader({
  lesson, module, isCompleted, onComplete, onReachEnd, navVisible = false,
}: LessonReaderProps) {
  const [tutorOpen, setTutorOpen] = useState(false)
  const termStrings = lesson.keyTerms.map(t => typeof t === 'string' ? t : t.term)
  const endRef = useRef<HTMLDivElement>(null)

  // Keep a stable ref to the callback so the IntersectionObserver doesn't need
  // to be recreated every render.
  const onReachEndRef = useRef(onReachEnd)
  useEffect(() => { onReachEndRef.current = onReachEnd })

  // Watch the "Mark as Complete" button; fire onReachEnd once it enters viewport
  useEffect(() => {
    const el = endRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onReachEndRef.current?.()
          observer.disconnect()
        }
      },
      { threshold: 0.5 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [lesson.id])  // recreate when navigating to a new lesson

  return (
    <div className="relative flex">
      {/* ── Lesson content ── */}
      <div className={cn(
        'flex-1 min-w-0 transition-all duration-300',
        tutorOpen ? 'lg:mr-[360px]' : '',
      )}>
        <article className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-ghost">Lesson {lesson.number}</span>
              <span className="text-ghost">·</span>
              <span className="text-xs text-dim">{lesson.duration} min read</span>
            </div>
            <h1 className="font-heading text-2xl lg:text-3xl font-bold text-ink leading-tight">
              {lesson.title}
            </h1>
          </div>

          {/* Lesson content */}
          <div className="prose-iron">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {lesson.content}
            </Markdown>
          </div>

          {/* Key terms */}
          {termStrings.length > 0 && (
            <div className="mt-10 p-5 card-raised rounded-2xl">
              <h3 className="font-heading text-xs text-spark-400 uppercase tracking-widest mb-3">
                Key Terms
              </h3>
              <div className="flex flex-wrap gap-2">
                {termStrings.map(term => (
                  <span
                    key={term}
                    className="font-mono text-xs text-spark-300 bg-spark-500/10 border border-spark-500/20 px-2.5 py-1 rounded-lg"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Complete button — observed by IntersectionObserver */}
          <div ref={endRef} className="mt-10 pb-8">
            <button
              onClick={onComplete}
              disabled={isCompleted}
              className={cn(
                'w-full min-h-[52px] font-heading text-base flex items-center justify-center gap-2 rounded-2xl transition-all duration-200',
                isCompleted
                  ? 'bg-ok/10 border border-ok/30 text-ok cursor-default'
                  : 'btn-primary',
              )}
            >
              {isCompleted ? (
                <>✓ Lesson Complete — 10 XP earned</>
              ) : (
                <>Mark as Complete <ChevronRight size={18} /></>
              )}
            </button>
          </div>
        </article>
      </div>

      {/* ── Tutor panel (desktop: fixed right panel) ── */}
      <div className={cn(
        'hidden lg:flex flex-col fixed right-0 top-[57px] bottom-0 w-[360px]',
        'transition-transform duration-300 z-10',
        tutorOpen ? 'translate-x-0' : 'translate-x-full',
      )}>
        {tutorOpen && (
          <TutorPanel lesson={lesson} module={module} onClose={() => setTutorOpen(false)} />
        )}
      </div>

      {/* ── Mobile tutor sheet ── */}
      {tutorOpen && (
        <div className="lg:hidden fixed inset-0 z-30 flex flex-col">
          <div className="h-1/4 bg-void/80 backdrop-blur-sm" onClick={() => setTutorOpen(false)} />
          <div className="flex-1 flex flex-col min-h-0 bg-void border-t border-border">
            <TutorPanel lesson={lesson} module={module} onClose={() => setTutorOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Floating tutor button ── */}
      {/* Shifts up when the sticky bottom nav becomes visible to avoid overlap  */}
      {!tutorOpen && (
        <button
          onClick={() => setTutorOpen(true)}
          className={cn(
            'fixed right-4 z-20 transition-all duration-300',
            navVisible ? 'bottom-40 lg:bottom-24' : 'bottom-24 lg:bottom-8',
            'btn-primary rounded-full w-14 h-14 shadow-lg',
            'flex items-center justify-center',
            'shadow-[0_0_20px_-4px_rgba(84,86,245,0.7)]',
          )}
          title="Open AI Tutor"
        >
          <MessageCircle size={20} />
        </button>
      )}
    </div>
  )
}
