'use client'

import { Check, Download, Laptop, Monitor } from 'lucide-react'
import type React from 'react'
import { Eyebrow, Reveal } from '@/components/landing-kit'
import { FEATURE_CARDS } from '@/lib/landing-data'

/*
 * The twelve PsyClick screens as a bento. Each tile carries a small working
 * sketch of the real screen; hovering (or focusing) turns the sketch over to
 * show how the screen is used and why it matters. Stage tags match the
 * "How it works" flow.
 */

const STAGE: Record<string, string> = {
  'Sign-in & Accounts': 'Access',
  Dashboard: 'Overview',
  'New Assessment & Consent': 'Setup',
  'Keyboard Calibration': 'Calibration',
  'Mouse Calibration': 'Calibration',
  'PHQ-9': 'Screening',
  'GAD-7': 'Screening',
  'Emotional Response Task': 'Screening',
  'Assessment Report': 'Review',
  'Client Database': 'Records',
  'Audit Log': 'Records',
  'Offline-first Sync': 'Sync',
}

const ORDER: { title: string; wide?: boolean }[] = [
  { title: 'Assessment Report', wide: true },
  { title: 'Dashboard' },
  { title: 'Sign-in & Accounts' },
  { title: 'Keyboard Calibration' },
  { title: 'Mouse Calibration' },
  { title: 'Emotional Response Task', wide: true },
  { title: 'New Assessment & Consent' },
  { title: 'PHQ-9' },
  { title: 'GAD-7' },
  { title: 'Client Database' },
  { title: 'Audit Log', wide: true },
  { title: 'Offline-first Sync', wide: true },
]

/* ── Sketches ── */

const ReportSketch = () => (
  <div className="sk sk-report">
    <div className="sk-banner">
      <span className="flag-dot amber" /> Follow up · slowed responses
    </div>
    <div className="sk-metrics">
      {[
        ['Behaviour', '92', 'cyan'],
        ['PHQ-9', '6', 'mint'],
        ['GAD-7', '4', 'peri'],
      ].map(([k, v, t]) => (
        <div key={k} className={`pd-stat t-${t}`}>
          <small>{k}</small>
          <strong>{v}</strong>
        </div>
      ))}
    </div>
    <div className="sk-histo">
      {[14, 30, 52, 78, 96, 70, 48, 32, 20, 12, 8].map((h, i) => (
        <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.06}s` }} />
      ))}
    </div>
    <span className="sk-export">
      <Download size={11} /> Save as PDF
    </span>
  </div>
)

const DashboardSketch = () => (
  <div className="sk sk-dash">
    <div className="sk-stats">
      {['mint', 'cyan', 'peri', 'alert'].map((t) => (
        <i key={t} className={`pd-stat t-${t}`} />
      ))}
    </div>
    <div className="sk-bars">
      {[30, 55, 40, 70, 45, 60, 92].map((h, i) => (
        <i key={i} className={i === 6 ? 'today' : ''} style={{ height: `${h}%`, animationDelay: `${i * 0.07}s` }} />
      ))}
    </div>
  </div>
)

const LoginSketch = () => (
  <div className="sk sk-login">
    <img src="/psyclick-icon.webp" alt="" width={26} height={26} loading="lazy" decoding="async" />
    <span className="sk-field mono">2026006</span>
    <span className="sk-field mono">••••••••</span>
    <span className="sk-btn">Sign in</span>
  </div>
)

const KeyboardSketch = () => (
  <div className="sk sk-keys">
    {['P', 'S', 'Y', 'C', 'L'].map((k, i) => (
      <span key={k} className={i === 3 ? 'late' : ''} style={{ animationDelay: `${i === 3 ? 1.1 : i * 0.18}s` }}>
        {k}
      </span>
    ))}
  </div>
)

const MouseSketch = () => (
  <div className="sk sk-mouse">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <polyline points="18,30 52,20 40,66 14,76 82,73" />
    </svg>
    {[
      [18, 30],
      [52, 20],
      [40, 66],
      [14, 76],
      [82, 73],
    ].map(([x, y], i) => (
      <span key={i} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.5}s` }}>
        {i + 1}
      </span>
    ))}
  </div>
)

const EmotionalSketch = () => (
  <div className="sk sk-emo">
    <small className="mono">Moderate · Relationships</small>
    <p>
      How did you react the last time you felt you <mark>let down</mark> someone important?
    </p>
    <p className="sk-typed mono">
      I kept apologising and avoided them for a while<b />
    </p>
  </div>
)

