# Phase 6 Research Context — Assembly
**Generated:** 2026-02-28
**Phase:** 6 of 7

## Topic: Next.js App Router page.js Assembly

### Layout Hierarchy and File Structure
In Next.js 15 App Router, the layout hierarchy works as nested wrappers:
- `app/layout.js` is the **root layout** — wraps every page, defines `<html>` and `<body>` tags
- `app/page.js` is the **home page** — the content rendered inside the root layout
- Layouts are a "contract" between page content and surrounding structure; they persist across navigations

### Assembling Multiple Client Components in page.js
The `page.js` file is a **Server Component by default**. This is a key architectural advantage:

```jsx
// app/page.js — Server Component (no 'use client' needed)
import HeroSection from '@/components/HeroSection';
import StatsGrid from '@/components/StatsGrid';
import TimelineSection from '@/components/TimelineSection';
// ... more imports

export default function Home() {
  return (
    <main>
      <HeroSection />
      <StatsGrid />
      <TimelineSection />
      {/* More sections... */}
    </main>
  );
}
```

**Critical pattern**: The page itself stays as a Server Component even when importing Client Components (those marked with `'use client'`). This means:
- The page file ships zero JavaScript to the client on its own
- Each `'use client'` component becomes its own hydration boundary
- The server renders the initial HTML for all components, then hydrates only the interactive ones

### Key Concepts Table
| Concept | Description |
|---------|-------------|
| Server Components | Default in App Router, run on server only |
| Client Components | Interactive, marked with `'use client'` |
| Layouts | Shared UI that preserves state across navigations |
| Loading States | Automatic Suspense boundaries via `loading.js` |
| Error Handling | Granular error boundaries via `error.js` |

### Best Practices for page.js Assembly
1. **Keep page.js as a Server Component** — never add `'use client'` to the page file itself
2. **Push `'use client'` to the leaf components** — only mark components that need interactivity (event handlers, hooks, browser APIs)
3. **Use composition pattern** — Server Component page imports and renders Client Components as children
4. **Order imports logically** — group by section order on the page for readability

## Topic: Hydration Error Prevention

### What Causes Hydration Errors
Hydration errors occur when the HTML rendered on the server differs from what React expects to render on the client. React 19 (used in Next.js 15) has **strict hydration checks** — these are a feature, not a bug.

The core equation: `f(state, props) = UI` must produce identical output on both server and client.

### The 5 Most Common Hydration Error Sources

1. **Dynamic/non-deterministic content** — `Date.now()`, `Math.random()`, `new Date().toLocaleString()` produce different values on server vs client
2. **Browser-only APIs during render** — accessing `window`, `localStorage`, `navigator` during initial render
3. **Browser extensions injecting DOM** — extensions like ad blockers or Grammarly add elements React doesn't expect
4. **Incorrect HTML nesting** — `<p>` containing `<div>`, `<a>` containing `<a>`, etc.
5. **Conditional rendering based on client state** — `typeof window !== 'undefined'` checks that differ between server/client

### Prevention Patterns

**Pattern 1: Client-only rendering with useEffect**
```jsx
'use client';
import { useState, useEffect } from 'react';

function DynamicTimestamp() {
  const [time, setTime] = useState(null);

  useEffect(() => {
    setTime(new Date().toLocaleString());
  }, []);

  if (!time) return <span>Loading...</span>;
  return <span>{time}</span>;
}
```

**Pattern 2: suppressHydrationWarning for known dynamic content**
```jsx
// Use sparingly — only for content you know will differ
<time suppressHydrationWarning>
  {new Date().toLocaleDateString()}
</time>
```

**Pattern 3: Isolate third-party DOM manipulation**
```jsx
'use client';
import { useRef, useEffect } from 'react';

function ThirdPartyWidget() {
  const containerRef = useRef(null);

  useEffect(() => {
    // Third-party code only runs after hydration
    initWidget(containerRef.current);
  }, []);

  return <div ref={containerRef} />;
}
```

**Pattern 4: Deterministic first render**
- Treat "first paint" as a deterministic snapshot
- Move anything environment-dependent into post-mount enhancement (useEffect)
- Keep client state initialization consistent with server output

### Prevention Checklist (Pre-merge)
- [ ] No `Date`, `Math.random()`, or locale-dependent values in initial render
- [ ] No `window`/`document`/`navigator` access outside `useEffect`
- [ ] All HTML nesting is valid (no `<div>` inside `<p>`, etc.)
- [ ] Third-party scripts isolated behind client-only boundaries
- [ ] Data consistency between server and client renders

## Topic: next build Error Debugging

### Common Build Failures in Next.js 15

**1. Hydration mismatch errors**
- Cause: Server HTML differs from client render
- Fix: Follow hydration prevention patterns above
- Build output shows: `"Hydration failed: the initial UI does not match what was rendered on the server"`

