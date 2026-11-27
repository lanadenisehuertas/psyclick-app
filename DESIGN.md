---
name: PsyClick
description: Landing page for a Windows clinical decision-support app that reads psychomotor timing alongside PHQ-9 and GAD-7.
colors:
  night: "#03161b"
  night-raised: "#0a252c"
  paper: "#f3f6f6"
  surface: "#f7f9f9"
  field: "#0b5f70"
  ink: "#0f2a33"
  slate: "#46606a"
  muted: "#5c757d"
  on-night: "#cfe3e7"
  hairline: "rgba(15, 42, 51, 0.12)"
  hairline-on-dark: "rgba(255, 255, 255, 0.14)"
  sweep-mint: "#8ff0cf"
  sweep-cyan: "#68d8e8"
  sweep-peri: "#8fb4e8"
  sweep-mint-ink: "#0b8f7c"
  sweep-cyan-ink: "#0a6b80"
  sweep-peri-ink: "#3d5fa8"
  flag-amber: "#f5a623"
  white: "#ffffff"
gradients:
  sweep-on-night: "linear-gradient(92deg, #8ff0cf 0%, #68d8e8 42%, #8fb4e8 100%)"
  sweep-on-paper: "linear-gradient(92deg, #0b8f7c 0%, #0a6b80 45%, #3d5fa8 100%)"
  glow-cyan: "rgba(104, 216, 232, 0.22)"
  glow-mint: "rgba(112, 232, 192, 0.16)"
  glow-peri: "rgba(120, 168, 216, 0.18)"
typography:
  display:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(44px, 6.8vw, 108px)"
    fontWeight: 500
    lineHeight: 0.98
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(36px, 5vw, 68px)"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.035em"
  figure:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(32px, 3.6vw, 56px)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
    fontFeature: "\"tnum\" 1"
  endmark:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "clamp(80px, 19vw, 300px)"
    fontWeight: 500
    lineHeight: 0.85
    letterSpacing: "-0.06em"
  title:
    fontFamily: "Schibsted Grotesk, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  lede:
    fontFamily: "DM Sans, system-ui, sans-serif"
    fontSize: "clamp(16px, 1.4vw, 20px)"
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
    backgroundColor: "{colors.night}"
    textColor: "{colors.white}"
  button-on-night:
    backgroundColor: "{colors.white}"
    textColor: "{colors.night}"
    rounded: "{rounded.r1}"
    padding: "0 22px"
    height: "48px"
  button-on-night-hover:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.night}"
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
    backgroundColor: "{colors.night-raised}"
    textColor: "{colors.on-night}"
    rounded: "{rounded.r3}"
  nav-bar:
    backgroundColor: "rgba(3, 22, 27, 0.72)"
    textColor: "{colors.white}"
    padding: "14px clamp(20px, 4vw, 56px)"
---

# Design System: PsyClick

## Overview

**Creative North Star: "The Trailer"**

The page plays like a product trailer. It opens on a pinned shot: the headline sits over a dim clinic workstation, then lifts and blurs away as the PsyClick task window rises from below, tips flat from a 26° tilt and settles in the centre of the screen. From there the page alternates between night chapters (near-black teal lit by soft brand light) and bright paper chapters where the product screens sit. It ends on a large "PsyClick" wordmark in the brand sweep.

The colour comes from the logo's sweep: mint, cyan and periwinkle. On night chapters it appears as soft radial light, as gradient key words in headlines and as the Evidence figures. On paper the same sweep is darkened so it holds contrast. The Rhythm field carries over from the earlier system: a row of keystroke-gap bars between chapters, now night-coloured with lit cyan or mint tips and one amber pause bar.

Headlines are large Schibsted Grotesk at weight 500 and get variety from tone, not weight: a dimmed second clause ("Timing, never meaning." with "never meaning." at 42% opacity), or a gradient key phrase ("Type a line. See your rhythm."). DM Sans does the reading; IBM Plex Mono sets measured values only.

