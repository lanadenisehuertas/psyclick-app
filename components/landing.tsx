'use client'

import {
  Activity,
  ArrowRight,
  BarChart3,
  Brain,
  Check,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Database,
  Download,
  FileText,
  HeartPulse,
  History,
  Keyboard,
  Lock,
  MousePointer2,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  UserCheck,
  X,
  Menu,
} from 'lucide-react'
import type React from 'react'
import { useState, useEffect, useRef } from 'react'

/* ─── Data ─────────────────────────────────────────────── */

const NAV_LINKS = [
  { href: '#overview', label: 'Overview' },
  { href: '#for-clients', label: 'For Clients' },
  { href: '#for-clinicians', label: 'For Clinicians' },
  { href: '#features', label: 'Features' },
  { href: '#guide', label: 'How It Works' },
  { href: '#algorithm', label: 'Algorithms' },
  { href: '#download', label: 'Download' },
  { href: '#team', label: 'Team' },
  { href: '#faq', label: 'FAQ' },
]

const FEATURE_CARDS = [
  {
    icon: Lock,
    title: 'Clinician Login & Registration',
    intent: 'Secure clinician access.',
    use: 'Register, receive clinician ID, sign in with password.',
    benefit: 'Keeps clinical workflows role-based and protected.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard',
    intent: 'Quick clinic and session overview.',
    use: 'View total clients, sessions this week, concern counts, recent sessions, charts, and export.',
    benefit: 'Supports fast review and prioritization.',
  },
  {
    icon: ClipboardList,
    title: 'New Client Intake & Consent',
    intent: 'Begin sessions with client identity and consent.',
    use: 'Enter full name or client ID, confirm consent, begin baseline calibration.',
    benefit: 'Keeps session start consistent and accountable.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard Calibration',
    intent: 'Establish the client\'s baseline typing rhythm.',
    use: 'Client types the displayed paragraph naturally.',
    benefit: 'Gives the algorithm a within-session reference for comparison.',
  },
  {
    icon: MousePointer2,
    title: 'Mouse Calibration',
    intent: 'Establish baseline pointer movement and clicking behavior.',
    use: 'Client clicks numbered circles in order.',
    benefit: 'Captures movement speed, smoothness, hesitation, and path behavior.',
  },
  {
    icon: HeartPulse,
    title: 'PHQ-9',
    intent: 'Standard depression symptom screening.',
    use: 'Client answers 9 items based on the last 2 weeks.',
    benefit: 'Adds a recognized symptom score to the report.',
  },
  {
    icon: Activity,
    title: 'GAD-7',
    intent: 'Standard anxiety symptom screening.',
    use: 'Client answers 7 items based on the last 2 weeks.',
    benefit: 'Adds a recognized anxiety score to the report.',
  },
  {
    icon: Brain,
    title: 'Emotional Response Task',
    intent: 'Observe written responses and psychomotor dynamics under different emotional prompts.',
    use: 'Client answers 12 prompts with typed responses up to 500 characters each.',
    benefit: 'Supports per-question biomarker analysis across domains.',
  },
  {
    icon: FileText,
    title: 'Decision-Support Report',
    intent: 'Summarize clinical decision-support signals.',
    use: 'Review flags, scores, charts, heatmaps, recommendation text, and per-question data.',
    benefit: 'Gives clinicians a clearer basis for discussion and follow-up.',
  },
  {
    icon: Database,
    title: 'Client Database',
    intent: 'Manage client records.',
    use: 'Search, filter, open client details, view session history.',
    benefit: 'Supports continuity across sessions.',
  },
  {
    icon: History,
    title: 'Audit Log',
    intent: 'Track clinician and client activity.',
    use: 'Review sign-ins, exports, session progress, and task events.',
    benefit: 'Supports compliance review and troubleshooting.',
  },
  {
    icon: ShieldCheck,
    title: 'Normative Tester Portal',
    intent: 'Collect baseline reference sessions.',
    use: 'Authorized testers complete the same session flow.',
    benefit: 'Improves the normative comparison dataset.',
  },
]

