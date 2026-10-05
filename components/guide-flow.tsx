'use client'

import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion'
import { Check, Download, FileText, Keyboard, MousePointer2, ClipboardList, Brain, UserCheck } from 'lucide-react'
import { createContext, useContext, useEffect, useRef, useState, useTransition } from 'react'
import { EASE, Eyebrow, Reveal } from '@/components/landing-kit'
import { CLIENT_STEPS, CLINICIAN_STEPS } from '@/lib/landing-data'

/*
 * How a session runs, as a scroll-driven flow. The step nearest the middle of
 * the viewport becomes active; the sticky device on the left shows the matching
 * PsyClick screen (copy and colors follow the app's own pages).
 */

type Role = 'clinician' | 'client'
type Phase = 'intake' | 'keyboard' | 'mouse' | 'questionnaire' | 'emotional' | 'review'

const FLOWS: Record<Role, { steps: string[]; phases: Phase[] }> = {
  clinician: {
    steps: CLINICIAN_STEPS,
    phases: ['intake', 'intake', 'intake', 'intake', 'keyboard', 'mouse', 'questionnaire', 'questionnaire', 'emotional', 'review', 'review', 'review'],
  },
  client: {
    steps: CLIENT_STEPS,
    phases: ['intake', 'keyboard', 'mouse', 'questionnaire', 'emotional', 'review'],
  },
}

const STAGES = [
  { id: 'setup', label: 'Setup', phases: ['intake'] },
  { id: 'calibration', label: 'Calibration', phases: ['keyboard', 'mouse'] },
  { id: 'screening', label: 'Screening', phases: ['questionnaire', 'emotional'] },
  { id: 'review', label: 'Review', phases: ['review'] },
]

const PHASE_ICON: Record<Phase, typeof Check> = {
  intake: UserCheck,
  keyboard: Keyboard,
  mouse: MousePointer2,
  questionnaire: ClipboardList,
  emotional: Brain,
  review: FileText,
}

const PASSAGE =
  'Photosynthesis is the process by which plants use sunlight, water, and carbon dioxide to produce oxygen and energy in the form of sugar.'

/* ── Device screens (mirroring the PsyClick app) ── */

// The demo screens tick on timers. They only tick while the section is on
// screen, so an off-screen section costs nothing; on screen nothing changes.
const FlowLive = createContext(true)

function Typing() {
  const [n, setN] = useState(0)
  const live = useContext(FlowLive)
  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setN((v) => (v >= PASSAGE.length ? 0 : v + 1)), 55)
    return () => clearInterval(id)
  }, [live])
  const pct = Math.round((n / PASSAGE.length) * 100)
  return (
    <div className="scr">
      <h5>Typing Task</h5>
      <p className="scr-sub">Type the text below exactly as shown, at your normal pace.</p>
      <div className="scr-card">
        <small>Copy this text</small>
        <p className="scr-passage">{PASSAGE}</p>
      </div>
      <div className="scr-card">
        <small>Type here</small>
        <p className="scr-typed">
          {PASSAGE.slice(0, n)}
          <b />
        </p>
      </div>
      <div className="scr-progress">
        <i style={{ width: `${pct}%`, background: pct >= 80 ? '#36C98E' : '#2bb8cf' }} />
      </div>
      <span className="scr-meta">{pct}% complete</span>
    </div>
  )
}

const CIRCLES = [
  [22, 30],
  [70, 22],
  [48, 58],
  [16, 74],
  [78, 70],
]

