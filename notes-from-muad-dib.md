# Notes from Muad'Dib
**Role:** Orchestration Agent
**Project:** Xylem OSINT Dashboard — React Migration v2.0
**Date:** February 28, 2026
**Session:** Master Plan analysis + phased planning + parallel research layer

---

## What I Did

Analyzed `MASTER-PLAN.md` and `xylem-osint.dash.html`, broke the project into a 7-phase implementation plan (`phased-implementation-plan.md`), then launched 7 parallel research agents (Agent Team: `xylem-phase-research`) to gather Exa-sourced context per phase. Each agent wrote its findings to `context-docs/phase-x-context.md`.

---

## Conflicts Between Master Plan and Research Findings

These are the most important things to review before starting the build. The Master Plan's constraints are described as "non-negotiable" and derived from a confirmed live Kandoo deploy. The researchers pulled from general Next.js / OpenNext documentation. These may not be the same thing.

### 1. `"type": "module"` in package.json
- **Master Plan says:** Required. Include it.
- **Phase 1 research says:** Do NOT use it — causes ESM/CJS ambiguity with Next.js internals.
- **My read:** The Master Plan's Kandoo pattern likely worked because Kilo's build pipeline handles this differently than a standard `npm run build`. If you encounter build failures in Phase 1, this is the first thing to test both ways. The Kandoo deploy is the ground truth here — trust it.

### 2. `next.config` file extension
- **Master Plan says:** Must be `.js` not `.ts`.
- **Phase 1 research says:** Use `.ts` — natively supported since Next.js 15, avoids CJS/ESM issues.
- **My read:** This is a lower-stakes conflict. Both work. The `.js` extension with `export default` (ESM syntax) is what the Master Plan specifies and it matches the working Kandoo pattern. Stick with `.js` unless Phase 1 build fails.

### 3. `open-next.config` file
- **Master Plan says:** Never add one — Kilo provides its own.
- **Phase 1 + Phase 7 research says:** Standard OpenNext deployment requires `open-next.config.ts` and `wrangler.jsonc`.
- **My read:** This is the clearest example of Kilo-specific behavior vs. vanilla OpenNext. Kilo appears to inject its own OpenNext config as part of its deployment wrapper, so adding your own would conflict with it. The Master Plan constraint here is almost certainly correct. Do not add `open-next.config.*` — Kilo provides it.

---

## Cross-Phase Patterns That Emerged

### Google Fonts: Two consistent findings across Phases 2 and 6
Both the design system researcher and the assembly researcher independently converged on the same pattern: use `next/font/google` with CSS variable output in `layout.js`, then reference the variables (`--font-heading`, `--font-body`, `--font-mono`) in `globals.css`. This is cleaner than a `<link>` tag and self-hosts at build time — no Google Fonts CDN request at runtime.

### `'use client'` placement strategy: Phase 4 vs. Master Plan
Phase 4 research noted that purely presentational components technically don't need `'use client'` until Phase 5 adds hooks. The Master Plan says add it proactively to everything. Both are valid. I recommend the Master Plan approach: add `'use client'` from the start. Retrofitting 15 files in Phase 5 is avoidable friction.

### Static data imports: Three researchers agreed
Phases 3, 4, and 6 all independently confirmed the same pattern: direct named imports from `data/` files into components, no prop drilling, no context, no state management. This is the correct architecture for a display-only dashboard.

### IntersectionObserver: Already CSS-animation-ready
The source HTML already uses the `opacity + translateY` pattern that IntersectionObserver hooks are designed to trigger. Phase 5 research confirmed this is the correct approach — no animation library needed. The CSS is already written; the hooks just toggle the `.animate-in` class.

---

## Risks and Gotchas I'm Watching

### High priority
- **Kilo bundle size limit:** Phase 7 found that Cloudflare Workers has a 3MB (free tier) / 10MB (paid) compressed bundle limit. This project has no heavy libraries so it should be fine, but worth checking the build output size after Phase 1 before adding anything.
- **`"type": "module"` conflict:** As noted above — if Phase 1 build fails, this is likely why. Test immediately.
- **Hydration errors:** Phase 6 flagged this as a common failure mode. The main risk here is any component that reads from `window`, `document`, or `localStorage` at render time. This project doesn't appear to do that, but IntersectionObserver setup in hooks must be guarded with `typeof window !== 'undefined'` or inside `useEffect`.

