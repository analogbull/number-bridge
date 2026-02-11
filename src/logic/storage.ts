const KEY = 'number-bridge-progress'

export interface Progress {
  highestLevelIndex: number
  bestStars: Record<string, number>
  recent: { correctRate: number; avgTime: number }
}

export function loadProgress(): Progress {
  const raw = localStorage.getItem(KEY)
  if (!raw) return { highestLevelIndex: 0, bestStars: {}, recent: { correctRate: 0, avgTime: 0 } }
  try {
    return JSON.parse(raw)
  } catch {
    return { highestLevelIndex: 0, bestStars: {}, recent: { correctRate: 0, avgTime: 0 } }
  }
}

export function saveProgress(p: Progress) {
  localStorage.setItem(KEY, JSON.stringify(p))
}

export function clearProgress() {
  localStorage.removeItem(KEY)
}
