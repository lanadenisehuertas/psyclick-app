'use client'

import { useEffect, useRef, useState } from 'react'

/*
 * The hero's live monitor: PsyClick's eight biomarkers measured from the
 * visitor's own mouse and keyboard, drawn like a bedside monitor — scrolling
 * waveforms plus numerics, with the thesis's normative means (n = 105) where
 * reported. Only timing is read, never which key; nothing leaves the browser.
 * Values are written straight to the DOM so input never triggers a render.
 */

type Metric = { id: string; code: string; label: string; unit: string; norm?: string; digits: number }

const KEYBOARD: Metric[] = [
  { id: 'flight', code: 'FT', label: 'Flight time', unit: 'ms', norm: '120.34', digits: 0 },
  { id: 'dwell', code: 'DT', label: 'Dwell time', unit: 'ms', norm: '40.07', digits: 0 },
  { id: 'typing', code: 'TV', label: 'Typing velocity', unit: 'cps', norm: '5.19', digits: 2 },
  { id: 'errors', code: 'ER', label: 'Error rate', unit: 'ratio', digits: 2 },
]

const CURSOR: Metric[] = [
  { id: 'velocity', code: 'CV', label: 'Cursor velocity', unit: 'px/s', norm: '181.08', digits: 0 },
  { id: 'jerk', code: 'JK', label: 'Jerk', unit: 'k px/s³', digits: 1 },
  { id: 'entropy', code: 'PE', label: 'Path entropy', unit: 'bits', norm: '2.80', digits: 2 },
  { id: 'pauses', code: 'PF', label: 'Pause frequency', unit: '/min', digits: 1 },
]

const LAMBDA = 0.2 // EWMA weight, as in PsyClick calibration
const KERNEL = [0.1, 0.2, 0.4, 0.2, 0.1] // PsyClick's 5-point smoothing kernel
const PAUSE_MS = 500 // pause = cessation longer than 500 ms
const WINDOW_MS = 6000 // waveform history shown

type Pt = { x: number; y: number; t: number }

