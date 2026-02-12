import { Difficulty, GapConfig, LevelConfig, Plank } from '../types'
import { mulberry32, randInt } from './random'
import { GameMode, MODE_CONFIG } from '../gameModes'

export interface GenParams {
  allowZero: boolean
  plankRange: [number, number]
  targetRange: [number, number]
  decoyCount: number
}

function paramsForDifficulty(d: Difficulty): GenParams {
  switch (d) {
    case 'A':
      return { allowZero: true, plankRange: [0, 10], targetRange: [5, 10], decoyCount: 6 }
    case 'B':
      return { allowZero: true, plankRange: [0, 20], targetRange: [10, 20], decoyCount: 6 }
    case 'C':
      return { allowZero: true, plankRange: [0, 50], targetRange: [20, 100], decoyCount: 8 }
  }
}

function pickSolution(rnd: () => number, p: GenParams): { a: number; b: number; t: number } {
  const t = randInt(rnd, p.targetRange[0], p.targetRange[1])
  const minA = p.allowZero ? 0 : 1
  const a = randInt(rnd, minA, Math.min(p.plankRange[1], t))
  const b = t - a
  if (b < (p.allowZero ? 0 : 1) || b > p.plankRange[1]) {
    return pickSolution(rnd, p)
  }
  return { a, b, t }
}

function makePlank(idPrefix: string, value: number): Plank {
  return { id: `${idPrefix}-${value}-${Math.random().toString(36).slice(2, 8)}`, value }
}

function generateGapSum2(rnd: () => number, idx: number, d: Difficulty): { gap: GapConfig; planks: Plank[] } {
  const p = paramsForDifficulty(d)
  const { a, b, t } = pickSolution(rnd, p)
  const gap: GapConfig = { id: `gap-${idx}`, target: t, requiredCount: 2 }
  const set = new Set<number>([a, b])
  const planks: Plank[] = [makePlank(gap.id, a), makePlank(gap.id, b)]
  const addNear = (base: number, delta: number[]) => {
    delta.forEach((dlt) => {
      const v = base + dlt
      if (v >= p.plankRange[0] && v <= p.plankRange[1] && !set.has(v)) {
        set.add(v)
        planks.push(makePlank(gap.id, v))
      }
    })
  }
  addNear(a, [1, -1, 2, -2, 3])
  addNear(b, [1, -1, 2, -2, 3])
  while (planks.length < 2 + p.decoyCount) {
    const v = randInt(rnd, p.plankRange[0], p.plankRange[1])
    if (!set.has(v)) {
      set.add(v)
      planks.push(makePlank(gap.id, v))
    }
  }
  for (let i = planks.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[planks[i], planks[j]] = [planks[j], planks[i]]
  }
  return { gap, planks }
}

function generateGapAdd2Sub2(rnd: () => number, idx: number, d: Difficulty): { gap: GapConfig; planks: Plank[] } {
  const p = paramsForDifficulty(d)
  const minP = p.allowZero ? 0 : 1
  const maxP = p.plankRange[1]

  let t = 0, c = 0, d2 = 0, a = 0, b = 0
  let success = false

  // Try to generate a valid equation: a + b - c - d = t  => a + b = t + c + d
  // Constraints: all numbers in [minP, maxP]
  for (let tryCount = 0; tryCount < 50; tryCount++) {
    t = randInt(rnd, p.targetRange[0], p.targetRange[1])
    
    // sumNeeded = a + b = t + c + d
    // Max possible sumNeeded is 2 * maxP
    // So we need t + c + d <= 2 * maxP  =>  c + d <= 2 * maxP - t
    const budgetForCD = 2 * maxP - t
    if (budgetForCD < 2 * minP) continue // t is too large to form a valid equation

    // c must be <= maxP AND <= budgetForCD - minP (leaving room for d)
    const maxC = Math.min(maxP, budgetForCD - minP)
    if (maxC < minP) continue
    c = randInt(rnd, minP, maxC)

    // d must be <= maxP AND <= budgetForCD - c
    const maxD = Math.min(maxP, budgetForCD - c)
    if (maxD < minP) continue
    d2 = randInt(rnd, minP, maxD)

    const sumNeeded = t + c + d2
    
    // Now we need to split sumNeeded into a + b, where a, b in [minP, maxP]
    // a = sumNeeded - b
    // minP <= sumNeeded - b <= maxP  =>  sumNeeded - maxP <= b <= sumNeeded - minP
    // Also minP <= b <= maxP
    const minB = Math.max(minP, sumNeeded - maxP)
    const maxB = Math.min(maxP, sumNeeded - minP)

    if (minB > maxB) continue

    b = randInt(rnd, minB, maxB)
    a = sumNeeded - b
    success = true
    break
  }

  if (!success) {
    // Fallback to simple valid values if random generation fails
    // This prevents infinite recursion
    t = p.targetRange[0]
    c = minP
    d2 = minP
    const sum = t + c + d2
    a = Math.ceil(sum / 2)
    b = sum - a
  }

  const gap: GapConfig = { id: `gap-${idx}`, target: t, requiredCount: 4 }
  const base = [a, b, c, d2]
  const set = new Set<number>(base)
  const planks: Plank[] = base.map((v) => makePlank(gap.id, v))
  
  // Add some near misses
  const near = [1, -1, 2, -2]
  base.forEach((val) => {
    near.forEach((dv) => {
      const v = val + dv
      if (v >= minP && v <= maxP && !set.has(v)) {
        set.add(v)
        planks.push(makePlank(gap.id, v))
      }
    })
  })

  // Fill with random decoys until we reach desired count
  // Avoid infinite loop if we run out of unique numbers
  let safety = 0
  const targetCount = 4 + p.decoyCount
  while (planks.length < targetCount && safety < 100) {
    const v = randInt(rnd, minP, maxP)
    if (!set.has(v)) {
      set.add(v)
      planks.push(makePlank(gap.id, v))
    }
    safety++
  }

  for (let i = planks.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1))
    ;[planks[i], planks[j]] = [planks[j], planks[i]]
  }
  return { gap, planks }
}

export function generateLevel(difficulty: Difficulty, seed?: number, mode: GameMode = 'SUM2'): LevelConfig {
  const rnd = mulberry32(seed ?? Date.now())
  const gaps: GapConfig[] = []
  const plankSets: Record<string, Plank[]> = {}
  const N = mode === 'ADD2_SUB2' ? 2 : 3
  for (let i = 0; i < N; i++) {
    const res = mode === 'SUM2' ? generateGapSum2(rnd, i, difficulty) : generateGapAdd2Sub2(rnd, i, difficulty)
    const gap = res.gap
    const planks = res.planks
    gaps.push(gap)
    plankSets[gap.id] = planks
  }
  return { levelId: `L-${difficulty}-${Date.now()}`, difficulty, gaps, plankSets, seed, mode }
}
