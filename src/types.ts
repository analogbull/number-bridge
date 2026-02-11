export type Difficulty = 'A' | 'B' | 'C'

export interface Plank {
  id: string
  value: number
}

export interface GapConfig {
  id: string
  target: number
  requiredCount: number
}

export interface GapState {
  id: string
  target: number
  requiredCount: number
  slots: Array<Plank | null>
  locked: boolean
}

export interface LevelConfig {
  levelId: string
  difficulty: Difficulty
  gaps: GapConfig[]
  plankSets: Record<string, Plank[]>
  seed?: number
  mode?: import('./gameModes').GameMode
}

export interface GameState {
  status: 'READY' | 'PLAYING' | 'CHECKING' | 'GAP_SUCCESS' | 'GAP_FAIL' | 'LEVEL_COMPLETE' | 'PAUSED'
  currentGapIndex: number
  errorsCount: number
  usedHints: number
  startTime: number | null
  elapsed: number
  starsResult: 0 | 1 | 2 | 3
}
