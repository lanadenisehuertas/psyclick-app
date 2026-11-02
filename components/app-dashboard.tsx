'use client'

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardList,
  Cloud,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Timer,
  Users,
  X,
} from 'lucide-react'
import { AnimatePresence, animate, motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

/*
 * An interactive, illustrative replica of the PsyClick dashboard
 * (psyclick-secure/frontend/src/pages/Dashboard.jsx): the sidebar switches
 * views, the key numbers filter the worklist, a client opens a report preview,
 * and "Begin" walks through the first steps of a session. All values are sample data.
 */

const EASE = [0.22, 1, 0.36, 1] as const

type View = 'dashboard' | 'clients' | 'audit' | 'security'
type Filter = 'week' | 'follow' | 'safety' | null
type Status = 'review' | 'follow' | 'clear'

const STATUS: Record<Status, string> = { review: 'Review now', follow: 'Follow up', clear: 'No concerns' }

type Client = {
  id: string
  when: string
  week: boolean
  phq: number
  gad: number
  status: Status
  safety?: boolean
  t2: number // behaviour change as a multiple of the healthy limit
  note: string
  // 8 biomarkers relative to the client's baseline, 0 = baseline, 1 = far from it
  bio: [number, number, number, number, number, number, number, number]
}

const CLIENTS: Client[] = [
  { id: 'C-015', when: 'Oct 5, 9:12 AM', week: true, phq: 14, gad: 19, status: 'review', safety: true, t2: 1.62, note: 'Long pauses before self-evaluative prompts; cursor jerk well above baseline.', bio: [0.8, 0.7, 0.6, 0.5, 0.7, 0.9, 0.8, 0.85] },
  { id: 'C-013', when: 'Oct 5, 8:20 AM', week: true, phq: 19, gad: 15, status: 'review', safety: true, t2: 1.71, note: 'Dwell and flight time both well above baseline; frequent long pauses.', bio: [0.85, 0.8, 0.7, 0.45, 0.55, 0.6, 0.65, 0.9] },
  { id: 'C-003', when: 'Oct 4, 3:40 PM', week: true, phq: 17, gad: 12, status: 'review', safety: true, t2: 1.55, note: 'Typing velocity down 31% against the client’s own baseline.', bio: [0.7, 0.8, 0.85, 0.4, 0.5, 0.5, 0.6, 0.7] },
  { id: 'C-002', when: 'Oct 3, 10:05 AM', week: true, phq: 6, gad: 4, status: 'follow', t2: 1.18, note: 'Self-report is mild, but flight time rose 38% and pauses doubled.', bio: [0.6, 0.45, 0.35, 0.2, 0.3, 0.35, 0.55, 0.6] },
  { id: 'C-009', when: 'Sep 27, 2:18 PM', week: false, phq: 7, gad: 9, status: 'follow', t2: 1.24, note: 'Erratic cursor paths (path entropy up) during the anxiety items.', bio: [0.3, 0.3, 0.25, 0.3, 0.6, 0.65, 0.7, 0.4] },
  { id: 'C-011', when: 'Oct 1, 1:50 PM', week: true, phq: 9, gad: 8, status: 'follow', t2: 1.09, note: 'Slight slowing on long answers; worth a check-in next session.', bio: [0.4, 0.35, 0.4, 0.2, 0.25, 0.2, 0.3, 0.35] },
  { id: 'C-001', when: 'Oct 2, 11:30 AM', week: true, phq: 3, gad: 2, status: 'clear', t2: 0.62, note: 'Typing and cursor rhythm close to baseline throughout.', bio: [0.15, 0.1, 0.15, 0.1, 0.2, 0.1, 0.15, 0.1] },
  { id: 'C-007', when: 'Sep 24, 4:05 PM', week: false, phq: 4, gad: 5, status: 'clear', t2: 0.71, note: 'No change worth flagging.', bio: [0.2, 0.15, 0.1, 0.2, 0.15, 0.2, 0.1, 0.2] },
  { id: 'C-005', when: 'Sep 26, 10:15 AM', week: false, phq: 15, gad: 11, status: 'review', safety: true, t2: 1.48, note: 'Cursor velocity down and pauses up across the questionnaire items.', bio: [0.5, 0.55, 0.6, 0.3, 0.75, 0.5, 0.45, 0.8] },
  { id: 'C-010', when: 'Sep 20, 3:30 PM', week: false, phq: 8, gad: 10, status: 'follow', t2: 1.12, note: 'Path entropy rising on the anxiety items; typing near baseline.', bio: [0.2, 0.25, 0.2, 0.15, 0.45, 0.4, 0.6, 0.3] },
  { id: 'C-012', when: 'Sep 22, 9:40 AM', week: false, phq: 11, gad: 6, status: 'follow', t2: 1.31, note: 'Dwell time up 24%; error rate rising across the session.', bio: [0.35, 0.65, 0.4, 0.6, 0.3, 0.25, 0.3, 0.4] },
]

const BIO_LABELS = ['Flight', 'Dwell', 'Velocity', 'Errors', 'Cursor', 'Jerk', 'Entropy', 'Pauses']

const ORDER: Record<Status, number> = { review: 0, follow: 1, clear: 2 }
const sortForAttention = (a: Client, b: Client) =>
  Number(!!b.safety) - Number(!!a.safety) || ORDER[a.status] - ORDER[b.status]

const STATS = [
  { key: 'clients', label: 'Clients', value: 15, sub: '20 sessions in total', icon: Users, tint: 'mint' },
  { key: 'week', label: 'Sessions this week', value: 6, sub: 'In the last 7 days', icon: CalendarDays, tint: 'cyan' },
  { key: 'follow', label: 'Need follow-up', value: 9, sub: 'Follow up or Review now', icon: AlertTriangle, tint: 'peri' },
  { key: 'safety', label: 'Self-harm answers', value: 4, sub: 'PHQ-9 question 9 above 0', icon: ShieldAlert, tint: 'alert' },
] as const

const WEEK = [
  { d: 'Tue', v: 0 },
  { d: 'Wed', v: 0 },
  { d: 'Thu', v: 1 },
  { d: 'Fri', v: 1 },
  { d: 'Sat', v: 1 },
  { d: 'Sun', v: 1 },
  { d: 'Mon', v: 2, today: true },
]

const AUDIT = [
  ['09:41', 'System', 'Synced 3 sessions to the clinic account'],
  ['09:12', 'Dr. A. Santos', 'Completed assessment for C-015'],
  ['08:20', 'Dr. A. Santos', 'Completed assessment for C-013'],
  ['09:05', 'Dr. A. Santos', 'Recorded consent for C-015'],
  ['08:02', 'Dr. A. Santos', 'Signed in'],
  ['Oct 4', 'J. Reyes', 'Exported report for C-003 as PDF'],
  ['Oct 4', 'Dr. A. Santos', 'Completed assessment for C-003'],
  ['Oct 3', 'Admin', 'Created clinician account for J. Reyes'],
]

const NAV: { key: View; label: string; icon: typeof Users; group: 'Clinic' | 'Administration' }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'Clinic' },
  { key: 'clients', label: 'Clients', icon: Users, group: 'Clinic' },
  { key: 'audit', label: 'Audit log', icon: ClipboardList, group: 'Administration' },
  { key: 'security', label: 'Security center', icon: ShieldCheck, group: 'Administration' },
]

