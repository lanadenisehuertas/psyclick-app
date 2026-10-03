'use client'

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Check,
  ExternalLink,
  Download,
  KeyRound,
  Monitor,
  MousePointer2,
  ShieldCheck,
  UserCheck,
  Wifi,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { EASE, Reveal } from '@/components/landing-kit'

/*
 * The download centrepiece: pick an edition, see that edition's app in a
 * pointer-tilted window, download through a magnetic button, and follow the
 * real install steps (including the SmartScreen prompt).
 */

type Edition = 'clinician' | 'tester'

const EDITIONS = {
  clinician: {
    title: 'Clinician edition',
    tagline: 'The full clinical workflow',
    icon: UserCheck,
    desc: 'For registered clinicians running screening sessions from intake to exported report.',
    includes: ['Dashboard and client database', 'Client intake and consent', 'Calibration, PHQ-9, GAD-7, emotional task', 'Clinical Assessment Report and export', 'Audit log'],
    file: 'PsyClick-Clinician-Setup.exe',
    href: 'https://drive.google.com/file/d/1QnQB82jyHkmiTClwGfXqP6NFxmm81YvH/view?usp=drive_link',
    signIn: 'Sign in with your clinician ID',
  },
  tester: {
    title: 'Normative tester edition',
    tagline: 'Builds the reference baseline',
    icon: ShieldCheck,
    desc: 'For authorized testers whose sessions form the population baseline used in clinical comparisons.',
    includes: ['Normative Tester Portal', 'Same session flow as clients', 'Authorized session password', 'Not stored as a clinical record'],
    file: 'PsyClick-Tester-Setup.exe',
    href: 'https://drive.google.com/file/d/14UocPZpKoXTbJU9HiyT83Z0mE22xALeR/view?usp=drive_link',
    signIn: 'Enter tester ID and session password',
  },
} as const

const REQS = [
  { icon: Monitor, label: 'Windows 10 or later' },
  { icon: Wifi, label: 'Internet for cloud mode' },
  { icon: MousePointer2, label: 'Keyboard and mouse' },
  { icon: KeyRound, label: 'Clinic or research authorization' },
]

