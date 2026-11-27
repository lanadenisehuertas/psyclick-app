---
name: PsyClick
description: Landing page for a Windows clinical decision-support app that reads psychomotor timing alongside PHQ-9 and GAD-7.
colors:
  paper: "#eceff0"
  surface: "#f7f9f9"
  field: "#0b5f70"
  deep: "#072f37"
  deep-raised: "#0c3b44"
  ink: "#0f2a33"
  slate: "#46606a"
  muted: "#5c757d"
  on-field: "#cfe3e7"
  hairline: "rgba(15, 42, 51, 0.12)"
  hairline-on-dark: "rgba(255, 255, 255, 0.14)"
  signal-cyan: "#5fc6d8"
  flag-amber: "#f5a623"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(48px, 7vw, 88px)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(32px, 4vw, 48px)"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "-0.025em"
  figure:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(28px, 3vw, 48px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\" 1"
  title:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  r1: "6px"
  r2: "12px"
  r3: "20px"
spacing:
  gutter: "clamp(20px, 4vw, 56px)"
  xs: "8px"
  sm: "12px"
  md: "24px"
  lg: "48px"
  xl: "72px"
  section: "clamp(80px, 9vw, 128px)"
components:
  button-primary:
    backgroundColor: "{colors.field}"
    textColor: "{colors.white}"
    rounded: "{rounded.r1}"
    padding: "0 22px"
    height: "48px"
    typography: "{typography.body}"
  button-primary-hover:
    backgroundColor: "{colors.deep}"
    textColor: "{colors.white}"
  button-on-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.deep}"
    rounded: "{rounded.r1}"
    padding: "0 22px"
    height: "48px"
  button-on-field-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.deep}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.r1}"
    padding: "0 22px"
    height: "48px"
  button-ghost-hover:
    backgroundColor: "{colors.white}"
  button-small:
    rounded: "{rounded.r1}"
    padding: "0 16px"
    height: "38px"
  app-window:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.r2}"
  pipeline-panel:
    backgroundColor: "{colors.deep-raised}"
    textColor: "{colors.on-field}"
    rounded: "{rounded.r3}"
  nav-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "14px clamp(20px, 4vw, 56px)"
---

# Design System: PsyClick

## Overview

**Creative North Star: "The Measured Field"**

The page is a two-colour systems document: cool grey paper and one committed teal field, with a deeper teal band where the pipeline runs. Nothing on it is decorative in the ornamental sense. Its one expressive device is borrowed from the product's own signal: the Rhythm field, a row of keystroke-gap bars that grows out of one colour into the other as the visitor scrolls, with a single amber bar standing for the long pause the app exists to notice. The design lets that timing trace carry the identity, and lets the real app screens, the report, and an evidence table with its limits carry the persuasion.

Density is calm and editorial. Large Schibsted Grotesk at regular weight sets the voice; DM Sans does the reading; IBM Plex Mono appears for measured values only. Separation comes from hairlines and from switching the ground colour, not from cards floating on shadows. One teal duotone photograph of a clinic workstation (generated, provenance in `public/art/workstation-duo.webp.json`) sits behind the hero field, and the live task window sits over its monitor.

The build rejected glass, glows, dot grids, eyebrow labels, gradient text, italics and serif faces; `app/system.css` enforces the first and last of these at page scope.

