'use client'

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Cloud,
  Download,
  LayoutDashboard,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { animate, motion, useInView, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef } from 'react'

/*
 * A faithful, illustrative replica of the PsyClick Clinical Edition dashboard
 * (psyclick-clinical/frontend/src/pages/Dashboard.jsx): same sidebar, header,
 * stat cards, charts and "Recent Session List" columns. All values are sample data.
 */

const EASE = [0.22, 1, 0.36, 1] as const

const STATS = [
  { label: 'Total Clients', value: 48, sub: '46 active records', icon: Users, color: '#0ABFBC', grad: ['#E0F9F9', '#CCF4F3'], spark: [3, 5, 4, 6, 5, 7, 8] },
  { label: 'Sessions This Week', value: 12, sub: '+5 new sessions', icon: CalendarDays, color: '#5BA4CF', grad: ['#EEF4FF', '#DDE8FF'], spark: [2, 4, 3, 5, 6, 4, 7] },
  { label: 'No Concerns', value: 31, sub: '65% of clients', icon: CheckCircle, color: '#36C98E', grad: ['#E8FBF2', '#D2F5E5'], spark: [4, 4, 5, 6, 5, 6, 7] },
  { label: 'Need Review', value: 17, sub: '35% flagged', icon: AlertTriangle, color: '#F27C7C', grad: ['#FFF0F0', '#FFE0E0'], spark: [5, 3, 4, 3, 5, 4, 3] },
]

const WEEK = [
  { d: 'Sun', v: 1 },
  { d: 'Mon', v: 3 },
  { d: 'Tue', v: 2 },
  { d: 'Wed', v: 4 },
  { d: 'Thu', v: 2 },
  { d: 'Fri', v: 3 },
  { d: 'Sat', v: 5, today: true },
]

type Flag = 'GREEN' | 'AMBER' | 'RED'
const ROWS: { id: string; date: string; phq: number; gad: number; flag: Flag; summary: string; fresh?: boolean }[] = [
  { id: 'C-0148', date: 'Oct 3', phq: 6, gad: 4, flag: 'AMBER', summary: 'Psychomotor slowing above baseline', fresh: true },
  { id: 'C-0147', date: 'Oct 2', phq: 4, gad: 3, flag: 'GREEN', summary: 'Within normal psychomotor range' },
  { id: 'C-0146', date: 'Oct 2', phq: 16, gad: 13, flag: 'RED', summary: 'Significant concerns, follow up in 48–72 h' },
  { id: 'C-0145', date: 'Oct 1', phq: 8, gad: 9, flag: 'GREEN', summary: 'No significant concerns' },
  { id: 'C-0144', date: 'Sep 30', phq: 11, gad: 7, flag: 'AMBER', summary: 'Moderate concerns, schedule follow-up' },
]

const scoreTone = (n: number) => (n >= 15 ? 'coral' : n >= 10 ? 'amber' : 'green')

