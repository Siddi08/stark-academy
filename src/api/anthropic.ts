import Anthropic from '@anthropic-ai/sdk'
import type { ClaudeGradingResult, QuizQuestion } from '@/types'

export interface GradeQuizParams {
  workerUrl?: string
  apiKey?: string
  moduleTitle: string
  questions: QuizQuestion[]
  answers: Record<string, string>
  passMark: number
}

export interface ExplainConceptParams {
  workerUrl?: string
  apiKey?: string
  lessonTitle: string
  concept: string
  lessonContent: string
}

export interface ChatInLessonParams {
  workerUrl?: string
  apiKey?: string
  lessonTitle: string
  lessonContent: string
  history: { role: 'user' | 'assistant'; content: string }[]
  userMessage: string
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

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

/** Call the Anthropic API directly from the browser using the user's API key. */
async function directPost(apiKey: string, body: { model: string; max_tokens: number; messages: { role: 'user' | 'assistant'; content: string }[]; system?: string }): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const msg = await client.messages.create(body)
  return msg.content[0]?.type === 'text' ? msg.content[0].text : ''
}

function resolvePost(params: { workerUrl?: string; apiKey?: string }) {
  if (params.workerUrl?.trim()) return (body: object) => workerPost(params.workerUrl!, body)
  if (params.apiKey?.trim()) return (body: Parameters<typeof directPost>[1]) => directPost(params.apiKey!, body)
  throw new Error('No API configured — add an API key or Worker URL in Settings.')
}

// ─── Exported helpers ─────────────────────────────────────────────────────────

const conceptCache = new Map<string, string>()

export async function gradeQuiz(params: GradeQuizParams): Promise<ClaudeGradingResult> {
  const post = resolvePost(params)

  const totalXp = params.questions.reduce((sum, q) => sum + q.xpValue, 0)
  const questionsText = params.questions.map((q, i) => {
    const answer = params.answers[q.id] ?? '(no answer)'
    return `Q${i + 1} [${q.id}] [${q.type}] (${q.xpValue} XP): ${q.question}\nAnswer: ${answer}\nRubric: ${q.gradingRubric}`
  }).join('\n\n')

  const prompt = `You are grading a quiz for Stark Academy, an AI curriculum.

Module: ${params.moduleTitle}
Pass mark: ${params.passMark}/100
Total possible XP: ${totalXp}

Questions and student answers:
${questionsText}

CRITICAL: your response must be ONLY a valid JSON object. Absolutely no markdown, no code fences, no backticks, no text before or after the JSON.

Return this exact shape:
{
  "totalScore": <number 0-100>,
  "passed": <boolean based on whether totalScore >= ${params.passMark}>,
  "overallFeedback": "<2-3 sentence summary>",
  "questionFeedback": {
    "<questionId>": "<specific feedback for this question>"
  },
  "xpAwarded": <number between 0 and ${totalXp}>
}`

  async function call(): Promise<string> {
    return post({
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

  const post = resolvePost(params)
  const text = await post({
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
  const post = resolvePost(params)
  return post({
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
