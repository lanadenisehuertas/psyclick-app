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
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
  type TargetAndTransition,
} from 'framer-motion'
import { ReactLenis } from 'lenis/react'
import type React from 'react'
import { Suspense, useCallback, useEffect, useRef, useState, useTransition } from 'react'

import DashStage from '@/components/dash-stage'
import { EASE, Eyebrow, Reveal, useScrollSteps } from '@/components/landing-kit'
import {
  FEATURE_CARDS,
  CLINICIAN_STEPS,
  CLIENT_STEPS,
  ALGORITHM_STEPS,
  FAQ_ITEMS,
  TEAM_MEMBERS,
} from '@/lib/landing-data'
import DownloadHub from '@/components/download-hub'
import GuideFlow from '@/components/guide-flow'
import TryRhythm from '@/components/try-rhythm'
import { Team } from '@/components/trust-team'
import IntroTakeover from '@/components/intro-takeover'

import HeroDemo from '@/components/hero-demo'

const NAV = [
  { href: '#app', label: 'The app' },
  { href: '#guide', label: 'How it works' },
  { href: '#algorithm', label: 'Algorithm' },
  { href: '#report', label: 'The report' },
  { href: '#for-clinicians', label: 'For clinics' },
  { href: '#evidence', label: 'Evidence' },
  { href: '#faq', label: 'FAQ' },
]

const ALGO_ICONS = [Activity, MousePointer2, BarChart3, Database, Brain, HeartPulse, ShieldCheck, Users]

type Token = string | { node: React.ReactNode; key: string }

function Word({ children, progress, range }: { children: React.ReactNode; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.4, 1])
  return <motion.span style={{ opacity }}>{children} </motion.span>
}