**2. Module not found / Cannot find module**
- Cause: Incorrect import paths, missing dependencies, case-sensitivity issues
- Fix: Verify all import paths, run `npm install`, check `jsconfig.json`/`tsconfig.json` path aliases
- Common with `@/` alias — ensure it maps to `./src/` or `./` in config

**3. "Unexpected token" / Syntax errors**
- Cause: Using JSX in non-component files, missing `'use client'` directive, or importing server-only code in client components
- Fix: Add proper directives, separate server/client code

**4. Tailwind CSS v4 configuration errors**
- Error: `Module parse failed: Unexpected character '@'`
- Cause: Tailwind v4 restructured its import system
- Fix: Update `globals.css` to use `@import "tailwindcss"` instead of the old `@tailwind base/components/utilities` pattern

**5. Environment variable issues**
- Cause: Missing `NEXT_PUBLIC_` prefix for client-side env vars, or env vars not available at build time
- Fix: Prefix client-side vars with `NEXT_PUBLIC_`, ensure `.env.local` exists

### Zero-Warning Build Strategy
1. Run `next build` early and often — don't wait until deployment
2. Treat warnings as errors: set `eslint.ignoreDuringBuilds: false` in `next.config.js`
3. Use `--debug` flag for verbose output: `next build --debug`
4. Check the `.next` output directory for generated files
5. Address TypeScript errors first — they block the entire build
6. Static analysis runs before compilation — fix linting issues early

### Build Output Interpretation
```
Route (app)                    Size     First Load JS
-------------------------------------------------
/                              5.2 kB   89.5 kB
/_not-found                    0 B      84.3 kB
+ First Load JS shared by all  84.3 kB

○  (Static)   prerendered as static content
```
- **Size**: JavaScript unique to that route
- **First Load JS**: Total JS needed for first page visit (shared + route-specific)
- Aim for First Load JS under 100kB for good performance
- `○ (Static)` means the page was statically generated at build time (ideal for dashboards)

## Topic: Google Fonts in layout.js

### Configuring Multiple Google Fonts with next/font/google

The `next/font/google` module provides automatic self-hosting, zero layout shift, and built-in optimization.

**Step 1: Import and configure fonts in layout.js**
```jsx
// app/layout.js
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-dm-serif',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
```

**Step 2: Apply CSS variables to the body**
```jsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Use CSS custom properties in your stylesheets**
```css
/* globals.css */
:root {
  --font-heading: var(--font-dm-serif);
  --font-body: var(--font-dm-sans);
  --font-code: var(--font-mono);
}

h1, h2, h3 {
  font-family: var(--font-heading);
}

body {
  font-family: var(--font-body);
}

code, pre {
  font-family: var(--font-code);
}
```

### Key Configuration Notes
- **`display: 'swap'`** — ensures text is visible immediately with a fallback font, then swaps to the custom font (prevents FOIT — Flash of Invisible Text)
- **`variable` property** — generates a CSS custom property (e.g., `--font-dm-serif`) that can be used anywhere in CSS
- **`subsets: ['latin']`** — only loads the Latin character subset, reducing font file size
- **`weight` array** — specify only the weights you actually use to minimize download size
- **Font names use underscores** in the import: `DM_Serif_Display`, `DM_Sans`, `JetBrains_Mono`
- Fonts are automatically self-hosted at build time — no requests to Google's servers at runtime
- Zero CLS (Cumulative Layout Shift) because Next.js uses CSS `size-adjust` to match fallback font metrics

### Common Pitfalls
- Do NOT use `@import url('fonts.googleapis.com/...')` in CSS — this defeats Next.js font optimization
- Do NOT install `@next/font` separately — `next/font/google` is built into Next.js 15
- Ensure `weight` values match what the font actually offers (e.g., DM Serif Display only has weight `400`)

## Topic: Component Import Performance

### Code Splitting in Next.js 15
Next.js automatically code-splits at the route level — each page only loads the JavaScript it needs. For a static dashboard page with many components, this means:

- **All 15 components imported in `page.js`** will be included in that route's bundle
- If `page.js` is a Server Component, only `'use client'` components contribute to the client JS bundle
- Server Components are rendered to HTML on the server and ship zero JavaScript

### When to Use Dynamic Imports
For a static OSINT dashboard, **regular imports are generally fine** because:
1. All components are visible on initial load (no below-fold lazy loading benefit)
2. The page is statically generated at build time
3. Server Components don't add to client bundle size

**Use `next/dynamic` when:**
- A component is heavy and not immediately visible (e.g., a modal, chart library)
- A component uses browser-only APIs that would break SSR
- You want to show a loading skeleton while a component loads

```jsx
import dynamic from 'next/dynamic';

