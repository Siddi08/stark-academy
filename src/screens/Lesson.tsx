import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { allModules } from '@/data/curriculum'
import { useAppStore } from '@/store/useAppStore'
import { LessonReader } from '@/components/lesson/LessonReader'

export default function LessonScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { completeLesson, progress } = useAppStore(s => ({
    completeLesson: s.completeLesson,
    progress: s.progress,
  }))

  // Find lesson + module
  let found: {
    lesson: typeof allModules[0]['lessons'][0]
    module: typeof allModules[0]
    lessonIndex: number
  } | null = null

  for (const m of allModules) {
    const idx = m.lessons.findIndex(l => l.id === id)
    if (idx !== -1) {
      found = { lesson: m.lessons[idx], module: m, lessonIndex: idx }
      break
    }
  }

  if (!found) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-dim">Lesson not found.</p>
        <Link to="/curriculum" className="btn-ghost mt-4 inline-flex">← Curriculum</Link>
      </div>
    )
  }

  const { lesson, module, lessonIndex } = found
  const isCompleted = progress.completedLessons.includes(lesson.id)

  // Adjacent navigation
  const prevLesson = lessonIndex > 0 ? module.lessons[lessonIndex - 1] : null
  const nextLesson = lessonIndex < module.lessons.length - 1 ? module.lessons[lessonIndex + 1] : null
  const lessonQuiz = module.quizzes.filter(q => q.type === 'lesson')[lessonIndex]

  function handleComplete() {
    if (!isCompleted) {
      completeLesson(lesson.id)
    }
  }

  function handleCompleteAndNext() {
    handleComplete()
    if (nextLesson) {
      navigate(`/lesson/${nextLesson.id}`)
    } else if (lessonQuiz) {
      navigate(`/quiz/${lessonQuiz.id}`)
    } else {
      navigate(`/module/${module.id}`)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Lesson top bar */}
      <div className="sticky top-0 z-10 bg-void/90 backdrop-blur-md border-b border-border">
        <div className="max-w-3xl mx-auto lg:max-w-none flex items-center gap-3 px-4 py-3">
          <Link
            to={`/module/${module.id}`}
            className="btn-ghost p-2 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
          >
            <ChevronLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] text-ghost">M{module.number} · {module.title}</p>
            <p className="font-heading text-sm text-ink truncate">{lesson.title}</p>
          </div>
          {/* Progress dots */}
          <div className="hidden sm:flex items-center gap-1">
            {module.lessons.map((l, i) => (
              <Link key={l.id} to={`/lesson/${l.id}`}>
                <div className={`w-2 h-2 rounded-full transition-colors ${
                  l.id === lesson.id
                    ? 'bg-spark-400'
                    : progress.completedLessons.includes(l.id)
                    ? 'bg-ok'
                    : 'bg-border'
                }`} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Full-height reader */}
      <div className="flex-1">
        <LessonReader
          lesson={lesson}
          module={module}
          isCompleted={isCompleted}
          onComplete={handleComplete}
        />
      </div>

      {/* Bottom navigation bar */}
      <div className="border-t border-border bg-void/90 backdrop-blur-md px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          {/* Previous */}
          {prevLesson ? (
            <Link
              to={`/lesson/${prevLesson.id}`}
              className="btn-ghost text-xs gap-1.5 min-h-[44px]"
            >
              <ChevronLeft size={14} />
              <span className="hidden sm:inline">{prevLesson.title}</span>
              <span className="sm:hidden">Prev</span>
            </Link>
          ) : (
            <div />
          )}

          {/* Quiz shortcut */}
          {isCompleted && lessonQuiz && (
            <Link to={`/quiz/${lessonQuiz.id}`} className="btn-secondary text-xs min-h-[44px]">
              Take Quiz →
            </Link>
          )}

          {/* Next / Complete */}
          {nextLesson ? (
            <button
              onClick={handleCompleteAndNext}
              className="btn-primary text-xs gap-1.5 min-h-[44px]"
            >
              <span className="hidden sm:inline">{nextLesson.title}</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => { handleComplete(); navigate(`/module/${module.id}`) }}
              className="btn-primary text-xs min-h-[44px]"
            >
              Back to Module →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
