import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProgress, QuizAttempt, Project, SyncStatus, ToastItem, Module } from '@/types'
import { getLevel } from '@/utils/xp'
import { generateDeviceId, mergeProgress } from '@/utils/sync'
import { achievements } from '@/data/achievements'
import { allModules } from '@/data/curriculum'
import { SAVE_KEY } from '@/utils/save'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayStr(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

function makeInitialProgress(): UserProgress {
  return {
    completedLessons: [],
    quizAttempts: [],
    projectStatuses: {},
    projectRepos: {},
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: '',
    streakHistory: [],
    achievements: [],
    onboardingComplete: false,
    userName: '',
    deviceId: generateDeviceId(),
    deviceName: typeof navigator !== 'undefined' ? navigator.platform : 'Unknown device',
    lastSyncedAt: null,
    lastSyncedWithDeviceId: null,
  }
}

// ─── Store interface ───────────────────────────────────────────────────────────

interface AppStore {
  // ── Persisted state ────────────────────────────────────────────────────────
  progress: UserProgress
  workerUrl: string
  apiKey: string
  syncServerUrl: string
  githubToken: string

  // ── Ephemeral UI state ─────────────────────────────────────────────────────
  toasts: ToastItem[]
  syncStatus: SyncStatus

  // ── Progress actions ───────────────────────────────────────────────────────

  /** Mark a lesson as complete, award XP, update streak, check achievements */
  completeLesson(lessonId: string): void

  /** Record a quiz attempt result */
  recordQuizAttempt(attempt: QuizAttempt): void

  /** Update a project's status */
  updateProjectStatus(projectId: string, status: Project['status']): void

  /** Set the GitHub repo URL for a project */
  setProjectRepo(projectId: string, repoUrl: string): void

  /** Award XP and recalculate level */
  addXP(amount: number): void

  /** Update streak based on today's date */
  updateStreak(): void

  /** Check all achievements and unlock newly satisfied ones */
  checkAchievements(modules?: Module[]): string[]  // returns newly unlocked IDs

  /** Complete onboarding */
  completeOnboarding(userName: string): void

  // ── Settings actions ───────────────────────────────────────────────────────

  setWorkerUrl(url: string): void
  setApiKey(key: string): void
  setSyncServerUrl(url: string): void
  setGithubToken(token: string): void
  setUserName(name: string): void

  // ── Sync actions ───────────────────────────────────────────────────────────

  /** Apply merged progress from a remote device */
  applySync(merged: UserProgress, deviceId: string): void

  updateSyncStatus(patch: Partial<SyncStatus>): void

  // ── Toast actions ──────────────────────────────────────────────────────────

  addToast(toast: Omit<ToastItem, 'id'>): void
  removeToast(id: string): void

  // ── Computed helpers ───────────────────────────────────────────────────────

  /** Total XP earned */
  totalXP(): number

  /** Percentage of lessons completed (0-100) */
  overallProgress(): number

  /** IDs of quizzes passed */
  passedQuizIds(): Set<string>

  /** Best score for a given quizId */
  bestScore(quizId: string): number | null
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // ── Initial state ────────────────────────────────────────────────────────
      progress: makeInitialProgress(),
      workerUrl: '',
      apiKey: '',
      syncServerUrl: '',
      githubToken: '',

      toasts: [],
      syncStatus: {
        state: 'idle',
        message: '',
        lastSyncedAt: null,
        conflicts: [],
      },

      // ── Progress actions ─────────────────────────────────────────────────────

      completeLesson(lessonId) {
        const { progress } = get()
        if (progress.completedLessons.includes(lessonId)) return

        set(s => ({
          progress: {
            ...s.progress,
            completedLessons: [...s.progress.completedLessons, lessonId],
          },
        }))

        get().addXP(10)
        get().updateStreak()
        const newIds = get().checkAchievements()
        newIds.forEach(id => {
          const a = achievements.find(x => x.id === id)
          if (a) {
            get().addToast({ variant: 'achievement', title: a.title, body: a.description, emoji: a.emoji })
          }
        })
      },

      recordQuizAttempt(attempt) {
        set(s => ({
          progress: {
            ...s.progress,
            quizAttempts: [...s.progress.quizAttempts, attempt],
          },
        }))
        if (attempt.xpAwarded > 0) get().addXP(attempt.xpAwarded)
        get().updateStreak()
        const newIds = get().checkAchievements()
        newIds.forEach(id => {
          const a = achievements.find(x => x.id === id)
          if (a) {
            get().addToast({ variant: 'achievement', title: a.title, body: a.description, emoji: a.emoji })
          }
        })
      },

      updateProjectStatus(projectId, status) {
        set(s => ({
          progress: {
            ...s.progress,
            projectStatuses: { ...s.progress.projectStatuses, [projectId]: status },
          },
        }))
        const newIds = get().checkAchievements()
        newIds.forEach(id => {
          const a = achievements.find(x => x.id === id)
          if (a) {
            get().addToast({ variant: 'achievement', title: a.title, body: a.description, emoji: a.emoji })
          }
        })
      },

      setProjectRepo(projectId, repoUrl) {
        set(s => ({
          progress: {
            ...s.progress,
            projectRepos: { ...s.progress.projectRepos, [projectId]: repoUrl },
          },
        }))
      },

      addXP(amount) {
        set(s => {
          const newXP = s.progress.xp + amount
          const newLevel = getLevel(newXP)
          const leveledUp = newLevel > s.progress.level
          return {
            progress: { ...s.progress, xp: newXP, level: newLevel },
            toasts: leveledUp
              ? [...s.toasts, {
                  id: `levelup-${Date.now()}`,
                  variant: 'success' as const,
                  title: `Level ${newLevel}!`,
                  body: `You reached level ${newLevel}. Keep going.`,
                  emoji: '⚡',
                }]
              : s.toasts,
          }
        })
      },

      updateStreak() {
        const { progress } = get()
        const today = todayStr()
        if (progress.lastActiveDate === today) return  // already counted today

        const yesterday = yesterdayStr()
        const newStreak = progress.lastActiveDate === yesterday
          ? progress.streak + 1
          : 1

        const newHistory = progress.streakHistory.includes(today)
          ? progress.streakHistory
          : [...progress.streakHistory, today]

        set(s => ({
          progress: {
            ...s.progress,
            streak: newStreak,
            lastActiveDate: today,
            streakHistory: newHistory,
          },
        }))
      },

      checkAchievements(modules = allModules) {
        const { progress } = get()
        const newlyUnlocked: string[] = []

        for (const a of achievements) {
          if (progress.achievements.includes(a.id)) continue
          if (a.condition(progress, modules)) {
            newlyUnlocked.push(a.id)
          }
        }

        if (newlyUnlocked.length > 0) {
          set(s => ({
            progress: {
              ...s.progress,
              achievements: [...s.progress.achievements, ...newlyUnlocked],
            },
          }))
        }

        return newlyUnlocked
      },

      completeOnboarding(userName) {
        set(s => ({
          progress: {
            ...s.progress,
            userName,
            onboardingComplete: true,
          },
        }))
        get().addXP(50)  // XP.ONBOARDING
      },

      // ── Settings ─────────────────────────────────────────────────────────────

      setWorkerUrl(url) { set({ workerUrl: url }) },
      setApiKey(key) { set({ apiKey: key }) },
      setSyncServerUrl(url) { set({ syncServerUrl: url }) },
      setGithubToken(token) { set({ githubToken: token }) },
      setUserName(name) {
        set(s => ({ progress: { ...s.progress, userName: name } }))
      },

      // ── Sync ──────────────────────────────────────────────────────────────────

      applySync(merged, deviceId) {
        const now = new Date().toISOString()
        set({
          progress: {
            ...merged,
            lastSyncedAt: now,
            lastSyncedWithDeviceId: deviceId,
          },
          syncStatus: {
            state: 'success',
            message: 'Sync complete',
            lastSyncedAt: now,
            conflicts: [],
          },
        })
        // Check achievements after sync (may unlock new ones on this device)
        get().checkAchievements()
      },

      updateSyncStatus(patch) {
        set(s => ({ syncStatus: { ...s.syncStatus, ...patch } }))
      },

      // ── Toasts ────────────────────────────────────────────────────────────────

      addToast(toast) {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        const duration = toast.duration ?? (toast.variant === 'achievement' ? 5000 : 3000)
        set(s => ({ toasts: [...s.toasts, { ...toast, id, duration }] }))
        // Auto-dismiss
        setTimeout(() => get().removeToast(id), duration)
      },

      removeToast(id) {
        set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }))
      },

      // ── Computed ──────────────────────────────────────────────────────────────

      totalXP() { return get().progress.xp },

      overallProgress() {
        const total = allModules.flatMap(m => m.lessons).length
        if (total === 0) return 0
        return Math.round((get().progress.completedLessons.length / total) * 100)
      },

      passedQuizIds() {
        return new Set(
          get().progress.quizAttempts.filter(a => a.passed).map(a => a.quizId)
        )
      },

      bestScore(quizId) {
        const attempts = get().progress.quizAttempts.filter(a => a.quizId === quizId)
        if (attempts.length === 0) return null
        return Math.max(...attempts.map(a => a.score))
      },
    }),
    {
      name: SAVE_KEY,
      // Only persist these fields; toasts and syncStatus are ephemeral
      partialize: (s) => ({
        progress: s.progress,
        workerUrl: s.workerUrl,
        apiKey: s.apiKey,
        syncServerUrl: s.syncServerUrl,
        githubToken: s.githubToken,
      }),
    }
  )
)

// ─── Convenience selector hooks ───────────────────────────────────────────────

export const useProgress   = () => useAppStore(s => s.progress)
export const useWorkerUrl  = () => useAppStore(s => s.workerUrl)
export const useApiKey     = () => useAppStore(s => s.apiKey)
export const useToasts     = () => useAppStore(s => s.toasts)
export const useSyncStatus = () => useAppStore(s => s.syncStatus)
