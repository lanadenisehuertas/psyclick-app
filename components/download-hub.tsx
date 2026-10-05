'use client'

import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Check,
  CloudOff,
  ExternalLink,
  Download,
  KeyRound,
  Monitor,
  MousePointer2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AnimatedLogo from '@/components/animated-logo'
import { EASE, Reveal } from '@/components/landing-kit'

/*
 * The download centrepiece: one app for the whole clinic, shown in a
 * pointer-tilted window, a magnetic download button, and the real install
 * steps (including the SmartScreen prompt).
 */

// Update file and href when a new installer is uploaded.
const APP = {
  desc: 'One app for the whole clinic. Administrators, clinicians and auditors each sign in with their own ID, on any computer.',
  includes: [
    'Dashboard, clients and a worklist of who needs attention',
    'Consent, typing and clicking warm-ups',
    'PHQ-9, GAD-7 and twelve short written prompts',
    'Report: what stood out, profile radar, attention heatmap',
    'Works offline, syncs when online',
    'Audit log and Security center',
  ],
  file: 'PsyClick-Clinician-Setup.exe',
  href: 'https://drive.google.com/file/d/1QnQB82jyHkmiTClwGfXqP6NFxmm81YvH/view?usp=drive_link',
  signIn: 'Sign in with the ID you were given',
}

const REQS = [
  { icon: Monitor, label: 'Windows 10 or later' },
  { icon: CloudOff, label: 'Works offline · syncs when online' },
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

function AppPreview() {
  const stats: [string, string, string][] = [
    ['15', 'Clients', 'mint'],
    ['6', 'This week', 'cyan'],
    ['9', 'Follow-up', 'peri'],
    ['4', 'Self-harm', 'alert'],
  ]
  const rows: [string, string, string][] = [
    ['C-015', 'review', 'Review now'],
    ['C-002', 'follow', 'Follow up'],
    ['C-001', 'clear', 'No concerns'],
  ]
  return (
    <div className="pv pv-dash">
      <aside>
        <span className="pv-logo" />
        <span className="pv-new" />
        <i className="on" />
        <i />
        <i />
        <i />
      </aside>
      <div className="pv-main">
        <div className="pv-start">
          <span>Start a new assessment</span>
          <b>Begin</b>
        </div>
        <div className="pv-stats">
          {stats.map(([v, l, t], i) => (
            <motion.div
              key={l}
              className={`pd-stat t-${t}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06, duration: 0.4, ease: EASE }}
            >
              <strong>{v}</strong>
              <small>{l}</small>
            </motion.div>
          ))}
        </div>
        <div className="pv-chart">
          {[30, 0, 52, 30, 76, 52, 100].map((h, i) => (
            <motion.i
              key={i}
              className={i === 6 ? 'today' : ''}
              initial={{ height: '6%' }}
              animate={{ height: `${Math.max(6, h)}%` }}
              transition={{ delay: 0.25 + i * 0.05, duration: 0.6, ease: EASE }}
            />
          ))}
        </div>
        <div className="pv-rows">
          {rows.map(([id, f, label], i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.07, duration: 0.4, ease: EASE }}
            >
              <span>{id}</span>
              <span className={`pd-pill ${f}`}>{label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DownloadHub() {
  const [step, setStep] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const ed = APP

  // pointer spotlight + window tilt
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(px, [0, 1], [-14, 8]), { stiffness: 80, damping: 18 })
  const rotateX = useSpring(useTransform(py, [0, 1], [10, -6]), { stiffness: 80, damping: 18 })

  // The install steps rotate only while the section is on screen.
  const live = useInView(sectionRef, { margin: '200px' })
  useEffect(() => {
    if (!live) return
    const id = window.setInterval(() => setStep((s) => (s + 1) % 4), 2200)
    return () => clearInterval(id)
  }, [live])

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
          <p>One installer for every role. Run the setup and sign in with the ID you were given. Everything is stored on the computer and works without internet.</p>
        </Reveal>

        <div className="hub-grid">
          <div className="hub-left">
            <div className="hub-app">
              <AnimatedLogo size={112} />
              <div>
                <strong>PsyClick</strong>
                <small>Clinical decision support · Windows</small>
              </div>
            </div>

            <div className="hub-detail">
              <p className="hub-desc">{ed.desc}</p>
              <ul className="hub-includes">
                {ed.includes.map((it, i) => (
                  <motion.li
                    key={it}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.3 }}
                  >
                    <Check size={14} /> {it}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="hub-cta">
              <MagneticButton href={ed.href}>
                <Download size={18} />
                Download PsyClick
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
                  <em>PsyClick</em>
                </div>
                <div className="hub-window-body">
                  <AppPreview />
                </div>
                <span className="hub-chip c1">
                  <span className="flag-dot amber" /> Follow up · slowing
                </span>
                <span className="hub-chip c2 mono">T² 92 · limit 78</span>
                <span className="hub-chip c3">
                  <Check size={12} /> Saved as PDF
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
