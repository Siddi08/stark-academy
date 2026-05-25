import { useState } from 'react'
import { Download, X } from 'lucide-react'
import { useInstallPrompt } from '@/hooks/useInstallPrompt'

/**
 * Subtle install banner shown once when the browser supports PWA install.
 * Dismissed permanently via localStorage flag.
 */
export function InstallPrompt() {
  const DISMISSED_KEY = 'stark-install-dismissed'
  const [hidden, setHidden] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true',
  )
  const { canInstall, install } = useInstallPrompt()

  if (!canInstall || hidden) return null

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, 'true')
    setHidden(true)
  }

  async function handleInstall() {
    const outcome = await install()
    if (outcome === 'accepted' || outcome === 'unavailable') {
      dismiss()
    }
  }

  return (
    <div
      className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 z-40
                 card border-spark-500/30 bg-surface/95 backdrop-blur-sm shadow-lg animate-fade-up"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl bg-spark-500/15 border border-spark-500/30 flex items-center justify-center shrink-0">
          <Download size={16} className="text-spark-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-sm text-ink">Install Stark Academy</p>
          <p className="text-xs text-ghost mt-0.5">
            Add to your home screen for offline access.
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="btn-primary text-xs px-3 py-1.5 min-h-[34px]"
            >
              Install
            </button>
            <button
              onClick={dismiss}
              className="btn-ghost text-xs px-3 py-1.5 min-h-[34px]"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          onClick={dismiss}
          className="text-ghost hover:text-dim min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 -mt-1 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
