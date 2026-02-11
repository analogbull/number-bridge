import React from 'react'
import { GapState, Plank } from '../types'
import { GameMode, MODE_CONFIG } from '../gameModes'

type Props = {
  gap: GapState
  mode: GameMode
  isActive: boolean
  onSlotClick: (si: number, plank: Plank | null) => void
}

export default function GapSegment({ gap, mode, isActive, onSlotClick }: Props) {
  const cfg = MODE_CONFIG[mode]
  const ops = cfg.operators
  return (
    <div className={'slots expr' + (gap.requiredCount > 3 ? ' tight' : '')}>
      {gap.slots.map((p, si) => (
        <React.Fragment key={si}>
          <div
            className={'slot' + (p ? ' filled' : '') + (isActive ? ' highlight' : '')}
            onClick={() => onSlotClick(si, p)}
          >
            {p?.value ?? ''}
          </div>
          {si < ops.length && <div className="op">{ops[si]}</div>}
        </React.Fragment>
      ))}
      <div className="eq">=</div>
      <div className="mode-eq">T</div>
    </div>
  )
}
