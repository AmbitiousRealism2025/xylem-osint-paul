# Xylem OSINT Dashboard — Phased Implementation Plan
**Derived from:** `MASTER-PLAN.md` + `xylem-osint.dash.html` analysis
**Author:** Muad'Dib (Orchestration Agent)
**Date:** February 28, 2026
**Status:** Active — Research layer pending

---

## Project Context

Convert `xylem-osint.dash.html` (single-file OSINT dashboard) into a production Next.js 15 / React 19 app deployed on Kilo (Cloudflare Workers via OpenNext). JavaScript only. No UI libraries. No TypeScript.

**Source HTML summary:**
- 10 named sections + Header, Nav, Hero, VerdictStrip, Footer
- Deep navy-black dark theme with gold/cyan/green accents
- Custom fonts: DM Serif Display, DM Sans, JetBrains Mono (Google Fonts)
- Scroll-triggered animations via IntersectionObserver
- Sticky nav with scroll-spy active states
- Signal bar animations (CSS transition on width)
- SVG score rings for competitor cards
- All content is static — no API calls

---

## Phase 1 — Scaffold

**Goal:** Stand up a working, buildable Next.js 15 app with the exact Kilo-compatible configuration before touching any components or styles.

**Exit criterion:** `npm run build` passes with zero errors and zero warnings on the empty scaffold.

> **⚠ CONTEXT MARKER — Read before building:**
> `context-docs/phase-1-context.md` → Section: **"ESM Module Configuration"**
> Critical conflict: research found `"type": "module"` causes ESM/CJS issues with Next.js internals and is NOT included in default `create-next-app` output. The Master Plan says include it. Ground truth is the working Kandoo deploy — test both and let the build decide.
> Also read: `notes-from-muad-dib.md` → Section: **"Conflicts Between Master Plan and Research Findings"** — items 1 and 2 directly affect this phase.

### Deliverables
1. `package.json` — exact shape from Master Plan (`"type": "module"`, Next 15, React 19, no extras)
2. `next.config.js` — minimal config, `reactStrictMode: true`, NO `output` key, ESM export default
3. `app/layout.js` — root HTML wrapper with metadata export, Google Fonts link tag
4. `app/page.js` — minimal placeholder (returns `<main>Hello</main>`)
5. `app/globals.css` — empty placeholder
6. `.gitignore` — standard Next.js ignores
7. `components/` — empty directory (touch `.gitkeep`)
8. `hooks/` — empty directory
9. `data/` — empty directory

### Key constraints
- File extension: `.js` NOT `.ts` — everywhere
- No `src/` directory — `app/`, `components/`, `hooks/`, `data/` all at repo root
- `"type": "module"` in package.json — required for ESM imports (but see context marker above)
- No `open-next.config.js` — Kilo generates its own
- ESLint: `eslint-config-next` only, no custom rules needed

### Research needs
- Next.js 15 + React 19 App Router bootstrap patterns
- Kilo deployment requirements and `package.json` shape
- ESM module configuration pitfalls in Next.js
- Common `npm run build` failure modes to preempt

---

## Phase 2 — Design System

**Goal:** Port the full CSS design system from the source HTML into `app/globals.css`. Verify the visual foundation renders on a test page before building any real components.

**Exit criterion:** A test page renders with correct fonts, colors, and base card styles matching the source HTML.

> **⚠ CONTEXT MARKER — Read before building:**
> `context-docs/phase-2-context.md` → Section: **"Google Fonts Loading Strategy"**
> Do NOT use a `<link>` tag for Google Fonts. Use `next/font/google` with CSS variable output in `layout.js` instead. Self-hosts at build time, zero CLS, no CDN request at runtime. Font name mapping: `DM Serif Display` → `DM_Serif_Display`, `DM Sans` → `DM_Sans`, `JetBrains Mono` → `JetBrains_Mono`.