function Count({ to, run }: { to: number; run: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!run) return
    const c = animate(0, to, {
      duration: 1.2,
      ease: EASE,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = String(Math.round(v))
      },
    })
    return () => c.stop()
  }, [run, to])
  return <span ref={ref}>0</span>
}

function Pills({ c }: { c: Client }) {
  return (
    <>
      {c.safety && <span className="pd-pill safety">Self-harm answer</span>}
      <span className={`pd-pill ${c.status}`}>{STATUS[c.status]}</span>
    </>
  )
}

/** 8-axis profile: dashed ring = the client's baseline, filled shape = this session. */
function Radar({ bio }: { bio: Client['bio'] }) {
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 2
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`
  }
  return (
    <svg viewBox="-14 -8 128 116" className="pd-radar" aria-hidden="true">
      {[14, 28, 42].map((r) => (
        <polygon key={r} points={BIO_LABELS.map((_, i) => pt(i, r)).join(' ')} className="grid" />
      ))}
      <polygon points={BIO_LABELS.map((_, i) => pt(i, 14)).join(' ')} className="base" />
      <motion.polygon
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ transformOrigin: '50px 50px' }}
        points={bio.map((v, i) => pt(i, 14 + v * 28)).join(' ')}
        className="val"
      />
      {BIO_LABELS.map((l, i) => {
        const [x, y] = pt(i, 50).split(',').map(Number)
        return (
          <text key={l} x={x} y={y + 2} textAnchor="middle">
            {l}
          </text>
        )
      })}
    </svg>
  )
}

function ReportSheet({ c, onClose }: { c: Client; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => closeRef.current?.focus({ preventScroll: true }), [c.id])
  return (
    <motion.div
      className="pd-sheet"
      role="dialog"
      aria-label={`Report preview for ${c.id}`}
      initial={{ x: '104%' }}
      animate={{ x: 0 }}
      exit={{ x: '104%' }}
      transition={{ duration: 0.45, ease: EASE }}
    >
      <div className="pd-sheet-head">
        <div>
          <small className="mono">Assessment report · sample</small>
          <strong className="mono">{c.id}</strong>
          <span>{c.when}</span>
        </div>
        <button ref={closeRef} className="pd-icon-btn" onClick={onClose} aria-label="Close report">
          <X size={16} />
        </button>
      </div>
      <div className="pd-sheet-pills">
        <Pills c={c} />
      </div>
      <div className="pd-sheet-scores">
        <div>
          <small>PHQ-9</small>
          <b>{c.phq}</b>
        </div>
        <div>
          <small>GAD-7</small>
          <b>{c.gad}</b>
        </div>
        <div className={c.t2 > 1 ? 'warn' : ''}>
          <small>Behaviour vs. limit</small>
          <b className="mono">{c.t2.toFixed(2)}×</b>
        </div>
      </div>
      <p className="pd-sheet-label">Typing & cursor profile</p>
      <Radar bio={c.bio} />
      <p className="pd-sheet-label">What stood out</p>
      <p className="pd-sheet-note">{c.note}</p>
      <p className="pd-sheet-foot">Decision support only. A clinician reviews every flag.</p>
    </motion.div>
  )
}

const SESSION_STEPS = [
  { title: 'Consent', body: 'The client reads what is measured: only the timing of keys and cursor movement, never what they write.' },
  { title: 'Keyboard warm-up', body: 'A short passage sets this client’s own typing baseline before any questions.' },
  { title: 'PHQ-9 · item 1', body: 'Little interest or pleasure in doing things? The answer and how long it took are both recorded.' },
]

function SessionPreview({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0)
  const [typed, setTyped] = useState(0)
  const passage = 'Plants turn sunlight into energy.'
  useEffect(() => {
    if (step !== 1) return
    setTyped(0)
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      setTyped(n)
      if (n >= passage.length) window.clearInterval(id)
    }, 70)
    return () => window.clearInterval(id)
  }, [step])
  const last = step === SESSION_STEPS.length - 1
  return (
    <motion.div
      className="pd-modal-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      <motion.div
        className="pd-modal"
        role="dialog"
        aria-label="New assessment preview"
        initial={{ y: 20, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 12, scale: 0.98 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="pd-modal-head">
          <small className="mono">New assessment · C-016 · preview</small>
          <button className="pd-icon-btn" onClick={onClose} aria-label="Close preview">
            <X size={16} />
          </button>
        </div>
        <ol className="pd-modal-steps">
          {SESSION_STEPS.map((s, i) => (
            <li key={s.title} className={i === step ? 'on' : i < step ? 'done' : ''}>
              <i>{i < step ? <Check size={11} /> : i + 1}</i>
              {s.title}
            </li>
          ))}
        </ol>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            className="pd-modal-body"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25 }}
          >
            <strong>{SESSION_STEPS[step].title}</strong>
            <p>{SESSION_STEPS[step].body}</p>
            {step === 0 && (
              <label className="pd-consent">
                <span className="pd-check">
                  <Check size={12} />
                </span>
                The client understands and agrees to the recording.
              </label>
            )}
            {step === 1 && (
              <div className="pd-type">
                <span className="ghost">{passage}</span>
                <span className="done">{passage.slice(0, typed)}</span>
              </div>
            )}
            {step === 2 && (
              <div className="pd-likert">
                {['Not at all', 'Several days', 'More than half', 'Nearly every day'].map((o, i) => (
                  <span key={o} className={i === 1 ? 'on' : ''}>
                    {o}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="pd-modal-foot">
          <button className="pd-ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft size={14} /> Back
          </button>
          <button className="pd-primary" onClick={() => (last ? onClose() : setStep((s) => s + 1))}>
            {last ? 'Done' : 'Next'} {!last && <ArrowRight size={14} />}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ClientsView({ onOpen }: { onOpen: (c: Client) => void }) {
  const [q, setQ] = useState('')
  const list = CLIENTS.filter((c) => c.id.toLowerCase().includes(q.trim().toLowerCase()))
  return (
    <div className="pd-card pd-view">
      <div className="pd-view-head">
        <div>
          <p className="pd-card-title">Clients</p>
          <p className="pd-card-sub">15 clients · showing the 11 most recent sessions.</p>
        </div>
        <label className="pd-search">
          <Search size={14} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search client code" aria-label="Search clients" />
        </label>
      </div>
      <div className="pd-table" role="table" aria-label="Sample clients">
        <div className="pd-tr head" role="row">
          <span>Client</span>
          <span>Last session</span>
          <span>PHQ-9</span>
          <span>GAD-7</span>
          <span>Status</span>
        </div>
        {list.map((c) => (
          <button key={c.id} className="pd-tr" role="row" onClick={() => onOpen(c)}>
            <span className="mono">{c.id}</span>
            <span>{c.when}</span>
            <span>{c.phq}</span>
            <span>{c.gad}</span>
            <span>
              <span className={`pd-pill ${c.status}`}>{STATUS[c.status]}</span>
            </span>
          </button>
        ))}
        {list.length === 0 && <p className="pd-empty">No client matches “{q}”.</p>}
      </div>
    </div>
  )
}

function AuditView() {
  return (
    <div className="pd-card pd-view">
      <p className="pd-card-title">Audit log</p>
      <p className="pd-card-sub">Every sign-in, assessment and export, kept on this computer.</p>
      <ul className="pd-audit">
        {AUDIT.map(([t, who, what], i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <span className="mono">{t}</span>
            <b>{who}</b>
            <span>{what}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

function SecurityView() {
  const items = [
    { icon: Lock, title: 'Stored on this computer', body: 'Sessions work offline and sync when online.' },
    { icon: KeyRound, title: 'Individual sign-in', body: 'Administrators, clinicians and auditors each use their own ID.' },
    { icon: Timer, title: 'Auto sign-out', body: 'Idle sessions close so a shared computer stays private.' },
    { icon: ClipboardList, title: 'Audit log on', body: 'Changes and exports are recorded with who and when.' },
  ]
  return (
    <div className="pd-card pd-view">
      <p className="pd-card-title">Security center</p>
      <p className="pd-card-sub">Built with RA 10173 (Data Privacy Act) in mind.</p>
      <div className="pd-sec">
        {items.map(({ icon: Icon, title, body }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <i>
              <Icon size={15} />
            </i>
            <b>{title}</b>
            <small>{body}</small>
            <span className="pd-on">
              <Check size={11} /> On
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function AppDashboard() {
  const wrap = useRef<HTMLDivElement>(null)
  const win = useRef<HTMLDivElement>(null)
  const run = useInView(win, { once: true, amount: 0.25 })
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start end', 'start 0.25'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  const y = useTransform(scrollYProgress, [0, 1], [60, 0])
  const peak = Math.max(...WEEK.map((w) => w.v))

  const [view, setView] = useState<View>('dashboard')
  const [filter, setFilter] = useState<Filter>(null)
  const [open, setOpen] = useState<Client | null>(null)
  const [session, setSession] = useState(false)

  // Esc closes the report or the session preview
  useEffect(() => {
    if (!open && !session) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(null)
        setSession(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, session])

  const rows = useMemo(() => {
    const base = [...CLIENTS].sort(sortForAttention)
    if (filter === 'week') return base.filter((c) => c.week)
    if (filter === 'follow') return base.filter((c) => c.status !== 'clear')
    if (filter === 'safety') return base.filter((c) => c.safety)
    return base.slice(0, 5)
  }, [filter])

  const go = (v: View) => {
    setView(v)
    setOpen(null)
  }
  const onStat = (key: (typeof STATS)[number]['key']) => {
    if (key === 'clients') return go('clients')
    setFilter((f) => (f === key ? null : key))
  }
  const filterLabel =
    filter === 'week' ? 'Sessions this week' : filter === 'follow' ? 'Follow up or Review now' : filter === 'safety' ? 'Self-harm answers' : null

  return (
    <div ref={wrap} className="dash-perspective">
      <motion.div ref={win} className={`dash${run ? ' run' : ''}`} style={{ rotateX, scale, y }}>
        <div className="dash-titlebar">
          <span />
          <span />
          <span />
          <em>PsyClick</em>
          <small className="dash-try mono">Interactive sample · click around</small>
        </div>
        <div className="dash-body">
          <aside className="pd-side">
            <div className="pd-brand">
              <img src="/psyclick-icon.webp" alt="" width={30} height={30} loading="lazy" decoding="async" />
              <strong>PsyClick</strong>
            </div>
            <button className="pd-new" onClick={() => setSession(true)}>
              <Plus size={14} /> New assessment
            </button>
            {(['Clinic', 'Administration'] as const).map((g) => (
              <div key={g} className="pd-group">
                <p className="pd-label">{g}</p>
                {NAV.filter((n) => n.group === g).map((n) => {
                  const Icon = n.icon
                  return (
                    <button
                      key={n.key}
                      className={`pd-nav${view === n.key ? ' on' : ''}`}
                      aria-current={view === n.key ? 'page' : undefined}
                      onClick={() => go(n.key)}
                    >
                      <Icon size={15} /> {n.label}
                    </button>
                  )
                })}
              </div>
            ))}
            <div className="pd-foot">
              <span className="pd-sync">
                <Cloud size={13} />
                <span>
                  <small>Saved on this computer</small>
                  Synced at 09:41
                </span>
              </span>
              <span className="pd-user">
                <i>AS</i>
                <span>
                  Dr. A. Santos
                  <small>Administrator</small>
                </span>
                <LogOut size={14} />
              </span>
            </div>
          </aside>

          <div className="pd-main">
            {/* phones: the sidebar is hidden, so views switch here */}
            <div className="pd-tabs" role="tablist" aria-label="Dashboard views">
              {NAV.map((n) => (
                <button key={n.key} role="tab" aria-selected={view === n.key} className={view === n.key ? 'on' : ''} onClick={() => go(n.key)}>
                  {n.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25, ease: EASE }}
              >
                {view === 'dashboard' && (
                  <>
                    <p className="pd-date">Monday, 5 October 2026</p>
                    <h4 className="pd-hello">Good morning, Dr. Santos</h4>
                    <p className="pd-sub">Here is what needs your attention today.</p>

                    <motion.div
                      className="pd-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={run ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
                    >
                      <svg viewBox="0 0 120 40" className="pd-start-trace" aria-hidden="true">
                        <path d="M2 22 H34 L42 10 L50 32 L58 16 L66 22 H118" />
                      </svg>
                      <div>
                        <strong>Start a new assessment</strong>
                        <small>About 15 minutes: consent, two warm-ups, two questionnaires and twelve short written answers.</small>
                      </div>
                      <button className="pd-begin" onClick={() => setSession(true)}>
                        Begin <ArrowRight size={14} />
                      </button>
                    </motion.div>

                    <div className="pd-stats">
                      {STATS.map((s, i) => {
                        const Icon = s.icon
                        const active = filter === s.key
                        return (
                          <motion.button
                            key={s.label}
                            className={`pd-stat t-${s.tint}${active ? ' active' : ''}`}
                            aria-pressed={s.key === 'clients' ? undefined : active}
                            onClick={() => onStat(s.key)}
                            initial={{ opacity: 0, y: 14 }}
                            animate={run ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.6, ease: EASE, delay: 0.18 + i * 0.08 }}
                          >
                            <span className="pd-stat-head">
                              {s.label}
                              <i>
                                <Icon size={15} />
                              </i>
                            </span>
                            <strong>
                              <Count to={s.value} run={run} />
                            </strong>
                            <small>{s.sub}</small>
                          </motion.button>
                        )
                      })}
                    </div>

                    <div className="pd-grid">
                      <div className="pd-card">
                        <div className="pd-card-row">
                          <div>
                            <p className="pd-card-title">Needs your attention</p>
                            <p className="pd-card-sub">
                              {filterLabel ? `Filtered: ${filterLabel}` : 'Self-harm answers first, then Review now and Follow up.'}
                            </p>
                          </div>
                          {filter && (
                            <button className="pd-clear" onClick={() => setFilter(null)}>
                              Clear <X size={12} />
                            </button>
                          )}
                        </div>
                        <div className="pd-rows" role="list" aria-label="Sample worklist">
                          <AnimatePresence initial={false}>
                            {rows.map((r, i) => (
                              <motion.button
                                layout
                                key={r.id}
                                role="listitem"
                                className={`pd-row${open?.id === r.id ? ' on' : ''}`}
                                onClick={() => setOpen(r)}
                                initial={{ opacity: 0, x: -12 }}
                                animate={run ? { opacity: 1, x: 0 } : {}}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.35, ease: EASE, delay: run ? 0.05 + i * 0.04 : 0 }}
                              >
                                <i className="pd-avatar">{r.id.slice(-2)}</i>
                                <span className="pd-client">
                                  <strong>{r.id}</strong>
                                  <small>
                                    {r.when} · PHQ-9 {r.phq} · GAD-7 {r.gad}
                                  </small>
                                </span>
                                <Pills c={r} />
                                <ArrowRight size={13} className="pd-row-go" />
                              </motion.button>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                      <div className="pd-card">
                        <p className="pd-card-title">This week</p>
                        <p className="pd-card-sub">Sessions per day, today highlighted.</p>
                        <div className="pd-bars">
                          {WEEK.map((w, i) => (
                            <div key={w.d} title={`${w.d}: ${w.v} session${w.v === 1 ? '' : 's'}`}>
                              <i
                                className={w.today ? 'today' : ''}
                                style={{ height: run ? `${Math.max(4, (w.v / peak) * 100)}%` : '4%', transitionDelay: `${0.4 + i * 0.06}s` }}
                              />
                              <b>{w.v}</b>
                              <small>{w.d}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {view === 'clients' && <ClientsView onOpen={setOpen} />}
                {view === 'audit' && <AuditView />}
                {view === 'security' && <SecurityView />}
              </motion.div>
            </AnimatePresence>
          </div>

          <AnimatePresence>{open && <ReportSheet key={open.id} c={open} onClose={() => setOpen(null)} />}</AnimatePresence>
          <AnimatePresence>{session && <SessionPreview onClose={() => setSession(false)} />}</AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
