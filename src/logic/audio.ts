export type SoundName = 'pick' | 'drop' | 'success' | 'fail'

export function playBeep(name: SoundName) {
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
  function ping(freq: number, type: OscillatorType, dur: number, vol = 0.08, sweep = 0) {
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = type
    o.frequency.value = freq
    if (sweep !== 0) o.frequency.linearRampToValueAtTime(freq + sweep, ctx.currentTime + dur / 1000)
    g.gain.value = vol
    o.connect(g)
    g.connect(ctx.destination)
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur / 1000)
    o.start()
    setTimeout(() => o.stop(), dur + 10)
  }
  if (name === 'pick') {
    ping(900, 'triangle', 90, 0.06, -60)
  } else if (name === 'drop') {
    ping(520, 'square', 100, 0.08, -40)
  } else if (name === 'success') {
    ping(620, 'square', 90, 0.08, 40)
    setTimeout(() => ping(920, 'square', 110, 0.08, -60), 90)
  } else if (name === 'fail') {
    ping(220, 'sawtooth', 140, 0.07, -80)
  }
  setTimeout(() => ctx.close(), 350)
}
