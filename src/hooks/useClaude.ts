import { useState, useCallback, useRef } from 'react'
import { useWorkerUrl } from '@/store/useAppStore'

type MessageParam = { role: 'user' | 'assistant'; content: string }

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface UseClaudeOptions {
  system?: string
  maxTokens?: number
  model?: string
}

export interface UseClaudeReturn {
  /** Send a message and return the full response text */
  send(userMessage: string, history?: ClaudeMessage[]): Promise<string>
  /** Abort the current request */
  abort(): void
  /** Response text (set once complete) */
  output: string
  /** True while waiting for response */
  streaming: boolean
  /** Error string if the last call failed */
  error: string | null
  /** Clear output and error */
  reset(): void
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useClaude(options: UseClaudeOptions = {}): UseClaudeReturn {
  const workerUrl = useWorkerUrl()
  const [streaming, setStreaming] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (
    userMessage: string,
    history: ClaudeMessage[] = [],
  ): Promise<string> => {
    if (!workerUrl) {
      setError('No Worker URL set. Go to Settings → AI Tutor and paste your Worker URL.')
      return ''
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStreaming(true)
    setOutput('')
    setError(null)

    try {
      const messages: MessageParam[] = [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ]

      const res = await fetch(workerUrl.replace(/\/$/, ''), {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      options.model ?? 'claude-sonnet-4-20250514',
          max_tokens: options.maxTokens ?? 2048,
          ...(options.system ? { system: options.system } : {}),
          messages,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Worker returned ${res.status}: ${text}`)
      }

      const data = await res.json() as {
        content?: Array<{ type: string; text?: string }>
      }

      const text = data.content?.find(b => b.type === 'text')?.text ?? ''
      setOutput(text)
      return text
    } catch (err) {
      if ((err as Error).name === 'AbortError') return ''
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      setError(
        msg.includes('Failed to fetch') || msg.includes('NetworkError')
          ? 'Cannot reach the AI Tutor Worker. Check your Worker URL in Settings.'
          : msg.includes('Worker returned 5')
          ? 'Worker error — make sure ANTHROPIC_API_KEY is set as a Worker secret.'
          : `Error: ${msg}`,
      )
      return ''
    } finally {
      setStreaming(false)
    }
  }, [workerUrl, options.system, options.maxTokens, options.model])

  const abort = useCallback(() => {
    abortRef.current?.abort()
    setStreaming(false)
  }, [])

  const reset = useCallback(() => {
    setOutput('')
    setError(null)
  }, [])

  return { send, abort, output, streaming, error, reset }
}
