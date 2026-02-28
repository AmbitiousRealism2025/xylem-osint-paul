# Phase 3 Research Context -- Data Layer
**Generated:** 2026-02-28
**Phase:** 3 of 7

## Topic: Static Data Files in Next.js

### Directory Structure Pattern
The consensus across Next.js 15 project structure guides (2025-2026) is to place static data files in a dedicated top-level directory. The two common conventions are:

```
project-root/
  src/
    data/           # Option A: inside src/
      navigation.js
      metrics.js
      timeline.js
    lib/
      constants.js  # Some teams put constants in lib/
  data/             # Option B: top-level (less common)
```

**Option A (`src/data/`)** is preferred for Next.js App Router projects because:
- It keeps data co-located with application source code
- It works naturally with the `@/` path alias (`import { metrics } from '@/data/metrics'`)
- The `src/` directory is already the recommended optional application source folder per official Next.js docs

### File Naming Convention
- Use **kebab-case** filenames: `financial-metrics.js`, `timeline-events.js`
- One data domain per file -- do not combine unrelated data
- Name files after the data domain, not the component consuming them

### Module Format
Next.js 15 projects use ES modules by default. Use `.js` extension (not `.mjs`) since `next.config.js` / `package.json` handle module resolution. These files are plain JS -- no JSX needed, so no `.jsx` extension.

### Key Pattern from Next.js Official Docs
The official project structure page (nextjs.org/docs/app/getting-started/project-structure) lists `src/` as the optional application source folder. Data files are not special-cased by Next.js, meaning they have no framework-imposed conventions -- you are free to organize them logically under `src/data/`.

## Topic: ES Module Data Patterns

### Named Exports (Preferred)
The 2025-2026 consensus is to use **named exports** rather than default exports for data files. This provides:
- Better IDE autocomplete and refactoring support
- Explicit import statements at call sites
- Tree-shaking compatibility (though less relevant for static data)

```js
// src/data/financial-metrics.js

export const revenueData = [
  { label: 'Q1 2024', value: 125000, change: 12.5 },
  { label: 'Q2 2024', value: 142000, change: 13.6 },
];

export const expenseCategories = [
  { name: 'Operations', amount: 45000, percentage: 32 },
  { name: 'Marketing', amount: 28000, percentage: 20 },
];
```

### Pattern: Constants + Computed Values
For data that has derived values (like SVG dasharray calculations), export both raw data and computed constants:

```js
// src/data/scores.js

export const SCORE_RING_CIRCUMFERENCE = 2 * Math.PI * 45; // radius = 45

export const scores = [
  {
    label: 'Risk Score',
    value: 72,
    dasharray: `${(72 / 100) * SCORE_RING_CIRCUMFERENCE} ${SCORE_RING_CIRCUMFERENCE}`,
  },
];
```

### Pattern: Grouping Related Data
When multiple data arrays are consumed by the same component, group them in a single file with multiple named exports rather than splitting across files:

```js
// src/data/dashboard-summary.js

export const summaryCards = [ /* ... */ ];
export const summaryChart = [ /* ... */ ];
export const summaryTable = [ /* ... */ ];
```

### Module Best Practices (2026 Node/ESM Patterns)
From TheLinuxCode's 2026 module patterns guide:
- **Export only what you mean to expose** -- keep internal helpers unexported
- **Imports should look obvious at the call site** -- prefer named exports so `import { revenueData }` is self-documenting
- **Avoid re-exporting through barrel files** for small projects -- direct imports are simpler and avoid circular dependency issues

## Topic: Data Extraction from HTML to JS

### Manual Extraction Strategy
For a one-time migration of static HTML content to JS data objects, the recommended approach is manual extraction with a systematic process:

1. **Identify data regions** in the HTML: tables, lists, repeated card structures, metric displays
2. **Map HTML structure to JS shape**: each repeated element becomes an object in an array; each unique section becomes a named export
3. **Preserve semantic meaning**: use descriptive property names that match the domain, not the HTML structure

