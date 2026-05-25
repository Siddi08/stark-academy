// ─── Curriculum ───────────────────────────────────────────────────────────────

export interface KeyTerm {
  term: string
  definition: string
}

export interface Lesson {
  id: string
  number: string
  title: string
  content: string
  duration: number
  keyTerms: Array<string | KeyTerm>
}

export type QuestionType = 'multiple_choice' | 'short_answer' | 'practical'

export interface QuizQuestion {
  id: string
  type: QuestionType
  question: string
  options?: string[]
  correctAnswer?: string
  gradingRubric: string
  xpValue: number
}

export interface Quiz {
  id: string
  title: string
  type: 'lesson' | 'module_final' | 'arc_final'
  moduleId: string
  questions: QuizQuestion[]
  passMark: number
}

export interface Project {
  id: string
  moduleId: string
  name: string
  emoji: string
  description: string
  tools: string[]
  githubRepo?: string
  status: 'not_started' | 'in_progress' | 'submitted' | 'verified'
  rubric: string[]
  xpReward: number
}

export type ArcNumber = 1 | 2 | 3 | 4 | 5

export const ARC_META: Record<ArcNumber, { title: string; subtitle: string; colour: string; modules: number[] }> = {
  1: { title: 'Foundation',    subtitle: 'How computers and mathematics actually work', colour: 'phase1', modules: [1,2,3,4,5,6] },
  2: { title: 'Intelligence',  subtitle: 'How modern LLMs are built',                  colour: 'phase2', modules: [7,8,9,10,11,12] },
  3: { title: 'Engineering',   subtitle: 'Building real systems with Anthropic',        colour: 'phase3', modules: [13,14,15,16] },
  4: { title: 'Systems',       subtitle: 'Safety, evaluation and scale',               colour: 'phase4', modules: [17,18,19,20] },
  5: { title: 'Mastery',       subtitle: 'The Iron Man arc',                           colour: 'phase5', modules: [21,22,23,24,25,26] },
}

export interface Module {
  id: string
  number: number
  title: string
  arc: ArcNumber
  description: string
  lessons: Lesson[]
  quizzes: Quiz[]
  project: Project
  finalExam?: Quiz
  prerequisiteModuleId?: string
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export interface QuizAttempt {
  quizId: string
  score: number
  passed: boolean
  attemptNumber: number
  timestamp: string
  overallFeedback: string
  questionFeedback: Record<string, string>
  xpAwarded: number
}

export interface UserProgress {
  completedLessons: string[]
  quizAttempts: QuizAttempt[]
  projectStatuses: Record<string, Project['status']>
  projectRepos: Record<string, string>
  xp: number
  level: number
  streak: number
  lastActiveDate: string
  streakHistory: string[]
  achievements: string[]
  onboardingComplete: boolean
  userName: string
  deviceId: string
  deviceName: string
  lastSyncedAt: string | null
  lastSyncedWithDeviceId: string | null
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ClaudeGradingResult {
  totalScore: number
  passed: boolean
  overallFeedback: string
  questionFeedback: Record<string, string>
  xpAwarded: number
}

export interface GithubVerifyResult {
  verified: boolean
  score: number
  feedback: string
  checkedItems: { item: string; passed: boolean; comment: string }[]
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  condition: (progress: UserProgress, modules: Module[]) => boolean
}

// ─── Sync ─────────────────────────────────────────────────────────────────────

export interface SyncStatus {
  state: 'idle' | 'connecting' | 'syncing' | 'success' | 'error'
  message: string
  lastSyncedAt: string | null
  conflicts: string[]
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export interface ToastItem {
  id: string
  variant: 'achievement' | 'success' | 'error' | 'info' | 'sync'
  title: string
  body?: string
  emoji?: string
  duration?: number
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}
