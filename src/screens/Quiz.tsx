import { useParams, Link, useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { allModules } from '@/data/curriculum'
import { QuizEngine } from '@/components/quiz/QuizEngine'
import type { Quiz } from '@/types'

export default function QuizScreen() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Find quiz + its module
  let found: { quiz: Quiz; module: typeof allModules[0] } | null = null
  for (const m of allModules) {
    const inQuizzes = m.quizzes.find(q => q.id === id)
    if (inQuizzes) { found = { quiz: inQuizzes, module: m }; break }
    if (m.finalExam && m.finalExam.id === id) { found = { quiz: m.finalExam, module: m }; break }
  }

  if (!found) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-dim">Quiz not found.</p>
        <Link to="/curriculum" className="btn-ghost mt-4 inline-flex">← Curriculum</Link>
      </div>
    )
  }

  const { quiz, module } = found

  function handleComplete() {
    // XP is recorded in QuizEngine via recordQuizAttempt.
    // Navigation is handled by the "Continue →" button in the results banner.
  }

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto animate-fade-up">
      {/* Back */}
      <Link
        to={`/module/${module.id}`}
        className="btn-ghost inline-flex gap-2 -ml-3 mb-5"
      >
        <ChevronLeft size={16} /> {module.title}
      </Link>

      <QuizEngine
        quiz={quiz}
        moduleTitle={module.title}
        onComplete={handleComplete}
        onBack={() => navigate(`/module/${module.id}`)}
      />
    </div>
  )
}