### Mapping HTML to JS Objects

| HTML Pattern | JS Data Shape |
|---|---|
| `<table>` with rows | Array of row objects with column keys |
| `<ul><li>` list | Array of strings or objects |
| Repeated `<div class="card">` | Array of card objects |
| Single metric `<span>$125K</span>` | Object with `{ value: 125000, formatted: '$125K' }` |
| `<time datetime="...">` | Object with `{ date: '2024-01-15', label: 'Jan 15' }` |

### Key Principle: Store Raw Values, Format in Components
Store numbers as numbers, dates as ISO strings, and percentages as decimals (0-100 or 0-1). Let React components handle formatting with `Intl.NumberFormat`, `toLocaleString()`, etc. This keeps data portable and testable:

```js
// GOOD: raw values in data
export const metrics = [
  { label: 'Revenue', value: 125000, change: 0.125 },
];

// Component handles formatting:
// `$${(value / 1000).toFixed(0)}K` => "$125K"
// `${(change * 100).toFixed(1)}%` => "12.5%"
```

### Avoiding Over-Extraction
Not everything needs to be extracted. Keep in the data file:
- Values that change between instances (labels, numbers, dates)
- Content that might be updated by non-developers

Keep in the component:
- Structural markup and layout logic
- CSS class names and styling
- Formatting and display logic

## Topic: Separating Data from Presentation

### The 3-Layer Separation Pattern
From a widely-referenced 2025 article on React architecture, the recommended separation is:

1. **Data Layer** -- pure JS modules exporting arrays/objects (no React imports)
2. **Logic Layer** -- custom hooks or utility functions for derived state, filtering, sorting
3. **Presentation Layer** -- React components that receive data via props or imports

For a static dashboard with no API calls, the data layer is simply `import` statements from `src/data/` files, and the logic layer may be minimal or absent.

### Data-First Architecture for Dashboards
The pattern for display-only dashboards:

```
src/
  data/
    metrics.js          # export const metrics = [...]
    timeline.js         # export const events = [...]
    scores.js           # export const scores = [...]
  components/
    MetricsCard.jsx     # import { metrics } from '@/data/metrics'
    Timeline.jsx        # import { events } from '@/data/timeline'
    ScoreRing.jsx       # import { scores } from '@/data/scores'
```

Components import data directly -- no prop-drilling or context needed for static content. This is the simplest and most maintainable pattern when data does not change at runtime.

### Benefits for Server Components
In Next.js 15 with App Router, components are Server Components by default. Importing static data files in Server Components means:
- Data is resolved at build time (or server render time)
- Zero JavaScript sent to the client for data
- No hydration cost for static content
- Data files are never exposed to the browser bundle

This makes the `src/data/` + Server Component pattern ideal for static dashboards.

### When to Use Props vs Direct Imports
- **Direct import**: when a component always displays the same dataset (dashboard sections)
- **Props**: when a component is reusable and needs to display different data in different contexts (e.g., a generic `<DataTable rows={data} />` component)

For a static dashboard, direct imports are preferred because they make data dependencies explicit at the file level and reduce component API surface.

## Topic: Financial Data Modeling for Display

### Modeling Monetary Values
Store monetary values as raw numbers (not strings). Include metadata for display:

```js
export const financialMetrics = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: 2450000,        // raw number in cents or dollars
    previousValue: 2180000,
    change: 12.4,          // percentage change as a number
    changeDirection: 'up', // 'up' | 'down' | 'neutral'
    period: 'Q4 2024',
    prefix: '$',           // currency symbol
    format: 'compact',     // 'compact' ($2.4M), 'full' ($2,450,000)
  },
];
```

### Modeling Table Rows
For financial tables, use flat objects with clear property names:

```js
export const portfolioHoldings = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 150,
    avgCost: 142.50,
    currentPrice: 178.25,
    marketValue: 26737.50,
    gain: 5362.50,
    gainPercent: 25.09,
    weight: 18.5,
  },
];

// Column definitions as separate export
export const holdingsColumns = [
  { key: 'symbol', label: 'Symbol', align: 'left' },
  { key: 'name', label: 'Name', align: 'left' },
  { key: 'shares', label: 'Shares', align: 'right', format: 'number' },
  { key: 'currentPrice', label: 'Price', align: 'right', format: 'currency' },
  { key: 'marketValue', label: 'Market Value', align: 'right', format: 'currency' },
  { key: 'gainPercent', label: 'Gain %', align: 'right', format: 'percent' },
];
```

### Modeling Percentage Changes
Use a consistent structure for metrics that show change over time:

```js
export const changeMetric = {
  value: 15.7,
  direction: 'up',    // determines color/icon in component
  baseline: 'vs last quarter',
};
```

### Key Principle: Separate Data from Column Definitions
For tables, export row data and column configuration separately. This allows the same `<DataTable>` component to render different tables by swapping column definitions.

## Topic: Timeline Data Structures

### Chronological Event Data Shape
The standard pattern across React timeline libraries (react-chrono, KendoReact Timeline, custom implementations) is an array of event objects sorted by date:

```js
export const timelineEvents = [
  {
    id: 'evt-001',
    date: '2024-01-15',
    title: 'Series A Funding',
    description: 'Secured $12M in Series A funding led by Acme Ventures.',
    category: 'funding',     // for filtering or color-coding
    icon: 'dollar',          // optional icon identifier
  },
  {
    id: 'evt-002',
    date: '2024-03-22',
    title: 'Product Launch',
    description: 'Launched v2.0 of the platform with new analytics dashboard.',
    category: 'product',
  },
];
```

### Key Properties for Timeline Events
| Property | Type | Purpose |
|---|---|---|
| `id` | string | Unique identifier for keys and anchoring |
| `date` | string (ISO) | Chronological ordering; component formats for display |
| `title` | string | Primary display text |
| `description` | string | Secondary/detail text |
| `category` | string | Color-coding, filtering, or icon selection |

### Ordering
Store events in **chronological order** (oldest first) in the data file. If reverse-chronological display is needed, the component handles `.slice().reverse()` or CSS ordering -- the data source should be canonical.

### Multi-Track Timelines
If the timeline shows multiple tracks (e.g., company milestones + market events), use a `track` or `category` property and let the component group/filter, rather than maintaining separate arrays.

## Topic: SVG Score Ring Data Modeling

### How SVG Ring Progress Works
An SVG circular progress indicator uses two `<circle>` elements:
1. **Background circle**: full ring in a muted color
2. **Progress circle**: partial ring showing the score, controlled by `stroke-dasharray` and `stroke-dashoffset`

The math:
```
circumference = 2 * PI * radius
dasharray = circumference  (total length of dash pattern)
dashoffset = circumference * (1 - score / maxScore)  (how much to hide)
```

### Data Shape for Score Rings

```js
// src/data/scores.js

// Shared constant for SVG calculation
// For a circle with radius 45 in a 100x100 viewBox:
export const RING_RADIUS = 45;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~282.74

export const scoreRings = [
  {
    id: 'risk-score',
    label: 'Risk Score',
    score: 72,
    maxScore: 100,
    color: '#4CAF50',        // or a CSS custom property reference
    description: 'Overall risk assessment',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    score: 89,
    maxScore: 100,
    color: '#2196F3',
    description: 'Regulatory compliance rating',
  },
];
```

### Compute in Component, Not in Data
Store only the **score value** in the data file. Let the component compute `stroke-dasharray` and `stroke-dashoffset` from the score value and shared constants:

```jsx
// In the ScoreRing component:
const dashoffset = RING_CIRCUMFERENCE * (1 - score / maxScore);
// <circle strokeDasharray={RING_CIRCUMFERENCE} strokeDashoffset={dashoffset} />
```

This approach (from nils.fyi and supun.io guides) keeps data clean and makes it easy to animate the transition with CSS `transition: stroke-dashoffset 0.5s ease`.