### Deliverables
1. `app/globals.css` — complete port of all CSS from source HTML:
   - `:root` CSS custom properties (all 20+ design tokens)
   - Reset rules (`*, html, body`)
   - Noise overlay (`body::before`)
   - Typography utilities (`.font-display`, `.font-mono`)
   - Layout utilities (`.grid-2`, `.grid-3`, `.grid-4`, `.container`)
   - Card base styles (`.card`, `.card-label`, `.card-value`, `.card-note`)
   - Section structure (`.section-header`, `.section-number`, `.section-title`)
   - All component-specific CSS blocks (verdict strip, signal bars, risk banner, gap table, competitor cards, diligence cards, timeline, ESG, pathways)
   - Animation keyframes (`fadeUp`, `pulse`, `shimmer`, `spin`)
   - `@media` responsive breakpoints
2. Google Fonts import in `app/layout.js` — DM Serif Display, DM Sans, JetBrains Mono

### Design tokens to port (complete list)
```
--bg-deep: #0a0e14
--bg-card: #111820
--bg-card-hover: #161e28
--bg-surface: #1a2332
--border: #1e2a3a
--border-accent: #2a3a4e
--text-primary: #e8edf3
--text-secondary: #8a9bb5
--text-muted: #56667a
--accent-blue: #3b8beb
--accent-cyan: #22d3ee
--accent-green: #34d399
--accent-amber: #fbbf24
--accent-red: #f87171
--accent-purple: #a78bfa
--gold: #d4a853
--gold-dim: rgba(212,168,83,0.15)
--fluidra-color: #34d399
--pentair-color: #3b8beb
--xylem-color: #fbbf24
--radius: 8px
--radius-lg: 12px
--shadow: 0 4px 24px rgba(0,0,0,0.4)
```

### Animation keyframes to port
- `fadeUp`: opacity 0→1, translateY 24px→0
- `fadeIn`: opacity 0→1
- `pulse`: opacity cycle for pulsing dots
- Signal bar width transitions: `1.5s cubic-bezier(0.22,1,0.36,1)`
- Verdict bar width transition: `1.2s cubic-bezier(0.22,1,0.36,1)`

### Research needs
- Next.js App Router globals.css loading patterns
- Google Fonts optimization in Next.js 15 (`next/font` vs link tag)
- CSS custom properties in React/Next.js — scoping patterns
- CSS noise/grain overlay techniques for dark UIs

---

## Phase 3 — Data Layer

**Goal:** Extract all static content from the source HTML into structured JS module files in `data/`. No rendering — just data. Components will import from these files.

**Exit criterion:** All 11 data files exist, export valid JS arrays/objects, and `node --input-type=module` can import each without errors.

### Deliverables (11 data files)

| File | Shape | Content |
|------|-------|---------|
| `data/verdicts.js` | `export const verdicts = [...]` | 3 objects: Fluidra, Pentair, Xylem — each with rank, company, score, label, color, barWidth |
| `data/financials.js` | `export const stats = [...]; export const tableRows = [...]` | 4 stat cards + 6 financial table rows |
| `data/aquatics.js` | `export const aquaticsCards = [...]` | 6 Neptune Benson product line cards |
| `data/gaps.js` | `export const gaps = [...]` | 6 gap analysis rows with severity (critical/high/whitespace) |
| `data/esg.js` | `export const esgBadges = [...]; export const esgCards = [...]` | 4 badges + 2 detail cards |
| `data/signals.js` | `export const signals = [...]` | 6 alignment signal rows with percentage values and colors |
| `data/riskSignals.js` | `export const riskSignals = [...]` | 6 risk bullet points as strings |
| `data/competitors.js` | `export const competitors = [...]` | 3 competitor cards with score ring data |
| `data/diligence.js` | `export const diligenceCards = [...]` | 4 due diligence hurdle cards |
| `data/pathways.js` | `export const entryPoints = [...]; export const questions = [...]` | 3 entry points + 3 questions |
| `data/timeline.js` | `export const timelineEvents = [...]` | 6 timeline events with date, title, body, color accent |