function MagneticButton({ href, children }: { href: string; children: React.ReactNode }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const x = useSpring(0, { stiffness: 220, damping: 16 })
  const y = useSpring(0, { stiffness: 220, damping: 16 })
  return (
    <motion.a
      ref={ref}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="dl-magnet"
      style={{ x, y }}
      onPointerMove={(e) => {
        const r = ref.current!.getBoundingClientRect()
        x.set((e.clientX - (r.left + r.width / 2)) * 0.18)
        y.set((e.clientY - (r.top + r.height / 2)) * 0.3)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      whileTap={{ scale: 0.97 }}
    >
      <span className="dl-magnet-shine" aria-hidden="true" />
      {children}
    </motion.a>
  )
}

function ClinicianPreview() {
  return (
    <div className="pv pv-dash">
      <aside>
        <span className="pv-logo" />
        <i className="on" />
        <i />
        <i />
        <i />
      </aside>
      <div className="pv-main">
        <div className="pv-top">
          <span className="pv-search" />
          <span className="pv-cta">+ New Intake</span>
        </div>
        <div className="pv-stats">
          {[
            ['48', 'Total Clients', '#E0F9F9', '#0ABFBC'],
            ['12', 'This Week', '#EEF4FF', '#5BA4CF'],
            ['31', 'No Concerns', '#E8FBF2', '#36C98E'],
            ['17', 'Need Review', '#FFF0F0', '#F27C7C'],
          ].map(([v, l, bg, c], i) => (
            <motion.div
              key={l}
              style={{ background: bg }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: EASE }}
            >
              <strong style={{ color: c }}>{v}</strong>
              <small>{l}</small>
            </motion.div>
          ))}
        </div>
        <div className="pv-chart">
          {[30, 52, 40, 68, 44, 58, 90].map((h, i) => (
            <motion.i
              key={i}
              className={i === 6 ? 'today' : ''}
              initial={{ height: '6%' }}
              animate={{ height: `${h}%` }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: EASE }}
            />
          ))}
        </div>
        <div className="pv-rows">
          {[
            ['C-0148', 'AMBER'],
            ['C-0147', 'GREEN'],
            ['C-0146', 'RED'],
          ].map(([id, f], i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.07, duration: 0.4, ease: EASE }}
            >
              <span>{id}</span>
              <span className={`app-flag ${f.toLowerCase()}`}>{f}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TesterPreview() {
  return (
    <div className="pv pv-portal">
      <motion.div
        className="pv-portal-card"
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <img src="/psyclick-icon.png" alt="" width={44} height={44} />
        <strong>Normative Tester Portal</strong>
        <small>Authorized access only</small>
        <label>
          <span>Tester ID</span>
          <i>NT-0042</i>
        </label>
        <label>
          <span>Session password</span>
          <i>••••••••</i>
        </label>
        <b>Begin session</b>
      </motion.div>
    </div>
  )
}

export default function DownloadHub() {
  const [edition, setEdition] = useState<Edition>('clinician')
  const [step, setStep] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const ed = EDITIONS[edition]

  // pointer spotlight + window tilt
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(px, [0, 1], [-14, 8]), { stiffness: 80, damping: 18 })
  const rotateX = useSpring(useTransform(py, [0, 1], [10, -6]), { stiffness: 80, damping: 18 })

  useEffect(() => {
    const id = window.setInterval(() => setStep((s) => (s + 1) % 4), 2200)
    return () => clearInterval(id)
  }, [])

  const steps = [
    { title: 'Download the installer', note: ed.file },
    { title: 'Run the setup file', note: 'Installs PsyClick for Windows' },
    { title: 'If SmartScreen appears', note: 'More info → Run anyway, only if you trust the source' },
    { title: 'Open PsyClick', note: ed.signIn },
  ]

  return (
    <section
      id="download"
      ref={sectionRef}
      className="hub"
      onPointerMove={(e) => {
        const r = sectionRef.current!.getBoundingClientRect()
        const nx = (e.clientX - r.left) / r.width
        const ny = (e.clientY - r.top) / r.height
        px.set(nx)
        py.set(ny)
        sectionRef.current!.style.setProperty('--sx', `${nx * 100}%`)
        sectionRef.current!.style.setProperty('--sy', `${ny * 100}%`)
      }}
    >
      <div className="hub-grain" aria-hidden="true" />
      <div className="hub-spot" aria-hidden="true" />
      <div className="hub-orbs" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="hub-inner">
        <Reveal className="hub-head">
          <span className="hub-eyebrow">
            <i /> Download · First public release
          </span>
          <h2>PsyClick for Windows</h2>
          <p>Two installers, one for each role. Pick yours, run the setup, and sign in with the ID you were given.</p>
        </Reveal>

        <div className="hub-grid">
          <div className="hub-left">
            <div className="hub-switch" role="radiogroup" aria-label="Choose an edition">
              {(Object.keys(EDITIONS) as Edition[]).map((k) => {
                const E = EDITIONS[k]
                const Icon = E.icon
                const on = edition === k
                return (
                  <button key={k} role="radio" aria-checked={on} className={on ? 'on' : ''} onClick={() => setEdition(k)}>
                    {on && (
                      <motion.span
                        layoutId="hub-pill"
                        className="hub-switch-pill"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    <span className="hub-switch-icon">
                      <Icon size={18} />
                    </span>
                    <span className="hub-switch-text">
                      <strong>{E.title}</strong>
                      <small>{E.tagline}</small>
                    </span>
                  </button>
                )
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={edition}
                className="hub-detail"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="hub-desc">{ed.desc}</p>
                <ul className="hub-includes">
                  {ed.includes.map((it, i) => (
                    <motion.li
                      key={it}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                    >
                      <Check size={14} /> {it}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>

            <div className="hub-cta">
              <MagneticButton href={ed.href}>
                <Download size={18} />
                Download {edition === 'clinician' ? 'clinician' : 'tester'} edition
                <ArrowRight size={18} className="dl-magnet-arrow" />
              </MagneticButton>
              <span className="hub-file mono">
                {ed.file} · <ExternalLink size={11} /> opens Google Drive
              </span>
            </div>
          </div>

          <div className="hub-right">
            <div className="hub-stage">
              <motion.div className="hub-window" style={{ rotateX, rotateY }}>
                <div className="hub-window-bar">
                  <span />
                  <span />
                  <span />
                  <em>{edition === 'clinician' ? 'PsyClick — Clinical Edition' : 'PsyClick — Normative Tester'}</em>
                </div>
                <div className="hub-window-body">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={edition}
                      initial={{ opacity: 0, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, filter: 'blur(8px)' }}
                      transition={{ duration: 0.35 }}
                    >
                      {edition === 'clinician' ? <ClinicianPreview /> : <TesterPreview />}
                    </motion.div>
                  </AnimatePresence>
                </div>
                <span className="hub-chip c1">
                  <span className="flag-dot amber" /> AMBER · review
                </span>
                <span className="hub-chip c2 mono">T² 1.27×</span>
                <span className="hub-chip c3">
                  <Check size={12} /> Report exported
                </span>
              </motion.div>
            </div>

            <ol className="hub-steps">
              <span className="hub-steps-rail" aria-hidden="true">
                <motion.i animate={{ scaleX: (step + 1) / 4 }} transition={{ duration: 0.6, ease: EASE }} />
              </span>
              {steps.map((s, i) => (
                <li key={s.title} className={i === step ? 'on' : i < step ? 'past' : ''} onMouseEnter={() => setStep(i)}>
                  <span className="hub-step-num mono">{i + 1}</span>
                  <strong>{s.title}</strong>
                  <small>{s.note}</small>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <ul className="hub-reqs">
          {REQS.map((r) => {
            const Icon = r.icon
            return (
              <li key={r.label}>
                <Icon size={15} /> {r.label}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
