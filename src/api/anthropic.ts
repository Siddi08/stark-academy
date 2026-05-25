import type { ClaudeGradingResult, QuizQuestion } from '@/types'

export interface GradeQuizParams {
  workerUrl: string
  moduleTitle: string
  questions: QuizQuestion[]
  answers: Record<string, string>
  passMark: number
}

export interface ExplainConceptParams {
  workerUrl: string
  lessonTitle: string
  concept: string
  lessonContent: string
}

export interface ChatInLessonParams {
  workerUrl: string
  lessonTitle: string
  lessonContent: string
  history: { role: 'user' | 'assistant'; content: string }[]
  userMessage: string
}

// ─── Internal helper ──────────────────────────────────────────────────────────

/** POST a messages request to the Worker (non-streaming) and return the text. */
async function workerPost(workerUrl: string, body: object): Promise<string> {
  const res = await fetch(workerUrl.replace(/\/$/, ''), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Worker error ${res.status}: ${text}`)
  }
  const data = await res.json() as { content?: Array<{ type: string; text?: string }> }
  return data.content?.[0]?.type === 'text' ? (data.content[0].text ?? '') : ''
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

const conceptCache = new Map<string, string>()

export async function gradeQuiz(params: GradeQuizParams): Promise<ClaudeGradingResult> {
  const questionsText = params.questions.map((q, i) => {
    const answer = params.answers[q.id] ?? '(no answer)'
    return `Q${i + 1} [${q.type}] (${q.xpValue} XP): ${q.question}\nAnswer: ${answer}\nRubric: ${q.gradingRubric}`
  }).join('\n\n')

  const prompt = `You are grading a quiz for Stark Academy, an AI curriculum.

Module: ${params.moduleTitle}
Pass mark: ${params.passMark}/100

Questions and student answers:
${questionsText}

CRITICAL: your response must be ONLY a valid JSON object. Absolutely no markdown, no code fences, no backticks, no text before or after the JSON.

Return this exact shape:
{
  "totalScore": <number 0-100>,
  "passed": <boolean>,
  "overallFeedback": "<2-3 sentence summary>",
  "questionFeedback": {
    "<questionId>": "<specific feedback for this question>"
  },
  "xpAwarded": <number>
}`

  async function call(): Promise<string> {
    return workerPost(params.workerUrl, {
      model:      'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages:   [{ role: 'user', content: prompt }],
    })
  }

  try {
    let text = await call()
    try {
      return JSON.parse(text) as ClaudeGradingResult
    } catch {
      text = await call()  // retry once
      return JSON.parse(text) as ClaudeGradingResult
    }
  } catch (err) {
    throw new Error(`Grading failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

export async function explainConcept(params: ExplainConceptParams): Promise<string> {
  const cacheKey = `${params.lessonTitle}::${params.concept}`
  if (conceptCache.has(cacheKey)) return conceptCache.get(cacheKey)!

  const text = await workerPost(params.workerUrl, {
    model:      'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages:   [{
      role:    'user',
      content: `You are a tutor for Stark Academy. The student is reading: "${params.lessonTitle}".

Explain this concept clearly and concisely: "${params.concept}"

Context from the lesson:
${params.lessonContent.slice(0, 1000)}

Give a clear explanation in 2-4 paragraphs. Use examples where helpful.`,
    }],
  })

  conceptCache.set(cacheKey, text)
  return text
}

export async function chatInLesson(params: ChatInLessonParams): Promise<string> {
  return workerPost(params.workerUrl, {
    model:      'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system:     `You are a knowledgeable, encouraging tutor for Stark Academy — an AI curriculum.
The student is currently reading: "${params.lessonTitle}".
Help them understand the material. Be concise but thorough. Use examples.`,
    messages:   [
      ...params.history.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: params.userMessage },
    ],
  })
}

/**
 * Ping the Worker to verify it's reachable and correctly deployed.
 * Returns true if the worker responds with { ok: true }.
 */
export async function pingWorker(workerUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`${workerUrl.replace(/\/$/, '')}/ping`, {
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return false
    const data = await res.json() as { ok?: boolean }
    return data.ok === true
  } catch {
    return false
  }
}
