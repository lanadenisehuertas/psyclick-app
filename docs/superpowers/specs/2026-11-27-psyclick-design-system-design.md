# PsyClick landing: Lab paper + Desk scenes design system

Date: 2026-11-27
Status: approved by the user ("a and c", then all four C parts, then "apply").

## Direction

Base is **Lab paper** (from Feather, Berd and Sui on Mobbin): a dotted off-white page, small mono chips, bracket frames around product shots, dotted divider rows, and dark ink bands. Mixed in from **Desk scenes** (Poly and Apple): full-bleed photo scenes at three moments, the app window resting in the hero photo, big feature tiles, and a floating tab bar.

Kept: section order, copy, all motion, Lenis, the three scroll holds (About, Roles, Algorithm), the 8-step algorithm stepper, Schibsted Grotesk / DM Sans / IBM Plex Mono. No serif, no italics.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f4f6f5`, 1px dots `rgba(15,42,51,.10)` on a 24px grid | page background |
| `--surface` | `#fff`, hairline `rgba(15,42,51,.08)` | cards, tiles |
| `--ink-band` | `#0b1f26`, dots `rgba(255,255,255,.07)` | Algorithm, Download |
| `--chip` | `#e5ecea`, Plex Mono 12px, sentence case, radius 4 | one label above each h2 |
| accent | `--teal-deep` | primary button, markers, brackets |
| data | `--teal`, `--amber` (flags only) | charts |

Type: Schibsted 500; h1 `clamp(44px, 6vw, 80px)` tracking -0.035em; h2 `clamp(34px, 4.4vw, 56px)`; body DM Sans 16/1.6.

Pieces:
- **Bracket frame** (`.ds-frame`): four 14px L corners, 1.5px teal-deep.
- **Dotted row**: 1px dotted divider, 8px square teal marker at the row start.
- **Buttons**: primary filled teal-deep radius 10; secondary white with hairline.
- **Footer wordmark**: huge "psyclick" in `#e3e8e6`.

## Sections

| Section | Treatment |
|---|---|
| Hero | photo scene `hero-desk`; the app window rests on the desk with a contact shadow; copy on the calm left |
| AppShowcase, Report | paper; screens in bracket frames |
| About | photo scene `about-room` behind the scroll hold |
| Reads, Trust, FAQ | dotted rows with square markers |
| Metrics, Evidence | big figures in dotted rows, source in mono |
| TryRhythm, GuideFlow | paper, cards on surface |
| Algorithm | dark ink band, stepper unchanged |
| RolePanels | panels kept, visuals in bracket frames |
| FeaturesBento | big white tiles, radius 28, 2 columns, one wide |
| Download | dark ink band + `download-evening` photo, keycap kept |
| Team | portrait grid on paper |
| Floating tab bar | bottom pill: How it works / Report / Download, active follows scroll, hidden during intro and over Download |

## Assets

Three Codex photos (`hero-desk`, `about-room`, `download-evening`), WebP under ~90 KB each.

## Checks

Desktop 1440 and mobile 390 screenshots of every section, 0 console and hydration errors, text contrast at least 4.5:1 on photos and dark bands, tab bar touch targets 44px and safe-area aware.