// Only use for heavy, non-critical components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div className="chart-skeleton" />,
  ssr: false, // Skip server rendering if it uses browser APIs
});
```

### Performance Considerations for 15 Components
1. **Server Components are free** — they add zero client JS. Keep as many components as possible as Server Components
2. **Client Components are chunked automatically** — Next.js creates separate bundles for each `'use client'` component
3. **Avoid barrel exports** — don't use `export * from './components'`; import each component directly
4. **Tree shaking works** — unused exports from component files are eliminated at build time
5. **Static generation is optimal** — for a dashboard with no dynamic data fetching, the entire page can be prerendered as static HTML

### Bundle Size Strategy
- Keep `'use client'` components small and focused
- Extract shared utilities into Server Components where possible
- Monitor bundle size with `next build` output
- Target: First Load JS under 100kB for the main page

## Topic: Section Anchor IDs

### Setting id Props on Section Wrappers
The simplest and most reliable approach for section anchors in Next.js:

```jsx
// app/page.js
export default function Home() {
  return (
    <main>
      <section id="hero">
        <HeroSection />
      </section>
      <section id="stats">
        <StatsGrid />
      </section>
      <section id="timeline">
        <TimelineSection />
      </section>
      <section id="network">
        <NetworkGraph />
      </section>
    </main>
  );
}
```

### Alternative: id Inside the Component
```jsx
// components/HeroSection.jsx
export default function HeroSection() {
  return (
    <section id="hero" className="hero-section">
      {/* content */}
    </section>
  );
}
```

### Scroll-to-Anchor Navigation

**Method 1: Native HTML anchor links (simplest)**
```jsx
// Works out of the box — no JavaScript needed
<a href="#stats">Jump to Stats</a>
```

**Method 2: Next.js Link component**
```jsx
import Link from 'next/link';

// Link with hash — updates URL and scrolls
<Link href="#stats">Jump to Stats</Link>
```

**Method 3: Smooth scrolling with CSS**
```css
/* globals.css */
html {
  scroll-behavior: smooth;
}
```
This single CSS rule enables smooth scrolling for all anchor navigation.

**Method 4: Programmatic scroll with offset (for fixed headers)**
```jsx
'use client';

