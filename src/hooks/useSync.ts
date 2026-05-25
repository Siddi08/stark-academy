import { useCallback } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { useShallow } from 'zustand/react/shallow'
import { mergeProgress } from '@/utils/sync'

// ─── useSync ──────────────────────────────────────────────────────────────────
// Talks to the Express sync server running on the laptop (sync-server/server.ts)
//
// Server routes (port 3001):
//   GET  /sync/ping  → { app, version, devicesSeen, lastSync }
//   GET  /sync/pull  → { progress, devicesSeen }
//   POST /sync/push  → { deviceId, deviceName, progress } → { merged, conflicts }

export interface UseSyncReturn {
  sync(): Promise<void>
  isSyncing: boolean
  lastSyncedAt: string | null
}

export function useSync(): UseSyncReturn {
  const { progress, syncServerUrl, syncStatus, updateSyncStatus, applySync } =
    useAppStore(useShallow(s => ({
      progress:         s.progress,
      syncServerUrl:    s.syncServerUrl,
      syncStatus:       s.syncStatus,
      updateSyncStatus: s.updateSyncStatus,
      applySync:        s.applySync,
    })))

  const sync = useCallback(async () => {
    if (!syncServerUrl) {
      updateSyncStatus({
        state:   'error',
        message: 'No sync server URL. Go to Settings and enter your laptop\'s LAN IP.',
      })
      return
    }

    const base = syncServerUrl.replace(/\/$/, '')

    updateSyncStatus({ state: 'connecting', message: 'Connecting to sync server…' })

    try {
      // 1. Ping — confirms server is reachable
      const ping = await fetch(`${base}/sync/ping`, {
        signal: AbortSignal.timeout(4000),
      })
      if (!ping.ok) throw new Error(`Ping failed: ${ping.status}`)

      updateSyncStatus({ state: 'syncing', message: 'Syncing progress…' })

      // 2. Pull server state
      const pullRes = await fetch(`${base}/sync/pull`, {
        signal: AbortSignal.timeout(8000),
      })
      const pulled: { progress?: unknown } = pullRes.ok ? await pullRes.json() : {}

      // 3. Merge locally first
      const { merged, conflicts } = mergeProgress(progress, pulled.progress ?? {})

      // 4. Push merged state to server
      const pushRes = await fetch(`${base}/sync/push`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceId:   progress.deviceId,
          deviceName: progress.deviceName,
          progress:   merged,
        }),
        signal: AbortSignal.timeout(8000),
      })

      const pushData: { merged?: unknown; conflicts?: string[] } = pushRes.ok
        ? await pushRes.json()
        : { merged, conflicts }

      // 5. Apply server-authoritative merged result to local store
      applySync(
        (pushData.merged ?? merged) as typeof progress,
        progress.deviceId,
      )

      updateSyncStatus({
        state:       'success',
        message:     conflicts.length > 0
          ? `Synced — ${conflicts.length} conflict(s) resolved`
          : 'Sync complete',
        lastSyncedAt: new Date().toISOString(),
        conflicts:   pushData.conflicts ?? conflicts,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown sync error'
      updateSyncStatus({
        state:   'error',
        message: `Sync failed: ${message}. Make sure the sync server is running.`,
      })
    }
  }, [progress, syncServerUrl, updateSyncStatus, applySync])

  return {
    sync,
    isSyncing: syncStatus.state === 'connecting' || syncStatus.state === 'syncing',
    lastSyncedAt: syncStatus.lastSyncedAt,
  }
}