const IntakeSketch = () => (
  <div className="sk sk-intake">
    <span className="sk-field mono">C-016</span>
    <span className="sk-consent">
      <i>
        <Check size={10} />
      </i>
      Consent recorded
    </span>
    <span className="sk-btn">Start assessment</span>
  </div>
)

const ItemsSketch = ({ n, done }: { n: number; done: number }) => (
  <div className="sk sk-items">
    <div className="sk-dots">
      {Array.from({ length: n }).map((_, i) => (
        <i key={i} className={i < done ? 'on' : i === done ? 'now' : ''} />
      ))}
    </div>
    <div className="sk-likert">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={i === 1 ? 'on' : ''} />
      ))}
    </div>
    <small className="mono">
      Item {done + 1} of {n}
    </small>
  </div>
)

const DatabaseSketch = () => (
  <div className="sk sk-db">
    {[
      ['15', 'C-015', 'review', 'Review now'],
      ['02', 'C-002', 'follow', 'Follow up'],
      ['01', 'C-001', 'clear', 'No concerns'],
    ].map(([a, id, f, label]) => (
      <div key={id}>
        <i>{a}</i>
        <span>{id}</span>
        <b className={`pd-pill ${f}`}>{label}</b>
      </div>
    ))}
  </div>
)

const AuditSketch = () => (
  <div className="sk sk-audit">
    {[
      ['09:02', 'Logged in · Dr. A. Santos'],
      ['09:05', 'Consent recorded · C-016'],
      ['09:19', 'Finished session · C-016'],
      ['09:24', 'Saved report as PDF'],
    ].map(([t, e], i) => (
      <div key={t} style={{ animationDelay: `${i * 0.6}s` }}>
        <span className="mono">{t}</span>
        <i />
        <p>{e}</p>
      </div>
    ))}
  </div>
)

const SyncSketch = () => (
  <div className="sk sk-sync">
    <span className="sk-device">
      <Laptop size={22} />
      <small>Clinic room</small>
    </span>
    <span className="sk-sync-line" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
    <span className="sk-device">
      <Monitor size={22} />
      <small>Front desk</small>
    </span>
    <span className="sk-sync-label mono">Saved on this computer · synced 09:41</span>
  </div>
)

const SKETCH: Record<string, () => React.ReactElement> = {
  'Assessment Report': ReportSketch,
  Dashboard: DashboardSketch,
  'Sign-in & Accounts': LoginSketch,
  'Keyboard Calibration': KeyboardSketch,
  'Mouse Calibration': MouseSketch,
  'Emotional Response Task': EmotionalSketch,
  'New Assessment & Consent': IntakeSketch,
  'PHQ-9': () => <ItemsSketch n={9} done={3} />,
  'GAD-7': () => <ItemsSketch n={7} done={2} />,
  'Client Database': DatabaseSketch,
  'Audit Log': AuditSketch,
  'Offline-first Sync': SyncSketch,
}

export default function FeaturesBento() {
  return (
    <section id="features" className="section features">
      <div className="section-head split">
        <Reveal>
          <Eyebrow>Features</Eyebrow>
          <h2>Twelve screens, one connected workflow.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="section-sub">Hover or focus a screen to see how it’s used and why it matters.</p>
        </Reveal>
      </div>
      <div className="fb-grid">
        {ORDER.map(({ title, wide }, i) => {
          const f = FEATURE_CARDS.find((c) => c.title === title)!
          const Icon = f.icon
          const Sketch = SKETCH[title]
          return (
            <Reveal key={title} className={`fb-cell${wide ? ' wide' : ''}`} delay={(i % 4) * 0.05}>
              <article className="fb" tabIndex={0} aria-label={title}>
                <div className="fb-vis">
                  <span className="fb-tag mono">{STAGE[title]}</span>
                  <div className="fb-front" aria-hidden="true">
                    <Sketch />
                  </div>
                  <div className="fb-back">
                    <p>
                      <b>How it works</b>
                      {f.use}
                    </p>
                    <p>
                      <b>Benefit</b>
                      {f.benefit}
                    </p>
                  </div>
                </div>
                <div className="fb-copy">
                  <span className="fb-icon">
                    <Icon size={16} />
                  </span>
                  <div>
                    <h3>{title}</h3>
                    <p>{f.intent}</p>
                  </div>
                </div>
              </article>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
