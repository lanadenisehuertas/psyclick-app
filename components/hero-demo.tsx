'use client'

import { motion, useInView, useReducedMotion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Keyboard, MousePointer2 } from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'
import { EASE } from '@/components/landing-kit'

/*
 * Hero product demo, drawn in DOM/SVG (no WebGL, so it shows everywhere).
 * Tells the study in one glance:
 *   the PsyClick window — a client answers a written prompt
 *   (1) keystrokes      — each key lands as a spike; the pause before "fine" shows amber
 *   (2) cursor          — the hesitation loop on the way to "Next"
 *   (3) report          — self-report looks mild, the rhythm says follow up
 * The typing loops only while the demo is on screen; static for reduced motion.
 */

// Glass keycaps + pointer floating behind the demo cards (WebGL, client only)
const HeroGlass = dynamic(() => import('@/components/hero-glass'), { ssr: false, loading: () => null })

const SENTENCE = 'Honestly, it was fine.'
const PAUSE_AT = SENTENCE.indexOf('fine')
const STEP_MS = 85
const PAUSE_MS = 1100
const HOLD_MS = 2600

export default function HeroDemo({ play }: { play: boolean }) {
  const reduce = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const live = useInView(ref, { margin: '-10% 0px' })
  const [typed, setTyped] = useState(reduce ? SENTENCE.length : 0)
  // the 3D layer only fits the overlapping layout (stacked cards on phones skip it)
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 601px)')
    const update = () => setWide(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (reduce) {
      setTyped(SENTENCE.length)
      return
    }
    if (!play || !live) return
    let n = 0
    let id = 0
    const tick = () => {
      if (n >= SENTENCE.length) {
        id = window.setTimeout(() => {
          n = 0
          setTyped(0)
          id = window.setTimeout(tick, 500)
        }, HOLD_MS)
        return
      }
      n += 1
      setTyped(n)
      id = window.setTimeout(tick, n === PAUSE_AT ? PAUSE_MS : STEP_MS + ((n * 37) % 50))
    }
    id = window.setTimeout(tick, 400)
    return () => clearTimeout(id)
  }, [play, live, reduce])

  const waiting = typed === PAUSE_AT
  const done = typed === SENTENCE.length
  const show = (i: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: play ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    transition: { duration: 0.8, ease: EASE, delay: 0.5 + i * 0.12 },
  })

  return (
    <div
      ref={ref}
      className={`hd${done ? ' is-done' : ''}${waiting ? ' is-wait' : ''}`}
      role="img"
      aria-label="Illustration: a client types “Honestly, it was fine.” in PsyClick. PsyClick times each keystroke and cursor movement, notices a long pause and a hesitant cursor, and flags Follow up even though the PHQ-9 score is mild."
    >
      <div className="hd-glass" aria-hidden="true">
        {play && wide && <HeroGlass still={!!reduce} />}
      </div>

      {/* The app window */}
      <motion.div className="hd-window" {...show(0)}>
        <div className="hd-bar">
          <img src="/psyclick-icon.webp" alt="" width={18} height={18} />
          <b>PsyClick</b>
          <span className="hd-bar-task">Emotional Response Task</span>
          <span className="hd-rec mono">
            <i /> timing only
          </span>
        </div>
        <div className="hd-body">
          <small className="mono">Prompt 4 of 12 · Level B</small>
          <p className="hd-q">How did you handle a stressful moment this week?</p>
          <div className="hd-input">
            {SENTENCE.slice(0, typed)}
            <span className="hd-caret" />
          </div>
          <div className="hd-spikes" aria-hidden="true">
            {SENTENCE.split('').map((c, i) => (
              <Fragment key={i}>
                {i === PAUSE_AT && (
                  <span className={`hd-gap${typed >= PAUSE_AT ? ' on' : ''}`}>
                    <em className="mono">pause 1.1 s</em>
                  </span>
                )}
                <i
                  className={`${i < typed ? 'on' : ''}${i === PAUSE_AT ? ' amber' : ''}`}
                  style={{ height: `${i === PAUSE_AT ? 92 : 38 + ((i * 53) % 46)}%` }}
                />
              </Fragment>
            ))}
          </div>
          <div className="hd-foot">
            <span className="hd-count mono">{typed} / 500</span>
            <span className="hd-next">Next</span>
          </div>
        </div>
      </motion.div>

      {/* (1) keystrokes */}
      <motion.div className="hd-card hd-keys" {...show(1)}>
        <span className="hd-step mono">1</span>
        <div className="hd-card-head">
          <Keyboard size={15} /> Keystrokes
        </div>
        <div className="hd-caps" aria-hidden="true">
          {['f', 'i', 'n', 'e'].map((k, i) => (
            <kbd key={k} className={i === 0 ? 'late' : ''} style={{ animationDelay: `${i * 0.18}s` }}>
              {k}
            </kbd>
          ))}
        </div>
        <dl>
          <div>
            <dt className="mono">Flight</dt>
            <dd>+38%</dd>
          </div>
          <div>
            <dt className="mono">Dwell</dt>
            <dd>+24%</dd>
          </div>
        </dl>
      </motion.div>

      {/* (2) cursor */}
      <motion.div className="hd-card hd-cursor" {...show(2)}>
        <span className="hd-step mono">2</span>
        <div className="hd-card-head">
          <MousePointer2 size={15} /> Cursor
        </div>
        <svg viewBox="0 0 200 84" aria-hidden="true">
          <path
            className="hd-path"
            d="M8,70 C40,66 62,40 92,44 C118,48 120,72 102,70 C82,68 96,30 128,28 C158,26 172,18 192,12"
          />
          <circle className="hd-ring" cx="104" cy="66" r="9" />
          <circle className="hd-tip" cx="192" cy="12" r="4" />
        </svg>
        <small className="mono">hesitation loop · path entropy ↑</small>
      </motion.div>

      {/* (3) report */}
      <motion.div className="hd-card hd-report" {...show(3)}>
        <span className="hd-step mono">3</span>
        <div className="hd-card-head">Clinician report</div>
        <div className="hd-row">
          <span>PHQ-9 self-report</span>
          <b>6 · mild</b>
        </div>
        <div className="hd-row">
          <span>Typing &amp; cursor vs. baseline</span>
          <b className="mono">1.18×</b>
        </div>
        <div className="hd-flag">
          <span className="flag-dot amber" /> Follow up · slowed responses
        </div>
      </motion.div>
    </div>
  )
}
