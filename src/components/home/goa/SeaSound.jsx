import { useEffect, useRef, useState } from 'react'
import { cx } from '../../../lib/format'

/**
 * Surf made in the browser — no audio file. Brown noise is the body of the sea;
 * two slow oscillators open and close it so waves build, break and draw back,
 * and a thin band of hiss rides on top as the foam.
 */
function createSea() {
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!Ctx) return null
  const ctx = new Ctx()

  const master = ctx.createGain()
  master.gain.value = 0
  master.connect(ctx.destination)

  const seconds = 6
  const length = ctx.sampleRate * seconds
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch += 1) {
    const data = buffer.getChannelData(ch)
    let last = 0
    for (let i = 0; i < length; i += 1) {
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02
      data[i] = last * 3.5
    }
  }
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  noise.loop = true

  // body of the wave
  const body = ctx.createBiquadFilter()
  body.type = 'lowpass'
  body.frequency.value = 650
  body.Q.value = 0.3
  const swell = ctx.createGain()
  swell.gain.value = 0.55

  // foam
  const hiss = ctx.createBiquadFilter()
  hiss.type = 'bandpass'
  hiss.frequency.value = 3200
  hiss.Q.value = 0.5
  const foam = ctx.createGain()
  foam.gain.value = 0.5

  // one wave roughly every nine seconds, with a slower drift so no two match
  const wave = ctx.createOscillator()
  wave.frequency.value = 0.11
  const drift = ctx.createOscillator()
  drift.frequency.value = 0.037

  const connect = (osc, amount, param) => {
    const g = ctx.createGain()
    g.gain.value = amount
    osc.connect(g)
    g.connect(param)
  }
  connect(wave, 0.35, swell.gain)
  connect(drift, 0.12, swell.gain)
  connect(wave, 420, body.frequency)
  connect(wave, 0.4, foam.gain)

  noise.connect(body)
  body.connect(swell)
  swell.connect(master)
  noise.connect(hiss)
  hiss.connect(foam)
  foam.connect(master)

  noise.start()
  wave.start()
  drift.start()

  return {
    play() {
      ctx.resume()
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0.6, ctx.currentTime, 0.6)
    },
    pause() {
      master.gain.cancelScheduledValues(ctx.currentTime)
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
    },
    close() {
      ctx.close()
    },
  }
}

/** Opt-in ambient surf. Off until the visitor asks for it. */
export default function SeaSound() {
  const [on, setOn] = useState(false)
  const sea = useRef(null)

  useEffect(
    () => () => {
      sea.current?.close()
      sea.current = null
    },
    [],
  )

  const toggle = () => {
    if (!sea.current) sea.current = createSea()
    if (!sea.current) return
    if (on) sea.current.pause()
    else sea.current.play()
    setOn(!on)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={on}
      className={cx(
        'goa-sound fixed left-4 z-30 inline-flex h-11 items-center gap-2.5 rounded-full border px-4 font-sans text-xs tracking-wide backdrop-blur-sm transition-colors duration-200 md:left-6',
        'bottom-[max(1rem,env(safe-area-inset-bottom,0px))] md:bottom-[max(1.5rem,env(safe-area-inset-bottom,0px))]',
        on
          ? 'border-primary bg-primary text-cream'
          : 'border-primary/40 bg-white/85 text-primary hover:border-primary',
      )}
    >
      <span className="goa-sound__bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
      {on ? 'Sea sound on' : 'Hear the sea'}
    </button>
  )
}
