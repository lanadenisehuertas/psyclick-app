'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Opening takeover: an illustrative session in three quick beats (~6 s).
 *   1. type  — the client types "It worked out fine." while each key lands
 *              on a live keystroke strip; the hesitation before "fine" grows
 *              as an amber band in real time
 *   2. read  — the cursor path draws over the strip and the readout (T² gauge,
 *              biomarker shifts, Follow up flag) slides in
 *   3. claim — the thesis line, then the overlay lifts to reveal the page
 * Plays on every page load; skippable (button, Esc, Enter); collapsed
 * for reduced motion. Only transform/opacity are animated, so it stays smooth
 * on low-end machines.
 */

const EASE = [0.22, 1, 0.36, 1] as const

const ANSWER = 'It worked out fine.'
const PAUSE_INDEX = 14 // the "f" of "fine"
const PAUSE_MS = 700
// Flight time before each key (ms, illustrative). Spacing on the strip follows it.
const FLIGHT = [0, 105, 95, 130, 110, 100, 120, 95, 115, 140, 105, 125, 110, 150, 900, 140, 125, 160, 190]
// Dwell time per key (ms): spike height on the strip.
const DWELL = [62, 70, 58, 66, 74, 64, 60, 68, 72, 80, 66, 70, 64, 76, 124, 102, 98, 110, 104]

// Strip geometry (SVG units)
const W = 900
const BASE = 150
const CUM = FLIGHT.reduce<number[]>((acc, f, i) => [...acc, (acc[i - 1] ?? 0) + f], [])
const KX = CUM.map((c) => 30 + (c / CUM[CUM.length - 1]) * (W - 60))
const CURSOR_D =
  'M30,128 C110,120 200,78 300,86 C380,92 430,96 470,112 C510,128 540,70 575,74 C610,78 600,124 630,118 C660,112 640,58 700,52 C770,46 820,38 870,26'

const TIMES = { read: 2100, claim: 4200, done: 5800 }

const METRICS: [string, string][] = [
  ['Flight time', '+38%'],
  ['Dwell time', '+24%'],
  ['Path entropy', '↑ erratic'],
  ['Pauses', '↑ 3 / min'],
]

type Phase = 'type' | 'read' | 'claim'

