# Phase 4 Research Context -- Static Components
**Generated:** 2026-02-28
**Phase:** 4 of 7

## Topic: React 19 Functional Component Patterns

### Server Components vs Client Components
React 19 with Next.js App Router defaults to **Server Components**. Server Components:
- Do not use state or effects
- Never ship JavaScript to the browser
- Can call databases and private APIs directly
- Run only on the server
- Are ideal for layout, data fetching, and non-interactive UI

For **presentational (static) components** that receive props and render UI without interactivity, Server Components are the correct default. No `'use client'` directive is needed.

### Standard Function Component Pattern (Recommended)
The React community has settled on **standard function components** over `React.FC`:

```jsx
// Preferred: Standard function with destructured props
function ScoreRing({ score, label, size = 120 }) {
  return (
    <div className="score-ring">
      {/* SVG rendering */}
    </div>
  );
}

export default ScoreRing;
```

Key conventions:
- **Destructure props** directly in the function signature with defaults
- **No hooks** needed for purely presentational components (no useState, useEffect)
- **Named exports** preferred for components used within the same module; default exports for page-level components
- Props should be plain serializable data (strings, numbers, arrays, plain objects) when passing from Server to Client components

### Container/Presentational Split
The Container/Presentational pattern remains relevant in React 19:
- **Presentational components**: Receive data via props, render UI, no side effects
- **Container components** (or Server Components): Handle data fetching, pass data down
- Keep presentational components pure -- same props = same output

### Key Patterns for Phase 4
Since Phase 4 builds **static** components (no interactivity), all 15 components can be Server Components by default:
- No `'use client'` directive needed
- No hooks (useState, useEffect) required
- Props are the only input; JSX is the only output
- CSS classes and inline styles handle all visual presentation

---

## Topic: 'use client' Directive Rules

### When 'use client' IS Required
Add `'use client'` at the top of a file (before any imports) when the component needs:
- **State**: `useState`, `useReducer`
- **Effects**: `useEffect`, `useLayoutEffect`
- **Browser APIs**: `window`, `document`, `localStorage`, `IntersectionObserver`
- **Event handlers** that modify state: `onClick` with `setState`, form submissions
- **Custom hooks** that use any of the above
- **Third-party libraries** that use hooks internally

### When 'use client' is NOT Required
Do NOT add `'use client'` for:
- Components that only render JSX from props
- Components that use CSS classes, inline styles, or CSS custom properties
- Components with static event handlers that don't modify state (e.g., anchor links)
- Layout components, wrappers, and structural elements
- Components that only format and display data

### Placement Rules
- Must be the **first statement** in the file (before all imports)
- Applies to the **entire file** -- all exports become Client Components
- Child components imported by a Client Component are **also** treated as client components (the boundary cascades down)
- You do NOT need `'use client'` in every file -- only at the "entry point" where the server/client boundary is crossed

### Phase 4 Implication
Since Phase 4 components are all **static/presentational** with no interactivity:
- **None of the 15 components need `'use client'`**
- They will remain Server Components, shipping zero JavaScript to the browser
- This is optimal for performance -- only HTML and CSS are sent
- When Phase 5 adds interactivity (IntersectionObserver, scroll-spy), those specific wrapper components will need `'use client'`

---

## Topic: SVG Stroke-Dasharray Score Rings

### Core Technique
A circular score/progress ring uses two SVG `<circle>` elements:
1. **Background circle**: Full ring in a muted color (the "track")
2. **Progress circle**: Partial ring showing the score value

The key SVG attributes:
- `stroke-dasharray`: Sets the dash pattern length (equal to circle circumference)
- `stroke-dashoffset`: Controls how much of the dash is hidden (creates the partial ring)
- `transform="rotate(-90 cx cy)"`: Rotates so progress starts at 12 o'clock (top)

### Math Formula
```
radius = size / 2 - strokeWidth / 2
circumference = 2 * Math.PI * radius
dashOffset = circumference * (1 - score / 100)
```

### React Implementation Pattern
```jsx
function ScoreRing({ score = 0, size = 120, strokeWidth = 8, color = 'var(--accent)' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);
  const center = size / 2;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Background track */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth={strokeWidth}
      />
      {/* Score arc */}
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform={`rotate(-90 ${center} ${center})`}
      />
      {/* Center label */}
      <text
        x={center}
        y={center}
        textAnchor="middle"
        dominantBaseline="central"
        className="score-ring__label"
      >
        {score}
      </text>
    </svg>
  );
}
```

