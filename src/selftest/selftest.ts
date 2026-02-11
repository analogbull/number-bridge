import { generateLevel } from '../logic/levelGenerator'
import { Plank } from '../types'
import { evaluateGap } from '../logic/evaluate'
import { GameMode } from '../gameModes'

function bruteHasSolution(mode: GameMode, target: number, planks: Plank[]): boolean {
  const values = planks.map(p => p.value)
  const n = mode === 'SUM2' ? 2 : 4
  const idxs = values.map((_, i) => i)
  function combos(arr: number[], k: number): number[][] {
    const res: number[][] = []
    function rec(start: number, path: number[]) {
      if (path.length === k) { res.push([...path]); return }
      for (let i = start; i < arr.length; i++) { path.push(arr[i]); rec(i + 1, path); path.pop() }
    }
    rec(0, [])
    return res
  }
  const choose = combos(idxs, n)
  for (const c of choose) {
    const vals = c.map(i => values[i])
    const e = evaluateGap(mode, vals, target)
    if (e.ready && e.diff === 0) return true
  }
  return false
}

function run(mode: GameMode) {
  let ok = 0
  for (let i = 0; i < 1000; i++) {
    const lvl = generateLevel('B', i + (mode === 'SUM2' ? 0 : 9999), mode)
    for (const g of lvl.gaps) {
      const has = bruteHasSolution(mode, g.target, lvl.plankSets[g.id])
      if (has) ok++
      else {
        console.error('Gap has no solution', mode, g.target, lvl.plankSets[g.id].map(p => p.value))
        process.exit(1)
      }
    }
  }
  console.log('Selftest passed. Mode:', mode, 'Checked gaps:', ok)
}

run('SUM2')
run('ADD2_SUB2')