function scrollToSection(id) {
  const element = document.getElementById(id);
  if (element) {
    const offset = 80; // height of fixed header
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}
```

### Known Issue: Next.js Link + Hash on Reload
When using `<Link href="#section">`, the URL updates to include the hash (e.g., `/#stats`). On page reload, the browser auto-scrolls to that anchor. This is standard browser behavior and generally desirable. If you need to prevent it, handle scroll position in `useEffect` on mount.

### Best Practice for This Project
- Set `id` attributes on `<section>` wrapper elements in `page.js`
- Use `scroll-behavior: smooth` in CSS for smooth navigation
- If there's a fixed header/nav, account for its height with `scroll-margin-top` CSS:
```css
section[id] {
  scroll-margin-top: 80px; /* adjust to header height */
}
```

## Topic: Mobile Responsive Layout

### CSS Grid with Responsive Breakpoints
For a dashboard layout, CSS Grid with media queries is the standard approach:

```css
/* Base mobile layout — single column */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
  padding: var(--space-md);
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

/* Tablet */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Large desktop */
@media (min-width: 1400px) {
  .dashboard-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

### Overflow Prevention (Critical)
Overflow is one of the most common mobile layout bugs. Key rules:

```css
/* Prevent horizontal overflow globally */
html, body {
  overflow-x: hidden;
  width: 100%;
}

/* Ensure all containers respect viewport width */
* {
  box-sizing: border-box;
}

/* Prevent content from breaking out of grid */
.dashboard-grid > * {
  min-width: 0; /* Critical for grid children */
  overflow: hidden;
}
```

**Why `min-width: 0` matters**: CSS Grid children have an implicit `min-width: auto`, which means content (like long text or pre-formatted code) can force a grid cell wider than the column, causing horizontal overflow. Setting `min-width: 0` on grid children fixes this.

### Container Queries (Modern Alternative)
Container queries allow components to respond to their container's size rather than the viewport:

```css
.card-container {
  container-type: inline-size;
}

@container (min-width: 400px) {
  .card {
    grid-template-columns: 1fr 1fr;
  }
}
```
Container queries are supported in all modern browsers (2024+) and offer more modular responsive behavior than viewport media queries.

### Mobile-First Approach
1. **Start with single-column mobile layout** — this is the base CSS
2. **Add complexity with `min-width` media queries** — progressively enhance for larger screens
3. **Use `clamp()` for fluid typography**: `font-size: clamp(1rem, 2.5vw, 1.5rem)`
4. **Test with real device viewports**: 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1024px (laptop), 1440px (desktop)

### Specific Tips for Next.js App Router
- CSS Grid styles in `globals.css` work across all routes
- Use CSS custom properties for consistent spacing: `gap: var(--space-md)`
- Avoid `100vw` — it includes scrollbar width on desktop and causes horizontal overflow; use `width: 100%` instead
- Test responsive layouts in both `next dev` and `next build && next start` — some layout issues only appear in production builds
- Images: always use `next/image` with responsive `sizes` prop to prevent layout shift

## Key Implementation Notes

- **Keep `page.js` as a Server Component** — never add `'use client'` to it. Import all 15 components directly. Only components that use hooks, event handlers, or browser APIs need the `'use client'` directive.
- **Font setup goes in `layout.js` only** — configure DM Serif Display, DM Sans, and JetBrains Mono with CSS `variable` properties and `display: 'swap'`. Apply all three variables to `<body className>`. Reference them in `globals.css` with `var(--font-*)`.
- **Set `min-width: 0` on all grid children** — this single rule prevents the most common CSS Grid overflow bug on mobile. Combine with `overflow-x: hidden` on `html, body` and `box-sizing: border-box` on everything.
- **Run `next build` before deploying and after every major change** — check that all routes show `○ (Static)` and First Load JS stays under 100kB. Address warnings immediately; do not let them accumulate.
- **Use `scroll-behavior: smooth` and `scroll-margin-top`** — add these to `globals.css` for anchor navigation. Set `id` attributes on section wrappers in `page.js` or inside each component.

## Sources
- https://dev.to/devjordan/nextjs-15-app-router-complete-guide-to-server-and-client-components-5h6k
- https://www.codercops.com/blog/nextjs-15-16-app-router-guide
- https://thelinuxcode.com/nextjs-layouts-app-router-and-pages-router-practical-patterns-pitfalls-and-performance/
- https://how2.sh/posts/how-to-build-server-components-with-nextjs-15-app-router/
- https://coldfusion-example.blogspot.com/2026/01/fixing-warning-text-content-does-not.html
- https://medium.com/@blogs-world/next-js-hydration-errors-in-2026-the-real-causes-fixes-and-prevention-checklist-4a8304d53702
- https://learnwebcraft.com/learn/nextjs/debugging-hydration-errors-nextjs-15
- https://markaicode.com/nextjs-15-hydration-errors-fix/
- https://oneuptime.com/blog/post/2026-01-24-fix-hydration-mismatch-errors-nextjs/view
- https://medium.com/@hardikkumarpro0005/fixing-next-js-15-and-tailwind-css-v4-build-issues-complete-solutions-guide-438b0665eabe
- https://blog.stackademic.com/common-next-js-build-errors-and-how-to-fix-them-fast-74c7963e1eba
- https://astconsulting.in/nextjs/nextjs-build-errors-troubleshooting
- https://www.omi.me/blogs/next-js-errors/error-next-build-failed-in-next-js-causes-and-how-to-fix
- https://www.buildwithmatija.com/blog/how-to-use-custom-google-fonts-in-next-js-15-and-tailwind-v4
- https://medium.com/codetodeploy/how-to-add-google-fonts-properly-in-next-js-15-without-layout-shift-e343531ecbce
- https://javascript.plainenglish.io/implement-local-google-fonts-in-next-js-the-right-way-a-practical-pattern-guide-529ffbed517a
- https://medium.com/@dolce-emmy/integrating-multiple-google-fonts-in-a-next-js-14-project-a-step-by-step-guide-ef051f3264e1
- https://dev.to/brendan_dev/how-to-use-multiple-fonts-in-nextjs-4c8m
- https://dev.to/boopykiki/optimize-nextjs-performance-with-smart-code-splitting-what-to-load-when-and-why-9l1
- https://mediusware.com/blog/lazy-loading-code-splitting-nextjs-react
- https://medium.com/@sureshdotariya/mastering-lazy-loading-in-next-js-15-advanced-patterns-for-peak-performance-75e0bd574c76
- https://advancingtechnology.online/blog/nextjs-15-react-19-production-ready
- https://arttus.net/blog/nextjs-performance
- https://how.dev/answers/how-to-implement-lazy-loading-in-nextjs-using-next-dynamic
- https://www.codegenes.net/blog/nextjs-link-to-scroll-to-a-section-in-same-page/
- https://stackoverflow.com/questions/68589788/nextjs-link-to-scroll-to-a-section-in-same-page
- https://nextjs.org/docs/14/app/building-your-application/routing/linking-and-navigating
- https://www.reddit.com/r/nextjs/comments/1cmj36z/scroll_to_specific_section/
- https://compilenrun.com/docs/framework/nextjs/nextjs-styling/nextjs-responsive-design
- https://nextnative.dev/blog/responsive-design-best-practices
- https://medium.com/@orami98/i-tested-every-next-gen-css-layout-2025-update-heres-what-actually-replaced-82-of-my-52c304025605