const CLINICIAN_STEPS = [
  'Install and open PsyClick',
  'Register or sign in with clinician ID and password',
  'Click New Intake',
  'Enter client ID / name and confirm consent',
  'Guide the client through keyboard calibration',
  'Guide the client through mouse calibration',
  'Have the client complete PHQ-9',
  'Have the client complete GAD-7',
  'Have the client complete the emotional response task',
  'Review the final report',
  'Export the report if needed',
  'Return to dashboard / client database for follow-up',
]

const CLIENT_STEPS = [
  'Listen to the clinician\'s instructions',
  'Type naturally during the typing task',
  'Click each numbered circle naturally during the mouse task',
  'Answer PHQ-9 and GAD-7 honestly',
  'Type natural responses to emotional prompts',
  'Wait while the clinician reviews the report',
]

const TESTER_STEPS = [
  'Open the Normative Tester Portal',
  'Enter assigned tester ID and authorized session password',
  'Complete keyboard calibration',
  'Complete mouse calibration',
  'Complete PHQ-9',
  'Complete GAD-7',
  'Complete emotional response task',
  'Exit portal after the completion page',
]

const ALGORITHM_STEPS = [
  {
    num: '1',
    title: 'Signal Capture',
    summary: 'Raw input events logged in real time.',
    detail: 'Captures keystroke DOWN/UP events, timestamps, mouse coordinates, movement, clicks, response timing, idle events, and questionnaire answers.',
  },
  {
    num: '2',
    title: 'Smooth',
    summary: '5-point weighted moving average on mouse paths.',
    detail: 'Mouse x/y coordinates are smoothed with a weighted kernel [0.1, 0.2, 0.4, 0.2, 0.1] to reduce high-frequency cursor noise while preserving lower-frequency hesitation patterns.',
  },
  {
    num: '3',
    title: 'Extract',
    summary: '8-feature psychomotor vector from keyboard and mouse.',
    detail: 'Keyboard: flight time, dwell time, typing velocity, error rate, pause frequency. Mouse: cursor velocity, jerk, path entropy, pause frequency and coordinates for heatmap.',
  },
  {
    num: '4',
    title: 'Baseline',
    summary: 'EWMA adaptive personal baseline per session.',
    detail: 'Calibration builds an adaptive personal baseline using EWMA. Formula: μ(t) = λ·x(t) + (1−λ)·μ(t−1). Covariance updated with λ = 0.2. Compares users against their own session, not only a population.',
  },
  {
    num: '5',
    title: 'Hotelling T²',
    summary: 'Multivariate anomaly detection across all features.',
    detail: 'Compares the current feature vector to the baseline across multiple psychomotor features. Uses regularized covariance inverse. Uses F-distribution threshold when enough calibration samples exist and chi-square fallback otherwise.',
  },
  {
    num: '6',
    title: 'PSI & PAI',
    summary: 'Psychomotor Slowing and Agitation Indices.',
    detail: 'PSI uses flight time, dwell time, and pause frequency — higher values indicate slowing. PAI uses typing velocity, error rate, path entropy, cursor velocity, and jerk — higher values indicate agitation.',
  },
  {
    num: '7',
    title: 'Classify',
    summary: 'Fuzzy logic maps signals to GREEN / AMBER / RED.',
    detail: 'Converts T², PSI, and PAI into graded memberships. Produces labels: Normal, Psychomotor Retardation, Psychomotor Agitation, or Mixed Disturbance. Maps severity to GREEN, AMBER, or RED decision-support flags.',
  },
  {
    num: '8',
    title: 'Normative',
    summary: 'Compare against reference population baseline.',
    detail: 'Aggregates authorized normative tester sessions into reference statistics. Compares client/session metrics against the normative baseline when available.',
  },
]

