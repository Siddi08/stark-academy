import { useState, useCallback, useRef } from 'react'
import { useApiKey } from '@/store/useAppStore'

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
  const apiKey = useApiKey()
  const [streaming, setStreaming] = useState(false)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const send = useCallback(async (
    userMessage: string,
    history: ClaudeMessage[] = [],
  ) => {
    if (!apiKey) {
      setError('No API key set. Go to Settings → Anthropic API Key.')
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
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

      const messages: MessageParam[] = [
        ...history.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
      ]

      const stream = client.messages.stream({
        model: options.model ?? 'claude-sonnet-4-20250514',
        max_tokens: options.maxTokens ?? 2048,
        system: options.system,
        messages,
      })

      for await (const event of stream) {
        if (controller.signal.aborted) break
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          setOutput(prev => prev + (event.delta as { text: string }).text)
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') return
      const message = err instanceof Error ? err.message : 'Unexpected error'
      setError(
        message.includes('401') || message.includes('invalid_api_key')
          ? 'Invalid API key. Check your key in Settings.'
          : message.includes('429')
          ? 'Rate limit reached. Wait a moment and try again.'
          : `Error: ${message}`,
      )
    } finally {
      setStreaming(false)
    }
  }, [apiKey, options.system, options.maxTokens, options.model])

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
