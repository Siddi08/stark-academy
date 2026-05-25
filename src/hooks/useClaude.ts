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
  /** Send a message and stream the response */
  send(userMessage: string, history?: ClaudeMessage[]): Promise<void>
  /** Abort the current stream */
  abort(): void
  /** Accumulated streamed output */
  output: string
  /** True while streaming */
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
  ) => {
    if (!workerUrl) {
      setError('No Worker URL set. Go to Settings → AI Tutor and paste your Worker URL.')
      return
    }

    // Abort any in-flight request
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      options.model ?? 'claude-sonnet-4-20250514',
          max_tokens: options.maxTokens ?? 2048,
          stream:     true,
          ...(options.system ? { system: options.system } : {}),
          messages,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Worker returned ${res.status}: ${text}`)
      }

      if (!res.body) throw new Error('Empty response body from Worker')

      // ── Parse SSE stream ────────────────────────────────────────────────────
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer    = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done || controller.signal.aborted) break

        buffer += decoder.decode(value, { stream: true })

        // SSE is newline-delimited; keep the last (possibly incomplete) line
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const payload = line.slice(6).trim()
          if (payload === '[DONE]') continue
          try {
            const event = JSON.parse(payload)
            if (
              event.type === 'content_block_delta' &&
              event.delta?.type === 'text_delta' &&
              typeof event.delta?.text === 'string'
            ) {
              setOutput(prev => prev + event.delta.text)
            }
          } catch {
            // Skip malformed SSE chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const msg = err instanceof Error ? err.message : 'Unexpected error'
      setError(
        msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')
          ? 'Cannot reach the AI Tutor Worker. Check your Worker URL in Settings.'
          : msg.includes('Worker returned 5')
          ? 'Worker error — make sure ANTHROPIC_API_KEY is set as a Worker secret.'
          : `Error: ${msg}`,
      )
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