### Key Details
- **No JavaScript animation needed** for static display -- just computed SVG attributes
- `strokeLinecap="round"` gives rounded ends to the arc
- Use CSS custom properties (`var(--color)`) for theming rather than hardcoded colors
- The component is purely presentational -- no hooks, no `'use client'`
- For accessibility, add `role="img"` and `aria-label={`Score: ${score} out of 100`}` to the SVG

### Color Mapping for Scores
```css
/* Score ring colors via CSS custom properties */
.score-ring--critical { --ring-color: var(--clr-critical); }
.score-ring--high     { --ring-color: var(--clr-high); }
.score-ring--medium   { --ring-color: var(--clr-medium); }
.score-ring--low      { --ring-color: var(--clr-low); }
```

---

## Topic: Sticky Header + Nav in Next.js

### CSS position: sticky Basics
```css
.site-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header, 100);
  background: var(--surface-1);
}

.section-nav {
  position: sticky;
  top: var(--header-height, 64px); /* Stack below the header */
  z-index: var(--z-nav, 90);
  background: var(--surface-1);
}
```

### Key Requirements for sticky to Work
1. The sticky element must **not** have an ancestor with `overflow: hidden`, `overflow: auto`, or `overflow: scroll` (unless that ancestor is the scrolling container)
2. The sticky element needs a `top` (or `bottom`) value
3. The parent container must be tall enough for scrolling to occur

### Next.js App Router Layout Pattern
In App Router, the layout wraps page content. Place the sticky header in `layout.js`:

