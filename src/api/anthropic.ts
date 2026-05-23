// Anthropic API client — full implementation in Phase 1
import type { ClaudeGradingResult, QuizQuestion } from '@/types'

export interface GradeQuizParams {
  apiKey: string
  moduleTitle: string
  questions: QuizQuestion[]
  answers: Record<string, string>
  passMark: number
}

export interface ExplainConceptParams {
  apiKey: string
  lessonTitle: string
  concept: string
  lessonContent: string
}

export interface ChatInLessonParams {
  apiKey: string
  lessonTitle: string
  lessonContent: string
  history: { role: 'user' | 'assistant'; content: string }[]
  userMessage: string
}

const conceptCache = new Map<string, string>()

export async function gradeQuiz(params: GradeQuizParams): Promise<ClaudeGradingResult> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: params.apiKey, dangerouslyAllowBrowser: true })

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

  async function callClaude(): Promise<string> {
    const res = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })
    return res.content[0].type === 'text' ? res.content[0].text : ''
  }

  try {
    let text = await callClaude()
    try {
      return JSON.parse(text) as ClaudeGradingResult
    } catch {
      // Retry once
      text = await callClaude()
      return JSON.parse(text) as ClaudeGradingResult
    }
  } catch (err) {
    throw new Error(`Grading failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }
}

export async function explainConcept(params: ExplainConceptParams): Promise<string> {
  const cacheKey = `${params.lessonTitle}::${params.concept}`
  if (conceptCache.has(cacheKey)) return conceptCache.get(cacheKey)!

  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: params.apiKey, dangerouslyAllowBrowser: true })

  const res = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{
      role: 'user',
      content: `You are a tutor for Stark Academy. The student is reading: "${params.lessonTitle}".

Explain this concept clearly and concisely: "${params.concept}"

Context from the lesson:
${params.lessonContent.slice(0, 1000)}

Give a clear explanation in 2-4 paragraphs. Use examples where helpful.`,
    }],
  })

  const text = res.content[0].type === 'text' ? res.content[0].text : ''
  conceptCache.set(cacheKey, text)
  return text
}

export async function chatInLesson(params: ChatInLessonParams): Promise<string> {
  const Anthropic = (await import('@anthropic-ai/sdk')).default
  const client = new Anthropic({ apiKey: params.apiKey, dangerouslyAllowBrowser: true })

  const systemPrompt = `You are a knowledgeable, encouraging tutor for Stark Academy — an AI curriculum.
The student is currently reading: "${params.lessonTitle}".
Help them understand the material. Be concise but thorough. Use examples.`

  const messages = [
    ...params.history.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: params.userMessage },
  ]

  const res = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    system: systemPrompt,
    messages,
  })

  return res.content[0].type === 'text' ? res.content[0].text : ''
}

export async function testApiKey(apiKey: string): Promise<boolean> {
  try {
    const Anthropic = (await import('@anthropic-ai/sdk')).default
    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
    const res = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Reply with just: OK' }],
    })
    const text = res.content[0].type === 'text' ? res.content[0].text : ''
    return text.includes('OK')
  } catch {
    return false
  }
}
