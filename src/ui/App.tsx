import React, { useMemo, useState, useRef } from 'react'
import Game from './Game'
import River from './River'
import SplashEffect, { SplashHandle } from './SplashEffect'
import { generateLevel } from '../logic/levelGenerator'
import { Difficulty } from '../types'
import { GameMode } from '../gameModes'
import { getSelectedMode, setSelectedMode } from '../store/settings'
import ModeSelect from '../components/ModeSelect'

export default function App() {
  const [difficulty, setDifficulty] = useState<Difficulty>('A')
  const [seed, setSeed] = useState<number>(Date.now())
  const [mode, setMode] = useState<GameMode>(getSelectedMode())
  const [showSelector, setShowSelector] = useState<boolean>(true)
  const [flowEnabled, setFlowEnabled] = useState(true)
  const [particlesEnabled, setParticlesEnabled] = useState(true)
  const [reducedMotion, setReducedMotion] = useState<boolean>(false)
  const splashRef = useRef<SplashHandle>(null)
  const riverRef = useRef<HTMLDivElement>(null)
  const level = useMemo(() => generateLevel(difficulty, seed, mode), [difficulty, seed, mode])
  React.useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handler = () => setReducedMotion(!!mq.matches)
    handler()
    mq.addEventListener?.('change', handler)
    return () => mq.removeEventListener?.('change', handler)
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="brand">修桥过河 · Number Bridge Builder</div>
        <div className="controls">
          <label>
            难度:
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)}>
              <option value="A">A 入门</option>
              <option value="B">B 基础</option>
              <option value="C">C 进阶</option>
            </select>
          </label>
          <button onClick={() => setSeed(Date.now())}>换一关</button>
          <label>
            水流动画
            <input type="checkbox" checked={flowEnabled} onChange={(e) => setFlowEnabled(e.target.checked)} />
          </label>
          <label>
            粒子特效
            <input type="checkbox" checked={particlesEnabled} onChange={(e) => setParticlesEnabled(e.target.checked)} />
          </label>
          <button onClick={() => setShowSelector(true)}>选择玩法</button>
        </div>
      </header>
      {showSelector ? (
        <ModeSelect onSelect={(m) => { setMode(m); setSelectedMode(m); setShowSelector(false); setSeed(Date.now()) }} />
      ) : (
        <River ref={riverRef} flowEnabled={flowEnabled} reducedMotion={reducedMotion}>
          <SplashEffect ref={splashRef} enabled={particlesEnabled} />
          <Game
            level={level}
            riverRef={riverRef}
            splashRef={splashRef}
            reducedMotion={reducedMotion}
            mode={mode}
            onLevelComplete={() => setSeed(Date.now())}
          />
        </River>
      )}
    </div>
  )
}