### Responsive Sizing
The SVG uses a `viewBox="0 0 100 100"` so it scales to any container size. The radius (45), stroke-width (10), and center (50, 50) are constants that can be exported from the data file or defined in the component. Keeping them as exported constants from the data file is cleaner if multiple components share the same ring geometry.

### CSS Custom Property Integration
Rather than hardcoding hex colors in the data file, reference CSS custom property names:

```js
export const scoreRings = [
  {
    id: 'risk-score',
    label: 'Risk Score',
    score: 72,
    colorVar: '--color-success',  // resolved by component via var(--color-success)
  },
];
```

This keeps the data layer decoupled from specific color values, which are managed by the design system (Phase 2).

## Key Implementation Notes

- **Use `src/data/` directory with named ES module exports** -- one file per data domain (metrics, timeline, scores, etc.). Import directly into Server Components with `@/data/filename` path alias.

- **Store raw values, format in components** -- keep numbers as numbers, dates as ISO strings, and percentages as plain numbers. Components handle `Intl.NumberFormat`, `toLocaleString()`, and template literals for display formatting.

- **Leverage Server Components for zero-JS data** -- since static data files imported by Server Components never reach the client bundle, this architecture gives you the performance benefits of static HTML with the maintainability of structured data.

- **Compute SVG geometry in components, not data** -- export score values and shared constants (radius, circumference) from data files. Let components derive `stroke-dasharray` and `stroke-dashoffset` so data stays portable.

- **Separate row data from column/display configuration** -- for tables, export both the data array and a columns definition array. This enables a single reusable `<DataTable>` component pattern across different financial tables.

## Sources

- https://nextjs.org/docs/app/getting-started/project-structure
- https://kitemetric.com/blogs/mastering-next-js-15-2025-best-practices-for-folder-structure
- https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji
- https://medium.com/@j.hariharan005/mastering-next-js-15-folder-structure-a-developers-guide-b9b0461e2d27
- https://janhesters.com/blog/how-to-set-up-nextjs-15-for-production-in-2025
- https://medium.com/@burpdeepak96/the-battle-tested-nextjs-project-structure-i-use-in-2025-f84c4eb5f426
- https://thelinuxcode.com/javascript-modules-in-2026-practical-patterns-with-commonjs-and-es-modules/
- https://thelinuxcode.com/exporting-multiple-values-from-a-nodejs-module-esm-commonjs-patterns-that-hold-up-in-2026/
- https://thelinuxcode.com/import-and-export-in-nodejs-2026-commonjs-esm-and-real-world-module-patterns/
- https://medium.com/@echilaka/clean-react-architecture-separating-logic-from-presentation-with-custom-hooks-and-react-query-1904e9cc1eb0
- https://javascript.plainenglish.io/the-3-layer-separation-a-simple-framework-to-keep-your-react-components-clean-again-8fefd81e8810
- https://www.perssondennis.com/articles/21-fantastic-react-design-patterns-and-when-to-use-them
- https://developersvoice.com/blog/frontend/mastering-react-architecture-patterns/
- https://launchdarkly.com/docs/blog/react-architecture-2025
- https://teachmeidea.com/react-dashboard-recharts-tanstack-table/
- https://www.patterns.dev/react/react-2026/
- https://www.nils.fyi/blog/post/svg-progress-circle
- https://supun.io/score-meter
- https://stackoverflow.com/questions/78425109/is-there-a-way-to-make-an-svg-circular-progress-bar-using-stroke-dasharray
- https://www.npmjs.com/package/react-circular-progressbar
- https://reactlibs.dev/articles/crafting-time-react-chrono
- https://www.bomberbot.com/web-development/how-to-create-a-timeline-component-with-react/
- https://www.groovyweb.co/blog/nextjs-project-structure-full-stack
- https://localskills.sh/blog/ai-rules-for-react-nextjs
- https://nextjs.org/docs/app/getting-started/server-and-client-components
- https://yakhil25.medium.com/react-best-practices-building-apps-that-dont-fall-apart-b973ab2f2d73
