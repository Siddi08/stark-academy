// Local-network sync utilities
// The laptop runs sync-server/server.ts on port 3001
// The phone connects by entering the laptop's local IP in Settings

export interface SyncPayload {
  deviceId: string
  deviceName: string
  timestamp: number
  progress: unknown
  anthropicApiKey?: string
}

export interface SyncResult {
  merged: unknown
  conflicts: string[]
  devicesSeen: string[]
}

export function generateDeviceId(): string {
  return `device_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

// Merge two progress objects — later lastModified timestamp wins per top-level field
export function mergeProgress(local: any, remote: any): { merged: any; conflicts: string[] } {
  const merged = { ...local }
  const conflicts: string[] = []

  const unionFields = ['completedLessons', 'achievements', 'streakHistory']
  for (const field of unionFields) {
    if (remote[field]) {
      const localArr: string[] = local[field] ?? []
      const remoteArr: string[] = remote[field] ?? []
      merged[field] = [...new Set([...localArr, ...remoteArr])]
    }
  }

  if (remote.quizAttempts) {
    const localAttempts = local.quizAttempts ?? []
    const remoteAttempts = remote.quizAttempts ?? []
    const seen = new Set(localAttempts.map((a: any) => `${a.quizId}-${a.attemptNumber}`))
    const newAttempts = remoteAttempts.filter((a: any) => !seen.has(`${a.quizId}-${a.attemptNumber}`))
    merged.quizAttempts = [...localAttempts, ...newAttempts]
  }

  const statusOrder = { not_started: 0, in_progress: 1, submitted: 2, verified: 3 }
  if (remote.projectStatuses) {
    for (const [id, remoteStatus] of Object.entries(remote.projectStatuses)) {
      const localStatus = local.projectStatuses?.[id] ?? 'not_started'
      const r = statusOrder[remoteStatus as keyof typeof statusOrder] ?? 0
      const l = statusOrder[localStatus as keyof typeof statusOrder] ?? 0
      if (r > l) {
        merged.projectStatuses = { ...merged.projectStatuses, [id]: remoteStatus }
        conflicts.push(`project:${id}`)
      }
    }
  }

  if (remote.projectRepos) {
    merged.projectRepos = { ...remote.projectRepos, ...local.projectRepos }
  }

  for (const field of ['xp', 'level', 'streak']) {
    if (remote[field] !== undefined) {
      if ((remote[field] as number) > (merged[field] ?? 0)) {
        merged[field] = remote[field]
        conflicts.push(field)
      }
    }
  }

  if (!merged.userName && remote.userName) {
    merged.userName = remote.userName
  }

  return { merged, conflicts }
}
