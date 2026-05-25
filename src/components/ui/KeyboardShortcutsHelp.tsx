import { X } from 'lucide-react'
import { KEYBOARD_SHORTCUTS } from '@/hooks/useKeyboardShortcuts'
import { cn } from '@/utils/cn'

interface KeyboardShortcutsHelpProps {
  onClose: () => void
}

function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd className={cn(
      'inline-flex items-center justify-center font-mono text-xs',
      'bg-raised border border-rim text-dim rounded-md',
      'px-2 py-0.5 min-w-[26px] shadow-sm',
      className,
    )}>
      {children}
    </kbd>
  )
}

export function KeyboardShortcutsHelp({ onClose }: KeyboardShortcutsHelpProps) {
  const categories = [...new Set(KEYBOARD_SHORTCUTS.map(s => s.category))]

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-void/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[340px] animate-spark">
        <div className="card-glow p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-base font-bold text-ink">Keyboard Shortcuts</h2>
            <button
              onClick={onClose}
              className="text-ghost hover:text-dim min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 -mt-2"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-5">
            {categories.map(cat => (
              <div key={cat}>
                <p className="font-heading text-[10px] uppercase tracking-widest text-ghost mb-2">
                  {cat}
                </p>
                <div className="space-y-2">
                  {KEYBOARD_SHORTCUTS.filter(s => s.category === cat).map(shortcut => (
                    <div key={shortcut.description} className="flex items-center justify-between gap-4">
                      <span className="text-sm text-dim">{shortcut.description}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {shortcut.keys.map((k, i) => (
                          <span key={i} className="flex items-center gap-1">
                            <Kbd>{k === '?' ? '?' : k.toUpperCase()}</Kbd>
                            {i < shortcut.keys.length - 1 && (
                              <span className="text-ghost text-xs">then</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-ghost mt-5 text-center">
            Press <Kbd className="text-[10px] mx-1">?</Kbd> to close
          </p>
        </div>
      </div>
    </>
  )
}
