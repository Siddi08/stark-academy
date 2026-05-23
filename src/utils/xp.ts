export const XP = {
  LESSON_COMPLETE:   10,
  QUIZ_FIRST_TRY:    25,
  QUIZ_RETRY:        10,
  PROJECT_SUBMIT:    50,
  PROJECT_VERIFIED: 100,
  DAILY_STREAK:       5,
  ONBOARDING:        50,
} as const

const LEVEL_BASE = 100
const LEVEL_INCREMENT = 150

export function getLevel(xp: number): number {
  let remaining = xp, level = 1, threshold = LEVEL_BASE
  while (remaining >= threshold) {
    remaining -= threshold
    level++
    threshold += LEVEL_INCREMENT
  }
  return level
}

export function getLevelProgress(xp: number) {
  let remaining = xp, level = 1, threshold = LEVEL_BASE
  while (remaining >= threshold) {
    remaining -= threshold
    level++
    threshold += LEVEL_INCREMENT
  }
  return { level, current: remaining, needed: threshold, percent: Math.round((remaining / threshold) * 100) }
}

export function getLevelTitle(level: number): string {
  const titles: Record<number, string> = {
    1: 'Cadet', 2: 'Apprentice', 3: 'Analyst', 4: 'Engineer',
    5: 'Architect', 6: 'Systems Thinker', 7: 'Researcher',
    8: 'Principal', 9: 'Distinguished', 10: 'Iron Man',
  }
  return titles[Math.min(level, 10)] ?? 'Iron Man'
}