/** Statement that inks in word by word as it scrolls; tokens may be inline illustrations. */
function ScrollWords({
  tokens,
  className,
  target,
}: {
  tokens: Token[]
  className?: string
  /** a hold wrapper: words fill across the whole hold instead of the paragraph's own pass */
  target?: React.RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll(
    target ? { target, offset: ['start 120px', 'end end'] } : { target: ref, offset: ['start 0.85', 'end 0.5'] },
  )
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
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  // The trailer shot: the headline lifts away while the app window rises and
  // tilts flat into the middle of the screen, over a slow pull-back of the room.
  const copyY = useTransform(p, [0, 0.55], ['0vh', '-14vh'])
  const copyO = useTransform(p, [0.05, 0.45], [1, 0])
  const copyBlur = useTransform(p, [0.05, 0.45], ['blur(0px)', 'blur(10px)'])
  const stageY = useTransform(p, [0, 0.7], ['0vh', '-46vh'])
  const stageRot = useTransform(p, [0, 0.7], [26, 0])
  const stageScale = useTransform(p, [0, 0.7], [0.84, 1.08])
  const mediaScale = useTransform(p, [0, 1], [1.18, 1])
  const mediaO = useTransform(p, [0, 1], [0.5, 0.16])
  const lines: React.ReactNode[] = [
    'PsyClick catches what',
    <>
      words <span className="gt">don’t say.</span>
    </>,
  ]
  const at = (to: TargetAndTransition, from: TargetAndTransition) => (play ? to : from)
  return (
    <section ref={ref} id="top" className="sx-hero">
      <div className="sx-hero-sticky">
        <motion.div
          className="sx-hero-media"
          aria-hidden="true"
          style={reduce ? undefined : { scale: mediaScale, opacity: mediaO }}
        />
        <div className="sx-hero-glow" aria-hidden="true" />
        <motion.div
          className="sx-hero-copy"
          style={reduce ? undefined : { y: copyY, opacity: copyO, filter: copyBlur }}
        >
          <h1>
            {lines.map((line, i) => (
              <span className="line-mask" key={i}>
                <motion.span
                  initial={{ y: '110%' }}
                  animate={at({ y: '0%' }, { y: '110%' })}
                  transition={{ duration: 1, ease: EASE, delay: 0.3 + i * 0.14 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            className="sx-hero-lede"
            initial={{ opacity: 0, y: 14 }}
            animate={at({ opacity: 1, y: 0 }, { opacity: 0, y: 14 })}
            transition={{ duration: 0.8, ease: EASE, delay: 0.7 }}
          >
            A Windows app that times every keystroke and cursor move while a client answers PHQ-9, GAD-7 and short
            written prompts, <span className="dim">then flags psychomotor signs of depression and anxiety for the
            clinician to review.</span>
          </motion.p>
          <motion.div
            className="sx-hero-actions"
            initial={{ opacity: 0, y: 14 }}
            animate={at({ opacity: 1, y: 0 }, { opacity: 0, y: 14 })}
            transition={{ duration: 0.8, ease: EASE, delay: 0.85 }}
          >
            <a className="btn sx-btn-light" href="#download">
              Download for Windows <ArrowRight size={16} />
            </a>
            <a className="sx-link" href="#guide">
              See how a session runs
            </a>
          </motion.div>
        </motion.div>
        <motion.div
          className="sx-hero-stage"
          initial={{ opacity: 0 }}
          animate={at({ opacity: 1 }, { opacity: 0 })}
          transition={{ duration: 1.2, ease: EASE, delay: 0.9 }}
          style={reduce ? undefined : { y: stageY, rotateX: stageRot, scale: stageScale }}
        >
          <HeroDemo play={play} />
        </motion.div>
        <motion.p
          className="sx-hero-facts"
          initial={{ opacity: 0 }}
          animate={at({ opacity: 1 }, { opacity: 0 })}
          transition={{ duration: 0.8, ease: EASE, delay: 1.1 }}
          style={reduce ? undefined : { opacity: copyO }}
        >
          Windows 10 or later <i /> Works offline <i /> Pairs with PHQ-9 and GAD-7
        </motion.p>
      </div>
    </section>
  )
}

/* Keystroke timing as a field of bars: the gaps of one typed sentence, with
   one long pause. It wipes the page between the teal field and the paper. */
const RHYTHM = Array.from({ length: 84 }, (_, i) => {
  const r = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1
  const pause = i === 51
  return { h: pause ? 1 : Math.round((0.26 + r * 0.56) * 1000) / 1000, d: Math.round((i / 84) * 0.45 * 1000) / 1000, pause }
})

function RhythmField({ dir, deep = false }: { dir: 'down' | 'up'; deep?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => ref.current?.style.setProperty('--p', v.toFixed(3)))
  return (
    <div ref={ref} className={`sx-rhythm ${dir}${deep ? ' deep' : ''}`} aria-hidden="true">
      {RHYTHM.map((b, i) => (
        <i
          key={i}
          className={b.pause ? 'pause' : undefined}
          style={{ '--h': b.h, '--d': b.d } as React.CSSProperties}
        />
      ))}
    </div>
  )
}

function About() {
  // The statement holds on screen while its words light up with scroll
  const holdRef = useRef<HTMLDivElement>(null)
  return (
    <section id="overview" className="section about">
      <div ref={holdRef} className="about-pin">
      <div className="about-stick">
      <Reveal>
        <Eyebrow>About PsyClick</Eyebrow>
      </Reveal>
      <ScrollWords
        target={holdRef}
        className="statement"
        tokens={[
          'Adults can mask distress in a session. The rhythm of their typing and cursor movement often shifts anyway. PsyClick measures that hidden signal against each client’s own baseline and puts it in front of the clinician.',
        ]}
      />
      </div>
      <div className="about-spacer" aria-hidden="true" />
      </div>
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

    </section>
  )
}

const READS = [
  ['Time between keys', 'flight time'],
  ['How long each key is held', 'dwell time'],
  ['Pauses and corrections', 'pause and error rate'],
  ['Cursor speed and path', 'velocity, jerk, path entropy'],
]
const NEVER = [
  ['What the words mean', 'text is not analysed'],
  ['The screen or other apps', 'only its own window'],
  ['Microphone or camera', 'never used'],
  ['Anything after the session', 'recording stops at the end'],
]

/** Exactly what is and is not recorded, stated next to the claim. */
function Reads() {
  return (
    <section id="what-it-reads" className="section reads" aria-labelledby="reads-title">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>What it records</Eyebrow>
          <h2 id="reads-title">
            Timing, <span className="dim">never meaning.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            PsyClick keeps when keys go down and up and how the cursor moves. What the client writes is never analysed.
          </p>
        </Reveal>
      </div>
      <div className="reads-grid">
        <Reveal className="reads-col yes">
          <h3>
            <i>
              <Check size={15} />
            </i>
            What PsyClick records
          </h3>
          <ul>
            {READS.map(([a, b]) => (
              <li key={a}>
                {a} <small>{b}</small>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal className="reads-col no" delay={0.08}>
          <h3>
            <i>
              <X size={15} />
            </i>
            What it never records
          </h3>
          <ul>
            {NEVER.map(([a, b]) => (
              <li key={a}>
                {a} <small>{b}</small>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
      <Reveal className="reads-note" delay={0.12}>
        <Shield size={16} /> PsyClick supports the clinician’s judgment. It does not diagnose, and it never replaces a crisis
        assessment or emergency protocol.
      </Reveal>
    </section>
  )
}

function AppShowcase() {
  return (
    <section id="app" className="section app-show">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Inside the app</Eyebrow>
          <h2>
            Every session lands <span className="dim">on the clinician’s dashboard.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            Flags, PHQ-9 and GAD-7 scores, and a summary line for each client, so the sessions that need review stand out
            first.
          </p>
        </Reveal>
      </div>
      <div className="lab-frame">
        <DashStage />
      </div>
      <p className="dash-note">Interactive sample with made-up data. Click around: the layout mirrors the PsyClick dashboard.</p>
    </section>
  )
}

const EVIDENCE = [
  {
    value: 'κ = 1.00',
    measure: 'Clinician concordance',
    how: '15 of 15 clinical sessions matched the attending clinician’s judgment (z = 5.44, p < .001)',
    limit: 'Small clinical sample; to be confirmed at larger scale',
  },
  {
    value: '105',
    measure: 'Normative participants',
    how: 'Adults aged 18–64; 71 healthy adults form the reference baseline',
    limit: 'Adults 18–64 only',
  },
  {
    value: '4.64 / 5',
    measure: 'ISO/IEC 25010 software quality',
    how: 'Rated by five software engineering professionals',
    limit: 'Software quality, not a clinical outcome',
  },
  {
    value: '~90%',
    measure: 'Hardware variance removed',
    how: 'Device normalization cut timing variance by 89.4–90.1%',
    limit: 'Four hardware setups tested',
  },
]

const COMMITMENTS = [
  ['Decision support only', 'No concerns, Follow up and Review now are prompts for a clinician, never a diagnosis, emergency assessment, or replacement for protocol.'],
  ['Clinician review required', 'Every flag, score, and recommendation is reviewed by a qualified clinician before it informs any decision.'],
  ['Timing, not content', 'What a client writes is never analyzed for meaning. Only the timing of keys and cursor movement is measured.'],
  ['Local-first data', 'Everything is stored on the computer and works offline, then syncs when online so accounts work on any clinic computer.'],
]

function Evidence() {
  return (
    <section id="evidence" className="sx-evidence">
      <div className="sx-wrap">
        <div className="sx-ev-head">
          <Reveal>
            <h2>
              Tested with clinicians. <span className="gt">Reported honestly.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p>
              Results from the PsyClick thesis study, each with its limit. For context: about 2,100 psychologists and
              psychiatrists serve 110 million Filipinos (Alibudbud).
            </p>
          </Reveal>
        </div>
        <Reveal>
          <table className="sx-ev-table">
            <thead>
              <tr>
                <th scope="col">Result</th>
                <th scope="col">Measure</th>
                <th scope="col">How it was measured</th>
                <th scope="col">Limit</th>
              </tr>
            </thead>
            <tbody>
              {EVIDENCE.map((r) => (
                <tr key={r.measure}>
                  <td className="sx-ev-value">{r.value}</td>
                  <th scope="row">{r.measure}</th>
                  <td>{r.how}</td>
                  <td className="sx-ev-limit">{r.limit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
        <ul className="sx-commit" aria-label="What PsyClick holds to">
          {COMMITMENTS.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.06}>
              <li>
                <h3>{t}</h3>
                <p>{d}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  )
}

function RolePanels() {
  // Desktop/tablet: the section holds while scrolling walks Clinicians, Clients,
  // Administrators. Phones keep plain tabs (the stacked panel is taller than the screen).
  const { ref, active: roleIdx, goTo } = useScrollSteps(3, 88, '(min-width: 901px) and (min-height: 700px)')
  const active = (['clinicians', 'clients', 'admins'] as const)[roleIdx]
  const tabs = [
    { id: 'clinicians' as const, label: 'Clinicians', icon: UserCheck },
    { id: 'clients' as const, label: 'Clients', icon: Users },
    { id: 'admins' as const, label: 'Administrators', icon: ShieldCheck },
  ]

  return (
    <section id="for-clinicians" className="section roles">
      <span id="for-clients" className="anchor-alias" />
      <div ref={ref} className="roles-pin">
      <div className="roles-stick">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Who it&apos;s for</Eyebrow>
          <h2>
            Built for everyone <span className="dim">in the room.</span>
          </h2>
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
                  onClick={() => goTo(tabs.findIndex((x) => x.id === t.id))}
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
      </div>
      <div className="roles-spacer" aria-hidden="true" />
      </div>
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

const FLAGS = [
  { label: 'No concerns', tone: 'clear', means: 'Timing matches the client’s own baseline and healthy adults.', next: 'Continue usual care.' },
  { label: 'Follow up', tone: 'follow', means: 'Responses are slowed or agitated compared with the baseline.', next: 'Check in with the client within 48–72 hours.' },
  { label: 'Review now', tone: 'review', means: 'A strong change across several signals.', next: 'Go through the report with the client during this visit.' },
  { label: 'Repeat session', tone: 'repeat', means: 'Not enough clean data, for example an interrupted session.', next: 'Run the session again. No result is given.' },
]

function Report() {
  const ringRef = useRef<HTMLDivElement>(null)
  const inView = useInView(ringRef, { once: true, amount: 0.4 })

  return (
    <section id="report" className="section report">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>The report</Eyebrow>
          <h2>
            The most important results, <span className="gt">first.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">
            The same blocks as the Assessment report: overall result, what stood out, the profile against healthy adults,
            where attention lingered, and the questionnaires. Values are illustrative.
          </p>
        </Reveal>
      </div>

      <div className="lab-frame">
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
      </div>

      <Reveal className="flag-table-wrap" delay={0.1}>
        <table className="flag-table">
          <caption>What each result means, and what the clinician does next</caption>
          <thead>
            <tr>
              <th scope="col">Result</th>
              <th scope="col">What it means</th>
              <th scope="col">Next step</th>
            </tr>
          </thead>
          <tbody>
            {FLAGS.map((f) => (
              <tr key={f.label}>
                <td>
                  <span className={`pd-pill ${f.tone}`}>{f.label}</span>
                </td>
                <td>{f.means}</td>
                <td>{f.next}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="flag-foot">
          <ShieldCheck size={15} /> A PHQ-9 self-harm answer is shown at the top of every report, whatever the result.
        </p>
      </Reveal>
    </section>
  )
}

// Methods each step is built on (moved here from the old marquee)
const ALGO_METHODS: string[][] = [
  ['Key down / up', 'Mouse x, y', 'ms timestamps'],
  ['Weighted kernel', '0.1 · 0.2 · 0.4 · 0.2 · 0.1'],
  ['8-feature vector', 'Attention heatmap'],
  ['EWMA', 'λ = 0.2'],
  ['Hotelling T²', 'Shrinkage covariance', 'Harrell–Davis cut-offs'],
  ['Psychomotor Slowing Index', 'Psychomotor Agitation Index'],
  ['Fuzzy logic', 'Seven rules'],
  ['71 healthy adults', 'Percentile ranks'],
]

// One line per step for readers who are not technical
const ALGO_PLAIN = [
  'Every key press and cursor move is logged with a timestamp.',
  'Shaky hand jitter is removed from the cursor path.',
  'Raw timing becomes eight measures, such as the time between keys.',
  'The warm-up typing becomes this client’s normal for today.',
  'All eight measures are checked together for an unusual shift.',
  'The shift is labelled as slowed down or sped up.',
  'Seven simple rules turn the results into one of four flags.',
  'Each measure is placed against 71 healthy adults.',
]

function Algorithm() {
  // The heading, timeline and panel hold on screen (sticky) while scrolling
  // walks through the eight steps, one per stretch of scroll.
  const { ref, active, goTo } = useScrollSteps(8, 88)
  const step = ALGORITHM_STEPS[active]
  const Icon = ALGO_ICONS[active] ?? Activity

  return (
    <section id="algorithm" className="section algorithm">
      <div ref={ref} className="algo-pin">
      <div className="algo-stick">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Behind the signals</Eyebrow>
          <h2>
            Eight steps <span className="dim">from keystroke to flag.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">Each step runs in order inside a session, on the clinic computer. Keep scrolling to walk through them, or pick a step.</p>
        </Reveal>
      </div>
      <div className="algo-tl">
        <div className="algo-track" aria-hidden="true">
          <motion.i animate={{ scaleX: active / 7 }} transition={{ duration: 0.5, ease: EASE }} />
        </div>
        <ol className="algo-steps" role="tablist" aria-label="Algorithm steps">
          {ALGORITHM_STEPS.map((s, i) => {
            const StepIcon = ALGO_ICONS[i] ?? Activity
            return (
              <li key={s.num}>
                <button
                  role="tab"
                  aria-selected={active === i}
                  className={active === i ? 'on' : i < active ? 'past' : ''}
                  onClick={() => goTo(i)}
                >
                  <span className="algo-dot">
                    <StepIcon size={16} />
                  </span>
                  <span className="algo-step-num mono">{s.num.padStart(2, '0')}</span>
                  <span className="algo-step-title">{s.title}</span>
                </button>
              </li>
            )
          })}
        </ol>
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            className="algo-panel"
            role="tabpanel"
            initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <div className="algo-panel-side">
              <span className="icon-disc">
                <Icon size={18} />
              </span>
              <span className="mono">Step {step.num} of 8</span>
            </div>
            <div className="algo-panel-main">
              <h3>{step.title}</h3>
              <p className="algo-plain">
                <b>In plain words:</b> {ALGO_PLAIN[active]}
              </p>
              <p className="algo-summary">{step.summary}</p>
              <p className="algo-detail-text">{step.detail}</p>
              <div className="algo-chips">
                <span className="mono">Built on</span>
                {ALGO_METHODS[active].map((m) => (
                  <b key={m}>{m}</b>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      </div>
      <div className="algo-spacer" aria-hidden="true" />
      </div>
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
          <h2>
            Common <span className="dim">questions.</span>
          </h2>
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
          <p className="footer-big">
            Bring PsyClick to your clinic.
          </p>
          <a className="footer-link" href="#team">
            Questions about deploying? Contact the ByteMe team <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="footer-cta">
          <p>Bring structured psychomotor screening into your next session.</p>
          <a className="btn btn-coral" href="#download">
            Download PsyClick
          </a>
        </div>
      </div>
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
      <p className="sx-endmark" aria-hidden="true">
        PsyClick
      </p>
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
let pauseIO: IntersectionObserver | null = null
function getPauseIO() {
  pauseIO ??= new IntersectionObserver(
    (entries) => entries.forEach((e) => e.target.toggleAttribute('data-offscreen', !e.isIntersecting)),
    { rootMargin: '300px 0px' },
  )
  return pauseIO
}

/**
 * Placed after each group of sections (inside its Suspense boundary). Its effect
 * runs only once that group has hydrated, so data-offscreen is never stamped on
 * server HTML that React has yet to hydrate (which caused hydration mismatches).
 * It observes the sections between itself and the previous marker.
 */
function PauseOffscreen() {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const io = getPauseIO()
    const els: Element[] = []
    let el = ref.current?.previousElementSibling ?? null
    while (el && !el.hasAttribute('data-pause-marker')) {
      if (el.matches('section, footer, div')) els.push(el)
      el = el.previousElementSibling
    }
    els.forEach((e) => io.observe(e))
    return () => els.forEach((e) => io.unobserve(e))
  }, [])
  return <span ref={ref} data-pause-marker="" hidden />
}


export default function Landing() {
  const [introDone, setIntroDone] = useState(false)
  const onIntroDone = useCallback(() => setIntroDone(true), [])
  // Hydrated: fade out the page loader painted by the layout
  useEffect(() => {
    document.documentElement.classList.add('pc-ready')
  }, [])
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true, anchors: { offset: -80 } }}>
      <MotionConfig reducedMotion="user">
        <IntroTakeover onDone={onIntroDone} />
        <main className="pc">
          <Nav />
          <Hero play={introDone} />
          <PauseOffscreen />
          <About />
          <RhythmField dir="down" />
          <PauseOffscreen />
          {/* Suspense boundaries let React hydrate below-the-fold sections in
              separate, interruptible chunks instead of one long task. */}
          <Suspense>
            <AppShowcase />
            <Reads />
            <TryRhythm />
            <RhythmField dir="up" deep />
            <PauseOffscreen />
          </Suspense>
          <Suspense>
            <GuideFlow />
            <Algorithm />
            <RhythmField dir="down" deep />
            <PauseOffscreen />
          </Suspense>
          <Suspense>
            <Report />
            <RolePanels />
            <RhythmField dir="up" />
            <Evidence />
            <PauseOffscreen />
          </Suspense>
          <Suspense>
            <DownloadHub />
            <Team />
            <Faq />
            <PauseOffscreen />
          </Suspense>
          <Footer />
          <PauseOffscreen />
        </main>
      </MotionConfig>
    </ReactLenis>
  )
}
