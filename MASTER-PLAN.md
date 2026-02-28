# Xylem OSINT Dashboard — Master Plan
**Version:** 2.0 (Fresh Start)
**Author:** Paul the Peregrine Falcon, CTO
**Date:** February 28, 2026
**Status:** Draft — Pending phase breakdown and research layer

---

## Project Overview

Convert a single-file HTML dashboard (`xylem-osint.dash.html`) into a production React app deployed to Kilo hosting. This is also a dry run of the full Mentat planning workflow: master plan → phased task list → research layer → progressive disclosure context markers → build.

**Source file:** `xylem-osint.dash.html`
**Deployment target:** Kilo hosting (app.kilo.ai/deploy)
**GitHub repo:** TBD — to be created fresh

---

## Confirmed Deployment Requirements

These are non-negotiable and confirmed from the working Kandoo deploy pattern. Do not deviate.

### Stack
- **Framework:** Next.js 15 (all versions supported on Kilo)
- **React:** 19.x
- **Language:** JavaScript (not TypeScript) — matches Kandoo working pattern
- **Package manager:** npm

### `next.config.js` — Exact Working Pattern
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}
export default nextConfig
```
- File extension must be `.js` not `.ts`
- NO `output` setting of any kind
- NO `open-next.config` file
- Kilo generates its own OpenNext configuration

### `package.json` — Required Shape
```json
{
  "name": "xylem-osint-dashboard",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  },
  "devDependencies": {
    "eslint": "^9.x",
    "eslint-config-next": "^15.0.0"
  }
}
```
- `"type": "module"` is required
- No UI libraries, no charting libraries, no state management
- No TypeScript devDependencies

### Directory Structure — Exact Working Pattern
```
app/
  layout.js        ← Root HTML wrapper, metadata export
  page.js          ← Home page, renders the app
  globals.css      ← All global styles
components/        ← At repo root, NOT under src/
hooks/             ← At repo root
data/              ← At repo root (static data as JS modules)
public/            ← Static assets if any
next.config.js
package.json
.gitignore
```

### Component Rules
- Every component that uses `useState`, `useEffect`, `useRef`, event handlers, or browser APIs must have `'use client'` as the first line
- This project is all client-side interactivity — virtually every component will be `'use client'`
- No server components unless explicitly stateless and data-only

### GitHub → Kilo Deployment Flow
1. Push to GitHub
2. Kilo detects Next.js → runs `npm install` → runs `next build`
3. Kilo wraps output with OpenNext + Cloudflare Workers
4. Deployment URL provisioned automatically
- Never add `open-next.config.ts/js` — Kilo provides its own
- Never set `output: 'standalone'` — breaks Cloudflare Workers runtime

---

## Source Dashboard Inventory

Ten sections in the source HTML, each becomes a component. Inventory below.

### Visual Design System
- **Background:** `#0a0e14` (deep navy-black)
- **Cards:** `#111820` with `#161e28` hover state
- **Typography:** DM Serif Display (headings), DM Sans (body), JetBrains Mono (labels/values)
- **Accent colors:** Blue `#3b8beb`, Cyan `#22d3ee`, Green `#34d399`, Amber `#fbbf24`, Red `#f87171`, Purple `#a78bfa`, Gold `#d4a853`
- **Animation:** Scroll-triggered fade-up via IntersectionObserver, signal bar animation on entry

### Section Breakdown

| # | Section ID | Component Name | Description |
|---|-----------|----------------|-------------|
| — | Header | `Header.js` | Sticky header, brand badge, meta info with pulsing dot |
| — | Nav | `NavBar.js` | Sticky nav pills, scroll-spy active state, smooth scroll |
| — | Hero | `Hero.js` | Eyebrow, h1, subtitle paragraph |
| — | Verdict Strip | `VerdictStrip.js` | 3-column grid: Fluidra/Pentair/Xylem score cards with animated bottom bars |
| 01 | Financials | `FinancialSection.js` | 4-stat grid + financial table |
| 02 | Aquatics | `AquaticsSection.js` | 6-card grid of Neptune Benson product lines |
| 03 | Gaps | `GapSection.js` | Table-style gap analysis with severity badges |
| 04 | ESG | `EsgSection.js` | 4 ESG badges + 2 detail cards |
| 05 | Alignment | `AlignmentSection.js` | Signal bar rows with scroll-triggered animation |
| 06 | Risk | `RiskSection.js` | Risk banner with 6 risk signal items |
| 07 | Competitors | `CompetitorSection.js` | 3 competitor cards with SVG score rings |
| 08 | Diligence | `DiligenceSection.js` | 4 diligence hurdle cards in 2-col grid |
| 09 | Pathways | `PathwaysSection.js` | Entry points list + 3 questions list |
| 10 | Timeline | `TimelineSection.js` | Vertical timeline, 6 events |
| — | Footer | `Footer.js` | Simple flex footer |

