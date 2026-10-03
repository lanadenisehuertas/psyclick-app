'use client'

import { Check, Download } from 'lucide-react'
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
  'Clinician Login & Registration': 'Access',
  Dashboard: 'Overview',
  'New Client Intake & Consent': 'Setup',
  'Keyboard Calibration': 'Calibration',
  'Mouse Calibration': 'Calibration',
  'PHQ-9': 'Screening',
  'GAD-7': 'Screening',
  'Emotional Response Task': 'Screening',
  'Decision-Support Report': 'Review',
  'Client Database': 'Records',
  'Audit Log': 'Records',
  'Normative Tester Portal': 'Normative',
}

const ORDER: { title: string; wide?: boolean }[] = [
  { title: 'Decision-Support Report', wide: true },
  { title: 'Dashboard' },
  { title: 'Clinician Login & Registration' },
  { title: 'Keyboard Calibration' },
  { title: 'Mouse Calibration' },
  { title: 'Emotional Response Task', wide: true },
  { title: 'New Client Intake & Consent' },
  { title: 'PHQ-9' },
  { title: 'GAD-7' },
  { title: 'Client Database' },
  { title: 'Audit Log', wide: true },
  { title: 'Normative Tester Portal', wide: true },
]

/* ── Sketches ── */

const ReportSketch = () => (
  <div className="sk sk-report">
    <div className="sk-banner">
      <span className="flag-dot amber" /> Moderate Concerns <em>68%</em>
    </div>
    <div className="sk-metrics">
      {[
        ['PHQ-9', '6'],
        ['GAD-7', '4'],
        ['T²', '1.27×'],
      ].map(([k, v]) => (
        <div key={k}>
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
      <Download size={11} /> Export
    </span>
  </div>
)

const DashboardSketch = () => (
  <div className="sk sk-dash">
    <div className="sk-stats">
      {['#E0F9F9', '#EEF4FF', '#E8FBF2', '#FFF0F0'].map((bg, i) => (
        <i key={bg} style={{ background: bg, borderColor: ['#0ABFBC', '#5BA4CF', '#36C98E', '#F27C7C'][i] }} />
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
    <img src="/psyclick-icon.png" alt="" width={26} height={26} />
    <span className="sk-field mono">CL-2026-014</span>
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
    <small className="mono">Level B · mild stressor</small>
    <p>
      Describe how you typically react when unexpected <mark>changes</mark> are made to plans you have already prepared.
    </p>
    <p className="sk-typed mono">
      I try to adjust but it takes me a while<b />
    </p>
  </div>
)

const IntakeSketch = () => (
  <div className="sk sk-intake">
    <span className="sk-field mono">C-0148</span>
    <span className="sk-consent">
      <i>
        <Check size={10} />
      </i>
      Consent confirmed
    </span>
    <span className="sk-btn">Begin calibration</span>
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
      ['48', 'C-0148', 'amber'],
      ['47', 'C-0147', 'green'],
      ['46', 'C-0146', 'red'],
    ].map(([a, id, f]) => (
      <div key={id}>
        <i>{a}</i>
        <span>{id}</span>
        <b className={`app-flag ${f}`}>{f.toUpperCase()}</b>
      </div>
    ))}
  </div>
)

const AuditSketch = () => (
  <div className="sk sk-audit">
    {[
      ['09:02', 'Clinician signed in'],
      ['09:05', 'Intake started · C-0148'],
      ['09:19', 'Emotional task completed'],
      ['09:24', 'Report exported'],
    ].map(([t, e], i) => (
      <div key={t} style={{ animationDelay: `${i * 0.6}s` }}>
        <span className="mono">{t}</span>
        <i />
        <p>{e}</p>
      </div>
    ))}
  </div>
)

const NormativeSketch = () => (
  <div className="sk sk-norm">
    <svg viewBox="0 0 200 70" preserveAspectRatio="none" aria-hidden="true">
      <rect x="62" y="0" width="76" height="70" className="band" />
      <path d="M0,68 C40,68 60,8 100,6 C140,8 160,68 200,68" className="curve" />
      <line x1="128" y1="0" x2="128" y2="70" className="marker" />
    </svg>
    <span className="sk-norm-label mono">16–84% normative band · client at 78th percentile</span>
  </div>
)

const SKETCH: Record<string, () => React.ReactElement> = {
  'Decision-Support Report': ReportSketch,
  Dashboard: DashboardSketch,
  'Clinician Login & Registration': LoginSketch,
  'Keyboard Calibration': KeyboardSketch,
  'Mouse Calibration': MouseSketch,
  'Emotional Response Task': EmotionalSketch,
  'New Client Intake & Consent': IntakeSketch,
  'PHQ-9': () => <ItemsSketch n={9} done={3} />,
  'GAD-7': () => <ItemsSketch n={7} done={2} />,
  'Client Database': DatabaseSketch,
  'Audit Log': AuditSketch,
  'Normative Tester Portal': NormativeSketch,
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