Motion follows the scroll. The hero is a framer-motion shot tied to scroll progress. Below it, CSS scroll-driven animations (`animation-timeline: view()`) bring headings up out of a blur, tilt product frames up to flat, and slide in table rows and FAQ items. Browsers without scroll timelines, and visitors with reduced motion, get the static page.

The trailer layer lives in `app/trailer.css`, loaded after `app/system.css` and `app/landing.css`. It overrides the paper and deep tokens at `:root`.

**Key Characteristics:**
- Two grounds: night (#03161b) for the hero, About, How it works, Algorithm, Evidence, Download and the footer; paper (#f3f6f6) for the product, try-it, report, roles, team and FAQ chapters.
- Night chapters are lit by two or three blurred radial glows in the brand sweep, placed off-centre.
- Two-tone headlines: one clause dimmed or one phrase in the sweep gradient, never both in one heading.
- A pinned 230vh hero (200vh on phones) whose sticky stage holds the opening shot.
- Rhythm fields with lit tips move between chapters.
- Three radii (6 / 12 / 20), flat surfaces, coloured light only around product windows and on night grounds.

**Known gaps (deferred, not part of the system):** the page still runs 13 sections plus footer against a target of about 9; the app mocks do not yet share one frame language; the legacy `app/landing.css` under the system layer still carries off-scale radii, many shadow rules and uppercase labels; Safari does not yet run the CSS scroll reveals.

## Colors

Near-black teal and bright cool paper, lit by the logo's mint-to-periwinkle sweep, with amber held back for flags.

### Grounds
- **Night** (night): The dark chapter ground and the nav glass tint. Every night section adds glows over it; none is flat black.
- **Night Raised** (night-raised): The algorithm panel and step dots, one step lighter than night.
- **Paper** (paper): The light chapter ground.
- **Clean Surface** (surface) and **White** (white): App windows, report cards, the button on night.

### Brand sweep
- **Sweep on night** (`sweep-on-night`: #8ff0cf to #68d8e8 to #8fb4e8): Gradient key words in headlines on night, the hero's "don't say.", Evidence figures and the end-card wordmark.
- **Sweep on paper** (`sweep-on-paper`: #0b8f7c to #0a6b80 to #3d5fa8): The same sweep darkened for gradient words on paper, so it keeps text contrast.
- **Glows** (glow-cyan, glow-mint, glow-peri): Radial light on night grounds, each `radial-gradient(… , transparent 70%)` at 16 to 38% alpha. On paper there is one glow only: a 40px-blurred cyan-to-mint pool behind each product frame.

### Action
- **Clinic Teal** (field): The primary button on paper, focus rings and text selection.

### Text
- **Clinic Ink** (ink), **Slate** (slate), **Muted** (muted): Text on paper, in that order of weight.
- **Night Mist** (on-night): Body copy on night. Headlines on night are white.
- **Hairline** (hairline) and **Hairline on Dark** (hairline-on-dark, 12 to 20% white): Every rule, table row and divider.

### Flag
- **Flag Amber** (flag-amber): The pause bar in each Rhythm field (lit to #f5a623 at its tip) and the follow-up flag on the report card. Nothing else.

### Named Rules
**The Lit Night Rule.** A night chapter always carries brand-sweep light, placed off-centre. A flat black band reads as a template.

**The One Accent per Heading Rule.** A heading gets one dimmed clause or one gradient phrase, never both and never more than one phrase.

**The Contrast-Safe Sweep Rule.** Gradient text on paper uses `sweep-on-paper`; the light sweep is for night only.

**The Amber Is a Flag Rule.** Amber marks something the clinician should look at. It is never a highlight, a button or a decoration.

## Typography

**Display Font:** Schibsted Grotesk (with system-ui, sans-serif)
**Body Font:** DM Sans (with system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono (with ui-monospace, monospace)

**Character:** A big, tight grotesk at medium weight over a soft humanist sans. The mono is an instrument readout, not a style.

### Hierarchy
- **Display** (500, clamp 44 to 108px, 0.98, -0.045em): The hero headline only, centred, revealed line by line from masks.
- **Headline** (500, clamp 36 to 68px, 1.04, -0.035em): Every section h2.
- **Figure** (400, clamp 32 to 56px, tabular, sweep gradient): Evidence results.
- **Endmark** (500, clamp 80 to 300px, 0.85, -0.06em): The footer wordmark, faded out at its foot with a mask.
- **Title** (400, 20px): h3s, Evidence commitments, column heads.
- **Lede** (DM Sans 400, clamp 16 to 20px, max 60ch): The hero lede, whose second clause is dimmed.
- **Body** (DM Sans 400, 16px, 1.6): Subs, table copy, FAQ.
- **Label** (DM Sans 500, 13px): Table heads, hero facts row, disclaimer.
- **Data** (Plex Mono 400, 13px): Timing values and scores inside the app mocks.

### Named Rules
**The Tone Not Weight Rule.** Headline variety comes from opacity (`.dim`, 0.42) or the sweep gradient (`.gt`), not from bold, italic or a size jump.

**The Mono Means Measured Rule.** Plex Mono sets a number the app measured or a value it reports. It does not set labels or headings.

## Layout

Content sits in a 1200px wrap inside a fluid gutter of clamp(20px, 4vw, 56px). Sections breathe at clamp(80px, 9vw, 128px).

The hero is a 230vh section with a 100svh sticky stage. The copy block is centred near the top (`top: clamp(96px, 15vh, 160px)`). The app window starts at 72vh, below the fold edge, and travels up to the centre. The facts row sits at the stage's foot and fades with the headline. On phones the section is 200vh, the actions stack and the facts row hides.

About runs full-bleed on night using a 100vmax box-shadow and a matching `clip-path` so its glow reaches the viewport edges. The Evidence section is a real table (result, measure, method, limit) that collapses to stacked rows under 640px.

Three scroll holds pin About, Roles and the 8-step Algorithm while their content steps with scroll; these are standing behaviour.

Breakpoints: 960px and 640px.

### Named Rules
**The Wipe Not Border Rule.** A change between night and paper happens through a Rhythm field or a hard cut, never a rule line or a soft gradient seam.

## Elevation & Depth

Surfaces are flat. Depth on night comes from the glows and from surface steps; depth on paper comes from the product frames and the light pool behind them.

### Shadow Vocabulary
- **Hairline lift** (`0 1px 2px rgba(15, 42, 51, 0.06), 0 0 0 1px rgba(15, 42, 51, 0.12)`): Small surfaces on paper.
- **Window drop** (`0 24px 60px -30px rgba(7, 47, 55, 0.45), 0 0 0 1px rgba(15, 42, 51, 0.12)`): A product window on paper.
- **Hero window** (`0 0 0 1px rgba(255,255,255,0.1), 0 60px 120px -40px rgba(0,0,0,0.75), 0 0 120px -20px rgba(104,216,232,0.45)`): The task window in the opening shot, with a cyan halo.
- **Hero report** (`0 30px 60px -24px rgba(0,0,0,0.6), 0 0 60px -20px rgba(112,232,192,0.5)`): The report card on the window's corner, with a mint halo.

### Named Rules
**The Light Belongs to the Product Rule.** Coloured glow appears on night grounds and around product windows only. Buttons, cards, text and icons never glow.

**The One Glass Rule.** The scrolled nav is the only glass surface (`rgba(3, 22, 27, 0.72)`, `saturate(1.6) blur(20px)`). `app/system.css` disables backdrop blur everywhere else.

## Motion

- **Ease:** `cubic-bezier(0.22, 1, 0.36, 1)` for reveals and the headline masks.
- **Opening shot** (framer-motion, scroll progress of the hero): headline y 0 to -14vh and blur 0 to 10px with opacity 1 to 0 across 5 to 45%; window y 0 to -46vh, rotateX 26° to 0 and scale 0.84 to 1.08 across 0 to 70%; photo scale 1.18 to 1 and opacity 0.5 to 0.16 across the whole hold. Skipped under reduced motion.
- **Heading rise** (`sx-rise`, `view()` entry 5% to 80%): opacity 0, y 48px, blur 10px to rest.
- **Frame zoom** (`sx-zoom`, entry 0% to cover 35%): product frames, the try-it card and the flow device from rotateX 16° and scale 0.86 at 20% opacity to flat.
- **Row slide** (`sx-slide`, entry 0% to 90%): Evidence rows, commitments and FAQ items from y 24px.
- **End card** (`sx-end`, entry 0% to cover 60%): the wordmark rises from y 20% and scale 0.92.
- **Rhythm wipe:** bars scale with `--p` (scroll progress) and a per-bar delay `--d`; under reduced motion they hold at 60% height.
- **State:** colour transitions only, 0.2s.

## Shapes

Three radii: 6px for interactive things, 12px for app windows and cards, 20px for the algorithm panel. Full-bleed bands have square corners. Lists and tables are open rows on hairlines.

The Rhythm field is the recurring silhouette: 84 flat-topped bars at 2px gaps, heights from one typed sentence, night at the root and lit at the tip (#68d8e8 hanging down, #8ff0cf rising up), one bar tipped amber.

## Components

### Buttons
- **Shape:** 6px, 48px tall, 22px side padding, DM Sans 500 16px.
- **Primary (paper):** teal with white text; hovers to night.
- **On night:** white with night text; the hero, nav, download and footer action.
- **Ghost:** transparent with a hairline border; hovers to white.
- **Text link on night:** white, underlined at 40% white, 6px offset; solid on hover.
- **Focus:** 2px outline, 3px offset, on every focusable element.

### Navigation
Transparent over the hero. Once scrolled it becomes dark glass with white text, a white hairline at 8% and a white Download button. Links hover to a faint white fill.

### Gradient Headline
An h2 with one `.gt` span (sweep gradient, clipped to text) or one `.dim` span (0.42 opacity). Night sections switch `.gt` to the light sweep automatically.

### Evidence Table
On night, between a cyan glow at the top right and a mint glow at the bottom left. Values are figures in the light sweep; each row carries its method and its limit. Rows slide in as they enter.

### Rhythm Field (signature)
A band of 84 bars between chapters; `down` hangs from night into paper, `up` rises out of paper into night. `deep` marks the wipes beside the pipeline band. One bar is amber.

### Opening Shot
The sticky hero stage: photo layer, glow layer, copy, app window with report card overlapping its lower-right corner, facts row. The report card is marked as a sample.

### End Card
The footer on night with a cyan glow at its foot, white links in on-night tones, and the "PsyClick" endmark (decorative, `aria-hidden`) before the disclaimer.

## Do's and Don'ts

### Do:
- **Do** light every night chapter with off-centre brand-sweep glows.
- **Do** give each headline at most one dimmed clause or one gradient phrase.
- **Do** use `sweep-on-paper` for gradient words on paper and `sweep-on-night` on night.
- **Do** let product windows carry the coloured halos and the light pools.
- **Do** tie motion to scroll, and leave the page complete without it.
- **Do** keep amber (#f5a623) for flags.
- **Do** show measured results with their limit beside them.
- **Do** keep the 8-step algorithm stepper and the scroll holds on About, Roles and Algorithm.
- **Do** label illustrative app data as a sample.

### Don't:
- **Don't** add glass beyond the scrolled nav, or glow to buttons, cards or icons.
- **Don't** use dot grids, corner brackets, grain overlays or eyebrow labels above headings.
- **Don't** use italics or serif faces.
- **Don't** put a gradient on a whole headline or on a surface fill; the sweep lives in words, figures, glows and the endmark.
- **Don't** introduce radii outside 6 / 12 / 20px.
- **Don't** show customers, testimonials, pricing, certifications or usage numbers the product does not have.
