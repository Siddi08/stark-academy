/**
 * Stark Academy — Anthropic API proxy
 *
 * Sits between the static GitHub Pages app and the Anthropic API so the
 * API key never has to live in the browser bundle.
 *
 * Secrets (set via `wrangler secret put`):
 *   ANTHROPIC_API_KEY  — your sk-ant-... key (required)
 *   ALLOWED_ORIGIN     — e.g. https://siddi08.github.io  (optional, locks the
 *                        proxy to one origin so others can't burn your quota)
 *
 * Endpoints
 *   POST /          — proxy a messages request (streaming or non-streaming)
 *   GET  /ping      — health-check, returns { ok: true }
 */

export interface Env {
  ANTHROPIC_API_KEY: string
  ALLOWED_ORIGIN?: string
}

const ANTHROPIC_MESSAGES = 'https://api.anthropic.com/v1/messages'

function corsHeaders(env: Env): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN ?? '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const cors = corsHeaders(env)

    // ── CORS preflight ──────────────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors })
    }

    const url = new URL(request.url)

    // ── Health-check ────────────────────────────────────────────────────────
    if (url.pathname === '/ping' && request.method === 'GET') {
      return Response.json({ ok: true }, { headers: cors })
    }

    // ── Proxy to Anthropic ──────────────────────────────────────────────────
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors })
    }

    if (!env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'ANTHROPIC_API_KEY secret not set on Worker' }),
        { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return new Response('Invalid JSON body', { status: 400, headers: cors })
    }

    // Forward to Anthropic
    const upstream = await fetch(ANTHROPIC_MESSAGES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(body),
    })

    // Pass through response (streaming or not) with CORS headers added
    const responseHeaders = new Headers(cors)
    const upstreamContentType = upstream.headers.get('Content-Type')
    if (upstreamContentType) responseHeaders.set('Content-Type', upstreamContentType)

    return new Response(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    })
  },
}
