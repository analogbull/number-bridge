import React from 'react'
import { GameMode, MODE_CONFIG } from '../gameModes'
import { setSelectedMode, getSelectedMode } from '../store/settings'

type Props = { onSelect: (mode: GameMode) => void }

export default function ModeSelect({ onSelect }: Props) {
  const [curr, setCurr] = React.useState<GameMode>(getSelectedMode())
  const choose = (m: GameMode) => {
    setCurr(m)
    setSelectedMode(m)
    onSelect(m)
  }
  return (
    <div style={{ padding: 24, display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
      {(['SUM2', 'ADD2_SUB2'] as GameMode[]).map((m) => (
        <button
          key={m}
          className="mode-card"
          onClick={() => choose(m)}
          aria-pressed={curr === m}
          title={MODE_CONFIG[m].label}
        >
          <div className="mode-title">{MODE_CONFIG[m].label}</div>
          <div className="mode-illustration">
            {MODE_CONFIG[m].operators.map((op, i) => (
              <div key={i} className="mode-slot">{op}</div>
            ))}
            <div className="mode-eq">= T</div>
          </div>
        </button>
      ))}
    </div>
  )
}
