'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useLenis } from 'lenis/react'
import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Opening takeover: an illustrative session told in four beats.
 *   1. say   — the client types "I'm fine" in the emotional response task
 *   2. hands — keystroke timing and a hesitant cursor path surface underneath
 *   3. sees  — those signals resolve into a Follow up decision-support result
 *   4. claim — the thesis line, then the overlay lifts to reveal the page
 * Shown once per browser session; skippable; collapsed for reduced motion.
 */

const STORAGE_KEY = 'pc-intro-seen'
const EASE = [0.22, 1, 0.36, 1] as const

const ANSWER = 'It worked out fine, I think.'
// Per-character delay before each key lands (ms). The long gap before
// "fine" is the hesitation the timeline calls out.
const KEY_DELAYS = [140, 120, 150, 110, 130, 120, 140, 110, 130, 170, 120, 140, 130, 260, 1350, 210, 190, 230, 200, 320, 240, 260, 220, 240, 210, 250, 230, 300]
const PAUSE_INDEX = 14 // the "f" of "fine"
const DWELL = [62, 70, 58, 66, 74, 64, 60, 68, 72, 80, 66, 70, 64, 76, 124, 102, 98, 110, 96, 104, 112, 98, 106, 110, 100, 114, 108, 120]

type Phase = 'say' | 'hands' | 'sees' | 'claim' | 'done'

const PHASE_AT: Record<Exclude<Phase, 'say'>, number> = {
  hands: 5700,
  sees: 8100,
  claim: 10600,
  done: 13400,
}

