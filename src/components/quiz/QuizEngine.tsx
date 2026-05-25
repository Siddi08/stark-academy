import { useState } from 'react'
import { CheckCircle, XCircle, Trophy, Copy, Download, FileText } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useAppStore } from '@/store/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import type { Quiz, QuizQuestion, ClaudeGradingResult } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildExportText(
  quiz: Quiz,
  moduleTitle: string,
  answers: Record<string, string>,
): string {
  const date = new Date().toLocaleDateString('en-AU', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const sep = '─'.repeat(52)
  const lines: string[] = [
    `=== STARK ACADEMY — QUIZ GRADING REQUEST ===`,
    ``,
    `Module:     ${moduleTitle}`,
    `Quiz:       ${quiz.title}`,
    `Date:       ${date}`,
    `Pass mark:  ${quiz.passMark}%`,
    ``,
    `Please grade my answers below. Respond with:`,
    `  • An overall score from 0–100 (weight by XP values shown)`,
    `  • Pass or Fail (pass mark is ${quiz.passMark}%)`,
    `  • One-line feedback per question`,
    ``,
    sep,
  ]

  quiz.questions.forEach((q, i) => {
    const typeLabel = q.type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'
    lines.push(``, `QUESTION ${i + 1} — ${typeLabel} [${q.xpValue} XP]`, ``)
    lines.push(q.question, ``)

    if (q.type === 'multiple_choice' && q.options) {
      q.options.forEach((opt, idx) => {
        lines.push(`  ${String.fromCharCode(65 + idx)}) ${opt}`)
      })
      lines.push(``)
      lines.push(`My answer:      ${answers[q.id] || '(no answer)'}`)
      if (q.correctAnswer) {
        lines.push(`Correct answer: ${q.correctAnswer}`)
      }
    } else {
      lines.push(`Grading rubric: ${q.gradingRubric}`, ``)
      lines.push(`My answer:`)
      lines.push(answers[q.id]?.trim() || '(no answer)')
    }

    lines.push(``, sep)
  })

  return lines.join('\n')
}

/** Grade only multiple-choice questions — instant, no API needed */
function gradeMC(quiz: Quiz, answers: Record<string, string>) {
  const mcQs = quiz.questions.filter(q => q.type === 'multiple_choice')
  if (mcQs.length === 0) return { score: 0, xp: 0, feedback: {} as Record<string, string> }

  let correct = 0
  let xp = 0
  const feedback: Record<string, string> = {}

  for (const q of mcQs) {
    const ok = !!q.correctAnswer && answers[q.id] === q.correctAnswer
    if (ok) { correct++; xp += q.xpValue }
    feedback[q.id] = ok
      ? '✓ Correct'
      : `✗ Incorrect — correct answer: ${q.correctAnswer ?? 'see rubric'}`
  }

  return {
    score: Math.round((correct / mcQs.length) * 100),
    xp,
    feedback,
  }
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

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

// ─── Export panel ─────────────────────────────────────────────────────────────

function ExportPanel({ text, filename }: { text: string; filename: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <div className="card p-5 space-y-4 border-spark-500/20">
      <div className="flex items-center gap-2">
        <FileText size={16} className="text-spark-400" />
        <h3 className="font-heading text-sm font-bold text-ink">Grade with AI</h3>
      </div>
      <p className="text-xs text-dim leading-relaxed">
        Copy or download your quiz answers, paste into{' '}
        <a href="https://claude.ai" target="_blank" rel="noreferrer" className="text-spark-300 underline">
          claude.ai
        </a>{' '}
        (or any AI chat), then enter the score you receive below.
      </p>
      <pre className="bg-raised border border-border rounded-xl p-4 text-xs text-ghost font-mono overflow-auto max-h-40 whitespace-pre-wrap leading-relaxed">
        {text.slice(0, 400)}{text.length > 400 ? '\n…' : ''}
      </pre>
      <div className="flex gap-2">
        <button onClick={handleCopy} className="btn-secondary flex-1 gap-2 min-h-[44px]">
          {copied
            ? <><CheckCircle size={14} className="text-ok" /> Copied!</>
            : <><Copy size={14} /> Copy to clipboard</>}
        </button>
        <button
          onClick={() => downloadText(text, filename)}
          className="btn-ghost gap-2 min-h-[44px]"
        >
          <Download size={14} /> .txt
        </button>
      </div>
    </div>
  )
}

// ─── Score entry ──────────────────────────────────────────────────────────────

function ScoreEntry({
  defaultScore,
  hasSA,
  onRecord,
}: {
  defaultScore: number
  hasSA: boolean
  onRecord: (score: number) => void
}) {
  const [scoreStr, setScoreStr] = useState(hasSA ? '' : String(defaultScore))
  const parsed = parseInt(scoreStr, 10)
  const valid = !isNaN(parsed) && parsed >= 0 && parsed <= 100

  return (
    <div className="card p-5 space-y-4">
      <h3 className="font-heading text-sm font-bold text-ink">
        {hasSA ? 'Enter your AI-graded score' : 'Your score'}
      </h3>
      {hasSA && (
        <p className="text-xs text-dim">
          After pasting your answers into an AI chat and receiving a grade, enter the overall score (0–100) here.
        </p>
      )}
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={0}
          max={100}
          value={scoreStr}
          onChange={e => setScoreStr(e.target.value)}
          readOnly={!hasSA}
          className={cn('input w-24 text-center text-lg font-mono', !hasSA && 'opacity-70')}
          placeholder="0–100"
        />
        <span className="text-dim text-sm">/ 100</span>
        <button
          onClick={() => valid && onRecord(parsed)}
          disabled={!valid}
          className="btn-primary ml-auto min-h-[44px] px-6"
        >
          Record Result
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

type Phase = 'answering' | 'submitted' | 'recorded'

export function QuizEngine({ quiz, moduleTitle, onComplete, onBack }: QuizEngineProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [phase, setPhase] = useState<Phase>('answering')
  const [mcResult, setMcResult] = useState<ReturnType<typeof gradeMC> | null>(null)
  const [exportText, setExportText] = useState('')
  const [result, setResult] = useState<ClaudeGradingResult | null>(null)

  const { recordQuizAttempt, progress } = useAppStore(useShallow(s => ({
    recordQuizAttempt: s.recordQuizAttempt,
    progress: s.progress,
  })))

  const hasSA = quiz.questions.some(q => q.type === 'short_answer')
  const answeredCount = quiz.questions.filter(q => answers[q.id]?.trim()).length
  const allAnswered = answeredCount === quiz.questions.length

  function setAnswer(questionId: string, value: string) {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  function handleSubmit() {
    if (!allAnswered) return
    const mc = gradeMC(quiz, answers)
    const text = buildExportText(quiz, moduleTitle, answers)
    setMcResult(mc)
    setExportText(text)
    setPhase('submitted')
  }

  function handleRecord(score: number) {
    const passed = score >= quiz.passMark

    // XP: full on pass, half on fail — use MC xp if available, else estimate from score
    const totalXp = quiz.questions.reduce((sum, q) => sum + q.xpValue, 0)
    const xpAwarded = passed
      ? Math.round(totalXp * (score / 100))
      : Math.round(totalXp * (score / 100) * 0.5)

    // Merge MC feedback with placeholder for SA
    const questionFeedback: Record<string, string> = { ...(mcResult?.feedback ?? {}) }
    for (const q of quiz.questions) {
      if (q.type === 'short_answer' && !questionFeedback[q.id]) {
        questionFeedback[q.id] = `Score: ${score}% (graded externally)`
      }
    }

    const gradeResult: ClaudeGradingResult = {
      totalScore: score,
      passed,
      overallFeedback: passed
        ? `You scored ${score}% — passed! Keep it up.`
        : `You scored ${score}% — need ${quiz.passMark}% to pass. Review the material and try again.`,
      questionFeedback,
      xpAwarded,
    }

    const prevAttempts = progress.quizAttempts.filter(a => a.quizId === quiz.id).length
    recordQuizAttempt({
      quizId: quiz.id,
      score,
      passed,
      attemptNumber: prevAttempts + 1,
      timestamp: new Date().toISOString(),
      overallFeedback: gradeResult.overallFeedback,
      questionFeedback,
      xpAwarded,
    })

    setResult(gradeResult)
    setPhase('recorded')
    onComplete(gradeResult)
  }

  function handleRetry() {
    setAnswers({})
    setPhase('answering')
    setMcResult(null)
    setExportText('')
    setResult(null)
  }

  const locked = phase !== 'answering'

  // Filename: "stark-quiz-module-13-final-2026-05-25.txt"
  const safeTitle = quiz.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `stark-quiz-${safeTitle}-${dateStr}.txt`

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
              feedback={mcResult?.feedback[q.id]}
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

      {/* Export + score entry (phase: submitted) */}
      {phase === 'submitted' && (
        <div className="mt-6 space-y-4">
          {/* MC-only: show score, record immediately */}
          {!hasSA ? (
            <ScoreEntry
              defaultScore={mcResult?.score ?? 0}
              hasSA={false}
              onRecord={handleRecord}
            />
          ) : (
            <>
              <ExportPanel text={exportText} filename={filename} />
              <ScoreEntry
                defaultScore={mcResult?.score ?? 0}
                hasSA={true}
                onRecord={handleRecord}
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