### Data extraction notes
- Preserve all original text verbatim from source HTML
- All data as JS objects with named keys (not positional arrays)
- No hardcoded colors in components — reference design tokens via className or CSS vars
- Percentages as numbers (e.g., `78` not `"78%"`) — components format for display

### Research needs
- Data normalization patterns for static React dashboards
- JS module export patterns best practices (named vs default)
- Structuring financial data for display-only React components

---

## Phase 4 — Static Components

**Goal:** Build all 15 components as pure presentational components. No interactivity yet — no hooks, no state, no event handlers beyond basic hover CSS. Each section should render correctly from data.

**Exit criterion:** All 15 components render their full content correctly when imported into a test page.

### Component build order (dependency-aware)

**Tier 1 — No dependencies, build in parallel:**
1. `components/Footer.js` — simple flex footer with meta text
2. `components/Hero.js` — eyebrow + h1 + subtitle paragraph
3. `components/FinancialSection.js` — stat grid + `<table>` from `data/financials.js`
4. `components/GapSection.js` — gap rows with severity badges from `data/gaps.js`
5. `components/EsgSection.js` — 4 badges + 2 cards from `data/esg.js`
6. `components/RiskSection.js` — risk banner + 2-col signals from `data/riskSignals.js`
7. `components/DiligenceSection.js` — 2-col grid from `data/diligence.js`
8. `components/TimelineSection.js` — vertical timeline from `data/timeline.js`

**Tier 2 — Slightly more complex:**
9. `components/AquaticsSection.js` — 6-card grid from `data/aquatics.js`
10. `components/PathwaysSection.js` — entry points + questions list from `data/pathways.js`
11. `components/VerdictStrip.js` — 3-col verdict cards, color-coded bars (static width initially)
12. `components/CompetitorSection.js` — 3 cards with SVG score rings from `data/competitors.js`

**Tier 3 — Navigation/layout (need full section list):**
13. `components/AlignmentSection.js` — signal bar rows (static, no animation yet)
14. `components/NavBar.js` — sticky nav pills, section anchors (no scroll-spy yet)
15. `components/Header.js` — brand badge, meta info, pulsing dot (static dot class initially)

### Component rules
- `'use client'` at top of every file (all use browser APIs or will in Phase 5)
- Props from data files via import, not prop drilling from parent
- No inline styles — all via CSS class names from globals.css
- SVG score rings: inline SVG with `viewBox="0 0 36 36"`, stroke-dasharray technique
- Pulsing dot in Header: `<span className="pulse-dot">` (CSS handles animation)

### Research needs
- React 19 component patterns — functional components, prop destructuring
- SVG stroke-dasharray score ring technique in React
- IntersectionObserver API — preparing components for Phase 5 animation
- Sticky header/nav patterns in Next.js App Router

---

## Phase 5 — Interactivity

**Goal:** Wire up all interactive behaviors: scroll-triggered section animations, nav scroll-spy, signal bar animated fill, verdict bar animated fill.

**Exit criterion:** All animations fire on scroll as in source HTML. Nav pills update correctly on scroll. Signal bars and verdict bars animate on section entry.

> **⚠ CONTEXT MARKER — Read before building:**
> `context-docs/phase-5-context.md` → Section: **"useIntersection Hook Patterns"** — canonical implementation with correct cleanup (`observer.unobserve` + `observer.disconnect`), the `once` option for fire-once animations, and the `[ref, isIntersecting]` tuple return pattern.
> Also: Section **"scroll-margin-top"** — set this on all section elements to compensate for the sticky header height, or sections will scroll behind the header when nav pills are clicked.

### Deliverables

**Custom hooks:**
1. `hooks/useIntersection.js`
   - Wraps `IntersectionObserver`
   - Returns `isIntersecting` boolean
   - Options: `threshold: 0.15`, `rootMargin: '0px 0px -50px 0px'`
   - Used by all sections to toggle `.animate-in` class
   - Cleanup: disconnect observer on unmount

