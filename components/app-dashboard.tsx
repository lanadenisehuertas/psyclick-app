'use client'

import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Cloud,
  LayoutDashboard,
  LogOut,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { animate, motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

/*
 * An illustrative replica of the PsyClick dashboard
 * (psyclick-secure/frontend/src/pages/Dashboard.jsx): same sidebar, start
 * panel, tinted key numbers, worklist and week chart. All values are sample data.
 */

const EASE = [0.22, 1, 0.36, 1] as const

const STATS = [
  { label: 'Clients', value: 15, sub: '20 sessions in total', icon: Users, tint: 'mint' },
  { label: 'Sessions this week', value: 6, sub: 'In the last 7 days', icon: CalendarDays, tint: 'cyan' },
  { label: 'Need follow-up', value: 9, sub: 'Follow up or Review now', icon: AlertTriangle, tint: 'peri' },
  { label: 'Self-harm answers', value: 4, sub: 'PHQ-9 question 9 above 0', icon: ShieldAlert, tint: 'alert' },
] as const

const WEEK = [
  { d: 'Tue', v: 1 },
  { d: 'Wed', v: 0 },
  { d: 'Thu', v: 2 },
  { d: 'Fri', v: 1 },
  { d: 'Sat', v: 3 },
  { d: 'Sun', v: 2 },
  { d: 'Mon', v: 4, today: true },
]

type Status = 'review' | 'follow' | 'clear'
const STATUS: Record<Status, string> = { review: 'Review now', follow: 'Follow up', clear: 'No concerns' }
const ROWS: { id: string; when: string; phq: number; gad: number; status: Status; safety?: boolean }[] = [
  { id: 'C-015', when: 'Oct 5, 9:12 AM', phq: 14, gad: 19, status: 'review', safety: true },
  { id: 'C-003', when: 'Oct 4, 3:40 PM', phq: 17, gad: 12, status: 'review', safety: true },
  { id: 'C-002', when: 'Oct 3, 10:05 AM', phq: 6, gad: 4, status: 'follow' },
  { id: 'C-009', when: 'Sep 27, 2:18 PM', phq: 7, gad: 9, status: 'follow' },
  { id: 'C-001', when: 'Oct 2, 11:30 AM', phq: 3, gad: 2, status: 'clear' },
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

export default function AppDashboard() {
  const wrap = useRef<HTMLDivElement>(null)
  const win = useRef<HTMLDivElement>(null)
  const run = useInView(win, { once: true, amount: 0.25 })
  const { scrollYProgress } = useScroll({ target: wrap, offset: ['start end', 'start 0.25'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [22, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1])
  const y = useTransform(scrollYProgress, [0, 1], [60, 0])
  const peak = Math.max(...WEEK.map((w) => w.v))

  return (
    <div ref={wrap} className="dash-perspective">
      <motion.div ref={win} className={`dash${run ? ' run' : ''}`} style={{ rotateX, scale, y }}>
        <div className="dash-titlebar">
          <span />
          <span />
          <span />
          <em>PsyClick</em>
        </div>
        <div className="dash-body">
          <aside className="pd-side" aria-hidden="true">
            <div className="pd-brand">
              <img src="/psyclick-icon.webp" alt="" width={30} height={30} loading="lazy" decoding="async" />
              <strong>PsyClick</strong>
            </div>
            <span className="pd-new">
              <Plus size={14} /> New assessment
            </span>
            <p className="pd-label">Clinic</p>
            <span className="pd-nav on">
              <LayoutDashboard size={15} /> Dashboard
            </span>
            <span className="pd-nav">
              <Users size={15} /> Clients
            </span>
            <p className="pd-label">Administration</p>
            <span className="pd-nav">
              <ClipboardList size={15} /> Audit log
            </span>
            <span className="pd-nav">
              <ShieldCheck size={15} /> Security center
            </span>
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
              <span className="pd-begin">
                Begin <ArrowRight size={14} />
              </span>
            </motion.div>

            <div className="pd-stats">
              {STATS.map((s, i) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.label}
                    className={`pd-stat t-${s.tint}`}
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
                  </motion.div>
                )
              })}
            </div>

            <div className="pd-grid">
              <div className="pd-card">
                <p className="pd-card-title">Needs your attention</p>
                <p className="pd-card-sub">Self-harm answers first, then Review now and Follow up.</p>
                <div className="pd-rows" role="table" aria-label="Sample worklist">
                  {ROWS.map((r, i) => (
                    <motion.div
                      key={r.id}
                      role="row"
                      className="pd-row"
                      initial={{ opacity: 0, x: -12 }}
                      animate={run ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.5 + i * 0.07 }}
                    >
                      <i className="pd-avatar">{r.id.slice(-2)}</i>
                      <span role="cell" className="pd-client">
                        <strong>{r.id}</strong>
                        <small>
                          {r.when} · PHQ-9 {r.phq} · GAD-7 {r.gad}
                        </small>
                      </span>
                      {r.safety && <span className="pd-pill safety">Self-harm answer</span>}
                      <span className={`pd-pill ${r.status}`}>{STATUS[r.status]}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="pd-card">
                <p className="pd-card-title">This week</p>
                <p className="pd-card-sub">Sessions per day, today highlighted.</p>
                <div className="pd-bars">
                  {WEEK.map((w, i) => (
                    <div key={w.d}>
                      <i
                        className={w.today ? 'today' : ''}
                        style={{ height: run ? `${Math.max(4, (w.v / peak) * 100)}%` : '4%', transitionDelay: `${0.4 + i * 0.06}s` }}
                      />
                      <small>{w.d}</small>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
