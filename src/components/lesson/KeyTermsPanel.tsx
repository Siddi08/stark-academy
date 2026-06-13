import { useState } from 'react'
import { Loader2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { cn } from '@/utils/cn'
import { explainConcept } from '@/api/anthropic'
import type { Lesson } from '@/types'

interface KeyTermCardProps {
  term: string
  definition?: string
  lessonTitle: string
  lessonContent: string
  workerUrl: string
}

function KeyTermCard({ term, definition, lessonTitle, lessonContent, workerUrl }: KeyTermCardProps) {
  const [open, setOpen] = useState(false)
  const [explanation, setExplanation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleOpen() {
    const next = !open
    setOpen(next)
    if (!next || explanation || !workerUrl) return
    setLoading(true)
    setError(null)
    try {
      const text = await explainConcept({ workerUrl, lessonTitle, concept: term, lessonContent })
      setExplanation(text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load explanation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      'rounded-xl border transition-all duration-200',
      open ? 'border-spark-500/40 bg-spark-500/5' : 'border-border bg-raised hover:border-rim',
    )}>
      <button
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-3 min-h-[44px] text-left gap-3"
      >
        <span className="font-mono text-sm text-spark-300 font-medium">{term}</span>
        {open
          ? <ChevronUp size={14} className="text-ghost shrink-0" />
          : <ChevronDown size={14} className="text-ghost shrink-0" />
        }
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 animate-fade-in">
          {/* Static definition from curriculum data */}
          {definition && (
            <p className="text-sm text-dim leading-relaxed border-l-2 border-spark-500/40 pl-3">
              {definition}
            </p>
          )}

          {/* AI deeper explanation */}
          {workerUrl && (
            <div>
              {loading && (
                <div className="flex items-center gap-2 text-xs text-ghost py-1">
                  <Loader2 size={12} className="animate-spin text-spark-400" />
                  Generating deeper explanation…
                </div>
              )}
              {error && (
                <p className="text-xs text-fail">{error}</p>
              )}
              {explanation && (
                <p className="text-sm text-dim leading-relaxed">{explanation}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── KeyTermsPanel ────────────────────────────────────────────────────────────

interface KeyTermsPanelProps {
  lesson: Lesson
  workerUrl: string
}

export function KeyTermsPanel({ lesson, workerUrl }: KeyTermsPanelProps) {
  if (lesson.keyTerms.length === 0) return null

  const lessonContent = lesson.content.slice(0, 2000)

  return (
    <div className="mt-10 card-raised rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen size={14} className="text-spark-400" />
        <h3 className="font-heading text-xs text-spark-400 uppercase tracking-widest">
          Key Terms
        </h3>
        {workerUrl && (
          <span className="text-[10px] text-ghost border border-border rounded px-1.5 py-0.5 font-mono ml-auto">
            click to explore
          </span>
        )}
      </div>

      <div className="space-y-2">
        {lesson.keyTerms.map(t => {
          const term   = typeof t === 'string' ? t : t.term
          const def    = typeof t === 'string' ? undefined : t.definition
          return (
            <KeyTermCard
              key={term}
              term={term}
              definition={def}
              lessonTitle={lesson.title}
              lessonContent={lessonContent}
              workerUrl={workerUrl}
            />
          )
        })}
      </div>
    </div>
  )
}
