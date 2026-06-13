import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { cn } from '@/utils/cn'
import type { Lesson } from '@/types'

interface Section {
  heading: string
  estimatedMinutes: number
}

function parseSections(content: string, totalMinutes: number): Section[] {
  const headingRegex = /^## (.+)$/m
  const rawSections = content.split(/(?=\n## )/).filter(s => s.trim().length > 0)

  // Count total words to distribute time proportionally
  const wordCounts = rawSections.map(s => s.split(/\s+/).length)
  const totalWords = wordCounts.reduce((a, b) => a + b, 0)

  return rawSections.map((section, i) => {
    const match = section.match(headingRegex)
    const heading = match ? match[1] : 'Introduction'
    const mins = Math.max(1, Math.round((wordCounts[i] / totalWords) * totalMinutes))
    return { heading, estimatedMinutes: mins }
  })
}

interface LessonBreakdownProps {
  lesson: Lesson
}

export function LessonBreakdown({ lesson }: LessonBreakdownProps) {
  const [open, setOpen] = useState(true)
  const sections = parseSections(lesson.content, lesson.duration)
  const objectives = lesson.keyTerms.slice(0, 5).map(t => typeof t === 'string' ? t : t.term)

  return (
    <div className="mb-8 rounded-2xl border border-border bg-raised overflow-hidden">
      {/* Header row — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 min-h-[52px] hover:bg-border/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-spark-400 shrink-0" />
          <span className="font-heading text-sm font-semibold text-ink">Lesson Breakdown</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-ghost">
            <Clock size={12} />
            <span>{lesson.duration} min</span>
          </div>
          {open
            ? <ChevronUp size={14} className="text-ghost" />
            : <ChevronDown size={14} className="text-ghost" />
          }
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 animate-fade-in border-t border-border/60">

          {/* What you'll learn */}
          {objectives.length > 0 && (
            <div className="pt-4">
              <p className="font-heading text-[10px] text-ghost uppercase tracking-widest mb-2.5">
                You'll understand
              </p>
              <div className="flex flex-wrap gap-1.5">
                {objectives.map(term => (
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

          {/* Section outline */}
          <div>
            <p className="font-heading text-[10px] text-ghost uppercase tracking-widest mb-2.5">
              Sections
            </p>
            <div className="space-y-1">
              {sections.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-border/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={cn(
                      'font-mono text-[10px] shrink-0 w-4 text-center',
                      i === 0 ? 'text-ghost' : 'text-spark-400',
                    )}>
                      {i === 0 ? '·' : `${i}`}
                    </span>
                    <span className="text-sm text-dim truncate">{s.heading}</span>
                  </div>
                  <span className="font-mono text-[10px] text-ghost shrink-0">{s.estimatedMinutes}m</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
