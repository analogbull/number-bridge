import React, { forwardRef, useImperativeHandle, useState } from 'react'

type SplashParams = {
  x: number
  y: number
  gapWidth: number
  gapHeight: number
  dropletCount?: number
  rippleCount?: number
  duration?: number
  splashScale?: number
  reducedMotion?: boolean
}

type Props = { enabled: boolean }

export type SplashHandle = {
  addSplash: (p: SplashParams) => void
}

export default forwardRef<SplashHandle, Props>(function SplashEffect({ enabled }, ref) {
  const [items, setItems] = useState<Array<{ id: string, x: number, y: number, cfg: Required<SplashParams> }>>([])

  useImperativeHandle(ref, () => ({
    addSplash(p: SplashParams) {
      if (!enabled) return
      const cfg: Required<SplashParams> = {
        dropletCount: p.dropletCount ?? 12,
        rippleCount: p.rippleCount ?? 3,
        duration: p.duration ?? 1100,
        splashScale: p.splashScale ?? 1,
        reducedMotion: p.reducedMotion ?? false,
        x: p.x, y: p.y, gapWidth: p.gapWidth, gapHeight: p.gapHeight,
      }
      const id = 'sp_' + Math.random().toString(36).slice(2)
      setItems((arr) => [...arr, { id, x: cfg.x, y: cfg.y, cfg }])
      setTimeout(() => setItems((arr) => arr.filter((i) => i.id !== id)), cfg.duration + 200)
    }
  }), [enabled])

  return (
    <>
      {items.map(it => {
        const scale = Math.min(1.8, Math.max(1.2, (it.cfg.gapWidth / 90))) * it.cfg.splashScale
        const rise = Math.min(1.2, Math.max(0.8, (it.cfg.gapHeight / 140))) * 80
        const rcount = it.cfg.reducedMotion ? 1 : it.cfg.rippleCount
        const dcount = it.cfg.reducedMotion ? 0 : it.cfg.dropletCount
        const rings = Array.from({ length: rcount }).map((_, i) => {
          const delay = i * 120
          return <div key={'ring'+i} className="ring" style={{ left: it.x, top: it.y, ['--ring-scale' as any]: scale, animationDuration: it.cfg.duration + 'ms', animationDelay: delay + 'ms' }} />
        })
        const drops = Array.from({ length: dcount }).map((_, i) => {
          const ang = (Math.PI * 2 * i) / dcount
          const dx = Math.cos(ang) * (20 + Math.random() * 16)
          const dy = -Math.abs(Math.sin(ang)) * (10 + Math.random() * 10)
          return <div key={'drop'+i} className="drop" style={{ left: it.x, top: it.y, ['--dx' as any]: dx + 'px', ['--rise' as any]: (rise + Math.random()*30) + 'px', animationDuration: it.cfg.duration + 'ms' }} />
        })
        const foams = it.cfg.reducedMotion ? null : Array.from({ length: 10 }).map((_, i) => {
          const fx = (Math.random() - 0.5) * 40
          const fy = (Math.random() - 0.2) * 16
          const sz = 4 + Math.random() * 6
          return <div key={'foam'+i} className="foam" style={{ left: it.x + fx, top: it.y + fy, width: sz, height: sz, animationDuration: '600ms' }} />
        })
        return <div key={it.id}>{rings}{drops}{foams}</div>
      })}
    </>
  )
})