```jsx
// app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          {/* Logo, nav links */}
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

The section nav (scroll-spy tabs) goes inside the page component, positioned sticky below the header.

### z-index Stacking Strategy
Use CSS custom properties for a z-index scale:
```css
:root {
  --z-base: 1;
  --z-nav: 90;
  --z-header: 100;
  --z-overlay: 200;
  --z-modal: 300;
}
```

### Stacking Context Gotcha
A sticky element with `z-index` creates its own **stacking context**. This means:
- Children inside the sticky header cannot escape above sibling stacking contexts
- Dropdowns/tooltips inside a sticky header may appear beneath later page content
- Solution: Ensure the header's z-index is higher than all page content z-indices

### Phase 4 Approach
For static components:
- The header and nav are purely CSS (`position: sticky`, `top`, `z-index`)
- No JavaScript needed for the sticky behavior itself
- Both can remain Server Components
- The scroll-spy highlighting (Phase 5) will later require `'use client'` for IntersectionObserver

---

## Topic: Financial Table Component Patterns

### Semantic HTML Table Structure
```jsx
function FinancialTable({ rows, caption }) {
  return (
    <table className="financial-table">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col" className="text-right">Amount</th>
          <th scope="col" className="text-right">Change</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.category}</td>
            <td className="text-right tabular-nums">
              {formatCurrency(row.amount)}
            </td>
            <td className={`text-right ${row.change >= 0 ? 'text-positive' : 'text-negative'}`}>
              {row.change >= 0 ? '+' : ''}{row.change}%
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Currency Formatting with Intl API
Use the browser-native `Intl.NumberFormat` for zero-dependency currency formatting:
```js
function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
```

### CSS for Financial Tables
```css
.financial-table {
  width: 100%;
  border-collapse: collapse;
}

.financial-table th,
.financial-table td {
  padding: var(--space-2) var(--space-3);
  border-bottom: 1px solid var(--border);
}

.financial-table tbody tr:hover {
  background: var(--surface-hover);
}

/* Tabular figures for aligned numbers */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}

.text-right {
  text-align: right;
}

.text-positive { color: var(--clr-positive); }
.text-negative { color: var(--clr-negative); }
```

### Key Details
- Use `font-variant-numeric: tabular-nums` so digits align vertically in columns
- Right-align numeric columns for scanability
- Use semantic `<th scope="col">` for accessibility
- Add `<caption>` (can be visually hidden with `.sr-only`) for screen readers
- Hover states are CSS-only (`:hover` pseudo-class), no JavaScript needed
- The component remains a Server Component -- no interactivity required

---

## Topic: Vertical Timeline Component

### CSS-Only Vertical Timeline Structure
```html
<div class="timeline">
  <div class="timeline__item">
    <div class="timeline__dot"></div>
    <div class="timeline__content">
      <time class="timeline__date">2024-03-15</time>
      <p class="timeline__text">Event description here</p>
    </div>
  </div>
  <!-- more items -->
</div>
```

### CSS Implementation
```css
.timeline {
  position: relative;
  padding-left: var(--space-8);
}

/* Vertical connector line */
.timeline::before {
  content: '';
  position: absolute;
  left: 11px; /* center of the dot */
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border);
}

.timeline__item {
  position: relative;
  padding-bottom: var(--space-6);
}

/* Event dot */
.timeline__dot {
  position: absolute;
  left: calc(-1 * var(--space-8) + 4px);
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--surface-1);
  z-index: 1;
}

.timeline__date {
  font-size: var(--font-sm);
  color: var(--text-2);
  margin-bottom: var(--space-1);
}

.timeline__content {
  background: var(--surface-2);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
}
```

### Key Patterns
- The **connector line** is a `::before` pseudo-element on the container -- absolute positioned, spanning full height
- **Event dots** are absolutely positioned circles that sit on top of the connector line
- Use `z-index: 1` on dots so they layer above the line
- The dot's `border` matches the background color to create a "cut-out" effect on the line
- **No JavaScript needed** -- pure CSS handles the entire layout
- Timeline items can have different dot colors for severity/category:
  ```css
  .timeline__dot--critical { background: var(--clr-critical); }
  .timeline__dot--info     { background: var(--clr-info); }
  ```

### React Component Pattern
```jsx
function Timeline({ events }) {
  return (
    <div className="timeline">
      {events.map((event) => (
        <div key={event.id} className="timeline__item">
          <div className={`timeline__dot timeline__dot--${event.severity}`} />
          <div className="timeline__content">
            <time className="timeline__date">{event.date}</time>
            <p className="timeline__text">{event.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Topic: Badge/Tag Components

### Core Badge Pattern
Badges are inline elements with color-coded backgrounds indicating severity or category:

```jsx
function Badge({ label, severity = 'info' }) {
  return (
    <span className={`badge badge--${severity}`}>
      {label}
    </span>
  );
}
```

### CSS Implementation
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-0-5) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-xs);
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* Severity variants */
.badge--critical {
  background: var(--clr-critical-bg);
  color: var(--clr-critical);
}

.badge--high {
  background: var(--clr-high-bg);
  color: var(--clr-high);
}

.badge--medium {
  background: var(--clr-medium-bg);
  color: var(--clr-medium);
}

.badge--low {
  background: var(--clr-low-bg);
  color: var(--clr-low);
}

.badge--info {
  background: var(--clr-info-bg);
  color: var(--clr-info);
}
```

### Design System Integration
- Use **CSS custom properties** for all colors -- maps directly to the Phase 2 design tokens
- The `*-bg` variant uses a tinted/muted version of the severity color (e.g., `hsl(0 80% 95%)` for critical background, `hsl(0 80% 40%)` for critical text)
- `border-radius: var(--radius-full)` creates pill-shaped badges
- No interactivity needed -- purely presentational, remains a Server Component

### Tag List Pattern
For displaying multiple tags (e.g., on competitor cards):
```jsx
function TagList({ tags }) {
  return (
    <div className="tag-list">
      {tags.map((tag) => (
        <Badge key={tag} label={tag} severity="info" />
      ))}
    </div>
  );
}
```
```css
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}
```

---

## Topic: Competitor Comparison Cards

### Card Structure
A competitor card for an OSINT dashboard typically contains:
1. **Accent top border** -- color-coded by score/category
2. **Company name and logo area**
3. **Score ring** (SVG circular progress)
4. **Key metrics** (revenue, employees, etc.)
5. **Tag list** (industry tags, risk badges)

### React Implementation Pattern
```jsx
function CompetitorCard({ competitor }) {
  const { name, score, metrics, tags, accentColor } = competitor;

  return (
    <article
      className="competitor-card"
      style={{ '--card-accent': accentColor }}
    >
      <div className="competitor-card__header">
        <h3 className="competitor-card__name">{name}</h3>
        <ScoreRing score={score} size={64} strokeWidth={6} />
      </div>

      <dl className="competitor-card__metrics">
        {metrics.map((metric) => (
          <div key={metric.label} className="competitor-card__metric">
            <dt>{metric.label}</dt>
            <dd>{metric.value}</dd>
          </div>
        ))}
      </dl>

      <div className="competitor-card__tags">
        <TagList tags={tags} />
      </div>
    </article>
  );
}
```

### CSS for Competitor Cards
```css
.competitor-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  border-top: 4px solid var(--card-accent, var(--accent));
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.competitor-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.competitor-card__name {
  font-size: var(--font-lg);
  font-weight: 700;
}

.competitor-card__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2);
}

.competitor-card__metric dt {
  font-size: var(--font-xs);
  color: var(--text-2);
  text-transform: uppercase;
}

.competitor-card__metric dd {
  font-size: var(--font-md);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
```

### Key Design Decisions
- **Accent top border** via `border-top` with a CSS custom property (`--card-accent`) set inline per card -- allows dynamic colors without extra CSS classes
- **Score ring** embedded directly as a child component (composition pattern)
- Use `<dl>` (description list) for key-value metric pairs -- semantically correct
- Use `<article>` as the card element -- each card is a self-contained piece of content
- Cards in a grid layout: `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));`

---

## Key Implementation Notes

1. **All 15 Phase 4 components should be Server Components** (no `'use client'`). Since they are purely presentational with no state, effects, or event handlers that modify state, they ship zero JavaScript. The `'use client'` directive will only be added in Phase 5 when interactivity is introduced.

2. **Use CSS custom properties (design tokens from Phase 2) everywhere** instead of hardcoded colors. Components reference `var(--token-name)` for colors, spacing, radii, and font sizes. This ensures consistency and enables easy theming.

3. **SVG score rings use pure math, no libraries needed.** The formula `circumference * (1 - score / 100)` for `stroke-dashoffset` is all that is required. Use `strokeLinecap="round"` for polished arc ends and `rotate(-90)` to start from 12 o'clock.

4. **Sticky header/nav is pure CSS** -- `position: sticky; top: 0;` for the header, `top: var(--header-height)` for the section nav. Maintain a z-index scale via custom properties. Avoid `overflow: hidden` on ancestor elements.

5. **Financial tables use semantic HTML** (`<table>`, `<thead>`, `<th scope="col">`, `<caption>`) with `font-variant-numeric: tabular-nums` for aligned numbers and `Intl.NumberFormat` for currency formatting. Hover states are CSS-only.

---

## Sources

- https://mohameddewidar.com/blog/react-19-component-patterns
- https://www.mindbowser.com/modern-react-design-patterns/
- https://www.adeelhere.com/blog/2025-10-21-react-fc-vs-standard-function-components-in-react-typescript
- https://nextjs.org/docs/app/api-reference/directives/use-client
- https://techify.blog/blog/understanding-use-client-and-use-server-in-nextjs
- https://www.startupbricks.in/blog/nextjs-app-router-best-practices-2025
- https://medium.com/@sureshdotariya/next-js-15-app-router-architecture-and-sequence-flow-3a6ffdd2445c
- https://www.nils.fyi/blog/post/svg-progress-circle
- https://www.telerik.com/blogs/pure-svg-circular-component
- https://blog.logrocket.com/build-svg-circular-progress-component-react-hooks/
- https://learning.atheros.ai/blog/how-to-develop-animated-progress-circle-component-using-svgs-react-and-react-spring
- https://medium.com/@ayham.attar98/the-hidden-battle-between-sticky-position-and-z-index-78097175c3b2
- https://medium.com/@dhairyasehgal2307/how-to-create-a-sticky-navbar-using-next-js-a1b19a6b4a49
- https://www.telerik.com/blogs/tutorial-how-to-build-accessible-react-table-data-grid
- https://dev.to/josephciullo/simplify-currency-formatting-in-react-a-zero-dependency-solution-with-intl-api-3kok
- https://wpdean.com/css-timeline/
- https://www.sliderrevolution.com/resources/css-timeline/
- https://www.npmjs.com/package/react-vertical-timeline-component
- https://material-tailwind.com/docs/react/timeline
- https://ui.fivexlabs.com/docs/components/badge
- https://crafted-ui.com/docs/components/badge
- https://v10.carbondesignsystem.com/patterns/status-indicator-pattern/
- https://www.shadcnblocks.com/block/stats-card10
- https://codezup.com/react-typescript-tailwind-dashboard/
