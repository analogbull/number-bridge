import React, { forwardRef, useEffect, useMemo } from 'react'

type Props = {
  flowEnabled: boolean
  flowSpeedBase?: number
  flowSpeedTexture?: number
  reducedMotion?: boolean
  children?: React.ReactNode
}

const River = forwardRef<HTMLDivElement, Props>(function River({ flowEnabled, flowSpeedBase = 12, flowSpeedTexture = 9, reducedMotion = false, children }, ref) {
  const speeds = useMemo(() => {
    if (!flowEnabled) return { base: 0, texture: 0 }
    if (reducedMotion) return { base: flowSpeedBase * 2, texture: flowSpeedTexture * 2 }
    return { base: flowSpeedBase, texture: flowSpeedTexture }
  }, [flowEnabled, flowSpeedBase, flowSpeedTexture, reducedMotion])

  useEffect(() => {
    const el = document.querySelector('.river')
    if (!el) return
    ;(el as HTMLElement).style.setProperty('--flow-speed-base', `${speeds.base}s`)
    ;(el as HTMLElement).style.setProperty('--flow-speed-texture', `${speeds.texture}s`)
  }, [speeds.base, speeds.texture])

  return (
    <div className="river" ref={ref}>
      <div className="water-base" />
      <div className="water-ripple" />
      {children}
    </div>
  )
})

export default River
