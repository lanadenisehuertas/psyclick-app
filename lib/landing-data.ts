import {
  Activity,
  BarChart3,
  Brain,
  ClipboardList,
  Database,
  FileText,
  HeartPulse,
  History,
  Keyboard,
  Lock,
  MousePointer2,
  ShieldCheck,
} from 'lucide-react'

/* ─── Data ─────────────────────────────────────────────── */

export const FEATURE_CARDS = [
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

export const CLINICIAN_STEPS = [
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

export const CLIENT_STEPS = [
  'Listen to the clinician\'s instructions',
  'Type naturally during the typing task',
  'Click each numbered circle naturally during the mouse task',
  'Answer PHQ-9 and GAD-7 honestly',
  'Type natural responses to emotional prompts',
  'Wait while the clinician reviews the report',
]

export const TESTER_STEPS = [
  'Open the Normative Tester Portal',
  'Enter assigned tester ID and authorized session password',
  'Complete keyboard calibration',
  'Complete mouse calibration',
  'Complete PHQ-9',
  'Complete GAD-7',
  'Complete emotional response task',
  'Exit portal after the completion page',
]

export const ALGORITHM_STEPS = [
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
    detail: 'Keyboard: flight time, dwell time, typing velocity, and error rate. Cursor: velocity, jerk, path entropy, and pause frequency (stops longer than 500 ms per minute), plus coordinates for the heatmap.',
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
    detail: 'Compares the current feature vector to the baseline across multiple psychomotor features. Uses a Ledoit-Wolf regularized covariance inverse and an F-distribution threshold at 95% confidence, falling back to χ²(0.95; 8) ≈ 15.51 when calibration samples are few.',
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
    detail: 'Converts T², PSI, and PAI into graded memberships. Produces labels: Normal, Psychomotor Retardation, Psychomotor Agitation, or Mixed Disturbance. Seven Mamdani rules assign a label and confidence. GREEN when T² stays within threshold, AMBER up to 1.5× threshold, RED beyond 1.5× when severe-class strength dominates.',
  },
  {
    num: '8',
    title: 'Normative',
    summary: 'Compare against reference population baseline.',
    detail: 'Aggregates authorized normative tester sessions into reference statistics. Compares client/session metrics against the normative baseline when available.',
  },
]

export const FAQ_ITEMS = [
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
    a: 'GREEN means Hotelling T² stayed within the client’s own threshold. AMBER means it exceeded the threshold by up to 1.5×, or the borderline class outweighed the severe class. RED means it exceeded 1.5× with severe-class strength dominant. All flags are decision-support signals, not diagnoses.',
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
    a: 'PsyClick runs on Windows 10 or later with a keyboard and mouse. Sessions are stored locally first; internet access is only needed for the optional cloud mode. Use requires clinic or research authorization.',
  },
  {
    q: 'Where can I download the app?',
    a: 'Use the Download section on this page. Clinicians install PsyClick-Clinician-Setup.exe; authorized normative testers install PsyClick-Tester-Setup.exe. If Windows SmartScreen appears, choose More info, then Run anyway, only if you trust the source.',
  },
]

export const TEAM_MEMBERS = [
  { name: 'Jon Añonuevo', role: 'System Architect & Lead Backend Engineer', photo: '/team/member1.png', initials: 'JA', email: 'jaanonuevo@fit.edu.ph'},
  { name: 'Denise Ballano', role: 'Full-Stack Developer & Quality Assurance Lead', photo: '/team/member2.png', initials: 'DB', email: 'dmballano@fit.edu.ph' },
  { name: 'Lana Huertas', role: 'Project Manager, Backend & Lead UI/UX Designer', photo: '/team/member3.jpg', initials: 'LH', email: 'lrhuertas@fit.edu.ph' },
  { name: 'Judea Tablate', role: 'Lead Researcher & Documentation Specialist', photo: '/team/member4.png', initials: 'JT', email: 'jctablate@fit.edu.ph' },
]

