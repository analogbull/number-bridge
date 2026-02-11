import { GameMode } from '../gameModes'

const KEY = 'nbb_settings'

type Settings = {
  selectedMode: GameMode
  bestStarsByMode: Record<string, Record<GameMode, number>>
}

const defaultSettings: Settings = {
  selectedMode: 'SUM2',
  bestStarsByMode: {},
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...defaultSettings }
    const data = JSON.parse(raw)
    return { ...defaultSettings, ...data }
  } catch {
    return { ...defaultSettings }
  }
}

export function saveSettings(s: Settings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {}
}

export function setSelectedMode(mode: GameMode) {
  const s = loadSettings()
  s.selectedMode = mode
  saveSettings(s)
}

export function getSelectedMode(): GameMode {
  return loadSettings().selectedMode
}
