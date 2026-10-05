import {
  Activity,
  BarChart3,
  Brain,
  ClipboardList,
  Cloud,
  Database,
  FileText,
  HeartPulse,
  History,
  Keyboard,
  Lock,
  MousePointer2,
} from 'lucide-react'

/* ─── Data ─────────────────────────────────────────────── */

export const FEATURE_CARDS = [
  {
    icon: Lock,
    title: 'Sign-in & Accounts',
    intent: 'Role-based access for the whole clinic.',
    use: 'Administrators create accounts for clinicians and auditors; everyone signs in with their own ID.',
    benefit: 'Each person sees only their own clients, on any computer.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard',
    intent: 'What needs attention today.',
    use: 'Key numbers, a worklist with self-harm answers first, then Review now and Follow up, and the week at a glance.',
    benefit: 'The clients who need you most are always on top.',
  },
  {
    icon: ClipboardList,
    title: 'New Assessment & Consent',
    intent: 'Start every session the same way.',
    use: 'Enter a client code (never a name), read what is recorded, and record consent.',
    benefit: 'Keeps sessions consistent, private and accountable.',
  },
  {
    icon: Keyboard,
    title: 'Keyboard Calibration',
    intent: 'Establish the client\'s baseline typing rhythm.',
    use: 'Client types the displayed paragraph naturally. Pasted or held-key typing is refused.',
    benefit: 'Gives the algorithm a trustworthy within-session reference.',
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
    use: 'Client answers 12 everyday prompts, from mild to emotionally strong, in their own words.',
    benefit: 'Shows which topics and how much emotional load move the client most.',
  },
  {
    icon: FileText,
    title: 'Assessment Report',
    intent: 'The most important results first.',
    use: 'Overall result, headline cards ranked by urgency, what stood out, profile radar, session trace, attention heatmap and next steps. Save as PDF.',
    benefit: 'Small signals are listed too, because that is where early change shows.',
  },
  {
    icon: Database,
    title: 'Client Database',
    intent: 'Manage client records.',
    use: 'Search and filter clients, open their history, and see what changed since the last visit.',
    benefit: 'Each client is compared with their own earlier sessions.',
  },
  {
    icon: History,
    title: 'Audit Log',
    intent: 'A tamper-evident record of activity.',
    use: 'Review sign-ins, account changes, assessment steps and exports, linked in a hash chain.',
    benefit: 'Supports compliance review and shows if records were altered.',
  },
  {
    icon: Cloud,
    title: 'Offline-first Sync',
    intent: 'Works fully without internet.',
    use: 'Everything is saved on the computer first, then accounts and sessions sync when online.',
    benefit: 'Any account can sign in on any clinic computer.',
  },
]

export const CLINICIAN_STEPS = [
  'Install and open PsyClick',
  'Sign in with your ID and password',
  'Click New assessment',
  'Enter a client code and record consent',
  'Guide the client through keyboard calibration',
  'Guide the client through mouse calibration',
  'Have the client complete PHQ-9',
  'Have the client complete GAD-7',
  'Have the client complete the emotional response task',
  'Review the report: what stood out comes first',
  'Save the report as a PDF if needed',
  'Return to the dashboard for follow-up',
]

