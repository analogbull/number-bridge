import React, { useEffect, useMemo, useRef, useState } from 'react'
import { LevelConfig, GapState, Plank } from '../types'
import { playBeep } from '../logic/audio'
import { SplashHandle } from './SplashEffect'
import { GameMode, MODE_CONFIG } from '../gameModes'
import GapSegment from '../components/GapSegment'
import { evaluateGap } from '../logic/evaluate'

interface Props {
  level: LevelConfig
  riverRef?: React.RefObject<HTMLDivElement>
  splashRef?: React.RefObject<SplashHandle>
  reducedMotion?: boolean
  mode: GameMode
}

function useTimer(running: boolean) {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!running) return
    const start = performance.now()
    const id = setInterval(() => setElapsed(Math.floor(performance.now() - start)), 100)
    return () => clearInterval(id)
  }, [running])
  return elapsed
}

export default function Game({ level, riverRef, splashRef, reducedMotion, mode }: Props) {
  const [status, setStatus] = useState<'READY'|'PLAYING'|'CHECKING'|'GAP_SUCCESS'|'GAP_FAIL'|'LEVEL_COMPLETE'|'PAUSED'>('READY')
  const [currentGapIndex, setCurrentGapIndex] = useState(0)
  const [errorsCount, setErrorsCount] = useState(0)
  const [usedHints, setUsedHints] = useState(0)
  const elapsed = useTimer(status === 'PLAYING')
  const [roleStep, setRoleStep] = useState(0)
  const [tipText, setTipText] = useState<string>('')
  const fallbackRiverRef = useRef<HTMLDivElement>(null)

  const gaps: GapState[] = useMemo(() => level.gaps.map(g => ({
    id: g.id, target: g.target, requiredCount: g.requiredCount, slots: Array(g.requiredCount).fill(null), locked: false
  })), [level])

  const [bank, setBank] = useState<Plank[]>(level.plankSets[level.gaps[0].id])
  useEffect(() => {
    setStatus('READY'); setCurrentGapIndex(0); setErrorsCount(0); setUsedHints(0); setRoleStep(0)
    setBank(level.plankSets[level.gaps[0].id])
  }, [level])

  useEffect(() => {
    setBank(level.plankSets[level.gaps[currentGapIndex].id])
  }, [currentGapIndex, level])

  function checkGap(gap: GapState) {
    const filled = gap.slots.filter(Boolean) as Plank[]
    if (filled.length < gap.requiredCount) return
    setStatus('CHECKING')
    const values = filled.map(p => p.value)
    const { result, diff } = evaluateGap(mode, values, gap.target)
    if (diff === 0) {
      playBeep('success')
      gap.locked = true
      setStatus('GAP_SUCCESS')
      setRoleStep((s) => s + 1)
      const gapEl = document.getElementById(gap.id)
      if (gapEl) {
        gapEl.classList.add('success')
        setTimeout(() => gapEl.classList.remove('success'), 500)
      }
      if ((riverRef?.current || fallbackRiverRef.current) && gapEl) {
        const rr = (riverRef?.current || fallbackRiverRef.current)!.getBoundingClientRect()
        const gr = gapEl.getBoundingClientRect()
        const x = gr.left + gr.width / 2 - rr.left
        const y = gr.bottom - rr.top + 6
        const gapWidth = gr.width
        const gapHeight = gr.height
        splashRef?.current?.addSplash({ x, y, gapWidth, gapHeight, reducedMotion: !!reducedMotion })
      }
      setTimeout(() => {
        if (currentGapIndex === gaps.length - 1) {
          setStatus('LEVEL_COMPLETE')
        } else {
          setCurrentGapIndex((i) => i + 1)
          setStatus('PLAYING')
        }
      }, 500)
    } else {
      playBeep('fail')
      setErrorsCount((e) => e + 1)
      for (let i = 0; i < gap.slots.length; i++) {
        const p = gap.slots[i]
        if (p) {
          setBank((b) => [...b, p])
          gap.slots[i] = null
        }
      }
      setStatus('GAP_FAIL')
      setTimeout(() => setStatus('PLAYING'), 300)
    }
  }

  const dragRef = useRef<{ plank: Plank | null }>({ plank: null })
  function onPlankPointerDown(e: React.PointerEvent, plank: Plank) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId)
    playBeep('pick')
    dragRef.current.plank = plank
    const el = e.currentTarget as HTMLElement
    el.classList.add('dragging')
  }
  function onPlankPointerMove(e: React.PointerEvent, idx: number) {
    if (!dragRef.current.plank) return
    const el = e.currentTarget as HTMLElement
    el.style.position = 'absolute'
    el.style.left = `${e.clientX - 40}px`
    el.style.top = `${e.clientY - 40}px`
  }
  function onPlankPointerUp(e: React.PointerEvent, plankIdx: number) {
    const el = e.currentTarget as HTMLElement
    el.classList.remove('dragging')
    el.style.position = ''
    el.style.left = ''
    el.style.top = ''
    const plank = dragRef.current.plank
    dragRef.current.plank = null
    if (!plank) return
    playBeep('drop')
    const gapEl = document.getElementById(gaps[currentGapIndex].id)!
    const rect = gapEl.getBoundingClientRect()
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      const gap = gaps[currentGapIndex]
      const slotIndex = gap.slots.findIndex((s) => s === null)
      if (slotIndex !== -1) {
        gap.slots[slotIndex] = plank
        setBank((b) => b.filter((p, i) => i !== plankIdx))
        checkGap(gap)
      }
    }
  }

  useEffect(() => { if (status === 'READY') setStatus('PLAYING') }, [status])

  function hint() {
    if (usedHints >= 2) return
    setUsedHints((h) => h + 1)
    const gap = gaps[currentGapIndex]
    const bankVals = bank.map((b) => b.value)
    const match = bankVals.find((v) => bankVals.includes(gap.target - v))
    if (match === undefined) return
    const idxA = bank.findIndex((b) => b.value === match)
    const idxB = bank.findIndex((b) => b.value === gap.target - match && b.id !== bank[idxA].id)
    if (usedHints === 0) {
      const elA = document.querySelectorAll('.plank')[idxA] as HTMLElement
      if (elA) {
        elA.style.boxShadow = '0 0 18px #10b981'
        setTimeout(() => (elA.style.boxShadow = ''), 600)
      }
    } else if (usedHints === 1 && idxB !== -1) {
      const elA = document.querySelectorAll('.plank')[idxA] as HTMLElement
      const elB = document.querySelectorAll('.plank')[idxB] as HTMLElement
      if (elA) { elA.style.boxShadow = '0 0 18px #10b981' }
      if (elB) { elB.style.boxShadow = '0 0 18px #10b981' }
      setTimeout(() => {
        if (elA) elA.style.boxShadow = ''
        if (elB) elB.style.boxShadow = ''
      }, 600)
    }
  }

  const filledVals = gaps[currentGapIndex].slots.filter(Boolean).map(p => (p as Plank).value)
  const cfg = MODE_CONFIG[mode]
  const ready = filledVals.length === cfg.requiredCount
  const evalRes = evaluateGap(mode, filledVals, gaps[currentGapIndex].target)
  const remaining = gaps[currentGapIndex].target - (evalRes.result ?? 0)

  return (
    <div className="game">
      <div className="hud">
        <div>Level {level.levelId} · Gap {currentGapIndex + 1}/{gaps.length}</div>
        <div>Errors {errorsCount}</div>
        <div>{MODE_CONFIG[mode].hudLabel}</div>
        <div>Time {Math.floor(elapsed / 1000)}s</div>
        <div className="controls-bar">
          <button className="btn" onClick={hint}>提示</button>
          <button className="btn secondary" onClick={() => location.reload()}>重来</button>
        </div>
        <div className="feedback">{tipText || (sum ? `合计 ${sum}，还差 ${remaining}` : '把桥板拖到槽位上')}</div>
      </div>
      <div ref={fallbackRiverRef}>
        <div className={`role ${roleStep ? 'move' : ''}`} />
        <div className={`gaps ${mode === 'ADD2_SUB2' ? 'wide' : ''}`}>
          {gaps.map((g, i) => (
            <div key={g.id} id={g.id} className={'gap' + (g.requiredCount > 3 ? ' gap-4' : '')} style={{ opacity: i < currentGapIndex ? 0.5 : 1 }}>
              <div className="target">{g.target}</div>
              <svg className="rope-svg" viewBox="0 0 220 140" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="steelBeam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#bfc6cd"/>
                    <stop offset="100%" stopColor="#88939e"/>
                  </linearGradient>
                  <pattern id="hazard" patternUnits="userSpaceOnUse" width="8" height="8">
                    <rect width="8" height="8" fill="#111"/>
                    <path d="M0,8 L8,0 M-2,6 L2,2 M6,10 L10,6" stroke="#ffc107" strokeWidth="4"/>
                  </pattern>
                </defs>
                <rect x="6" y="18" width="12" height="104" fill="url(#steelBeam)" rx="2"/>
                <rect x="202" y="18" width="12" height="104" fill="url(#steelBeam)" rx="2"/>
                <rect x="0" y="126" width="220" height="10" fill="url(#steelBeam)"/>
                <rect x="0" y="126" width="220" height="4" fill="url(#hazard)"/>
                {g.locked
                  ? <g>
                      <rect x="22" y="40" width="176" height="6" fill="url(#steelBeam)" rx="2"/>
                      <rect x="22" y="76" width="176" height="6" fill="url(#steelBeam)" rx="2"/>
                    </g>
                  : <g>
                      <rect x="22" y="40" width="90" height="6" fill="url(#steelBeam)" rx="2"/>
                      <rect x="22" y="76" width="90" height="6" fill="url(#steelBeam)" rx="2"/>
                    </g>}
              </svg>
              <GapSegment
                gap={g}
                mode={mode}
                isActive={i === currentGapIndex}
                onSlotClick={(si, p) => {
                  if (p && status !== 'CHECKING') {
                    setBank((b) => [...b, p as Plank])
                    g.slots[si] = null
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="bank">
        {bank.map((p, i) => (
          <div
            key={p.id}
            className="plank"
            onPointerDown={(e) => onPlankPointerDown(e, p)}
            onPointerMove={(e) => onPlankPointerMove(e, i)}
            onPointerUp={(e) => onPlankPointerUp(e, i)}
            onClick={() => {
              const t = gaps[currentGapIndex].target
              setTipText(`和 ${t - p.value} 能凑 ${t}`)
              setTimeout(() => setTipText(''), 800)
            }}
          >
            {p.value}
          </div>
        ))}
      </div>
    </div>
  )
}