### Data to Extract as JS Modules

All content extracted from HTML into static data files. Components receive data as props or import directly.

| File | Contents |
|------|----------|
| `data/verdicts.js` | Fluidra/Pentair/Xylem verdict card data |
| `data/financials.js` | 4 stat cards + 6 table rows |
| `data/aquatics.js` | 6 Neptune Benson product cards |
| `data/gaps.js` | 6 gap rows with severity levels |
| `data/esg.js` | 4 badges + 2 detail cards |
| `data/signals.js` | 6 alignment signal rows with percentages |
| `data/riskSignals.js` | 6 risk bullet points |
| `data/competitors.js` | 3 competitor cards with ring data |
| `data/diligence.js` | 4 diligence cards |
| `data/pathways.js` | 3 entry points + 3 questions |
| `data/timeline.js` | 6 timeline events |

### Hooks to Build

| File | Purpose |
|------|---------|
| `hooks/useIntersection.js` | IntersectionObserver for scroll-triggered `.animate-in` sections |
| `hooks/useScrollSpy.js` | Track active nav section, update nav pill active state |

---

## What NOT to Do

- Do not use Vite — Kilo does not support it
- Do not use TypeScript — `.js` everywhere to match working deploy pattern
- Do not add any UI libraries (no MUI, Tailwind, shadcn, etc.)
- Do not add charting libraries
- Do not add state management libraries (no Redux, Zustand, etc.)
- Do not add `open-next.config.js` or `.ts`
- Do not set `output` in `next.config.js`
- Do not put components under `src/` — they live at root level

---

## Phases Overview

*(Detail to be filled in by phase breakdown pass)*

### Phase 1 — Scaffold
Initialize Next.js project with confirmed config. Verify `npm run build` passes on an empty app before any components are added.

### Phase 2 — Design System
Port CSS custom properties and global styles from HTML into `app/globals.css`. Port Google Fonts import. Verify visual foundation renders correctly.

### Phase 3 — Data Layer
Extract all content from HTML into `data/` JS modules. No rendering yet — just structured data.

### Phase 4 — Static Components
Build all components without interactivity. Header, Footer, Hero, all section cards. Each section renders correctly from data.

### Phase 5 — Interactivity
Add hooks: `useIntersection` for scroll animations, `useScrollSpy` for nav active state, signal bar animation. Wire up smooth scroll.

### Phase 6 — Assembly
Import all sections into `app/page.js`. Verify full dashboard renders and all interactions work locally.

### Phase 7 — Deploy
Push to GitHub. Trigger Kilo deploy. Verify live URL loads correctly.

---

## Success Criteria

- [ ] `npm run build` passes locally with zero errors
- [ ] All 10 sections render with correct data
- [ ] Scroll-triggered animations fire correctly
- [ ] Nav pills track active section on scroll
- [ ] Signal bars animate in on section entry
- [ ] Responsive breakpoints match source HTML behavior
- [ ] Deploys to Kilo successfully (no SSL error, no Worker crash)
- [ ] Live URL accessible and visually matches source HTML

---

## Files In This Directory

```
xylem-osint.dash.html    ← Source — read-only reference
MASTER-PLAN.md           ← This file
PHASES.md                ← Phase breakdown (to be generated)
CONTEXT/                 ← Research context docs per phase (to be generated)
```

---

*Paul the Peregrine Falcon*
*CTO, Ambitious Realism*