export const CLIENT_STEPS = [
  'Listen to the clinician\'s instructions',
  'Type naturally during the typing task',
  'Click each numbered circle naturally during the mouse task',
  'Answer PHQ-9 and GAD-7 honestly',
  'Type natural responses to emotional prompts',
  'Wait while the clinician reviews the report',
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
    detail: 'Keyboard: flight time, dwell time, typing velocity, error rate, and pauses longer than 1 s per second of typing. Cursor (while answering the questionnaires): velocity, jerk, and path entropy. Cursor rests over prompt words feed the attention heatmap.',
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
    detail: 'Compares the current feature vector with the personal baseline across all eight features at once: T² = Δxᵀ·S⁻¹·Δx, with a shrinkage-regularized covariance. Cut-offs are the 95th and 99th percentiles of 71 healthy adults (Harrell–Davis): 59.1 and 86.5 for a session.',
  },
  {
    num: '6',
    title: 'PSI & PAI',
    summary: 'Psychomotor Slowing and Agitation Indices.',
    detail: 'Each index sums the T² contributions of its features in the direction of change. PSI: slower key presses, longer key holds, more pauses and more errors (hesitation). PAI: lower typing velocity, more errors, and more irregular, faster, jerkier cursor movement.',
  },
  {
    num: '7',
    title: 'Classify',
    summary: 'Fuzzy logic maps signals to No concerns / Follow up / Review now.',
    detail: 'Converts T², PSI, and PAI into graded memberships. Seven rules give a pattern (Normal, Psychomotor Retardation, Psychomotor Agitation, or Mixed Disturbance) and a confidence. No concerns while T² is within the healthy 95th percentile; Follow up above it; Review now above the 99th percentile when a marked pattern dominates.',
  },
  {
    num: '8',
    title: 'Normative',
    summary: 'Compare against reference population baseline.',
    detail: '105 tester sessions were collected; 71 healthy adults (one session each, PHQ-9 and GAD-7 below 10, typing captured correctly) form the reference. Every score in the report is ranked against them as a percentile.',
  },
]

export const FAQ_ITEMS = [
  {
    q: 'Is PsyClick a diagnosis tool?',
    a: 'No. PsyClick is a clinical decision-support tool. It does not replace clinical judgment, formal diagnosis, emergency assessment, or established clinic protocols. Clinician review is always required.',
  },
  {
    q: 'Who should use PsyClick?',
    a: 'PsyClick is designed for clinics running mental health screening sessions. Administrators manage accounts, clinicians run sessions, and auditors review the audit trail. Clients complete guided tasks under clinician supervision.',
  },
  {
    q: 'What does the client do during a session?',
    a: 'Clients type a paragraph naturally, click numbered circles, answer PHQ-9 and GAD-7 questionnaires, and respond to 12 written emotional prompts. There are no right or wrong answers.',
  },
  {
    q: 'What do No concerns, Follow up, and Review now mean?',
    a: 'No concerns: behaviour changed no more than in 95 of 100 healthy adults. Follow up: a larger change than most healthy adults show. Review now: a change beyond 99 of 100 healthy adults with a marked pattern. Repeat session: too little typing to judge behaviour, with questionnaires that need no follow-up on their own. A self-harm answer on PHQ-9 is always shown first, whatever the result. All results are decision support, not diagnoses.',
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
    a: 'PsyClick runs on Windows 10 or later with a keyboard and mouse. Everything is stored on the computer and works without internet; when online, accounts and sessions sync so you can sign in on any clinic computer. Use requires clinic or research authorization.',
  },
  {
    q: 'Where can I download the app?',
    a: 'Use the Download section on this page. One installer covers every role. If Windows SmartScreen appears, choose More info, then Run anyway, only if you trust the source.',
  },
]

export const TEAM_MEMBERS = [
  { name: 'Jon Añonuevo', role: 'System Architect & Lead Backend Engineer', photo: '/team/member1.webp', initials: 'JA', email: 'jaanonuevo@fit.edu.ph'},
  { name: 'Denise Ballano', role: 'Full-Stack Developer & Quality Assurance Lead', photo: '/team/member2.webp', initials: 'DB', email: 'dmballano@fit.edu.ph' },
  { name: 'Lana Huertas', role: 'Project Manager, Backend & Lead UI/UX Designer', photo: '/team/member3.webp', initials: 'LH', email: 'lrhuertas@fit.edu.ph' },
  { name: 'Judea Tablate', role: 'Lead Researcher & Documentation Specialist', photo: '/team/member4.webp', initials: 'JT', email: 'jctablate@fit.edu.ph' },
]

