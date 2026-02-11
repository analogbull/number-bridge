import { GameMode, MODE_CONFIG } from '../gameModes'

export function evaluateGap(mode: GameMode, values: number[], target: number) {
  const cfg = MODE_CONFIG[mode]
  if (values.length < cfg.requiredCount) return { ready: false, sum: 0, result: 0, diff: target }
  let acc = values[0]
  for (let i = 1; i < cfg.requiredCount; i++) {
    const op = cfg.operators[i - 1]
    const v = values[i]
    acc = op === '+' ? acc + v : acc - v
  }
  const result = acc
  const diff = result - target
  return { ready: true, sum: result, result, diff }
}
