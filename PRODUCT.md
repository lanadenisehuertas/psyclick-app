# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: clinics adopting PsyClick. Psychologists, psychiatrists and clinic administrators in the Philippines deciding whether to install PsyClick and run it with clients. They evaluate it the way they would any clinical decision-support software: what it measures, how it fits a session, what it does with client data, and whether the evidence holds.

Inside the product there are four roles: administrators (accounts and roles), clinicians (run sessions, review reports), auditors (review the audit trail) and clients (complete guided tasks under supervision). The landing page speaks to the first three; clients never visit it.

## Product Purpose

PsyClick is a Windows desktop app for clinical decision support in mental health screening. While a client completes PHQ-9, GAD-7 and twelve short written emotional prompts, it records only the timing of keystrokes and cursor movement, compares it with the client's own calibrated baseline and a normative reference, and flags psychomotor signs of depression and anxiety (No concerns, Follow up, Review now, Repeat session) for the clinician to review.

The landing page has two jobs, in this order of reading: help the visitor understand how the system works and why its result can be trusted, and get them to download the Windows installer.

## Positioning

Self-report questionnaires can be masked. PsyClick adds a behavioural signal the client does not consciously control: how they type and move the cursor while answering, measured against their own baseline. It reads timing, never the meaning of the words. Peers it should sit alongside: clinical and digital-biomarker software (e.g. Kintsugi, Limbic, Cambridge Cognition).

## Operating Context

- A clinic computer running Windows 10 or later, keyboard and mouse, offline first; syncs accounts and sessions when online.
- A supervised 10 to 15 minute session: consent, keyboard and mouse calibration warm-ups, PHQ-9, GAD-7, 12 emotional response prompts, then the Assessment report.
- The clinician reviews the report (overall result, what stood out, profile against healthy adults, attention heatmap, questionnaires) and decides; follow-up within 48 to 72 hours on a Follow up flag.
- One installer covers every role; users sign in with an issued ID. Distributed via a Google Drive link today; Windows SmartScreen may warn.

## Capabilities and Constraints

- Eight psychomotor features: flight time, dwell time, typing velocity, error rate, cursor velocity, jerk, path entropy, pause frequency.
- Pipeline: signal capture, 5-point weighted smoothing, feature extraction, EWMA baseline (λ = 0.2), Hotelling T² with shrinkage covariance and Harrell–Davis cut-offs, Psychomotor Slowing Index and Psychomotor Agitation Index, fuzzy-logic classification (seven rules), normative percentile ranks (71 healthy adults).
- A PHQ-9 self-harm answer is always shown first, whatever the result.
- Roles: administrator, clinician, auditor; hash-chained tamper-evident audit log; encrypted verified backups; save report as PDF.
- Not a diagnosis tool. Never replaces clinical judgment, diagnosis, crisis assessment or emergency protocols. Use requires clinic or research authorization.
- Undecided: a public download host other than Google Drive; pricing or licensing (none exists; do not invent).

## Brand Commitments

- Name: PsyClick. Built by ByteMe (FEU Institute of Technology). Logo files: `public/psyclick-icon.png`, `public/psyclick-icon.webp`, `public/psyclick-logo.png`.
- Palette taken from the logo and the app (teal, mint, cyan, periwinkle on ink); the landing mirrors the app's dashboard and Assessment report UI.
- The user likes and wants kept: the eight-step algorithm stepper with its scroll hold, the scroll holds for About and the roles, and the page's movement. No italics.
- Standing preference (user, 2026-11-24): keep the existing landing look (light teal glass hero, app-UI tiles, dark monitor band). Themed concepts and a plain apple.com-style restyle were both rejected as "too plain and AI slop". No Instrument Serif accent; accent words use the headline face.

## Evidence on Hand

From the PsyClick thesis study (state the small clinical sample honestly):
- Clinician concordance κ = 1.00: 15 of 15 clinical sessions matched the attending clinician (z = 5.44, p < .001).
- 105 normative participants, adults 18 to 64; 71 healthy adults form the reference baseline.
- ISO/IEC 25010 software quality rating 4.64 / 5 from five software engineering professionals.
- Device normalization removed 89.4 to 90.1% of timing variance across four setups.
- Context figure: about 2,100 psychologists and psychiatrists for 110 million Filipinos (Alibudbud).
- Team photos in `public/team/`; adviser named on the page.

Absent, never fabricate: customer clinics, testimonials, logos of adopters, pricing, certifications or regulatory clearance, usage numbers.

## Product Principles

1. Support the clinician's judgment, never replace it; every flag is a prompt to look, not a verdict.
2. Measure timing, not meaning; say exactly what is and is not captured.
3. Show the real system: the app's own screens, report and pipeline are the proof.
4. Report evidence with its limits stated.

## Accessibility & Inclusion

Clinical audience on clinic hardware, often lower-end Windows machines; the page must stay fast on weak devices and respect reduced motion.