export default function IntroTakeover({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion()
  const lenis = useLenis()
  const [phase, setPhase] = useState<Phase>('say')
  const [typed, setTyped] = useState(0)
  const [visible, setVisible] = useState(true)
  const timers = useRef<number[]>([])

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {}
    setVisible(false)
  }, [])

  // Decide whether to play at all.
  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === '1'
    } catch {}
    if (seen) setVisible(false)
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
    if (reduce) {
      setTyped(ANSWER.length)
      setPhase('claim')
      timers.current.push(window.setTimeout(finish, 2600))
      return
    }
    let t = 700
    KEY_DELAYS.forEach((d, i) => {
      t += i === PAUSE_INDEX ? d : d * 0.6
      timers.current.push(window.setTimeout(() => setTyped(i + 1), t))
    })
    ;(Object.keys(PHASE_AT) as (keyof typeof PHASE_AT)[]).forEach((p) => {
      timers.current.push(
        window.setTimeout(() => (p === 'done' ? finish() : setPhase(p)), PHASE_AT[p]),
      )
    })
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') finish()
    }
    window.addEventListener('keydown', onKey)
    const pending = timers.current
    return () => {
      pending.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
    }
  }, [visible, reduce, finish])

  const showSignals = phase !== 'say'
  const showVerdict = phase === 'sees' || phase === 'claim'

  return (
    <>
      {/* Hide before first paint for returning visitors in the same session */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('${STORAGE_KEY}')==='1')document.documentElement.classList.add('intro-seen')}catch(e){}`,
        }}
      />
      <AnimatePresence>
        {visible && (
          <motion.div
            className="intro"
            role="dialog"
            aria-modal="true"
            aria-label="PsyClick introduction"
            exit={{ clipPath: 'inset(0 0 100% 0 round 0 0 32px 32px)' }}
            transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            style={{ clipPath: 'inset(0 0 0% 0 round 0)' }}
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
              {/* Beat 1 — what the client says */}
              <motion.div
                className="intro-say"
                animate={{
                  y: phase === 'claim' ? -40 : 0,
                  opacity: phase === 'claim' ? 0 : 1,
                  filter: phase === 'claim' ? 'blur(10px)' : 'blur(0px)',
                }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <motion.p
                  className="intro-prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.2 }}
                >
                  Self-Evaluation · Level C · Describe a situation in which you doubted whether a decision you made was the right one.
                </motion.p>
                <p className="intro-answer">
                  {ANSWER.slice(0, typed)}
                  <span className="intro-caret" />
                </p>

                {/* Keystroke timeline: tick height = dwell, spacing = flight time */}
                <div className="intro-keys">
                  {ANSWER.split('').map((ch, i) => {
                    const landed = i < typed
                    const isPause = i === PAUSE_INDEX
                    return (
                      <span
                        key={i}
                        className={`intro-key${isPause ? ' pause' : ''}`}
                        style={{ marginLeft: i === 0 ? 0 : `calc(${Math.min(KEY_DELAYS[i] / 9, 150)}px * var(--key-k, 1))` }}
                      >
                        <motion.i
                          initial={{ scaleY: 0, opacity: 0 }}
                          animate={landed ? { scaleY: 1, opacity: 1 } : {}}
                          transition={{ duration: 0.25, ease: EASE }}
                          style={{ height: DWELL[i] * 0.5 }}
                        />
                        {isPause && showSignals && (
                          <motion.em
                            className="intro-callout"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: EASE }}
                          >
                            1.35 s hesitation
                          </motion.em>
                        )}
                      </span>
                    )
                  })}
                </div>
              </motion.div>

              {/* Beat 2 — what the hands show */}
              <AnimatePresence>
                {showSignals && phase !== 'claim' && (
                  <motion.div
                    className="intro-hands"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: 'blur(8px)' }}
                    transition={{ duration: 0.6 }}
                  >
                    <svg viewBox="0 0 520 150" className="intro-path" aria-hidden="true">
                      <motion.path
                        d="M8,128 C70,120 120,70 190,74 C240,77 262,110 236,118 C206,128 214,66 262,58 C300,52 318,92 300,96 C282,100 300,40 360,36 C420,32 460,22 512,14"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.8, ease: 'easeInOut' }}
                      />
                      <motion.circle
                        r="6"
                        cx="512"
                        cy="14"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.7, duration: 0.3 }}
                      />
                    </svg>
                    <div className="intro-chips">
                      {[
                        ['Flight time', '+38% vs. baseline'],
                        ['Dwell time', '+24% vs. baseline'],
                        ['Path entropy', 'erratic trajectory'],
                        ['Pause frequency', '>500 ms stops ↑'],
                      ].map(([k, v], i) => (
                        <motion.span
                          key={k}
                          className="intro-chip"
                          initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                          transition={{ duration: 0.5, ease: EASE, delay: 0.5 + i * 0.22 }}
                        >
                          <small className="mono">{k}</small>
                          {v}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Beat 3 — what PsyClick sees */}
              <AnimatePresence>
                {showVerdict && phase !== 'claim' && (
                  <motion.div
                    className="intro-verdict"
                    initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                    transition={{ duration: 0.7, ease: EASE }}
                  >
                    <div className="intro-verdict-row">
                      <div>
                        <small className="mono">PHQ-9 self-report</small>
                        <strong>6</strong>
                        <span>mild</span>
                      </div>
                      <div>
                        <small className="mono">Behaviour change vs. healthy limit</small>
                        <div className="intro-bar">
                          <motion.i
                            initial={{ width: '6%' }}
                            animate={{ width: '64%' }}
                            transition={{ duration: 1.2, ease: EASE, delay: 0.3 }}
                          />
                          <b style={{ left: '50%' }} title="threshold" />
                        </div>
                        <span>92 · healthy limit 78 · upper limit 114</span>
                      </div>
                    </div>
                    <motion.div
                      className="intro-flag"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: EASE, delay: 1.2 }}
                    >
                      <span className="flag-dot amber" /> Follow up · slowed responses (pattern clarity 68%)
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Beat 4 — the claim */}
              <AnimatePresence>
                {phase === 'claim' && (
                  <motion.div
                    className="intro-claim"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    {['The words said fine.', 'The rhythm didn’t.'].map((line, i) => (
                      <span className="line-mask" key={line}>
                        <motion.span
                          initial={{ y: '110%' }}
                          animate={{ y: '0%' }}
                          transition={{ duration: 0.9, ease: EASE, delay: 0.1 + i * 0.35 }}
                        >
                          {line}
                        </motion.span>
                      </span>
                    ))}
                    <motion.p
                      initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.8, ease: EASE, delay: 1 }}
                    >
                      People can mask distress in a session. Their typing and cursor rhythm often can’t. PsyClick surfaces those signals for the clinician to review.
                    </motion.p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="intro-bottom">
              <div className="intro-steps mono" aria-hidden="true">
                {(['say', 'hands', 'sees', 'claim'] as const).map((p, i) => {
                  const order = ['say', 'hands', 'sees', 'claim']
                  const on = order.indexOf(phase) >= i
                  return (
                    <span key={p} className={on ? 'on' : ''}>
                      {['What they say', 'What their hands show', 'What PsyClick flags', 'Why it matters'][i]}
                    </span>
                  )
                })}
              </div>
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
