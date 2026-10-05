'use client'

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  Check,
  ClipboardList,
  Database,
  Download,
  FileText,
  HeartPulse,
  History,
  Keyboard,
  Lock,
  Menu,
  MousePointer2,
  Plus,
  Shield,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import {
  AnimatePresence,
  MotionConfig,
  animate,
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type TargetAndTransition,
} from 'framer-motion'
import { ReactLenis } from 'lenis/react'
import dynamic from 'next/dynamic'
import type React from 'react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'

import AppDashboard from '@/components/app-dashboard'
import { EASE, Eyebrow, Reveal } from '@/components/landing-kit'
import {
  FEATURE_CARDS,
  CLINICIAN_STEPS,
  CLIENT_STEPS,
  ALGORITHM_STEPS,
  FAQ_ITEMS,
  TEAM_MEMBERS,
} from '@/lib/landing-data'
import HeroInstrument from '@/components/hero-instrument'
import DownloadHub from '@/components/download-hub'
import FeaturesBento from '@/components/features-bento'
import FooterWord from '@/components/footer-word'
import GuideFlow from '@/components/guide-flow'
import { Team, Trust } from '@/components/trust-team'
import IntroTakeover from '@/components/intro-takeover'

const HeroGlass = dynamic(() => import('@/components/hero-glass'), {
  ssr: false,
  loading: () => null,
})

const NAV = [
  { href: '#overview', label: 'Overview' },
  { href: '#app', label: 'The app' },
  { href: '#guide', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#algorithm', label: 'Algorithm' },
  { href: '#evidence', label: 'Evidence' },
  { href: '#faq', label: 'FAQ' },
]

const MEASURES = [
  'PHQ-9',
  'GAD-7',
  'Hotelling T²',
  'EWMA baseline',
  'Psychomotor Slowing Index',
  'Psychomotor Agitation Index',
  'Fuzzy classification',
  'Normative comparison',
]

const ALGO_ICONS = [Activity, MousePointer2, BarChart3, Database, Brain, HeartPulse, ShieldCheck, Users]

type Token = string | { node: React.ReactNode; key: string }

function Word({ children, progress, range }: { children: React.ReactNode; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.18, 1])
  return <motion.span style={{ opacity }}>{children} </motion.span>
}

/** Statement that inks in word by word as it scrolls; tokens may be inline illustrations. */
function ScrollWords({ tokens, className }: { tokens: Token[]; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] })
  const words = tokens.flatMap<Token>((t) => (typeof t === 'string' ? t.split(' ') : [t]))
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <Word key={typeof w === 'string' ? i : w.key} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {typeof w === 'string' ? w : w.node}
        </Word>
      ))}
    </p>
  )
}

function KeysChip() {
  return (
    <span className="inl inl-keys" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <i key={i} style={{ animationDelay: `${i * 0.18 + (i === 2 ? 0.5 : 0)}s` }} className={i === 2 ? 'late' : ''} />
      ))}
    </span>
  )
}

function CursorChip() {
  return (
    <span className="inl inl-cursor" aria-hidden="true">
      <svg viewBox="0 0 80 28">
        <path d="M4,22 C18,20 22,6 34,8 C44,10 40,22 32,20 C24,18 34,4 48,6 C58,7 64,10 76,6" />
      </svg>
    </span>
  )
}

function BaselineChip() {
  return (
    <span className="inl inl-base" aria-hidden="true">
      <svg viewBox="0 0 80 28">
        <line x1="0" y1="16" x2="80" y2="16" className="b" />
        <path d="M0,18 L14,14 L24,19 L34,12 L44,17 L54,9 L64,15 L80,11" />
      </svg>
    </span>
  )
}

function CountUp({ to, decimals = 0 }: { to: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  useEffect(() => {
    if (!inView) return
    const controls = animate(0, to, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = Number(v.toFixed(decimals)).toLocaleString('en-US')
      },
    })
    return () => controls.stop()
  }, [inView, to, decimals])
  return <span ref={ref}>0</span>
}

/* ─── Sections ──────────────────────────────────────────── */

