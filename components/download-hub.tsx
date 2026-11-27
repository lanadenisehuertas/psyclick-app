'use client'

import { motion, useInView } from 'framer-motion'
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
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="dl-magnet">
      {children}
    </a>
  )
}

export default function DownloadHub() {
  const [step, setStep] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const ed = APP

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
    >
      <div className="hub-inner">
        <Reveal className="hub-head">
          <h2>
            PsyClick <span className="gt">for Windows</span>
          </h2>
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

            {/* What step 3 looks like, so the Windows warning is expected rather than alarming */}
            <figure className={`hub-ss${step === 2 ? ' on' : ''}`}>
              <div className="hub-ss-win" aria-hidden="true">
                <b>Windows protected your PC</b>
                <p>
                  Microsoft Defender SmartScreen prevented an unrecognized app from starting. <u>More info</u>
                </p>
                <div className="hub-ss-btns">
                  <span className="hl">Run anyway</span>
                  <span>Don’t run</span>
                </div>
              </div>
              <figcaption>
                Step 3 may show this blue window. Click <b>More info</b>, then <b>Run anyway</b>.
              </figcaption>
            </figure>
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
