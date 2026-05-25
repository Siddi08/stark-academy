import { useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── Shortcut definitions ─────────────────────────────────────────────────────

export const KEYBOARD_SHORTCUTS = [
  { keys: ['g', 'h'], description: 'Go to Home',       category: 'Navigation' },
  { keys: ['g', 'c'], description: 'Go to Curriculum', category: 'Navigation' },
  { keys: ['g', 'p'], description: 'Go to Progress',   category: 'Navigation' },
  { keys: ['g', 'b'], description: 'Go to Projects',   category: 'Navigation' },
  { keys: ['g', 's'], description: 'Go to Settings',   category: 'Navigation' },
  { keys: ['?'],      description: 'Toggle this help',  category: 'General' },
] as const

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseKeyboardShortcutsOptions {
  onToggleHelp: () => void
}

/**
 * Global keyboard shortcuts. Prefix navigation with 'g':
 *   g+h → Home, g+c → Curriculum, g+p → Progress, g+b → Build (Projects), g+s → Settings
 *   ?   → toggle shortcuts help overlay
 *
 * Disabled when focus is inside an input, textarea, or contenteditable.
 */
export function useKeyboardShortcuts({ onToggleHelp }: UseKeyboardShortcutsOptions) {
  const navigate = useNavigate()
  const pendingG = useRef(false)
  const gTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isInputFocused = useCallback((): boolean => {
    const el = document.activeElement
    if (!el) return false
    const tag = el.tagName.toLowerCase()
    return tag === 'input' || tag === 'textarea' || tag === 'select' ||
      (el as HTMLElement).isContentEditable
  }, [])

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      // Never intercept when typing in a form field
      if (isInputFocused()) return

      // Ignore modifier combos (Ctrl+C, Cmd+K, etc.)
      if (e.metaKey || e.ctrlKey || e.altKey) return

      const key = e.key.toLowerCase()

      // ── 'g' prefix sequence (within 600ms) ──────────────────────────────
      if (pendingG.current) {
        pendingG.current = false
        if (gTimerRef.current) clearTimeout(gTimerRef.current)

        const routes: Record<string, string> = {
          h: '/',
          c: '/curriculum',
          p: '/progress',
          b: '/projects',
          s: '/settings',
        }

        if (routes[key]) {
          e.preventDefault()
          navigate(routes[key])
        }
        return
      }

      if (key === 'g') {
        e.preventDefault()
        pendingG.current = true
        gTimerRef.current = setTimeout(() => {
          pendingG.current = false
        }, 600)
        return
      }

      // ── Single-key shortcuts ─────────────────────────────────────────────
      if (key === '?') {
        e.preventDefault()
        onToggleHelp()
      }
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      if (gTimerRef.current) clearTimeout(gTimerRef.current)
    }
  }, [navigate, onToggleHelp, isInputFocused])
}