function Clicks() {
  const [k, setK] = useState(0)
  const live = useContext(FlowLive)
  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setK((v) => (v + 1) % 7), 700)
    return () => clearInterval(id)
  }, [live])
  return (
    <div className="scr">
      <h5>Click Task</h5>
      <p className="scr-sub">Click each circle in order, numbered 1 to 5.</p>
      <div className="scr-field">
        <span className="scr-pill">{Math.min(k, 5)} / 5 clicked</span>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            points={CIRCLES.slice(0, Math.min(k, 5) + (k < 5 ? 1 : 0))
              .map(([x, y]) => `${x},${y}`)
              .join(' ')}
          />
        </svg>
        {CIRCLES.map(([x, y], i) => (
          <span
            key={i}
            className={`scr-dot${i < k ? ' done' : i === k ? ' active' : ''}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {i < k ? 'OK' : i + 1}
          </span>
        ))}
      </div>
    </div>
  )
}

const LIKERT = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']

function Questionnaire() {
  const [sel, setSel] = useState(-1)
  const live = useContext(FlowLive)
  useEffect(() => {
    if (!live) return
    const seq = [-1, 0, 1, 1, -1]
    let i = 0
    const id = window.setInterval(() => setSel(seq[(i = (i + 1) % seq.length)]), 900)
    return () => clearInterval(id)
  }, [live])
  return (
    <div className="scr">
      <h5>PHQ-9</h5>
      <p className="scr-sub">Over the last 2 weeks, how often have you been bothered by…</p>
      <div className="scr-card">
        <small>Item 3 of 9</small>
        <p className="scr-question">Trouble falling or staying asleep, or sleeping too much</p>
        <div className="scr-likert">
          {LIKERT.map((l, i) => (
            <span key={l} className={i === sel ? 'on' : ''}>
              <i />
              {l}
            </span>
          ))}
        </div>
      </div>
      <div className="scr-progress">
        <i style={{ width: '33%' }} />
      </div>
    </div>
  )
}

const REPLY = 'Usually near the end of the week when everything piles up'

function Emotional() {
  const [n, setN] = useState(0)
  const live = useContext(FlowLive)
  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setN((v) => (v >= REPLY.length + 12 ? 0 : v + 1)), 75)
    return () => clearInterval(id)
  }, [live])
  return (
    <div className="scr">
      <h5>Emotional Response Task</h5>
      <p className="scr-sub">Level A · routine situation · no time limit</p>
      <div className="scr-card">
        <small>Prompt</small>
        <p className="scr-question">
          Describe a typical situation in which you feel <mark>behind</mark> on tasks or deadlines.
        </p>
      </div>
      <div className="scr-card">
        <small>Your response</small>
        <p className="scr-typed">
          {REPLY.slice(0, n)}
          <b />
        </p>
      </div>
      <span className="scr-meta">Only timing is measured · {Math.min(n, REPLY.length)} / 500</span>
    </div>
  )
}

function Intake() {
  return (
    <div className="scr">
      <h5>Set up the session</h5>
      <p className="scr-sub">Choose the client and record their consent.</p>
      <div className="scr-card">
        <small>Client code</small>
        <p className="scr-field-line">C-016</p>
      </div>
      <div className="scr-card">
        <small>Consent</small>
        <p className="scr-consent">
          <motion.span
            className="scr-check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 18 }}
          >
            <Check size={12} />
          </motion.span>
          The client understands and agrees to this recording
        </p>
      </div>
      <span className="scr-btn">Start assessment for C-016</span>
    </div>
  )
}

function Review() {
  return (
    <div className="scr">
      <h5>Assessment report</h5>
      <p className="scr-sub">Client C-016 · Mon, 5 Oct 2026</p>
      <div className="scr-banner">
        <span className="flag-dot amber" /> Follow up · slowed responses
        <em>Not a diagnosis</em>
      </div>
      <div className="scr-metrics">
        {[
          ['Behaviour change', '92', 'limit 78', 'cyan'],
          ['Depression', '6', 'Mild', 'mint'],
          ['Anxiety', '4', 'Minimal', 'peri'],
        ].map(([k, v, s, t]) => (
          <div key={k} className={`pd-stat t-${t}`}>
            <small>{k}</small>
            <strong>{v}</strong>
            <span>{s}</span>
          </div>
        ))}
      </div>
      <span className="scr-btn">
        <Download size={13} /> Save as PDF
      </span>
    </div>
  )
}

function Screen({ phase }: { phase: Phase }) {
  switch (phase) {
    case 'intake':
      return <Intake />
    case 'keyboard':
      return <Typing />
    case 'mouse':
      return <Clicks />
    case 'questionnaire':
      return <Questionnaire />
    case 'emotional':
      return <Emotional />
    case 'review':
      return <Review />
  }
}

/* ── Section ── */

export default function GuideFlow() {
  const [role, setRole] = useState<Role>('clinician')
  const [, startTransition] = useTransition()
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const live = useInView(sectionRef)
  const { steps, phases } = FLOWS[role]

  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 0.55', 'end 0.55'] })
  const fill = useSpring(scrollYProgress, { stiffness: 140, damping: 24 })
  const railScale = useTransform(fill, [0, 1], [0, 1])
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    const i = Math.max(0, Math.min(steps.length - 1, Math.round(v * (steps.length - 1))))
    setActive((prev) => (prev === i ? prev : i))
  })
  useEffect(() => setActive(0), [role])

  const phase = phases[active]
  const stageIdx = STAGES.findIndex((s) => s.phases.includes(phase))
  const PhaseIcon = PHASE_ICON[phase]

  return (
    <FlowLive.Provider value={live}>
    <section id="guide" className="flow" ref={sectionRef}>
      <div className="flow-glow" aria-hidden="true" />
      <div className="flow-inner">
        <div className="flow-head">
          <Reveal>
            <Eyebrow dark>How it works</Eyebrow>
            <h2>One calm path through a session.</h2>
          </Reveal>
          <Reveal delay={0.1} className="flow-head-side">
            <p>Every session follows the same order, so results stay comparable from visit to visit.</p>
            <div className="segmented dark" role="tablist" aria-label="Choose a flow">
              {(['clinician', 'client'] as const).map((r) => (
                <button
                  key={r}
                  role="tab"
                  aria-selected={role === r}
                  className={role === r ? 'on' : ''}
                  onClick={() => startTransition(() => setRole(r))}
                >
                  {r === 'clinician' ? 'Clinician' : 'Client'}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="flow-body">
          <div className="flow-device-col">
            <div className="flow-device-wrap">
              <div className="flow-stages" aria-hidden="true">
                {STAGES.map((s, i) => (
                  <span key={s.id} className={i < stageIdx ? 'past' : i === stageIdx ? 'on' : ''}>
                    <i />
                    {s.label}
                  </span>
                ))}
              </div>
              <motion.div
                className="flow-device"
                animate={{ rotateY: -10 + (active % 3) * 2, rotateX: 6 }}
                transition={{ type: 'spring', stiffness: 60, damping: 16 }}
              >
                <div className="flow-device-bar">
                  <span />
                  <span />
                  <span />
                  <em>PsyClick</em>
                  <b className="mono">
                    Step {String(active + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
                  </b>
                </div>
                <div className="flow-device-screen">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${role}-${phase}`}
                      initial={{ opacity: 0, y: 18, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                      transition={{ duration: 0.45, ease: EASE }}
                    >
                      <Screen phase={phase} />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <motion.span
                  key={phase}
                  className="flow-float"
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ duration: 0.5, ease: EASE, delay: 0.15 }}
                >
                  <PhaseIcon size={15} /> {STAGES[stageIdx]?.label}
                </motion.span>
              </motion.div>
            </div>
          </div>

          <ol className="flow-steps" ref={listRef} key={role}>
            <span className="flow-rail" aria-hidden="true">
              <motion.i style={{ scaleY: railScale }} />
            </span>
            {steps.map((s, i) => {
              const d = i - active
              const Icon = PHASE_ICON[phases[i]]
              return (
                <motion.li
                  key={`${role}-${i}`}
                  className={`flow-step${d === 0 ? ' on' : d < 0 ? ' past' : ''}`}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  animate={{
                    scale: d === 0 ? 1.03 : 1,
                    rotateX: Math.max(-14, Math.min(14, d * -3.5)),
                    z: d === 0 ? 40 : 0,
                  }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <span className="flow-node">
                    <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  </span>
                  <div className="flow-step-body">
                    <p>{s}</p>
                    <span className="flow-tag">
                      <Icon size={12} /> {STAGES.find((st) => st.phases.includes(phases[i]))?.label}
                    </span>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
    </FlowLive.Provider>
  )
}