**Key Characteristics:**
- Two grounds only: paper (#eceff0) and teal field (#0b5f70), plus deep teal (#072f37) for the pipeline and download bands.
- Chapter changes are wipes of the Rhythm field, not borders or gradients.
- Hairline rules (12% ink on paper, 14% white on teal) do the structural work.
- Regular-weight grotesk display with tight negative tracking.
- Amber appears only as a flag: the pause bar, a follow-up marker.
- Three radii (6 / 12 / 20), two elevations, flat at rest.

**Known gaps (deferred from the finish review, not part of the system):** the page still runs 13 sections plus footer against a target of about 9; the app mocks (hero window, dashboard stage, report tiles, download hub, roles panel) do not yet share one frame language; the legacy `app/landing.css` under the system layer still carries off-scale radii, many shadow rules and uppercase labels; Plex Mono still sets two non-measured labels in the hero window; two small tags use a 4px radius.

## Colors

A cool, low-chroma paper against a single saturated teal, with amber held back for flags.

### Primary
- **Clinic Teal Field** (field): The hero ground, the Evidence section ground, the Rhythm bars, the primary button, focus rings, text selection and the footer link. It is a ground colour first and an accent second.
- **Deep Pipeline Teal** (deep): The ground for How it works, the 8-step Algorithm and the Download hub; also the primary button's hover. The Rhythm field switches to this colour (`deep` variant) when it wipes into and out of that band.
- **Raised Deep** (deep-raised): The algorithm panel and step dots, one step lighter than the band they sit on.

### Secondary
- **Signal Cyan** (signal-cyan): Lives only inside the deep band: the algorithm progress track, the active step outline, chip fills at 14% alpha. It never appears on paper.

### Tertiary
- **Flag Amber** (flag-amber): The single pause bar in each Rhythm field and the follow-up flag on the report card. Nothing else.

### Neutral
- **Grey Paper** (paper): The page ground, the scrolled nav, the footer, the roles panel.
- **Clean Surface** (surface) and **White** (white): App windows, report cards and the button that sits on teal.
- **Clinic Ink** (ink): All body and heading text on paper.
- **Slate** (slate): Sub-headlines and footer copy on paper.
- **Muted** (muted): Small secondary labels on paper; this replaced an older grey that failed contrast.
- **Field Mist** (on-field): Body text, ledes and table copy on teal and deep grounds.
- **Hairline** (hairline) and **Hairline on Dark** (hairline-on-dark): Every rule, table row, list divider and card border.

### Named Rules
**The Two Grounds Rule.** A section's ground is paper, field, or deep. No section sits on a gradient, a tint, a photo wash or a third hue.

**The Amber Is a Flag Rule.** Amber marks something the clinician should look at. It is never a highlight, a button, or a decoration.

**The Cyan Stays Home Rule.** Signal cyan is the pipeline's progress colour and appears only on the deep band.

## Typography

**Display Font:** Schibsted Grotesk (with system-ui, sans-serif)
**Body Font:** DM Sans (with system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, monospace)

**Character:** A plain, slightly mechanical grotesk at regular weight, set large and tight, over a soft humanist sans for reading. The mono is an instrument readout, not a style.

### Hierarchy
- **Display** (400, clamp 48 to 88px, 0.98): The hero headline only, white on the field, revealed line by line from masks.
- **Headline** (400, clamp 32 to 48px, 1.08): Every section h2, balanced wrap.
- **Figure** (400 display face, clamp 28 to 48px, 1.0, tabular): Measured results in the Evidence table.
- **Title** (400 display face, 20px, 1.25): h3s, Evidence commitments, the Reads column heads.
- **Lede** (DM Sans 400, 20px, 1.5, max 52ch): The hero lede; drops to 16px under 640px.
- **Body** (DM Sans 400, 16px, 1.6, max about 48 to 52ch): Section subs, table copy, FAQ.
- **Label** (DM Sans 500, 13px): Table column heads, hero facts row, disclaimer.
- **Data** (Plex Mono 400, 13px): Timing values, counts, scores inside the app mocks.

### Named Rules
**The Six Steps Rule.** New type sits on 13 / 16 / 20 / 28 / 48 / 88. A size between steps needs a reason the scale cannot answer.

**The Regular Voice Rule.** Display and headline are weight 400. Emphasis comes from size and position, never from bold, italic, colour or gradient on a word.

**The Mono Means Measured Rule.** Plex Mono sets a number the app measured or a value it reports. It does not set labels, headings or decorative tags.

## Layout

Content sits in a 1200px wrap (1320px for the hero grid) inside a fluid gutter of clamp(20px, 4vw, 56px). Sections breathe at clamp(80px, 9vw, 128px) vertical padding. The hero fills at least the viewport (min 680px) and anchors its copy to the bottom-left over the photograph, with the live app window to the right on a 1.08 / 0.92 split.

Section heads use a two-column split: headline left, sub right, aligned to the bottom. The Evidence section is a real table (value, method, limit) that collapses to stacked rows with an inline "Limit:" label under 640px. The four commitments under it run 4 columns, then 2 under 960px, then 1.

Three scroll holds pin About, Roles and the 8-step Algorithm while their content steps with scroll; these are standing behaviour, not optional.

Breakpoints: 960px (hero and Evidence head go single column) and 640px (nav links hide, hero photo crops to the top 60% over deep, the report card drops but the typing window stays).

### Named Rules
**The Wipe Not Border Rule.** A chapter change between paper and teal is made by a Rhythm field, never by a rule, a curve or a gradient seam.

## Elevation & Depth

The system is flat at rest. Depth comes from changing the ground colour and from hairlines. Two shadows exist, both for app mocks that need to read as windows on a surface.

### Shadow Vocabulary
- **Hairline lift** (`box-shadow: 0 1px 2px rgba(15, 42, 51, 0.06), 0 0 0 1px rgba(15, 42, 51, 0.12)`): Small surfaces on paper that need an edge.
- **Window drop** (`box-shadow: 0 24px 60px -30px rgba(7, 47, 55, 0.45), 0 0 0 1px rgba(15, 42, 51, 0.12)`): A product window resting on paper. Over the hero photograph the same role uses a deeper black drop (`0 40px 80px -40px rgba(0, 0, 0, 0.55)`).

### Named Rules
**The No Glow Rule.** No coloured shadows, halos, rings or blurred light. An active state is an outline (1px, offset 4px), not a glow.

**The No Glass Rule.** No backdrop blur and no text shadow anywhere on the page.

## Shapes

Three radii: 6px for interactive things (buttons, nav links, focus rings), 12px for app windows, report cards and tiles, 20px for the large algorithm panel. Full-bleed bands (hero, Evidence, pipeline, download, footer) have square corners and run edge to edge. Lists and tables are open rows on hairlines with no container at all.

The Rhythm field is the recurring silhouette: 84 flat-topped bars at 2px gaps, heights drawn from one typed sentence, one bar at full height in amber.

## Components

### Buttons
Quiet, rectangular, confident.
- **Shape:** gently squared (6px), 48px tall, 22px side padding, DM Sans 500 16px.
- **Primary:** teal field with white text; hovers to deep teal. Colour transitions only, 0.2s.
- **On teal:** white with deep-teal text; hovers to paper. This is the hero and download action.
- **Ghost:** transparent with a hairline border and ink text; hovers to white.
- **Text link on teal:** white, underlined at 40% white with a 6px offset; the underline goes solid on hover.
- **Small:** 38px tall, 16px padding, 14px text.
- **Focus:** 2px teal outline, 3px offset, 6px radius, on every focusable element.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** white or clean surface on paper; raised deep on the deep band.
- **Shadow Strategy:** none at rest; see Elevation for windows.
- **Border:** 1px hairline.
- **Internal Padding:** 16 to 24px.

### Navigation
A plain full-width bar. White text over the teal hero, with the Download action as a white button. Once scrolled it turns paper with ink text and a bottom hairline, and the action becomes a teal button. Links are 86% opacity at rest, full on hover with a faint fill, 6px radius. Under 640px the links hide behind a menu button.

### Evidence Table
The trust surface. A full-width table on the teal field: 13px label heads over a 40% white rule, rows on 14% white hairlines, the measured value in the figure style, and a dedicated limit column so every result carries its caveat beside it.

### Rhythm Field (signature)
A band of 84 bars between chapters. Scroll progress (`--p`) scales each bar with a per-bar delay (`--d`), so the teal grows down out of the field into paper (`down`) or rises up out of paper into the next field (`up`). The `deep` variant uses deep teal for wipes into and out of the pipeline band. One bar is amber. Under reduced motion the bars hold at 60% of their height.

### Live App Window
The PsyClick task window, typing, set on the hero photograph's monitor: white, 12px, the window drop shadow. The report card that overlaps it is marked as a sample.

## Do's and Don'ts

### Do:
- **Do** put every section on paper (#eceff0), field (#0b5f70) or deep (#072f37), and change between them with a Rhythm field.
- **Do** separate content with 1px hairlines (rgba(15, 42, 51, 0.12) on paper, rgba(255, 255, 255, 0.14) on teal).
- **Do** set display and headline in Schibsted Grotesk 400 with negative tracking (-0.025em to -0.035em).
- **Do** keep amber (#f5a623) for flags: the pause bar and follow-up markers.
- **Do** show measured results with their limit beside them, as the Evidence table does.
- **Do** keep the 8-step algorithm stepper and the scroll holds on About, Roles and Algorithm.
- **Do** label any illustrative app data as a sample.

### Don't:
- **Don't** use backdrop blur, glass panels, glows, halos or text shadows.
- **Don't** use dot grids, corner brackets, ghost wordmarks or grain overlays.
- **Don't** put a small label or tag above a heading.
- **Don't** use italics, serif faces, gradient text or a coloured accent word in a headline.
- **Don't** use gradients as fills; the legacy gradient tokens are flattened to solid teal.
- **Don't** introduce radii outside 6 / 12 / 20px or shadows outside the two in Elevation.
- **Don't** show customers, testimonials, pricing or usage numbers the product does not have.