function Nav() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setHidden(y > lastY.current && y > window.innerHeight * 0.8)
      lastY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}${hidden && !open ? ' nav-hidden' : ''}`} aria-label="Main">
        <a className="nav-brand" href="#top" aria-label="PsyClick home">
          <img src="/psyclick-icon.webp" alt="" width={28} height={28} />
          <span>PsyClick</span>
        </a>
        <div className="nav-pill">
          {NAV.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-end">
          <a className="btn btn-ink btn-sm" href="#download">
            Download
          </a>
          <button
            className="nav-toggle"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            {NAV.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
            <a className="btn btn-ink" href="#download" onClick={() => setOpen(false)}>
              <Download size={16} /> Download PsyClick
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Hero({ play }: { play: boolean }) {
  const reduce = useReducedMotion()
  const lines = ['See what', 'words don’t', 'say.']
  const at = (to: TargetAndTransition, from: TargetAndTransition) => (play ? to : from)
  const heroRef = useRef<HTMLElement>(null)

  return (
    <section id="top" className="hero" ref={heroRef}>
      <div className="hero-stage" aria-hidden="true">
        {play && <HeroGlass still={!!reduce} />}
      </div>
      <div className="hero-grid">
        <div className="hero-copy">
          <motion.span
            className="hero-tag"
            initial={{ opacity: 0, y: 10 }}
            animate={at({ opacity: 1, y: 0 }, { opacity: 0, y: 10 })}
            transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          >
            <i /> Clinical decision support for Windows
          </motion.span>
          <h1>
            {lines.map((line, i) => (
              <span className="line-mask" key={line}>
                <motion.span
                  initial={{ y: '110%' }}
                  animate={at({ y: '0%' }, { y: '110%' })}
                  transition={{ duration: 1.1, ease: EASE, delay: 0.45 + i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="hero-lede"
            initial={{ opacity: 0, y: 14, filter: 'blur(8px)' }}
            animate={at({ opacity: 1, y: 0, filter: 'blur(0px)' }, { opacity: 0, y: 14, filter: 'blur(8px)' })}
            transition={{ duration: 0.9, ease: EASE, delay: 0.9 }}
          >
            A 10–15 minute session pairs PHQ-9 and GAD-7 with eight keystroke and cursor biomarkers, then hands the
            clinician one decision-support report.
          </motion.p>
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 14 }}
            animate={at({ opacity: 1, y: 0 }, { opacity: 0, y: 14 })}
            transition={{ duration: 0.8, ease: EASE, delay: 1.05 }}
          >
            <a className="btn btn-ink" href="#download">
              Download for Windows <ArrowRight size={16} />
            </a>
            <a className="btn btn-glass" href="#guide">
              See how a session runs
            </a>
          </motion.div>
        </div>
      </div>
      <motion.div
        className="hero-inst-slot"
        initial={{ opacity: 0, y: 30 }}
        animate={at({ opacity: 1, y: 0 }, { opacity: 0, y: 30 })}
        transition={{ duration: 1, ease: EASE, delay: 1.3 }}
      >
        <HeroInstrument heroRef={heroRef} />
      </motion.div>
    </section>
  )
}

function Measures() {
  const row = [...MEASURES, ...MEASURES]
  return (
    <section className="measures" aria-label="Measures PsyClick is built on">
      <p className="measures-label">Built on established clinical and statistical measures</p>
      <div className="marquee">
        <div className="marquee-track">
          {row.map((m, i) => (
            <span key={i} aria-hidden={i >= MEASURES.length}>
              {m}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section id="overview" className="section about">
      <Reveal>
        <Eyebrow>About PsyClick</Eyebrow>
      </Reveal>
      <ScrollWords
        className="statement"
        tokens={[
          'Adults can mask distress in a session. The rhythm of their typing',
          { key: 'keys', node: <KeysChip /> },
          'and cursor movement',
          { key: 'cursor', node: <CursorChip /> },
          'often shifts anyway. PsyClick measures that hidden signal against each client’s own baseline',
          { key: 'base', node: <BaselineChip /> },
          'and puts it in front of the clinician.',
        ]}
      />
      <div className="about-foot">
        <Reveal className="about-byline">
          <div className="avatar-stack">
            {TEAM_MEMBERS.map((m) => (
              <img key={m.name} src={m.photo} alt="" loading="lazy" decoding="async" />
            ))}
          </div>
          <p>
            Built by ByteMe at FEU Institute of Technology. PsyClick supports clinical judgment and never replaces
            diagnosis, crisis assessment, or emergency protocols.
          </p>
        </Reveal>
        <Reveal className="about-links" delay={0.08}>
          <a href="#app">
            See the dashboard <ArrowRight size={15} />
          </a>
          <a href="#evidence">
            Read the evidence <ArrowRight size={15} />
          </a>
        </Reveal>
      </div>

      <div className="stat-grid">
        <Reveal className="stat-card" delay={0}>
          <div className="stat-head">
            <h3>
              Psychologists and
              <br />
              psychiatrists
            </h3>
            <div className="stat-figure">
              <small>For 110 million Filipinos</small>
              <strong>
                <CountUp to={2100} />
              </strong>
            </div>
          </div>
          <div className="dot-scale" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <i key={i} className={i === 0 ? 'phq' : 'gad'} style={{ animationDelay: `${i * 0.08}s` }} />
            ))}
          </div>
          <p className="stat-foot">
            A service gap that leaves masked, mild-to-moderate distress easy to miss. Source: Alibudbud, cited in the
            PsyClick manuscript.
          </p>
        </Reveal>

        <Reveal className="stat-card glacier" delay={0.08}>
          <div className="stat-head">
            <h3>
              Psychomotor
              <br />
              biomarkers
            </h3>
            <div className="stat-figure">
              <small>Keyboard + mouse</small>
              <strong>
                <CountUp to={8} />
              </strong>
            </div>
          </div>
          <div className="bead-field" aria-hidden="true">
            {Array.from({ length: 8 }).map((_, i) => (
              <i key={i} />
            ))}
          </div>
          <p className="stat-foot">
            Flight time, dwell time, typing velocity, error rate, path entropy, cursor velocity, jerk, pause frequency.
          </p>
        </Reveal>

        <Reveal className="stat-card" delay={0.16}>
          <div className="stat-head">
            <h3>
              One guided
              <br />
              session
            </h3>
            <div className="stat-figure">
              <small>Minutes</small>
              <strong>10–15</strong>
            </div>
          </div>
          <div className="type-line" aria-hidden="true">
            <span>Describe a typical situation in which you feel behind on tasks or deadlines.</span>
            <b />
          </div>
          <p className="stat-foot">Only timing is measured. Typed content is never analyzed for meaning.</p>
        </Reveal>
      </div>
    </section>
  )
}

function AppShowcase() {
  return (
    <section id="app" className="section app-show">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Inside the app</Eyebrow>
          <h2>Every session lands on the clinician’s dashboard.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            Flags, PHQ-9 and GAD-7 scores, and a summary line for each client, so the sessions that need review stand out
            first.
          </p>
        </Reveal>
      </div>
      <AppDashboard />
      <p className="dash-note">Sample data. Layout mirrors the PsyClick dashboard.</p>
    </section>
  )
}

function Evidence() {
  const items = [
    { value: 'κ = 1.00', unit: '', label: 'Clinician concordance', note: '15 of 15 clinical sessions matched the attending clinician’s judgment (z = 5.44, p < .001).' },
    { value: '105', unit: '', label: 'Normative participants', note: 'Adults aged 18–64 built the reference baseline for population comparison.' },
    { value: '4.64', unit: '/ 5', label: 'ISO/IEC 25010 rating', note: 'Software quality rated by five software engineering professionals.' },
    { value: '~90%', unit: '', label: 'Hardware variance removed', note: 'Device normalization cut timing variance by 89.4–90.1% across four setups.' },
  ]
  return (
    <section id="evidence" className="section evidence">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Evidence</Eyebrow>
          <h2>Tested with clinicians, reported honestly.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            Results from the PsyClick thesis study. The concordance result comes from a small clinical sample and should be
            confirmed at larger scale.
          </p>
        </Reveal>
      </div>
      <div className="evidence-grid">
        {items.map((it, i) => (
          <Reveal key={it.label} className={`evidence-card${i === 0 ? ' lead' : ''}`} delay={i * 0.07}>
            <strong>
              {it.value}
              {it.unit && <small> {it.unit}</small>}
            </strong>
            <span>{it.label}</span>
            <p>{it.note}</p>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function RolePanels() {
  const [active, setActive] = useState<'clients' | 'clinicians' | 'admins'>('clinicians')
  const [, startTransition] = useTransition()
  const tabs = [
    { id: 'clinicians' as const, label: 'Clinicians', icon: UserCheck },
    { id: 'clients' as const, label: 'Clients', icon: Users },
    { id: 'admins' as const, label: 'Administrators', icon: ShieldCheck },
  ]

  return (
    <section id="for-clinicians" className="section roles">
      <span id="for-clients" className="anchor-alias" />
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <h2>Built for everyone in the room.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="segmented" role="tablist" aria-label="Choose a role">
            {tabs.map((t) => {
              const Icon = t.icon
              return (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={active === t.id}
                  className={active === t.id ? 'on' : ''}
                  onClick={() => startTransition(() => setActive(t.id))}
                >
                  <Icon size={15} /> {t.label}
                </button>
              )
            })}
          </div>
        </Reveal>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          className="role-panel"
          role="tabpanel"
          initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {active === 'clinicians' && (
            <>
              <div className="role-copy">
                <h3>A complete workflow from consent to report.</h3>
                <p>
                  A repeatable path through consent, two warm-ups, two questionnaires and twelve written prompts, then a
                  report that puts the most urgent results first and compares each visit with the last.
                </p>
                <ul className="check-list">
                  <li><Check size={15} /> Consent recorded before anything is captured</li>
                  <li><Check size={15} /> Behaviour measured against the client&apos;s own baseline</li>
                  <li><Check size={15} /> Small signals listed, not only the overall result</li>
                  <li><Check size={15} /> Change since earlier sessions, visit by visit</li>
                  <li><Check size={15} /> Save as PDF and a full audit trail</li>
                </ul>
              </div>
              <div className="role-visual">
                <div className="mini-report">
                  <div className="mini-report-top">
                    <span>Assessment report</span>
                    <span className="pd-pill follow">Follow up</span>
                  </div>
                  <div className="mini-kpis">
                    {[
                      ['Behaviour change', '92', 'limit 78', 'cyan', 'Watch'],
                      ['Depression', '6', '/ 27', 'mint', 'Mild'],
                      ['Anxiety', '4', '/ 21', 'peri', 'Minimal'],
                    ].map(([k, v, unit, t, chip]) => (
                      <div key={k} className={`pd-stat t-${t}`}>
                        <small>{k}</small>
                        <strong>
                          {v} <em>{unit}</em>
                        </strong>
                        <b>{chip}</b>
                      </div>
                    ))}
                  </div>
                  <p className="mini-stood">What stood out</p>
                  <ul className="mini-signals">
                    <li className="watch">Typing slowed more than in 95% of healthy adults</li>
                    <li className="note">Long hesitation before prompt C4: 24 s</li>
                    <li className="note">Cursor lingered on “hard?” for 3.4 s</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {active === 'clients' && (
            <>
              <div className="role-copy">
                <h3>Simple guided tasks, no right or wrong answers.</h3>
                <p>
                  Type a paragraph, click numbered circles, answer two short questionnaires, and write a few responses.
                  Move and type the way you normally would.
                </p>
                <ul className="check-list">
                  <li><Check size={15} /> Step-by-step guidance on every screen</li>
                  <li><Check size={15} /> Plain instructions, no technical terms</li>
                  <li><Check size={15} /> A calm, consistent session every time</li>
                  <li><Check size={15} /> Your clinician reviews every result with you</li>
                </ul>
              </div>
              <div className="role-visual">
                <div className="mini-task">
                  <div className="mini-report-top">
                    <span>Keyboard task</span>
                    <span className="mono muted">2 / 5</span>
                  </div>
                  <p className="mini-prompt">Type the paragraph below at your usual pace.</p>
                  <div className="mini-typing">
                    The quick brown fox jumps over the lazy dog near the river<b />
                  </div>
                  <div className="mini-rhythm" aria-hidden="true">
                    {[40, 65, 52, 80, 48, 72, 58, 90, 44, 68, 55, 76].map((h, i) => (
                      <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.09}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {active === 'admins' && (
            <>
              <div className="role-copy">
                <h3>Accounts, roles and records you can trust.</h3>
                <p>
                  Create accounts for clinicians and auditors, change roles, and check the audit trail. Everything works
                  offline and syncs when online, so every account signs in on any clinic computer.
                </p>
                <ul className="check-list">
                  <li><Check size={15} /> Administrator, clinician and auditor roles</li>
                  <li><Check size={15} /> Tamper-evident, hash-chained audit log</li>
                  <li><Check size={15} /> Encrypted, verified backups</li>
                  <li><Check size={15} /> Offline first, synced across devices</li>
                </ul>
              </div>
              <div className="role-visual">
                <div className="mini-accounts">
                  <div className="mini-report-top">
                    <span>Security center</span>
                    <span className="pd-pill clear">Synced</span>
                  </div>
                  {[
                    ['AS', 'Dr. A. Santos', 'Administrator'],
                    ['MR', 'M. Reyes', 'Clinician'],
                    ['JL', 'J. Lim', 'Auditor'],
                  ].map(([i, n, r]) => (
                    <div key={n} className="mini-account">
                      <i>{i}</i>
                      <span>
                        <strong>{n}</strong>
                        <small>{r}</small>
                      </span>
                      <b>Active</b>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

function Segments({ value, max, tone }: { value: number; max: number; tone: 'green' | 'blue' }) {
  return (
    <div className={`segments ${tone}`} aria-hidden="true">
      {Array.from({ length: max }).map((_, i) => (
        <i key={i} className={i < value ? 'on' : ''} style={{ transitionDelay: `${i * 30}ms` }} />
      ))}
    </div>
  )
}

const HEAT_WORDS: [string, number][] = [
  ['What', 0], ['words', 0.25], ['do', 0], ['you', 0], ['use', 0.1], ['to', 0], ['describe', 0.35], ['yourself', 0.7],
  ['on', 0], ['days', 0.15], ['when', 0], ['things', 0.2], ['are', 0], ['very', 0.3], ['hard?', 1],
]
const TOP_WORDS: [string, number][] = [['hard?', 3.4], ['yourself', 2.2], ['left', 1.9], ['down', 1.6]]

function heatColor(t: number) {
  // white → mint → cyan → periwinkle → deep blue, as in the app
  const stops: [number, number[]][] = [[0, [255, 255, 255]], [0.15, [112, 232, 192]], [0.45, [104, 216, 232]], [0.75, [120, 168, 216]], [1, [61, 95, 168]]]
  for (let k = 1; k < stops.length; k++) {
    const [p1, c1] = stops[k - 1]
    const [p2, c2] = stops[k]
    if (t <= p2) {
      const f = (t - p1) / (p2 - p1)
      return `rgb(${c1.map((v, n) => Math.round(v + (c2[n] - v) * f)).join(',')})`
    }
  }
  return 'rgb(61,95,168)'
}

function MiniRadar({ run }: { run: boolean }) {
  const axes = [['Behaviour', 96], ['Slowing', 97], ['Restless', 62], ['Anxiety', 58], ['Depression', 74]] as const
  const C = 90
  const R = 64
  const pt = (k: number, f: number) => {
    const a = -Math.PI / 2 + (k * 2 * Math.PI) / axes.length
    return [C + Math.cos(a) * R * f, C + Math.sin(a) * R * f]
  }
  const poly = (f: number) => axes.map((_, k) => pt(k, f).join(',')).join(' ')
  const client = axes.map(([, p], k) => pt(k, p / 100).join(',')).join(' ')
  return (
    <svg viewBox="-46 -6 272 192" className="mini-radar" aria-hidden="true">
      <polygon points={poly(1)} fill="#fbe3e1" />
      <polygon points={poly(0.95)} fill="#fcefd9" />
      <polygon points={poly(0.85)} fill="#e3f7ef" stroke="#3ccb9a" strokeDasharray="3 3" />
      {axes.map((_, k) => {
        const [x, y] = pt(k, 1)
        return <line key={k} x1={C} y1={C} x2={x} y2={y} stroke="#d9e6ea" />
      })}
      <motion.polygon
        points={client}
        fill="rgba(104,216,232,.4)"
        stroke="#3d5fa8"
        strokeWidth="2"
        style={{ originX: `${C}px`, originY: `${C}px` }}
        initial={{ scale: 0 }}
        animate={{ scale: run ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.2 }}
      />
      {axes.map(([name, p], k) => {
        const [x, y] = pt(k, 1.22)
        return (
          <text key={name} x={x} y={y} textAnchor={Math.abs(x - C) < 6 ? 'middle' : x > C ? 'start' : 'end'} fontSize="10.5" fill={p >= 95 ? '#b83a38' : p >= 85 ? '#9a5b00' : '#0f2a33'} fontWeight="600">
            {name}
          </text>
        )
      })}
    </svg>
  )
}

function Report() {
  const ringRef = useRef<HTMLDivElement>(null)
  const inView = useInView(ringRef, { once: true, amount: 0.4 })

  return (
    <section id="report" className="section report">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>The report</Eyebrow>
          <h2>The most important results, first.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            The same blocks as the Assessment report: overall result, what stood out, the profile against healthy adults,
            where attention lingered, and the questionnaires. Values are illustrative.
          </p>
        </Reveal>
      </div>

      <div ref={ringRef} className={`bento${inView ? ' in' : ''}`}>
        <Reveal className="tile tile-flag">
          <div className="t2-ring" style={{ '--p': inView ? 0.62 : 0 } as React.CSSProperties}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="50" className="ring-track" />
              <circle cx="60" cy="60" r="50" className="ring-fill" />
            </svg>
            <div className="ring-center">
              <small className="mono">Behaviour change</small>
              <strong>92</strong>
            </div>
          </div>
          <span className="pd-pill follow">Follow up · slowed responses</span>
          <p>Above the healthy limit of 78. Plan a follow-up conversation within 48–72 hours.</p>
        </Reveal>

        <Reveal className="tile tile-heat" delay={0.06}>
          <div className="tile-top">
            <strong>Where attention lingered</strong>
            <span className="mono muted">cursor rest per word</span>
          </div>
          <p className="heat-words">
            {HEAT_WORDS.map(([w, t], k) => (
              <span
                key={k}
                style={{ background: t ? heatColor(inView ? t : 0) : undefined, color: t > 0.8 ? '#fff' : undefined, fontWeight: t > 0.3 ? 600 : 400, transitionDelay: `${k * 40}ms` }}
              >
                {w}
              </span>
            ))}
          </p>
          <ol className="heat-top">
            {TOP_WORDS.map(([w, sec], k) => (
              <li key={w}>
                <span className="mono">{k + 1}</span> “{w.replace('?', '')}” <em className="mono">{sec.toFixed(1)} s</em>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal className="tile" delay={0.1}>
          <div className="tile-top">
            <strong>Depression · PHQ-9</strong>
          </div>
          <p className="tile-figure">
            6 <small>/ 27 · mild</small>
          </p>
          <Segments value={6} max={27} tone="green" />
        </Reveal>

        <Reveal className="tile" delay={0.14}>
          <div className="tile-top">
            <strong>Anxiety · GAD-7</strong>
          </div>
          <p className="tile-figure">
            4 <small>/ 21 · minimal</small>
          </p>
          <Segments value={4} max={21} tone="blue" />
        </Reveal>

        <Reveal className="tile tile-index" delay={0.18}>
          <div className="tile-top">
            <strong>Profile against healthy adults</strong>
          </div>
          <MiniRadar run={inView} />
        </Reveal>

        <Reveal className="tile tile-glacier" delay={0.22}>
          <div className="tile-top">
            <strong>What stood out</strong>
          </div>
          <ul className="stood-list">
            <li>Typing slowed more than in 95% of healthy adults</li>
            <li>Long hesitation before prompt C4: 24 s</li>
            <li>Mild depressive symptoms (PHQ-9 6)</li>
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

function Algorithm() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section id="algorithm" className="section algorithm">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Behind the signals</Eyebrow>
          <h2>Eight steps from keystroke to flag.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">Each step runs in order inside a session. Open one for the technical detail.</p>
        </Reveal>
      </div>
      <ol className="algo-list">
        {ALGORITHM_STEPS.map((step, i) => {
          const Icon = ALGO_ICONS[i] ?? Activity
          const isOpen = open === i
          return (
            <motion.li
              key={step.num}
              className={`algo-row${isOpen ? ' open' : ''}`}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, ease: EASE, delay: (i % 2) * 0.06 }}
            >
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}>
                  <span className="algo-num mono">{step.num.padStart(2, '0')}</span>
                  <span className="icon-disc">
                    <Icon size={17} />
                  </span>
                  <span className="algo-text">
                    <strong>{step.title}</strong>
                    <span>{step.summary}</span>
                  </span>
                  <Plus size={18} className="algo-plus" />
                </button>
                <div className="algo-detail">
                  <div>
                    <p>{step.detail}</p>
                  </div>
                </div>
            </motion.li>
          )
        })}
      </ol>
    </section>
  )
}

function Faq() {
  const [open, setOpen] = useState<number | null>(null)
  const [, startTransition] = useTransition()
  return (
    <section id="faq" className="section faq">
      <div className="faq-grid">
        <Reveal>
          <Eyebrow>FAQ</Eyebrow>
          <h2>Common questions.</h2>
          <p className="section-sub">
            Still unsure? Write to the team from the <a href="#team">team section</a>.
          </p>
        </Reveal>
        <div className="faq-list">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i
            return (
              <Reveal key={item.q} delay={Math.min(i, 5) * 0.04}>
                <div className={`faq-item${isOpen ? ' open' : ''}`}>
                  <button onClick={() => startTransition(() => setOpen(isOpen ? null : i))} aria-expanded={isOpen}>
                    <span>{item.q}</span>
                    <Plus size={18} className="faq-plus" />
                  </button>
                  <div className="faq-answer">
                    <div>
                      <p>{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <p className="footer-big">Questions about deploying PsyClick in your clinic?</p>
          <a className="footer-link" href="#team">
            Contact the ByteMe team <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-cta">
          <p>Bring structured psychomotor screening into your next session.</p>
          <a className="btn btn-coral" href="#download">
            Download PsyClick
          </a>
        </div>
      </div>
      <FooterWord />
      <div className="footer-mid">
        <nav aria-label="Footer">
          {NAV.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
          <a href="#download">Download</a>
        </nav>
        <p>© 2026 PsyClick by ByteMe</p>
      </div>
      <p className="footer-disclaimer">
        PsyClick is a decision-support tool. It does not replace clinical judgment, diagnosis, emergency assessment, or
        clinic protocols.
      </p>
    </footer>
  )
}

/* ─── Page ──────────────────────────────────────────────── */

/**
 * Looping CSS animations keep the compositor and style engine busy even when
 * their section is far off screen. Mark sections that are out of view so CSS
 * can pause them; anything on screen (plus a margin) runs exactly as designed.
 */
function usePauseOffscreen() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('main.pc > section, main.pc > footer, main.pc > div'))
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.toggleAttribute('data-offscreen', !e.isIntersecting)),
      { rootMargin: '300px 0px' },
    )
    els.forEach((el) => io.observe(el))

    return () => io.disconnect()
  }, [])
}

export default function Landing() {
  const [introDone, setIntroDone] = useState(false)
  const onIntroDone = useCallback(() => setIntroDone(true), [])
  usePauseOffscreen()
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, anchors: { offset: -80 } }}>
      <MotionConfig reducedMotion="user">
        <IntroTakeover onDone={onIntroDone} />
        <main className="pc">
          <Nav />
          <Hero play={introDone} />
          <Measures />
          <About />
          <AppShowcase />
          <RolePanels />
          <GuideFlow />
          <FeaturesBento />
          <Report />
          <Algorithm />
          <Evidence />
          <DownloadHub />
          <Trust />
          <Team />
          <Faq />
          <Footer />
        </main>
      </MotionConfig>
    </ReactLenis>
  )
}
