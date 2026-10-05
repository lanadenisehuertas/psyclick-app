'use client'

import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { Check, Database, GraduationCap, Lock, Mail } from 'lucide-react'
import { useRef } from 'react'
import { Eyebrow, Reveal } from '@/components/landing-kit'
import { TEAM_MEMBERS } from '@/lib/landing-data'

/* ─── Trust & safety: each principle gets a small working illustration ─── */

const FLAGS = [
  ['clear', 'No concerns'],
  ['follow', 'Follow up'],
  ['review', 'Review now'],
] as const

function FlagsArt() {
  // The float only runs while the card is on screen (an off-screen loop would
  // keep the whole page re-rendering every frame).
  const ref = useRef<HTMLDivElement>(null)
  const live = useInView(ref, { margin: '200px' })
  return (
    <div ref={ref} className="ta ta-flags" aria-hidden="true">
      {FLAGS.map(([f, label], i) => (
        <motion.span
          key={f}
          className={`pd-pill ${f}`}
          animate={live ? { y: [0, -6, 0] } : { y: 0 }}
          transition={live ? { duration: 3, repeat: Infinity, delay: i * 0.4, ease: 'easeInOut' } : { duration: 0.3 }}
        >
          {label}
        </motion.span>
      ))}
      <span className="ta-caption mono">signals, not diagnoses</span>
    </div>
  )
}

function ReviewArt() {
  return (
    <div className="ta ta-review" aria-hidden="true">
      <div className="ta-avatar">
        CL
        <svg viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="29" className="ta-ring" />
        </svg>
        <span className="ta-badge">
          <Check size={12} />
        </span>
      </div>
      <div className="ta-lines">
        <i />
        <i />
        <i />
      </div>
    </div>
  )
}

function TimingArt() {
  const word = 'I felt okay this week'
  return (
    <div className="ta ta-timing" aria-hidden="true">
      <p className="ta-text">
        {word.split('').map((c, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>
            {c === ' ' ? ' ' : c}
          </span>
        ))}
      </p>
      <div className="ta-bars">
        {word.split('').map((_, i) => (
          <i key={i} style={{ height: `${30 + ((i * 47) % 60)}%`, animationDelay: `${i * 0.05}s` }} />
        ))}
      </div>
    </div>
  )
}

function LocalArt() {
  return (
    <div className="ta ta-local" aria-hidden="true">
      <span className="ta-db">
        <Database size={34} strokeWidth={1.5} />
        <span className="ta-lock">
          <Lock size={12} />
        </span>
      </span>
      <span className="ta-baseline mono">session baseline · discarded at end</span>
    </div>
  )
}

const TRUST = [
  { art: FlagsArt, title: 'Decision support only', text: 'No concerns, Follow up and Review now are prompts for a clinician, never a diagnosis, emergency assessment, or replacement for protocol.' },
  { art: ReviewArt, title: 'Clinician review required', text: 'Every flag, score, and recommendation is reviewed by a qualified clinician before it informs any decision.' },
  { art: TimingArt, title: 'Timing, not content', text: 'What a client writes is never analyzed for meaning. Only the timing of keys and cursor movement is measured.' },
  { art: LocalArt, title: 'Local-first data', text: 'Everything is stored on the computer and works offline, then syncs when online so accounts work on any clinic computer. Built with RA 10173 in mind.' },
]

export function Trust() {
  return (
    <section className="section trust">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Trust & safety</Eyebrow>
          <h2>Designed to support clinicians, not replace them.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">Four commitments built into how PsyClick measures, stores, and reports.</p>
        </Reveal>
      </div>
      <div className="trust-bento">
        {TRUST.map((t, i) => {
          const Art = t.art
          return (
            <Reveal key={t.title} className="trust-card" delay={i * 0.07}>
              <Art />
              <div className="trust-copy">
                <h3>{t.title}</h3>
                <p>{t.text}</p>
              </div>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}

/* ─── Team: portraits with depth ─── */

function Person({ m, i }: { m: (typeof TEAM_MEMBERS)[number]; i: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateY = useSpring(useTransform(px, [0, 1], [-9, 9]), { stiffness: 150, damping: 15 })
  const rotateX = useSpring(useTransform(py, [0, 1], [8, -8]), { stiffness: 150, damping: 15 })
  const glareX = useTransform(px, [0, 1], ['0%', '100%'])

  return (
    <Reveal className="member" delay={i * 0.08}>
      <motion.div
        ref={ref}
        className="member-card"
        style={{ rotateX, rotateY }}
        onPointerMove={(e) => {
          const r = ref.current!.getBoundingClientRect()
          px.set((e.clientX - r.left) / r.width)
          py.set((e.clientY - r.top) / r.height)
        }}
        onPointerLeave={() => {
          px.set(0.5)
          py.set(0.5)
        }}
      >
        <div className="member-bg" />
        <span className="member-initials">{m.initials}</span>
        <img
          src={m.photo}
          alt={m.name}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            ;(e.target as HTMLImageElement).style.display = 'none'
          }}
        />
        <motion.span className="member-glare" style={{ left: glareX }} aria-hidden="true" />
        <div className="member-info">
          <strong>{m.name}</strong>
          <span>{m.role}</span>
          <a href={`mailto:${m.email}`} className="member-mail">
            <Mail size={13} /> {m.email}
          </a>
        </div>
      </motion.div>
    </Reveal>
  )
}

export function Team() {
  return (
    <section id="team" className="section team">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Team</Eyebrow>
          <h2>Built by ByteMe.</h2>
        </Reveal>
        <Reveal delay={0.1} className="team-adviser">
          <span className="team-adviser-icon">
            <GraduationCap size={20} />
          </span>
          <p>
            BS Computer Science, Software Engineering · FEU Institute of Technology
            <br />
            Thesis adviser <strong>Mr. Justine Jude C. Pura</strong>
          </p>
        </Reveal>
      </div>
      <div className="member-grid">
        {TEAM_MEMBERS.map((m, i) => (
          <Person key={m.name} m={m} i={i} />
        ))}
      </div>
    </section>
  )
}