2. `hooks/useScrollSpy.js`
   - Tracks which section ID is currently in viewport
   - Returns `activeId` string
   - Uses `IntersectionObserver` on all section elements
   - Updates nav pill active state in `NavBar.js`

**Component updates:**
- All section components: add `useIntersection` hook, toggle `animate-in` class on wrapper
- `AlignmentSection.js`: animate signal bar widths from 0 to target % on entry (CSS transition triggered by class toggle)
- `VerdictStrip.js`: animate bottom bar widths from 0 to target on entry
- `NavBar.js`: add `useScrollSpy`, apply `active` class to current section pill
- `Header.js`: pulsing dot already CSS-driven, verify it renders correctly

**Smooth scroll:**
- Already handled by `html { scroll-behavior: smooth; }` in globals.css
- Nav pills link to `#section-id` anchors — no JS needed

### Animation details from source HTML
- Section entry: `opacity: 0; transform: translateY(24px)` → with `.animate-in` class: `opacity: 1; transform: none`
- Transition: `0.6s ease-out` (section wrapper)
- Signal bars: `width: 0` → `width: {n}%` with `1.5s cubic-bezier(0.22,1,0.36,1)` (CSS transition fires when `.animate-in` added)
- Verdict bars: same pattern, `1.2s` duration

### Research needs
- `IntersectionObserver` in React hooks — correct cleanup patterns
- `useScrollSpy` implementation — handling multiple observers
- CSS transition triggering via class toggle in React
- Performance considerations for multiple IntersectionObserver instances

---

## Phase 6 — Assembly

**Goal:** Import all 15 components into `app/page.js` and wire up the complete dashboard. Verify the full app renders correctly end-to-end and all interactions work locally.

**Exit criterion:** `npm run dev` loads the full dashboard. All sections render. Scroll animations fire. Nav spy works. `npm run build` passes with zero errors.

### Deliverables

1. `app/page.js` — full assembly:
```jsx
import Header from '../components/Header'
import NavBar from '../components/NavBar'
import Hero from '../components/Hero'
import VerdictStrip from '../components/VerdictStrip'
import FinancialSection from '../components/FinancialSection'
import AquaticsSection from '../components/AquaticsSection'
import GapSection from '../components/GapSection'
import EsgSection from '../components/EsgSection'
import AlignmentSection from '../components/AlignmentSection'
import RiskSection from '../components/RiskSection'
import CompetitorSection from '../components/CompetitorSection'
import DiligenceSection from '../components/DiligenceSection'
import PathwaysSection from '../components/PathwaysSection'
import TimelineSection from '../components/TimelineSection'
import Footer from '../components/Footer'
```

2. Section ID anchors — match source HTML exactly:
   - `id="financials"`, `id="aquatics"`, `id="gaps"`, `id="esg"`, `id="alignment"`, `id="risk"`, `id="competitors"`, `id="diligence"`, `id="pathways"`, `id="timeline"`

3. Layout wrapper — `<div className="container">` with `max-width: 1200px; margin: 0 auto; padding: 0 24px`

### Pre-launch checklist
- [ ] All imports resolve without errors
- [ ] No hydration warnings in browser console
- [ ] `npm run build` passes — zero errors, zero warnings
- [ ] Fonts load correctly (check Network tab for Google Fonts requests)
- [ ] All 10 sections visible and styled correctly
- [ ] Scroll animations fire when sections enter viewport
- [ ] Nav pills highlight active section on scroll
- [ ] Signal bars animate on section entry
- [ ] Verdict bars animate on load
- [ ] Mobile breakpoints render without overflow

### Research needs
- Next.js App Router page.js patterns and layout hierarchy
- Hydration error prevention in Next.js 15 with `'use client'` components
- Google Fonts loading in Next.js — `next/font/google` vs `<link>` in layout
- `npm run build` error debugging in Next.js (common causes and fixes)

---

## Phase 7 — Deploy

**Goal:** Create GitHub repo, push code, trigger Kilo deployment, verify the live URL loads correctly and matches the source HTML visually.

**Exit criterion:** Live Kilo URL accessible, all sections render, zero Worker errors in Kilo logs.