const FAQ_ITEMS = [
  {
    q: 'Is PsyClick a diagnosis tool?',
    a: 'No. PsyClick is a clinical decision-support tool. It does not replace clinical judgment, formal diagnosis, emergency assessment, or established clinic protocols. Clinician review is always required.',
  },
  {
    q: 'Who should use PsyClick?',
    a: 'PsyClick is designed for clinicians running psychomotor and mental health screening sessions. Clients/patients complete guided tasks under clinician supervision. Authorized normative testers contribute to the reference dataset.',
  },
  {
    q: 'What does the client do during a session?',
    a: 'Clients type a paragraph naturally, click numbered circles, answer PHQ-9 and GAD-7 questionnaires, and respond to 12 written emotional prompts. There are no right or wrong answers.',
  },
  {
    q: 'What do GREEN, AMBER, and RED mean?',
    a: 'GREEN indicates results within normal psychomotor range. AMBER suggests mild deviations warranting clinician review. RED indicates notable deviations requiring closer clinical attention. All flags are decision-support signals, not diagnoses.',
  },
  {
    q: 'What are PHQ-9 and GAD-7?',
    a: 'PHQ-9 is a standard 9-item depression screening questionnaire. GAD-7 is a standard 7-item generalized anxiety screening questionnaire. Both are well-validated clinical tools used globally.',
  },
  {
    q: 'What is the Psychomotor Slowing Index (PSI)?',
    a: 'PSI combines flight time, dwell time, and pause frequency. Higher values suggest more slowing, longer key holds, or more frequent hesitation compared to the session baseline.',
  },
  {
    q: 'What is the Psychomotor Agitation Index (PAI)?',
    a: 'PAI combines typing velocity, error rate, path entropy, cursor velocity, and jerk. Higher values suggest more restlessness, erratic movement, or abrupt cursor behavior.',
  },
  {
    q: 'What is Hotelling T²?',
    a: 'Hotelling T² is a multivariate statistical test that detects deviations from a baseline across multiple features simultaneously. PsyClick uses it to identify psychomotor shifts that might not be apparent from a single feature alone.',
  },
  {
    q: 'What system does PsyClick run on?',
    a: 'PsyClick runs on Windows 10 or later. It requires internet access for cloud database mode, a keyboard, a mouse, and clinic or research authorization.',
  },
  {
    q: 'Where can I download the app?',
    a: 'Use the Download button on this page to get the PsyClick-Setup.exe installer. Run the installer, and if SmartScreen appears, choose More info then Run anyway only if the source is trusted.',
  },
]

/* ─── Sub-components ────────────────────────────────────── */

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

function ProductMockup() {
  return (
    <div className="landing-device">
      <div className="device-topbar">
        <span style={{ background: '#ff5f57' }} />
        <span style={{ background: '#ffbd2e' }} />
        <span style={{ background: '#28c840' }} />
      </div>
      <div className="device-content">
        <div className="device-sidebar">
          <div className="device-sidebar-logo">Ψ</div>
          <div className="device-pill active" />
          <div className="device-pill" />
          <div className="device-pill" />
          <div className="device-pill" />
        </div>
        <div className="device-main">
          <div className="device-header">
            <div>
              <p>Clinical overview</p>
              <h3>Session Report</h3>
            </div>
            <span className="flag-green">● GREEN</span>
          </div>
          <div className="device-grid">
            <div className="device-stat">
              <small>PHQ-9</small>
              <strong>7</strong>
            </div>
            <div className="device-stat">
              <small>GAD-7</small>
              <strong>5</strong>
            </div>
            <div className="device-stat teal">
              <small>PSI</small>
              <strong>0.82</strong>
            </div>
            <div className="device-stat">
              <small>PAI</small>
              <strong>0.44</strong>
            </div>
            <div className="device-stat">
              <small>T²</small>
              <strong>3.2</strong>
            </div>
            <div className="device-stat green">
              <small>Flag</small>
              <strong style={{ fontSize: 14 }}>Normal</strong>
            </div>
          </div>
          <div className="heatmap-preview">
            {Array.from({ length: 42 }).map((_, i) => (
              <i key={i} style={{ '--d': `${(i % 7) * 0.04}s` } as React.CSSProperties} />
            ))}
          </div>
          <div className="rhythm-lines">
            <span /><span /><span /><span /><span /><span /><span />
          </div>
        </div>
      </div>
    </div>
  )
}

