import { useEffect, useState, useCallback } from 'react'

// BeforeInstallPromptEvent is not in the standard lib — extend Event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export interface UseInstallPromptReturn {
  /** True if the native install prompt is available (Chrome/Edge Android/desktop) */
  canInstall: boolean
  /** True if the app has already been installed */
  isInstalled: boolean
  /** Trigger the native install prompt */
  install(): Promise<'accepted' | 'dismissed' | 'unavailable'>
}

export function useInstallPrompt(): UseInstallPromptReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches,
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const installedHandler = () => setIsInstalled(true)

    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'

    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    setDeferredPrompt(null)
    if (outcome === 'accepted') setIsInstalled(true)
    return outcome
  }, [deferredPrompt])

  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    install,
  }
}
