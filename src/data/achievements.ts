import type { Achievement } from '@/types'

// ─── 20 achievements ──────────────────────────────────────────────────────────
// condition receives (UserProgress, Module[]) — use modules to resolve lesson IDs by arc

export const achievements: Achievement[] = [
  // ── Lesson milestones ──────────────────────────────────────────────────────

  {
    id: 'first-lesson',
    title: 'First Steps',
    description: 'Complete your very first lesson.',
    emoji: '🦾',
    condition: (p) => p.completedLessons.length >= 1,
  },
  {
    id: 'ten-lessons',
    title: 'Getting Started',
    description: 'Complete 10 lessons.',
    emoji: '⚡',
    condition: (p) => p.completedLessons.length >= 10,
  },
  {
    id: 'halfway',
    title: 'Halfway There',
    description: 'Complete 52 lessons — the halfway point of the curriculum.',
    emoji: '🎯',
    condition: (p) => p.completedLessons.length >= 52,
  },
  {
    id: 'all-lessons',
    title: 'Completionist',
    description: 'Complete every single lesson across all 26 modules.',
    emoji: '📚',
    condition: (p, modules) => {
      const allLessonIds = modules.flatMap(m => m.lessons.map(l => l.id))
      return allLessonIds.every(id => p.completedLessons.includes(id))
    },
  },

  // ── Arc completions ────────────────────────────────────────────────────────

  {
    id: 'arc1-done',
    title: 'Iron Foundation',
    description: 'Complete all lessons in Arc 1 — Foundation.',
    emoji: '🏗️',
    condition: (p, modules) => {
      const ids = modules.filter(m => m.arc === 1).flatMap(m => m.lessons.map(l => l.id))
      return ids.length > 0 && ids.every(id => p.completedLessons.includes(id))
    },
  },
  {
    id: 'arc2-done',
    title: 'Iron Intelligence',
    description: 'Complete all lessons in Arc 2 — Intelligence.',
    emoji: '🧠',
    condition: (p, modules) => {
      const ids = modules.filter(m => m.arc === 2).flatMap(m => m.lessons.map(l => l.id))
      return ids.length > 0 && ids.every(id => p.completedLessons.includes(id))
    },
  },
  {
    id: 'arc3-done',
    title: 'Iron Engineer',
    description: 'Complete all lessons in Arc 3 — Engineering.',
    emoji: '⚙️',
    condition: (p, modules) => {
      const ids = modules.filter(m => m.arc === 3).flatMap(m => m.lessons.map(l => l.id))
      return ids.length > 0 && ids.every(id => p.completedLessons.includes(id))
    },
  },
  {
    id: 'arc4-done',
    title: 'Iron Master',
    description: 'Complete all lessons in Arc 4 — Systems.',
    emoji: '🔬',
    condition: (p, modules) => {
      const ids = modules.filter(m => m.arc === 4).flatMap(m => m.lessons.map(l => l.id))
      return ids.length > 0 && ids.every(id => p.completedLessons.includes(id))
    },
  },
  {
    id: 'arc5-done',
    title: 'Iron Architect',
    description: 'Complete all lessons in Arc 5 — Mastery.',
    emoji: '🏛️',
    condition: (p, modules) => {
      const ids = modules.filter(m => m.arc === 5).flatMap(m => m.lessons.map(l => l.id))
      return ids.length > 0 && ids.every(id => p.completedLessons.includes(id))
    },
  },

  // ── Quiz milestones ────────────────────────────────────────────────────────

  {
    id: 'perfect-score',
    title: 'Perfect Score',
    description: 'Score 100% on any quiz.',
    emoji: '💯',
    condition: (p) => p.quizAttempts.some(a => a.score === 100),
  },
  {
    id: 'quiz-25',
    title: 'Quiz Machine',
    description: 'Pass 25 quizzes.',
    emoji: '🧪',
    condition: (p) => p.quizAttempts.filter(a => a.passed).length >= 25,
  },
  {
    id: 'arc-finals-all',
    title: 'Arc Final Boss',
    description: 'Pass all five arc final exams.',
    emoji: '👑',
    condition: (p, modules) => {
      const arcFinalIds = modules
        .filter(m => m.finalExam != null)
        .map(m => m.finalExam!.id)
      return (
        arcFinalIds.length === 5 &&
        arcFinalIds.every(id => p.quizAttempts.some(a => a.quizId === id && a.passed))
      )
    },
  },
  {
    id: 'grand-final',
    title: 'Extremis Complete',
    description: 'Pass the Grand Final Exam and complete the Stark Academy curriculum.',
    emoji: '🏆',
    condition: (p, modules) => {
      const m26 = modules.find(m => m.id === 'm26')
      if (!m26?.finalExam) return false
      return p.quizAttempts.some(a => a.quizId === m26.finalExam!.id && a.passed)
    },
  },

  // ── XP milestones ──────────────────────────────────────────────────────────

  {
    id: 'xp-1000',
    title: 'Centurion',
    description: 'Earn 1,000 XP.',
    emoji: '💎',
    condition: (p) => p.xp >= 1000,
  },
  {
    id: 'xp-5000',
    title: 'Veteran',
    description: 'Earn 5,000 XP.',
    emoji: '🌟',
    condition: (p) => p.xp >= 5000,
  },
  {
    id: 'xp-10000',
    title: 'Extremis',
    description: 'Earn 10,000 XP. You\'ve reached the upper limit of human potential.',
    emoji: '🔮',
    condition: (p) => p.xp >= 10000,
  },

  // ── Project milestones ────────────────────────────────────────────────────

  {
    id: 'first-project',
    title: 'Builder',
    description: 'Submit your first project.',
    emoji: '🔧',
    condition: (p) =>
      Object.values(p.projectStatuses).some(s => s === 'submitted' || s === 'verified'),
  },
  {
    id: 'first-verified',
    title: 'GitHub Hero',
    description: 'Get a project verified via GitHub.',
    emoji: '📦',
    condition: (p) => Object.values(p.projectStatuses).some(s => s === 'verified'),
  },

  // ── Streak milestones ─────────────────────────────────────────────────────

  {
    id: 'streak-7',
    title: 'On Fire',
    description: 'Maintain a 7-day learning streak.',
    emoji: '🔥',
    condition: (p) => p.streak >= 7,
  },

  // ── Sync ──────────────────────────────────────────────────────────────────

  {
    id: 'synced',
    title: 'Synced Up',
    description: 'Successfully sync progress between two devices over LAN.',
    emoji: '📡',
    condition: (p) => p.lastSyncedAt !== null,
  },
]