function RoleTabs() {
  const [active, setActive] = useState<'clients' | 'clinicians' | 'testers'>('clients')
  const { ref, visible } = useReveal()

  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.7s ease' }}>
      <div className="role-tab-bar">
        {(['clients', 'clinicians', 'testers'] as const).map((role) => (
          <button
            key={role}
            className={`role-tab-btn${active === role ? ' active' : ''}`}
            onClick={() => setActive(role)}
          >
            {role === 'clients' && <Users size={15} />}
            {role === 'clinicians' && <UserCheck size={15} />}
            {role === 'testers' && <ShieldCheck size={15} />}
            {role === 'clients' ? 'For Clients' : role === 'clinicians' ? 'For Clinicians' : 'For Testers'}
          </button>
        ))}
      </div>

      {active === 'clients' && (
        <div className="role-panel">
          <div className="role-panel-copy">
            <span className="section-kicker">For Clients & Patients</span>
            <h3>Simple guided tasks, no right or wrong answers.</h3>
            <p>You will complete simple guided tasks: typing, clicking, questionnaires, and short written responses. Answer honestly and move and type naturally. There are no right or wrong answers.</p>
            <p style={{ marginTop: 16 }}>Your clinician reviews the final report. The app supports conversation and follow-up — it does not diagnose you by itself.</p>
            <ul className="role-list">
              <li><Check size={15} /> Clear session flow with step-by-step guidance</li>
              <li><Check size={15} /> Simple instructions with no technical jargon</li>
              <li><Check size={15} /> Consistent, calm screening experience</li>
              <li><Check size={15} /> More structured conversation with your clinician</li>
              <li><Check size={15} /> Your clinician always reviews results with clinical judgment</li>
            </ul>
          </div>
          <div className="role-panel-visual patient-visual">
            <div className="mini-task-card">
              <div className="mini-task-header">
                <span>Keyboard Task</span>
                <span className="mini-progress">2 / 5</span>
              </div>
              <p className="mini-task-prompt">Type the following paragraph naturally at your usual pace:</p>
              <div className="mini-typing-area">
                <span className="cursor-blink">|</span>
                The quick brown fox jumps over the lazy dog near the river...
              </div>
              <div className="mini-rhythm">
                {[40, 65, 52, 80, 48, 72, 58, 90, 44, 68].map((h, i) => (
                  <span key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {active === 'clinicians' && (
        <div className="role-panel">
          <div className="role-panel-copy">
            <span className="section-kicker">For Clinicians</span>
            <h3>A complete workflow from intake to export.</h3>
            <p>PsyClick gives clinicians a repeatable workflow for intake, calibration, screening, emotional response tasks, psychomotor metrics, normative comparison, report export, and session history review.</p>
            <p style={{ marginTop: 16 }}>Reports include overall risk flag, PHQ-9, GAD-7, Hotelling T², PSI, PAI, temporal hesitation heatmap, keystroke flight distribution, domain scores, normative comparison, and clinical recommendation text.</p>
            <ul className="role-list">
              <li><Check size={15} /> Structured intake workflow</li>
              <li><Check size={15} /> Rich behavioral context beyond questionnaires alone</li>
              <li><Check size={15} /> Exportable reports for documentation</li>
              <li><Check size={15} /> Longitudinal client session history</li>
              <li><Check size={15} /> Normative baseline comparison</li>
              <li><Check size={15} /> Audit trail for review and troubleshooting</li>
            </ul>
          </div>
          <div className="role-panel-visual clinician-visual">
            <div className="mini-report-card">
              <div className="mini-report-header">
                <span>Session Report</span>
                <span className="flag-green" style={{ fontSize: 11 }}>● GREEN</span>
              </div>
              <div className="mini-scores">
                <div><small>PHQ-9</small><strong>7</strong></div>
                <div><small>GAD-7</small><strong>5</strong></div>
                <div><small>T²</small><strong>3.2</strong></div>
                <div><small>PSI</small><strong>0.82</strong></div>
                <div><small>PAI</small><strong>0.44</strong></div>
              </div>
              <div className="mini-heatmap">
                {Array.from({ length: 24 }).map((_, i) => (
                  <i key={i} style={{ '--d': `${i * 0.05}s` } as React.CSSProperties} />
                ))}
              </div>
              <div className="mini-recommendation">
                <ShieldCheck size={13} />
                <span>Within normal psychomotor range. Continue routine follow-up.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {active === 'testers' && (
        <div className="role-panel">
          <div className="role-panel-copy">
            <span className="section-kicker">For Normative Testers</span>
            <h3>Your session contributes to the reference dataset.</h3>
            <p>Normative testers complete the same session flow as clients — keyboard calibration, mouse calibration, PHQ-9, GAD-7, and the emotional response task — using an authorized session password from the Normative Tester Portal.</p>
            <p style={{ marginTop: 16 }}>Your session is not a regular clinical record. It contributes to the population baseline used to provide context for clinical comparisons.</p>
            <ul className="role-list">
              <li><Check size={15} /> Contributes to normative comparison dataset</li>
              <li><Check size={15} /> Separate portal from clinical workflow</li>
              <li><Check size={15} /> Authorized session password required</li>
              <li><Check size={15} /> Same structured session flow as clients</li>
            </ul>
          </div>
          <div className="role-panel-visual tester-visual">
            <div className="mini-portal-card">
              <div className="mini-portal-icon">Ψ</div>
              <p className="mini-portal-title">Normative Tester Portal</p>
              <div className="mini-input-row"><span>Tester ID</span><div className="mini-input-bar" /></div>
              <div className="mini-input-row"><span>Session Password</span><div className="mini-input-bar" /></div>
              <div className="mini-portal-btn">Begin Session</div>
              <p className="mini-portal-note">Authorized access only. Your session contributes to the normative baseline.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureAccordion() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="feature-accordion">
      {FEATURE_CARDS.map((f, i) => {
        const Icon = f.icon
        const isOpen = open === i
        return (
          <RevealSection key={f.title} delay={i * 40}>
            <article className={`feature-sandwich${isOpen ? ' open' : ''}`}>
              <button
                className="feature-sandwich-trigger"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
              >
                <span className="feature-sandwich-icon"><Icon size={20} /></span>
                <span className="feature-sandwich-title">{f.title}</span>
                <ChevronDown size={17} className="feature-sandwich-chevron" />
              </button>
              <div className="feature-sandwich-body">
                <div className="feature-sandwich-inner">
                  <div className="feature-sandwich-row">
                    <span className="feature-sandwich-label">Intention</span>
                    <p>{f.intent}</p>
                  </div>
                  <div className="feature-sandwich-row">
                    <span className="feature-sandwich-label">How it works</span>
                    <p>{f.use}</p>
                  </div>
                  <div className="feature-sandwich-row">
                    <span className="feature-sandwich-label">Benefit</span>
                    <p>{f.benefit}</p>
                  </div>
                </div>
              </div>
            </article>
          </RevealSection>
        )
      })}
    </div>
  )
}

function AlgorithmAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className="algo-accordion"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
    >
      {ALGORITHM_STEPS.map((step, i) => (
        <div key={step.num} className={`algo-item${open === i ? ' open' : ''}`}>
          <button className="algo-trigger" onClick={() => setOpen(open === i ? null : i)}>
            <span className="algo-num">{step.num}</span>
            <div className="algo-trigger-text">
              <strong>{step.title}</strong>
              <span>{step.summary}</span>
            </div>
            <ChevronDown size={18} className="algo-chevron" />
          </button>
          <div className="algo-detail-wrap">
            <div className="algo-detail"><p>{step.detail}</p></div>
          </div>
        </div>
      ))}
    </div>
  )
}

function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(null)
  const { ref, visible } = useReveal()

  return (
    <div
      ref={ref}
      className="faq-accordion"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}
    >
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className={`faq-item${open === i ? ' open' : ''}`}>
          <button className="faq-trigger" onClick={() => setOpen(open === i ? null : i)}>
            <span>{item.q}</span>
            <ChevronDown size={17} className="faq-chevron" />
          </button>
          <div className="faq-answer-wrap">
            <div className="faq-answer"><p>{item.a}</p></div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main Landing ──────────────────────────────────────── */

export default function Landing() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <main className="landing-page">
      {/* ── Nav ── */}
      <nav className={`landing-nav${scrolled ? ' scrolled' : ''}`}>
        <a className="landing-brand" href="#top">
          <div className="brand-psi">Ψ</div>
          <span className="brand-name">PsyClick</span>
        </a>
        <div className="landing-links">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </div>
        <div className="nav-right">
          <a className="nav-cta" href="#download">
            <Download size={15} />
            Download
          </a>
          <button className="nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="mobile-menu">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}>{l.label}</a>
          ))}
          <a className="nav-cta mobile-cta" href="#download" onClick={() => setMobileOpen(false)}>
            <Download size={15} /> Download PsyClick
          </a>
        </div>
      )}

      {/* ── Hero ── */}
      <section id="top" className="hero-section">
        <div className="organic organic-one" />
        <div className="organic organic-two" />
        <div className="hero-copy">
          <div className="eyebrow animate-fade-up-1">
            <Sparkles size={14} />
            Calmer clinical screening
          </div>
          <h1 className="animate-fade-up-2">PsyClick</h1>
          <p className="hero-lede animate-fade-up-2">
            A clinician-guided screening companion that combines questionnaires, typing rhythm, mouse dynamics, and emotional response tasks into clear decision-support reports.
          </p>
          <div className="hero-actions animate-fade-up-3">
            <a className="landing-btn primary" href="#download">
              Download PsyClick <ArrowRight size={17} />
            </a>
            <a className="landing-btn secondary" href="#guide">
              View usage guide <ChevronRight size={17} />
            </a>
          </div>
          <div className="hero-trust animate-fade-up-3">
            <span><Check size={14} /> PHQ-9 + GAD-7</span>
            <span><Check size={14} /> PSI + PAI biomarkers</span>
            <span><Check size={14} /> Clinician reviewed</span>
          </div>
          <p className="hero-disclaimer">Clinical decision support. Not a diagnostic replacement.</p>
        </div>
        <div className="hero-visual animate-fade-up-2">
          <ProductMockup />
          <div className="floating-card card-one">
            <Activity size={19} />
            <div>
              <strong>Hotelling T²</strong>
              <span>Baseline-aware anomaly review</span>
            </div>
          </div>
          <div className="floating-card card-two">
            <FileText size={19} />
            <div>
              <strong>Report ready</strong>
              <span>Exportable clinician summary</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ticker strip ── */}
      <div className="ticker-wrap" aria-hidden="true">
        <div className="ticker-track">
          {['PHQ-9', 'GAD-7', 'Hotelling T²', 'PSI', 'PAI', 'Keystroke Analysis', 'Mouse Dynamics', 'Emotional Tasks', 'Decision Support', 'Normative Comparison', 'Audit Logs', 'Export Reports',
            'PHQ-9', 'GAD-7', 'Hotelling T²', 'PSI', 'PAI', 'Keystroke Analysis', 'Mouse Dynamics', 'Emotional Tasks', 'Decision Support', 'Normative Comparison', 'Audit Logs', 'Export Reports'].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* ── Purpose ── */}
      <section id="overview" className="purpose-band">
        <div className="section-bg-mesh section-bg-mesh--purpose" aria-hidden="true" />
        <RevealSection>
          <p className="section-kicker">Purpose</p>
          <h2>Designed to make screening feel clear, structured, and human.</h2>
        </RevealSection>
        <RevealSection delay={150}>
          <p>
            PsyClick helps clinicians run structured psychomotor and mental health screening sessions. It pairs familiar PHQ-9 and GAD-7 questionnaires with interaction patterns — keystroke timing, cursor movement, hesitation, and response behavior — then organizes results into reviewable, exportable reports.
          </p>
          <p style={{ marginTop: 20 }}>
            It captures typing rhythm, mouse dynamics, hesitation patterns, and emotional response behavior. The result helps clinicians review psychomotor slowing, agitation, and follow-up needs with more context. It does not replace clinical judgment, diagnosis, crisis assessment, or emergency protocols.
          </p>
        </RevealSection>
      </section>

      {/* ── Role Split ── */}
      <section id="for-clients" className="roles-section">
        <RevealSection className="section-heading centered">
          <p className="section-kicker">Audience</p>
          <h2>Built for everyone in the room.</h2>
          <p className="section-sub">PsyClick serves clients, clinicians, and normative testers — each with a clear role in the session.</p>
        </RevealSection>
        <RoleTabs />
      </section>

      {/* ── Features ── */}
      <section id="features" className="feature-section">
        <div className="section-bg-mesh section-bg-mesh--features" aria-hidden="true" />
        <RevealSection className="section-heading">
          <div>
            <p className="section-kicker">Feature Tour</p>
            <h2>Everything the app does, presented with intention.</h2>
          </div>
          <p className="algo-sub">Click any feature to expand details.</p>
        </RevealSection>
        <FeatureAccordion />
      </section>

      {/* ── Usage Guide ── */}
      <section id="guide" className="guide-section">
        <div className="section-bg-mesh section-bg-mesh--guide" aria-hidden="true" />
        <RevealSection className="section-heading centered">
          <p className="section-kicker">Usage Guide</p>
          <h2>One calm path through a PsyClick session.</h2>
          <p className="section-sub">Step-by-step flows for every role.</p>
        </RevealSection>
        <div className="guide-tabs-wrap">
          <GuideSteps />
        </div>
      </section>

      {/* ── Algorithm ── */}
      <section id="algorithm" className="algorithm-section">
        <div className="section-bg-mesh section-bg-mesh--algo" aria-hidden="true" />
        <RevealSection className="section-heading">
          <div>
            <p className="section-kicker">Behind the Signals</p>
            <h2>The algorithm, explained without losing people.</h2>
          </div>
          <p className="algo-sub">Hover any step card to reveal technical detail.</p>
        </RevealSection>

        <div className="algo-pipeline-v2">
          {ALGORITHM_STEPS.map((step, i) => {
            const ALGO_ICONS = [Activity, Brain, BarChart3, Database, Sparkles, HeartPulse, ShieldCheck, Users]
            const Icon = ALGO_ICONS[i] ?? Activity
            return (
              <RevealSection key={step.num} delay={i * 70}>
                <article className="algo-signal-card">
                  <div className="algo-signal-top">
                    <span className="algo-signal-num">{step.num}</span>
                    <span className="algo-signal-icon"><Icon size={18} /></span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.summary}</p>
                  {/* Green triangle hover trigger */}
                  <i className="algo-card-triangle" aria-hidden="true">▶</i>
                  {/* Detail overlay revealed on hover */}
                  <div className="algo-card-detail-overlay">
                    <p>{step.detail}</p>
                  </div>
                  {i < ALGORITHM_STEPS.length - 1 && <span className="algo-signal-arrow" aria-hidden="true" />}
                </article>
              </RevealSection>
            )
          })}
        </div>

        <RevealSection delay={100}>
          <AlgorithmAccordion />
        </RevealSection>
      </section>

      {/* ── Download ── */}
      <section id="download" className="download-section">
        <RevealSection>
          <div className="download-inner">
            <div>
              <p className="section-kicker">Download</p>
              <h2>PsyClick for Windows</h2>
              <p>First public PsyClick release. Direct Windows installer for approved deployment. Requires Windows 10 or later, internet access, keyboard and mouse.</p>
              <ul className="download-reqs">
                <li><Check size={14} /> Windows 10 or later</li>
                <li><Check size={14} /> Internet access for cloud database mode</li>
                <li><Check size={14} /> Keyboard and mouse required</li>
                <li><Check size={14} /> Clinic or research authorization</li>
              </ul>
              <div className="download-actions">
                <a className="landing-btn primary" href="/downloads/PsyClick-Setup.exe">
                  <Download size={17} /> Download PsyClick-Setup.exe
                </a>
                <a className="landing-btn secondary" href="#guide">
                  View installation guide
                </a>
              </div>
              <p className="download-smartscreen">If Windows SmartScreen appears, choose More info then Run anyway — only if the installer source is trusted.</p>
            </div>
            <div className="download-badge-wrap">
              <div className="download-badge">
                <div className="download-badge-icon">Ψ</div>
                <span>PsyClick</span>
                <small>Windows Desktop App</small>
                <div className="download-badge-flag flag-green">● Decision-support tool</div>
              </div>
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── Trust & Safety ── */}
      <section className="trust-section">
        <div className="section-bg-mesh section-bg-mesh--trust" aria-hidden="true" />
        <RevealSection className="section-heading centered">
          <p className="section-kicker">Trust & Safety</p>
          <h2>Designed to support clinicians, not replace them.</h2>
        </RevealSection>
        <RevealSection delay={100}>
          <div className="trust-grid">
            {[
              { icon: ShieldCheck, title: 'Decision-support only', text: 'PsyClick is a clinical decision-support tool. It does not replace clinical judgment, formal diagnosis, or emergency procedures.' },
              { icon: Shield, title: 'Clinician review required', text: 'All results require review by a qualified clinician. The app supports discussion and follow-up — it does not act independently.' },
              { icon: Lock, title: 'No credentials exposed', text: 'The landing page does not expose Supabase connection strings, clinician passwords, normative tester passwords, or real patient data.' },
              { icon: FileText, title: 'Privacy & data governance', text: 'Clinics should follow their own privacy, consent, and data governance policies. Data storage depends on deployment configuration.' },
            ].map((t) => {
              const Icon = t.icon
              return (
                <div className="trust-card" key={t.title}>
                  <span className="trust-icon"><Icon size={20} /></span>
                  <h4>{t.title}</h4>
                  <p>{t.text}</p>
                </div>
              )
            })}
          </div>
        </RevealSection>
      </section>

      {/* ── Team ── */}
      <section id="team" className="team-section">
        <RevealSection>
          <div className="team-photo" role="img" aria-label="Team photo placeholder">
            <Users size={48} />
            <span>Team photo — add in Vercel before launch</span>
          </div>
        </RevealSection>
        <RevealSection delay={150}>
          <p className="section-kicker">Our Team</p>
          <h2>Built by ByteMe.</h2>
          <p>Team member names, roles, bios, contact details, and adviser information will be added directly in Vercel before launch.</p>
          <div className="team-tags">
            <span>Product</span>
            <span>Clinical workflow</span>
            <span>Frontend</span>
            <span>Psychomotor algorithms</span>
            <span>ByteMe</span>
          </div>
        </RevealSection>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="faq-section">
        <RevealSection className="section-heading centered">
          <p className="section-kicker">FAQ</p>
          <h2>Common questions answered.</h2>
        </RevealSection>
        <FaqAccordion />
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="brand-psi large">Ψ</div>
            <div>
              <span className="brand-name">PsyClick</span>
              <p>Clinical decision-support tool by ByteMe.</p>
            </div>
          </div>
          <div className="footer-links">
            <div>
              <strong>Product</strong>
              <a href="#overview">Overview</a>
              <a href="#features">Features</a>
              <a href="#algorithm">Algorithms</a>
              <a href="#download">Download</a>
            </div>
            <div>
              <strong>Users</strong>
              <a href="#for-clients">For Clients</a>
              <a href="#for-clinicians">For Clinicians</a>
              <a href="#guide">Usage Guide</a>
              <a href="#faq">FAQ</a>
            </div>
            <div>
              <strong>Team</strong>
              <a href="#team">ByteMe</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>PsyClick is a decision-support tool. It does not replace clinical judgment, diagnosis, emergency assessment, or clinic protocols.</p>
          <span>© 2026 PsyClick by ByteMe</span>
        </div>
      </footer>
    </main>
  )
}

