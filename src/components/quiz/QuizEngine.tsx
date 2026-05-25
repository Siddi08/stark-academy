import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, Trophy, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { gradeQuiz } from '@/api/anthropic'
import { useAppStore } from '@/store/useAppStore'
import type { Quiz, QuizQuestion, ClaudeGradingResult } from '@/types'

// ─── Individual question ──────────────────────────────────────────────────────

interface QuestionProps {
  question: QuizQuestion
  answer: string
  onChange: (value: string) => void
  feedback?: string
  locked: boolean
}

function QuestionItem({ question, answer, onChange, feedback, locked }: QuestionProps) {
  return (
    <div className="card p-5 space-y-3">
      {/* Question header */}
      <div className="flex items-start gap-3">
        <span className="font-mono text-xs text-ghost shrink-0 mt-0.5">
          {question.xpValue} XP
        </span>
        <p className="font-body text-sm text-ink leading-relaxed">{question.question}</p>
      </div>

      {/* Multiple choice */}
      {question.type === 'multiple_choice' && question.options && (
        <div className="space-y-2 mt-2">
          {question.options.map(opt => (
            <label
              key={opt}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer',
                'transition-all duration-150 min-h-[44px]',
                locked && 'cursor-default',
                answer === opt
                  ? 'border-spark-500/50 bg-spark-500/10 text-ink'
                  : 'border-border bg-raised text-dim hover:border-rim hover:text-ink',
              )}
            >
              <input
                type="radio"
                name={question.id}
                value={opt}
                checked={answer === opt}
                onChange={() => !locked && onChange(opt)}
                disabled={locked}
                className="sr-only"
              />
              <div className={cn(
                'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                answer === opt ? 'border-spark-400' : 'border-ghost',
              )}>
                {answer === opt && <div className="w-2 h-2 rounded-full bg-spark-400" />}
              </div>
              <span className="font-body text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Short answer */}
      {question.type === 'short_answer' && (
        <textarea
          value={answer}
          onChange={e => onChange(e.target.value)}
          disabled={locked}
          placeholder="Write your answer here…"
          rows={4}
          className="input resize-none font-body text-sm"
        />
      )}

      {/* Feedback (after grading) */}
      {feedback && (
        <div className="mt-3 px-4 py-3 rounded-xl bg-surface border border-border text-xs text-dim leading-relaxed">
          <span className="font-heading text-[10px] uppercase tracking-wide text-spark-400 block mb-1">
            Feedback
          </span>
          {feedback}
        </div>
      )}
    </div>
  )
}

// ─── Results banner ───────────────────────────────────────────────────────────

interface ResultsBannerProps {
  result: ClaudeGradingResult
  quiz: Quiz
  onRetry: () => void
  onContinue: () => void
}

function ResultsBanner({ result, quiz, onRetry, onContinue }: ResultsBannerProps) {
  const passed = result.passed
  return (
    <div className={cn(
      'rounded-2xl border p-6 text-center mb-6',
      passed ? 'border-ok/30 bg-ok/5' : 'border-fail/30 bg-fail/5',
    )}>
      {passed
        ? <Trophy size={40} className="text-ok mx-auto mb-3" />
        : <XCircle size={40} className="text-fail mx-auto mb-3" />
      }
      <h2 className="font-heading text-2xl font-bold text-ink mb-1">
        {result.totalScore}%
      </h2>
      <p className={cn(
        'font-heading text-sm mb-3',
        passed ? 'text-ok' : 'text-fail',
      )}>
        {passed ? `Passed · Pass mark: ${quiz.passMark}%` : `Failed · Need ${quiz.passMark}% to pass`}
      </p>
      {result.xpAwarded > 0 && (
        <p className="text-xs text-dim mb-4">
          <span className="text-spark-300 font-mono">+{result.xpAwarded} XP</span> awarded
        </p>
      )}
      <p className="text-sm text-dim leading-relaxed max-w-lg mx-auto mb-6">
        {result.overallFeedback}
      </p>
      <div className="flex gap-3 justify-center">
        {!passed && (
          <button onClick={onRetry} className="btn-secondary">
            Try Again
          </button>
        )}
        <button onClick={onContinue} className="btn-primary">
          {passed ? 'Continue →' : 'Back to Module'}
        </button>
      </div>
    </div>
  )
}

// ─── QuizEngine ───────────────────────────────────────────────────────────────

interface QuizEngineProps {
  quiz: Quiz
  moduleTitle: string
  onComplete: (result: ClaudeGradingResult) => void
  onBack: () => void
}

export function QuizEngine({ quiz, moduleTitle, onComplete, onBack }: QuizEngineProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<ClaudeGradingResult | null>(null)
  const [gradingError, setGradingError] = useState<string | null>(null)

  const { apiKey, recordQuizAttempt, progress } = useAppStore(s => ({
    apiKey: s.apiKey,
    recordQuizAttempt: s.recordQuizAttempt,
    progress: s.progress,
  }))

  const answeredCount = quiz.questions.filter(q => answers[q.id]?.trim()).length
  const allAnswered = answeredCount === quiz.questions.length

  function setAnswer(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit() {
    if (!allAnswered) return
    setGrading(true)
    setGradingError(null)

    try {
      let gradeResult: ClaudeGradingResult

      if (apiKey) {
        // Full AI grading
        gradeResult = await gradeQuiz({
          apiKey,
          moduleTitle,
          questions: quiz.questions,
          answers,
          passMark: quiz.passMark,
        })
      } else {
        // Local fallback: grade MC only, SA gets 0
        let xpAwarded = 0
        let correct = 0
        const questionFeedback: Record<string, string> = {}

        for (const q of quiz.questions) {
          if (q.type === 'multiple_choice' && q.correctAnswer) {
            const isCorrect = answers[q.id] === q.correctAnswer
            if (isCorrect) { xpAwarded += q.xpValue; correct++ }
            questionFeedback[q.id] = isCorrect
              ? 'Correct!'
              : `Incorrect. ${q.gradingRubric}`
          } else {
            questionFeedback[q.id] = 'Short-answer questions require an API key for grading. Set your key in Settings.'
          }
        }

        const mcQuestions = quiz.questions.filter(q => q.type === 'multiple_choice')
        const totalScore = mcQuestions.length > 0
          ? Math.round((correct / mcQuestions.length) * 100)
          : 0
        const passed = totalScore >= quiz.passMark

        gradeResult = {
          totalScore,
          passed,
          overallFeedback: passed
            ? 'Good work on the multiple-choice questions. Add your Anthropic API key in Settings to unlock full AI grading.'
            : 'Keep studying. Add your Anthropic API key in Settings to unlock AI grading for short-answer questions.',
          questionFeedback,
          xpAwarded: passed ? xpAwarded : Math.floor(xpAwarded / 2),
        }
      }

      // Find attempt number for this quiz
      const prevAttempts = progress.quizAttempts.filter(a => a.quizId === quiz.id).length

      recordQuizAttempt({
        quizId:          quiz.id,
        score:           gradeResult.totalScore,
        passed:          gradeResult.passed,
        attemptNumber:   prevAttempts + 1,
        timestamp:       new Date().toISOString(),
        overallFeedback: gradeResult.overallFeedback,
        questionFeedback: gradeResult.questionFeedback,
        xpAwarded:       gradeResult.xpAwarded,
      })

      setResult(gradeResult)
      onComplete(gradeResult)
    } catch (err) {
      setGradingError(
        err instanceof Error ? err.message : 'Grading failed. Check your API key and try again.'
      )
    } finally {
      setGrading(false)
    }
  }

  function handleRetry() {
    setAnswers({})
    setResult(null)
    setGradingError(null)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Quiz header */}
      <div className="mb-6">
        <p className="font-mono text-xs text-ghost mb-1">
          {quiz.type === 'arc_final'
            ? '★ ARC FINAL EXAM'
            : quiz.type === 'module_final'
            ? 'MODULE FINAL'
            : 'LESSON QUIZ'}
        </p>
        <h1 className="font-heading text-xl font-bold text-ink">{quiz.title}</h1>
        <p className="text-xs text-dim mt-1">
          {quiz.questions.length} questions · Pass mark: {quiz.passMark}%
          {!apiKey && (
            <span className="ml-2 text-warn">
              · Short-answer grading requires an API key
            </span>
          )}
        </p>
      </div>

      {/* Results banner */}
      {result && (
        <ResultsBanner
          result={result}
          quiz={quiz}
          onRetry={handleRetry}
          onContinue={onBack}
        />
      )}

      {/* Questions */}
      <div className="space-y-4">
        {quiz.questions.map((q, i) => (
          <div key={q.id}>
            <p className="font-heading text-xs text-ghost uppercase tracking-wide mb-2">
              Question {i + 1}
            </p>
            <QuestionItem
              question={q}
              answer={answers[q.id] ?? ''}
              onChange={v => setAnswer(q.id, v)}
              feedback={result?.questionFeedback[q.id]}
              locked={!!result || grading}
            />
          </div>
        ))}
      </div>

      {/* Error */}
      {gradingError && (
        <div className="mt-4 flex items-start gap-3 px-4 py-3 bg-fail/10 border border-fail/20 rounded-xl text-sm text-fail">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          {gradingError}
        </div>
      )}

      {/* Submit / progress */}
      {!result && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-ghost">
            <span>{answeredCount}/{quiz.questions.length} answered</span>
            {!allAnswered && <span>Answer all questions to submit</span>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || grading}
            className="btn-primary w-full min-h-[52px] text-base"
          >
            {grading ? (
              <><Loader2 size={16} className="animate-spin mr-2" /> Grading…</>
            ) : (
              'Submit Quiz'
            )}
          </button>
          {result && (
            <div className="flex items-center gap-2 text-xs text-ok">
              <CheckCircle size={14} />
              Submitted
            </div>
          )}
        </div>
      )}
    </div>
  )
}
