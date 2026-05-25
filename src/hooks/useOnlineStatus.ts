import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'

export interface OnlineStatus {
  /** True if browser reports online (does NOT guarantee sync server is reachable) */
  isOnline: boolean
  /** True if the sync server at syncServerUrl responded to a ping */
  syncReachable: boolean
  /** Check reachability of the sync server right now */
  checkSync(): Promise<boolean>
}

export function useOnlineStatus(): OnlineStatus {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const [syncReachable, setSyncReachable] = useState(false)
  const syncServerUrl = useAppStore(s => s.syncServerUrl)

  // Listen to browser online/offline events
  useEffect(() => {
    const onOnline  = () => setIsOnline(true)
    const onOffline = () => { setIsOnline(false); setSyncReachable(false) }

    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  const checkSync = useCallback(async (): Promise<boolean> => {
    if (!syncServerUrl) { setSyncReachable(false); return false }

    const url = syncServerUrl.replace(/\/$/, '')
    try {
      const res = await fetch(`${url}/ping`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      })
      const reachable = res.ok
      setSyncReachable(reachable)
      return reachable
    } catch {
      setSyncReachable(false)
      return false
    }
  }, [syncServerUrl])

  // Recheck whenever syncServerUrl changes or we come back online
  useEffect(() => {
    if (isOnline && syncServerUrl) {
      checkSync()
    } else {
      setSyncReachable(false)
    }
  }, [isOnline, syncServerUrl, checkSync])

  return { isOnline, syncReachable, checkSync }
}