/* ─── Guide Steps sub-component ─────────────────────────── */
function TimelineStep({ step, index, total }: { step: string; index: number; total: number }) {
  const { ref, visible } = useReveal()
  const isLast = index === total - 1
  const isEven = index % 2 === 0
  return (
    <div
      ref={ref}
      className={`timeline-step${visible ? ' visible' : ''}${isEven ? ' even' : ' odd'}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Left slot — filled on odd steps */}
      <div className="timeline-slot timeline-slot-left">
        {!isEven && (
          <div className="timeline-content">
            <p>{step}</p>
          </div>
        )}
      </div>

      {/* Center column: number node + connecting line */}
      <div className="timeline-center-col">
        <div className="timeline-node">
          <span>{String(index + 1).padStart(2, '0')}</span>
        </div>
        {!isLast && <div className="timeline-line" />}
      </div>

      {/* Right slot — filled on even steps */}
      <div className="timeline-slot timeline-slot-right">
        {isEven && (
          <div className="timeline-content">
            <p>{step}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function GuideSteps() {
  const [role, setRole] = useState<'clinician' | 'client' | 'tester'>('clinician')
  const steps = role === 'clinician' ? CLINICIAN_STEPS : role === 'client' ? CLIENT_STEPS : TESTER_STEPS

  return (
    <div>
      <div className="guide-role-bar">
        {(['clinician', 'client', 'tester'] as const).map((r) => (
          <button key={r} className={`guide-role-btn${role === r ? ' active' : ''}`} onClick={() => setRole(r)}>
            {r === 'clinician' ? <UserCheck size={14} /> : r === 'client' ? <Users size={14} /> : <ShieldCheck size={14} />}
            {r === 'clinician' ? 'Clinician flow' : r === 'client' ? 'Client flow' : 'Tester flow'}
          </button>
        ))}
      </div>
      <div className="timeline">
        {steps.map((step, i) => (
          <TimelineStep key={`${role}-${i}`} step={step} index={i} total={steps.length} />
        ))}
      </div>
    </div>
  )
}