export default function HeroInstrument({ heroRef }: { heroRef: React.RefObject<HTMLElement | null> }) {
  const [fine, setFine] = useState(true)
  const valueRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const cellRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const trailRef = useRef<HTMLCanvasElement>(null)
  const waveRef = useRef<HTMLCanvasElement>(null)
  const statusRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    setFine(mq.matches)
    const hero = heroRef.current
    const trailCanvas = trailRef.current
    const waveCanvas = waveRef.current
    if (!hero || !trailCanvas || !waveCanvas) return
    const tctx = trailCanvas.getContext('2d')!
    const wctx = waveCanvas.getContext('2d')!
    const interactive = mq.matches

    const ewma: Record<string, number | null> = {}
    const put = (id: string, raw: number, digits: number) => {
      if (!Number.isFinite(raw)) return
      const prev = ewma[id]
      const v = prev == null ? raw : LAMBDA * raw + (1 - LAMBDA) * prev
      ewma[id] = v
      const el = valueRefs.current[id]
      if (el) el.textContent = v.toFixed(digits)
      const cell = cellRefs.current[id]
      if (cell && !cell.classList.contains('live')) cell.classList.add('live')
    }
    const pulse = (id: string) => {
      const cell = cellRefs.current[id]
      if (!cell) return
      cell.classList.remove('tick')
      void cell.offsetWidth
      cell.classList.add('tick')
    }
    const setStatus = (text: string) => {
      if (statusRef.current) statusRef.current.textContent = text
    }

    /* ── Canvas sizing ── */
    let rect = hero.getBoundingClientRect()
    let ww = 0
    let wh = 0
    const resize = () => {
      rect = hero.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      trailCanvas.width = rect.width * dpr
      trailCanvas.height = rect.height * dpr
      tctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const wr = waveCanvas.getBoundingClientRect()
      ww = wr.width
      wh = wr.height
      waveCanvas.width = ww * dpr
      waveCanvas.height = wh * dpr
      wctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(hero)
    ro.observe(waveCanvas)

    /* ── Signal buffers ── */
    const raw: Pt[] = []
    const trail: Pt[] = []
    const marks: { x: number; y: number; t: number; ms: number }[] = []
    const angles: number[] = []
    const speedSeries: { t: number; v: number }[] = []
    const keySpikes: { t: number; dwell: number; late: boolean }[] = []
    const pauseTicks: number[] = []
    let lastMove = 0
    let pauseCount = 0
    let firstMove = 0
    let paused = false

    const onMove = (e: PointerEvent) => {
      const now = performance.now()
      if (!firstMove) firstMove = now
      if (paused && lastMove) {
        const last = trail[trail.length - 1]
        if (last) marks.push({ x: last.x, y: last.y, t: now, ms: now - lastMove })
        pauseTicks.push(now)
        pauseCount++
        pulse('pauses')
      }
      paused = false
      lastMove = now
      raw.push({ x: e.clientX - rect.left, y: e.clientY - rect.top, t: now })
      if (raw.length > 5) raw.shift()
      if (raw.length === 5) {
        const sx = raw.reduce((a, p, i) => a + p.x * KERNEL[i], 0)
        const sy = raw.reduce((a, p, i) => a + p.y * KERNEL[i], 0)
        const p = { x: sx, y: sy, t: raw[2].t }
        const prev = trail[trail.length - 1]
        if (prev) {
          const dx = p.x - prev.x
          const dy = p.y - prev.y
          if (dx * dx + dy * dy > 4) angles.push(Math.atan2(dy, dx))
          if (angles.length > 80) angles.shift()
        }
        trail.push(p)
        if (trail.length > 240) trail.shift()
      }
    }
    const onScroll = () => {
      rect = hero.getBoundingClientRect()
    }

    /* ── Keyboard (timing only) ── */
    const downAt = new Map<string, number>()
    let lastUp = 0
    const keyTimes: number[] = []
    let keys = 0
    let backspaces = 0
    const isField = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      return !!t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)
    }
    const onDown = (e: KeyboardEvent) => {
      if (e.repeat || isField(e) || e.metaKey || e.ctrlKey || e.altKey) return
      if (e.key.length !== 1 && e.key !== 'Backspace') return // typing keys only
      const now = performance.now()
      downAt.set(e.code, now)
      const flight = lastUp ? now - lastUp : 0
      if (lastUp && flight < 2000) {
        put('flight', flight, 0)
        pulse('flight')
      }
      keySpikes.push({ t: now, dwell: 0, late: flight > 600 })
      keys++
      if (e.key === 'Backspace') backspaces++
      put('errors', backspaces / keys, 2)
      keyTimes.push(now)
      while (keyTimes.length && now - keyTimes[0] > 5000) keyTimes.shift()
      if (keyTimes.length > 2) put('typing', keyTimes.length / Math.max((now - keyTimes[0]) / 1000, 0.5), 2)
      setStatus('Keystroke timing captured · key identity never read')
    }
    const onUp = (e: KeyboardEvent) => {
      const start = downAt.get(e.code)
      if (start == null) return
      const now = performance.now()
      downAt.delete(e.code)
      lastUp = now
      const spike = keySpikes[keySpikes.length - 1]
      if (spike) spike.dwell = now - start
      put('dwell', now - start, 0)
      pulse('dwell')
    }

    /* ── 10 Hz sampler: cursor metrics ── */
    let lastSample: Pt | null = null
    let lastV = 0
    let lastA = 0
    const sampler = window.setInterval(() => {
      const now = performance.now()
      if (lastMove && now - lastMove > PAUSE_MS) paused = true
      const p = trail[trail.length - 1]
      let v = 0
      if (p && lastSample && p !== lastSample) {
        const dt = (p.t - lastSample.t) / 1000
        if (dt > 0) {
          v = Math.hypot(p.x - lastSample.x, p.y - lastSample.y) / dt
          const a = (v - lastV) / dt
          put('velocity', v, 0)
          put('jerk', Math.min(Math.abs((a - lastA) / dt) / 1000, 999), 1)
          lastV = v
          lastA = a
        }
      } else if (lastSample && paused) {
        put('velocity', 0, 0)
      }
      if (p) lastSample = p
      speedSeries.push({ t: now, v })
      while (speedSeries.length && now - speedSeries[0].t > WINDOW_MS) speedSeries.shift()
      while (keySpikes.length && now - keySpikes[0].t > WINDOW_MS) keySpikes.shift()
      while (pauseTicks.length && now - pauseTicks[0] > WINDOW_MS) pauseTicks.shift()
      if (angles.length > 12) {
        const bins = new Array(8).fill(0)
        angles.forEach((th) => bins[Math.floor(((th + Math.PI) / (2 * Math.PI)) * 8) % 8]++)
        put('entropy', bins.reduce((h, c) => (c ? h - (c / angles.length) * Math.log2(c / angles.length) : h), 0), 2)
      }
      if (firstMove) {
        const minutes = (now - firstMove) / 60000
        if (minutes > 0.05) put('pauses', pauseCount / minutes, 1)
      }
    }, 100)

    /* ── Drawing ── */
    let raf = 0
    let idle = 0 // demo signal phase for touch devices / before input
    const drawWave = (now: number) => {
      wctx.clearRect(0, 0, ww, wh)
      const lane = wh / 2
      // grid
      wctx.strokeStyle = 'rgba(112,232,192, 0.07)'
      wctx.lineWidth = 1
      for (let x = (-(now / 40) % 20) + 20; x < ww; x += 20) {
        wctx.beginPath()
        wctx.moveTo(x, 0)
        wctx.lineTo(x, wh)
        wctx.stroke()
      }
      for (let y = 0; y <= wh; y += lane / 4) {
        wctx.beginPath()
        wctx.moveTo(0, y)
        wctx.lineTo(ww, y)
        wctx.stroke()
      }
      wctx.strokeStyle = 'rgba(112,232,192, 0.16)'
      wctx.beginPath()
      wctx.moveTo(0, lane)
      wctx.lineTo(ww, lane)
      wctx.stroke()

      const xOf = (t: number) => ww - ((now - t) / WINDOW_MS) * ww
      const glow = (color: string) => {
        wctx.strokeStyle = color
        wctx.shadowColor = color
        wctx.shadowBlur = 8
        wctx.lineWidth = 1.8
        wctx.lineJoin = 'round'
      }

      // lane 1 — keystrokes as spikes (height ∝ dwell)
      const base1 = lane * 0.72
      glow('#68d8e8')
      wctx.beginPath()
      wctx.moveTo(0, base1)
      const spikes = interactive && keySpikes.length
        ? keySpikes
        : Array.from({ length: 9 }, (_, i) => {
            const period = 620
            const t = now - (((now + idle) % period) + i * period)
            return { t, dwell: 80 + ((i * 37) % 60), late: i === 4 }
          })
      spikes
        .slice()
        .sort((a, b) => a.t - b.t)
        .forEach((s) => {
          const x = xOf(s.t)
          if (x < -10) return
          const h = Math.min(lane * 0.62, 10 + (s.dwell || 60) * 0.22)
          wctx.lineTo(x - 6, base1)
          wctx.lineTo(x - 3, base1 + 4)
          wctx.lineTo(x, base1 - h)
          wctx.lineTo(x + 3, base1 + 6)
          wctx.lineTo(x + 7, base1)
        })
      wctx.lineTo(ww, base1)
      wctx.stroke()
      spikes.forEach((s) => {
        if (!s.late) return
        const x = xOf(s.t)
        wctx.shadowBlur = 0
        wctx.fillStyle = 'rgba(245, 166, 35, 0.9)'
        wctx.beginPath()
        wctx.arc(x - 18, base1 - 4, 3, 0, Math.PI * 2)
        wctx.fill()
      })

      // lane 2 — cursor velocity
      const base2 = lane + lane * 0.82
      glow('#36c98e')
      wctx.beginPath()
      if (interactive && firstMove) {
        speedSeries.forEach((s, i) => {
          const x = xOf(s.t)
          const y = base2 - Math.min(s.v / 1600, 1) * lane * 0.68
          i ? wctx.lineTo(x, y) : wctx.moveTo(x, y)
        })
      } else {
        for (let x = 0; x <= ww; x += 3) {
          const t = (now - ((ww - x) / ww) * WINDOW_MS) / 1000
          const env = Math.max(0, Math.sin(t * 1.3)) * (0.6 + 0.4 * Math.sin(t * 0.37))
          const y = base2 - env * (0.5 + 0.5 * Math.sin(t * 9)) * lane * 0.55
          x ? wctx.lineTo(x, y) : wctx.moveTo(x, y)
        }
      }
      wctx.stroke()
      wctx.shadowBlur = 0
      pauseTicks.forEach((t) => {
        const x = xOf(t)
        wctx.fillStyle = 'rgba(245, 166, 35, 0.95)'
        wctx.fillRect(x - 1, lane + 6, 2, lane - 12)
        wctx.font = '500 9px "IBM Plex Mono", ui-monospace, monospace'
        wctx.fillText('P', x + 4, lane + 14)
      })
      // sweep head
      const g = wctx.createLinearGradient(ww - 40, 0, ww, 0)
      g.addColorStop(0, 'rgba(7,24,30, 0)')
      g.addColorStop(1, 'rgba(112,232,192, 0.18)')
      wctx.fillStyle = g
      wctx.fillRect(ww - 40, 0, 40, wh)
    }

    const drawTrail = (now: number) => {
      tctx.clearRect(0, 0, rect.width, rect.height)
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1]
        const b = trail[i]
        const age = now - b.t
        if (age > 1600) continue
        const k = 1 - age / 1600
        tctx.strokeStyle = `rgba(8,126,159, ${0.55 * k})`
        tctx.lineWidth = 1 + 2.5 * k
        tctx.lineCap = 'round'
        tctx.beginPath()
        tctx.moveTo(a.x, a.y)
        tctx.lineTo(b.x, b.y)
        tctx.stroke()
      }
      for (let i = marks.length - 1; i >= 0; i--) {
        const m = marks[i]
        const age = now - m.t
        if (age > 2600) {
          marks.splice(i, 1)
          continue
        }
        const k = 1 - age / 2600
        const r = 8 + (age / 2600) * 14
        tctx.strokeStyle = `rgba(245, 166, 35, ${0.9 * k})`
        tctx.lineWidth = 1.5
        tctx.beginPath()
        tctx.arc(m.x, m.y, r, 0, Math.PI * 2)
        tctx.stroke()
        tctx.fillStyle = `rgba(154, 98, 5, ${k})`
        tctx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace'
        tctx.fillText(`pause ${(m.ms / 1000).toFixed(2)} s`, m.x + r + 6, m.y + 4)
      }
    }

    // Draw only while the hero is on screen; off screen no frames are requested.
    let visible = true
    const frame = () => {
      const now = performance.now()
      drawWave(now)
      if (interactive) drawTrail(now)
      raf = visible ? requestAnimationFrame(frame) : 0
    }
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf) raf = requestAnimationFrame(frame)
    })
    io.observe(hero)
    raf = requestAnimationFrame(frame)

    if (interactive) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      window.addEventListener('keydown', onDown)
      window.addEventListener('keyup', onUp)
    }
    return () => {
      cancelAnimationFrame(raf)
      clearInterval(sampler)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [heroRef])

  const cell = (m: Metric, channel: 'key' | 'cur') => (
    <div
      key={m.id}
      className={`mon-cell ${channel}`}
      ref={(el) => {
        cellRefs.current[m.id] = el
      }}
      title={m.label}
    >
      <div className="mon-cell-top">
        <b>{m.code}</b>
        <small>{m.label}</small>
      </div>
      <p>
        <span
          className="mon-value"
          ref={(el) => {
            valueRefs.current[m.id] = el
          }}
        >
          {fine ? '--' : m.norm ?? '--'}
        </span>
        <em>{m.unit}</em>
      </p>
      <span className="mon-norm">{m.norm ? `N ${m.norm}` : 'session'}</span>
    </div>
  )

  return (
    <>
      <canvas ref={trailRef} className="hero-trail" aria-hidden="true" />
      <div className="mon" role="group" aria-label="Live psychomotor monitor measured in your browser">
        <div className="mon-head">
          <span className="mon-brand">
            <i /> PsyClick monitor
          </span>
          <span className="mon-rec">{fine ? 'LIVE' : 'DEMO'}</span>
          <span ref={statusRef} className="mon-status">
            {fine ? 'Move your mouse or type to see your own signal' : 'Normative means, n = 105'}
          </span>
          <span className="mon-meta">EWMA λ 0.2 · local only</span>
        </div>
        <div className="mon-body">
          <div className="mon-wave">
            <span className="mon-lane l1">KEY</span>
            <span className="mon-lane l2">CUR</span>
            <canvas ref={waveRef} aria-hidden="true" />
          </div>
          <div className="mon-grid">
            {KEYBOARD.map((m) => cell(m, 'key'))}
            {CURSOR.map((m) => cell(m, 'cur'))}
          </div>
        </div>
      </div>
    </>
  )
}