function Count({ to, run }: { to: number; run: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    if (!run) return
    const c = animate(0, to, {
      duration: 1.4,
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

  const noConcern = 31
  const review = 17
  const circ = 2 * Math.PI * 42
  const greenLen = (noConcern / (noConcern + review)) * circ

  return (
    <div ref={wrap} className="dash-perspective">
      <motion.div ref={win} className={`dash${run ? ' run' : ''}`} style={{ rotateX, scale, y }}>
        <div className="dash-titlebar">
          <span />
          <span />
          <span />
          <em>PsyClick — Clinical Edition</em>
        </div>
        <div className="dash-body">
          <aside className="dash-side" aria-hidden="true">
            <div className="dash-logo">
              <img src="/psyclick-icon.png" alt="" width={30} height={30} />
              <div>
                <strong>PsyClick</strong>
                <small>Clinical Edition</small>
              </div>
            </div>
            <p className="dash-side-label">Main Menu</p>
            <span className="dash-nav on">
              <LayoutDashboard size={15} /> Dashboard
            </span>
            <p className="dash-side-label">Clients</p>
            <span className="dash-nav">
              <Users size={15} /> Clients
            </span>
            <span className="dash-nav">
              <ClipboardList size={15} /> Audit
            </span>
            <span className="dash-nav">
              <ShieldCheck size={15} /> Security Center
            </span>
            <div className="dash-side-foot">
              <span className="dash-sync">
                <Cloud size={13} /> Cloud sync on
              </span>
              <span className="dash-logout">
                <LogOut size={14} /> Logout
              </span>
            </div>
          </aside>

          <div className="dash-main">
            <header className="dash-header">
              <span className="dash-search">
                <Search size={14} /> Search clients…
              </span>
              <span className="dash-intake">
                <Plus size={14} /> New Intake
              </span>
              <span className="dash-user">
                <i>CL</i> Clinician
              </span>
            </header>

            <div className="dash-content">
              <div className="dash-welcome">
                <div>
                  <h4>Welcome, Clinician!</h4>
                  <small>Saturday, October 3, 2026</small>
                </div>
                <span className="dash-chip">
                  <CalendarDays size={13} /> All Time
                </span>
              </div>
              <p className="dash-section-label">Clinical Session Results</p>

              <div className="dash-stats">
                {STATS.map((s, i) => {
                  const Icon = s.icon
                  return (
                    <motion.div
                      key={s.label}
                      className="dash-stat"
                      style={{ background: `linear-gradient(135deg, ${s.grad[0]}, ${s.grad[1]})` }}
                      initial={{ opacity: 0, y: 14 }}
                      animate={run ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.08 }}
                    >
                      <div className="dash-stat-top">
                        <span className="dash-stat-icon" style={{ color: s.color }}>
                          <Icon size={16} />
                        </span>
                        <span className="dash-spark">
                          {s.spark.map((h, j) => (
                            <i
                              key={j}
                              style={{ height: run ? `${h * 11}%` : '8%', background: s.color, transitionDelay: `${0.3 + j * 0.05}s` }}
                            />
                          ))}
                        </span>
                      </div>
                      <strong>
                        <Count to={s.value} run={run} />
                      </strong>
                      <span className="dash-stat-label">{s.label}</span>
                      <small>{s.sub}</small>
                    </motion.div>
                  )
                })}
              </div>

              <div className="dash-charts">
                <div className="dash-card">
                  <p className="dash-card-title">Session Overview</p>
                  <div className="dash-donut">
                    <svg viewBox="0 0 100 100" aria-hidden="true">
                      <circle cx="50" cy="50" r="42" stroke="#FFE0E0" />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#36C98E"
                        strokeDasharray={`${run ? greenLen : 0} ${circ}`}
                        className="dash-donut-fill"
                      />
                    </svg>
                    <div>
                      <small>Total</small>
                      <strong>
                        <Count to={48} run={run} />
                      </strong>
                    </div>
                  </div>
                  <div className="dash-legend">
                    <span>
                      <i style={{ background: '#36C98E' }} /> No Concerns
                    </span>
                    <span>
                      <i style={{ background: '#F27C7C' }} /> Need Review
                    </span>
                  </div>
                </div>
                <div className="dash-card dash-week">
                  <div className="dash-card-head">
                    <p className="dash-card-title">Sessions This Week</p>
                    <small>Last 7 days</small>
                  </div>
                  <div className="dash-bars">
                    {WEEK.map((w, i) => (
                      <div key={w.d}>
                        <i
                          className={w.today ? 'today' : ''}
                          style={{ height: run ? `${w.v * 18}%` : '4%', transitionDelay: `${0.4 + i * 0.06}s` }}
                        />
                        <small>{w.d}</small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="dash-card dash-table">
                <div className="dash-card-head">
                  <p className="dash-card-title">Recent Session List</p>
                  <div className="dash-tools">
                    {(['ALL', 'GREEN', 'AMBER', 'RED'] as const).map((f) => (
                      <span key={f} className={f === 'ALL' ? 'on' : ''}>
                        {f}
                      </span>
                    ))}
                    <span className="dash-export">
                      <Download size={12} /> Export
                    </span>
                  </div>
                </div>
                <div className="dash-rows" role="table" aria-label="Sample recent sessions">
                  <div className="dash-row head" role="row">
                    {['Client', 'Date', 'PHQ-9', 'GAD-7', 'Status', 'Summary', ''].map((h) => (
                      <span key={h} role="columnheader">
                        {h}
                      </span>
                    ))}
                  </div>
                  {ROWS.map((r, i) => (
                    <motion.div
                      key={r.id}
                      role="row"
                      className={`dash-row${r.fresh ? ' fresh' : ''}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={run ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.5, ease: EASE, delay: 0.6 + i * 0.08 }}
                    >
                      <span role="cell" className="dash-client">
                        <i>{r.id.slice(-2)}</i>
                        {r.id}
                      </span>
                      <span role="cell">{r.date}</span>
                      <span role="cell" className={`tone-${scoreTone(r.phq)}`}>
                        {r.phq}
                      </span>
                      <span role="cell" className={`tone-${scoreTone(r.gad)}`}>
                        {r.gad}
                      </span>
                      <span role="cell">
                        <span className={`app-flag ${r.flag.toLowerCase()}`}>{r.flag}</span>
                      </span>
                      <span role="cell" className="dash-summary">
                        {r.summary}
                      </span>
                      <span role="cell" className="dash-view">
                        View →
                      </span>
                    </motion.div>
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