> **⚠ CONTEXT MARKER — Read before building:**
> `context-docs/phase-7-context.md` → Section: **"Kilo.ai Deployment Workflow"** — exact deploy sequence via app.kilo.ai.
> `notes-from-muad-dib.md` → Section: **"Conflicts Between Master Plan and Research Findings"** item 3 — Kilo provides its own `open-next.config`. Do NOT add one. Standard OpenNext docs say to add it — Kilo-specific behavior overrides this.
> Also: `notes-from-muad-dib.md` → Section: **"Risks and Gotchas"** — Cloudflare Worker bundle size limit (3MB free / 10MB paid). Check build output size before deploying.

### Deliverables

1. GitHub repository created (public or private per user preference)
2. Initial commit with all files from Phase 1–6
3. Kilo deployment triggered via `app.kilo.ai/deploy` GitHub integration
4. Live URL verified: full dashboard loads, fonts render, animations fire

### Deployment sequence
```
1. git init && git add . && git commit -m "initial: xylem osint dashboard"
2. gh repo create xylem-osint-dashboard --public (or --private)
3. git remote add origin <repo-url>
4. git push -u origin main
5. Connect repo to Kilo via app.kilo.ai/deploy
6. Kilo auto-detects Next.js → runs npm install → next build → wraps with OpenNext
7. Monitor build logs in Kilo dashboard
8. Verify live URL
```

### Known Kilo gotchas (from Kandoo working pattern)
- Do NOT add `open-next.config.js` — Kilo provides its own, adding one causes conflicts
- Do NOT set `output: 'standalone'` — breaks Cloudflare Workers runtime
- `next.config.js` must be `.js` not `.mjs` or `.ts`
- Node.js modules not available at runtime — all data is static (already the case)
- `"type": "module"` in package.json — required for Kilo's build pipeline

### Research needs
- Kilo.ai deployment workflow — Next.js + GitHub integration
- OpenNext + Cloudflare Workers — what breaks and what works
- `next build` output and what Kilo consumes
- Common Kilo deployment failure modes and diagnostics

---

## Component → Section Mapping (Quick Reference)

| Component | Section ID | Data File | Interactivity |
|-----------|-----------|-----------|---------------|
| `Header.js` | — | — | pulsing dot (CSS) |
| `NavBar.js` | — | — | scroll-spy (useScrollSpy) |
| `Hero.js` | — | — | none |
| `VerdictStrip.js` | — | `verdicts.js` | bar animation (useIntersection) |
| `FinancialSection.js` | `#financials` | `financials.js` | section fade-up |
| `AquaticsSection.js` | `#aquatics` | `aquatics.js` | section fade-up |
| `GapSection.js` | `#gaps` | `gaps.js` | section fade-up |
| `EsgSection.js` | `#esg` | `esg.js` | section fade-up |
| `AlignmentSection.js` | `#alignment` | `signals.js` | bar animation + fade-up |
| `RiskSection.js` | `#risk` | `riskSignals.js` | section fade-up |
| `CompetitorSection.js` | `#competitors` | `competitors.js` | section fade-up |
| `DiligenceSection.js` | `#diligence` | `diligence.js` | section fade-up |
| `PathwaysSection.js` | `#pathways` | `pathways.js` | section fade-up |
| `TimelineSection.js` | `#timeline` | `timeline.js` | section fade-up |
| `Footer.js` | — | — | none |

---

## Success Criteria (from Master Plan)

- [ ] `npm run build` passes locally with zero errors
- [ ] All 10 sections render with correct data
- [ ] Scroll-triggered animations fire correctly
- [ ] Nav pills track active section on scroll
- [ ] Signal bars animate in on section entry
- [ ] Responsive breakpoints match source HTML behavior
- [ ] Deploys to Kilo successfully (no SSL error, no Worker crash)
- [ ] Live URL accessible and visually matches source HTML

---

*Generated by Muad'Dib — Xylem OSINT Dashboard v2.0*