### Medium priority
- **Signal bar animation vs. `scaleX`:** Phase 5 found that `scaleX` transform is more GPU-compositable than animating `width` directly. The source HTML uses `width` transitions. Either works — `width` matches the original exactly, `scaleX` is slightly more performant. Not worth deviating from the source unless performance is a concern.
- **SVG score ring dashoffset math:** Phase 4 documented the formula: `circumference = 2 * Math.PI * r`, `dashoffset = circumference * (1 - score/100)`. This needs to be computed in the component, not stored in the data file. Easy to get wrong — double-check the ring renders at the right fill percentage.
- **`min-width: 0` on grid children:** Phase 6 flagged this as the fix for CSS Grid overflow issues (the financial table and gap rows are the most likely to overflow on mobile). Easy to miss during build, shows up late in responsive testing.

### Lower priority
- **Noise overlay technique:** Phase 2 found the SVG `feTurbulence` data URI approach is more performant than a PNG texture for the `body::before` grain effect. The source HTML may use a simpler CSS approach. Worth checking if the visual fidelity matches before deviating.
- **`scroll-margin-top`:** Phase 5 flagged this as the fix for sticky header obscuring section anchors on scroll-to. Set it as a CSS custom property so it matches the header height and can be updated in one place.

---

## Architectural Observations

### This is a simpler build than it looks
15 components sounds like a lot. But 12 of them are purely presentational with no internal state — they just receive data and render markup. The only real complexity is:
1. The two custom hooks (`useIntersection`, `useScrollSpy`)
2. The SVG score rings in `CompetitorSection.js`
3. The animated signal bars in `AlignmentSection.js` and `VerdictStrip.js`

Everything else is CSS and JSX. The heavy lifting was already done in the source HTML — the React migration is mostly transcription with structure.

### The data extraction step (Phase 3) is the most tedious, not the most complex
Pulling 11 data files from the HTML is mechanical work. The shapes are straightforward: arrays of objects with named keys. The only judgment calls are around the SVG ring data (store raw score, compute geometry in component) and formatting (store raw numbers, format for display in component). Both are confirmed patterns from the research.

### Phase 7 is the biggest unknown
Kilo.ai is not a commodity platform with thousands of public stack overflow answers. The working Kandoo deploy pattern is the most valuable reference for this phase — more valuable than any documentation the researchers found. If Phase 7 fails, the debugging loop will be: check Kilo build logs, compare config against Kandoo repo, isolate the difference.

---

## Recommendations Before Starting

1. **Locate the Kandoo repo** and keep it open during Phase 1. It is the ground truth for Kilo compatibility, more so than any Next.js or OpenNext documentation.
2. **Build Phase 1 first and validate `npm run build` passes before writing any components.** The Master Plan is correct to make this a hard gate — catching config issues early is far cheaper than debugging them after 15 components are written.
3. **Port the full CSS in one pass during Phase 2** rather than adding styles incrementally per component. The source HTML has everything in one `<style>` block — it's faster to port it all at once and have a complete design system from the start.
4. **During Phase 3 (data extraction), preserve original text verbatim.** The OSINT content (financial figures, gap analysis text, competitor assessments) is the value of this dashboard. Don't paraphrase or summarize during extraction.
5. **Test signal bar animations on a real scroll interaction** before calling Phase 5 done. The `cubic-bezier(0.22,1,0.36,1)` easing is what makes the bars feel good — verify it's working, not just that the class toggle fires.

---

## What the Context Docs Are Good For

Each `phase-x-context.md` is a pre-loaded reference for the agent building that phase. The pattern: read the context doc first, then build. You won't need to search for how IntersectionObserver cleanup works, or what the SVG dashoffset formula is, or how to configure `next/font/google` — it's already there.

The context docs are most dense for Phases 1 and 7 (the infrastructure phases with the most unknowns). Phases 3 and 4 are the most straightforward — the research mostly confirmed "do the obvious thing."

---

*Muad'Dib — Atreides Orchestration*
*Xylem OSINT Dashboard v2.0*