export default function IntroTakeover({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion()
  const lenis = useLenis()
  const [phase, setPhase] = useState<Phase>('type')
  const [typed, setTyped] = useState(0)
  const [visible, setVisible] = useState(true)
  const [running, setRunning] = useState(false)
  const timers = useRef<number[]>([])

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setVisible(false)
  }, [])

  // Hold page scroll while the takeover is up.
  useEffect(() => {
    if (!visible) {
      lenis?.start()
      document.documentElement.classList.remove('intro-lock')
      onDone?.()
      return
    }
    lenis?.stop()
    document.documentElement.classList.add('intro-lock')
  }, [visible, lenis, onDone])

  // Run the timeline.
  useEffect(() => {
    if (!visible) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') finish()
    }
    window.addEventListener('keydown', onKey)
    setRunning(true)
    const pending = timers.current
    if (reduce) {
      setTyped(ANSWER.length)
      setPhase('claim')
      pending.push(window.setTimeout(finish, 2200))
    } else {
      let t = 300
      FLIGHT.forEach((f, i) => {
        if (i > 0) t += i === PAUSE_INDEX ? PAUSE_MS : f * 0.42
        pending.push(window.setTimeout(() => setTyped(i + 1), t))
      })
      pending.push(window.setTimeout(() => setPhase('read'), TIMES.read))
      pending.push(window.setTimeout(() => setPhase('claim'), TIMES.claim))
      pending.push(window.setTimeout(finish, TIMES.done))
    }
    return () => {
      pending.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
    }
  }, [visible, reduce, finish])

  const reading = phase === 'read'
  const waiting = typed >= PAUSE_INDEX // pause band grows while the next key is held back

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            className="intro"
            role="dialog"
            aria-modal="true"
            aria-label="PsyClick introduction"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="intro-grid" aria-hidden="true" />

            <div className="intro-top">
              <span className="intro-brand">
                <img src="/psyclick-icon.webp" alt="" width={22} height={22} />
                PsyClick
              </span>
              <span className="intro-meta mono">Illustrative session · Emotional Response Task</span>
            </div>

            <div className="intro-stage">
              <AnimatePresence mode="wait">
                {phase !== 'claim' ? (
                  <motion.div
                    key="scene"
                    className="intro-scene"
                    exit={{ opacity: 0, y: -24 }}
                    transition={{ duration: 0.4, ease: EASE }}
                  >
                    <p className="intro-prompt mono">
                      Level C · Self-evaluation · <span>Describe a decision you doubted.</span>
                    </p>
                    <p className="intro-answer">
                      {ANSWER.slice(0, typed)}
                      <span className="intro-caret" />
                    </p>

                    {/* Keystroke strip: spacing = flight time, spike height = dwell time */}
                    <svg className={`intro-strip${reading ? ' is-read' : ''}`} viewBox={`0 0 ${W} 170`} aria-hidden="true">
                      <line className="is-base" x1="20" x2={W - 20} y1={BASE} y2={BASE} />
                      <g className={`intro-band${waiting ? ' on' : ''}`}>
                        <rect x={KX[PAUSE_INDEX - 1] + 8} y="18" width={KX[PAUSE_INDEX] - KX[PAUSE_INDEX - 1] - 16} height={BASE - 18} rx="10" />
                        <text x={(KX[PAUSE_INDEX - 1] + KX[PAUSE_INDEX]) / 2} y="40">
                          0.9 s hesitation
                        </text>
                      </g>
                      {KX.map((x, i) => (
                        <line
                          key={i}
                          className={`intro-spike${i < typed ? ' on' : ''}${i === PAUSE_INDEX ? ' amber' : ''}`}
                          x1={x}
                          x2={x}
                          y1={BASE}
                          y2={BASE - DWELL[i] * 0.85}
                        />
                      ))}
                      {reading && (
                        <>
                          <motion.path
                            className="intro-cursor-glow"
                            d={CURSOR_D}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.9, ease: 'easeInOut' }}
                          />
                          <motion.path
                            className="intro-cursor"
                            d={CURSOR_D}
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.9, ease: 'easeInOut' }}
                          />
                          {[
                            [470, 112],
                            [630, 118],
                          ].map(([cx, cy], i) => (
                            <motion.circle
                              key={cx}
                              className="intro-ring"
                              cx={cx}
                              cy={cy}
                              r="11"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.35 + i * 0.2, duration: 0.35, ease: EASE }}
                            />
                          ))}
                        </>
                      )}
                    </svg>

                    {/* Readout */}
                    <div className={`intro-readout${reading ? ' on' : ''}`}>
                      <div className="intro-gauge">
                        <svg viewBox="0 0 64 64" aria-hidden="true">
                          <circle className="is-track" cx="32" cy="32" r="26" pathLength={1} />
                          {reading && (
                            <motion.circle
                              className="is-val"
                              cx="32"
                              cy="32"
                              r="26"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 92 / 114 }}
                              transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
                            />
                          )}
                          <line className="is-limit" x1="32" y1="2" x2="32" y2="12" style={{ transform: `rotate(${(78 / 114) * 360}deg)` }} />
                        </svg>
                        <div>
                          <strong className="mono">1.18×</strong>
                          <small>T² 92 · healthy limit 78</small>
                        </div>
                      </div>
                      <ul className="intro-metrics">
                        {METRICS.map(([k, v], i) => (
                          <li key={k} style={{ transitionDelay: reading ? `${0.15 + i * 0.08}s` : '0s' }}>
                            <small className="mono">{k}</small>
                            <b>{v}</b>
                          </li>
                        ))}
                      </ul>
                      <span className="intro-flag" style={{ transitionDelay: reading ? '0.7s' : '0s' }}>
                        <span className="flag-dot amber" /> Follow up · slowed responses
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="claim"
                    className="intro-claim"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {['The words said fine.', 'The rhythm didn’t.'].map((line, i) => (
                      <span className="line-mask" key={line}>
                        <motion.span
                          initial={{ y: '110%' }}
                          animate={{ y: '0%' }}
                          transition={{ duration: 0.7, ease: EASE, delay: 0.05 + i * 0.22 }}
                        >
                          {line}
                        </motion.span>
                      </span>
                    ))}
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.55 }}
                    >
                      PsyClick surfaces the signals a session can miss, for the clinician to review.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="intro-bottom">
              <span className="intro-progress" aria-hidden="true">
                {running && <i style={{ animationDuration: `${reduce ? 2200 : TIMES.done}ms` }} />}
              </span>
              <button className="intro-skip" onClick={finish}>
                Skip intro
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
