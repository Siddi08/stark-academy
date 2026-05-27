import { useState } from 'react'
import { XCircle, Trophy, Loader2, AlertTriangle } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAppStore } from '@/store/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { gradeQuiz } from '@/api/anthropic'
import type { Quiz, QuizQuestion, ClaudeGradingResult } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

// ─── QuestionItem ─────────────────────────────────────────────────────────────

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
      <div className="flex items-start gap-3">
        <span className="font-mono text-xs text-ghost shrink-0 mt-0.5">{question.xpValue} XP</span>
        <p className="font-body text-sm text-ink leading-relaxed">{question.question}</p>
      </div>

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

      {feedback && (
        <div className={cn(
          'mt-3 px-4 py-3 rounded-xl border text-xs leading-relaxed',
          feedback.startsWith('✓')
            ? 'bg-ok/5 border-ok/20 text-ok'
            : feedback.startsWith('✗')
            ? 'bg-fail/5 border-fail/20 text-fail'
            : 'bg-surface border-border text-dim',
        )}>
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
        : <XCircle size={40} className="text-fail mx-auto mb-3" />}
      <h2 className="font-heading text-2xl font-bold text-ink mb-1">{result.totalScore}%</h2>
      <p className={cn('font-heading text-sm mb-3', passed ? 'text-ok' : 'text-fail')}>
        {passed ? `Passed · Pass mark: ${quiz.passMark}%` : `Failed · Need ${quiz.passMark}% to pass`}
      </p>
      {result.xpAwarded > 0 && (
        <p className="text-xs text-dim mb-4">
          <span className="text-spark-300 font-mono">+{result.xpAwarded} XP</span> awarded
        </p>
      )}
      <div className="flex gap-3 justify-center">
        {!passed && (
          <button onClick={onRetry} className="btn-secondary">Try Again</button>
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

type Phase = 'answering' | 'grading' | 'recorded'

export function QuizEngine({ quiz, moduleTitle, onComplete, onBack }: QuizEngineProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<Phase>('answering')
  const [result, setResult] = useState<ClaudeGradingResult | null>(null)
  const [gradingError, setGradingError] = useState<string | null>(null)

  const { recordQuizAttempt, progress, workerUrl, apiKey } = useAppStore(useShallow(s => ({
    recordQuizAttempt: s.recordQuizAttempt,
    progress: s.progress,
    workerUrl: s.workerUrl,
    apiKey: s.apiKey,
  })))

  const answeredCount = quiz.questions.filter(q => answers[q.id]?.trim()).length
  const allAnswered = answeredCount === quiz.questions.length

  function setAnswer(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  async function handleSubmit() {
    if (!allAnswered) return
    setPhase('grading')
    setGradingError(null)
    try {
      const gradeResult = await gradeQuiz({
        workerUrl: workerUrl || undefined,
        apiKey: apiKey || undefined,
        moduleTitle,
        questions: quiz.questions,
        answers,
        passMark: quiz.passMark,
      })
      const prevAttempts = progress.quizAttempts.filter(a => a.quizId === quiz.id).length
      recordQuizAttempt({
        quizId: quiz.id,
        score: gradeResult.totalScore,
        passed: gradeResult.passed,
        attemptNumber: prevAttempts + 1,
        timestamp: new Date().toISOString(),
        overallFeedback: gradeResult.overallFeedback,
        questionFeedback: gradeResult.questionFeedback,
        xpAwarded: gradeResult.xpAwarded,
      })
      setResult(gradeResult)
      setPhase('recorded')
      onComplete(gradeResult)
    } catch (err) {
      setGradingError(err instanceof Error ? err.message : 'Grading failed')
      setPhase('answering')
    }
  }

  function handleRetry() {
    setAnswers({})
    setPhase('answering')
    setResult(null)
    setGradingError(null)
  }

  const locked = phase !== 'answering'

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="font-mono text-xs text-ghost mb-1">
          {quiz.type === 'arc_final' ? '★ ARC FINAL EXAM' : quiz.type === 'module_final' ? 'MODULE FINAL' : 'LESSON QUIZ'}
        </p>
        <h1 className="font-heading text-xl font-bold text-ink">{quiz.title}</h1>
        <p className="text-xs text-dim mt-1">
          {quiz.questions.length} questions · Pass mark: {quiz.passMark}%
        </p>
      </div>

      {/* Results banner (phase: recorded) */}
      {result && (
        <ResultsBanner result={result} quiz={quiz} onRetry={handleRetry} onContinue={onBack} />
      )}

      {/* Grading overlay (phase: grading) */}
      {phase === 'grading' && (
        <div className="card p-8 text-center mb-6 space-y-3">
          <Loader2 size={32} className="animate-spin text-spark-400 mx-auto" />
          <p className="font-heading text-sm font-bold text-ink">Grading with Claude…</p>
          <p className="text-xs text-dim">Analysing your answers and preparing feedback</p>
        </div>
      )}

      {/* Error banner */}
      {gradingError && (
        <div className="card p-4 mb-6 border-fail/30 bg-fail/5 flex items-start gap-3">
          <AlertTriangle size={16} className="text-fail shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-fail">Grading failed</p>
            <p className="text-xs text-dim">{gradingError}</p>
          </div>
        </div>
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
              locked={locked}
            />
          </div>
        ))}
      </div>

      {/* Submit (phase: answering) */}
      {phase === 'answering' && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-ghost">
            <span>{answeredCount}/{quiz.questions.length} answered</span>
            {!allAnswered && <span>Answer all questions to submit</span>}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="btn-primary w-full min-h-[52px] text-base"
          >
            Submit Quiz
          </button>
        </div>
      )}
    </div>
  )
}
