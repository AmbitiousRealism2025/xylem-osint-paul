# Phase 2 Research Context — Design System
**Generated:** 2026-02-28
**Phase:** 2 of 7

## Topic: CSS Custom Properties in Next.js App Router

### Defining `:root` Variables in `globals.css`

In the Next.js App Router, `globals.css` is imported directly in `app/layout.js` (or `layout.tsx`). CSS custom properties defined in `:root` are available globally across all pages and components without any additional configuration:

```css
/* app/globals.css */
:root {
  --color-bg-primary: #0a0e1a;
  --color-bg-secondary: #111827;
  --color-text-primary: #e2e8f0;
  --color-accent: #3b82f6;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --radius-md: 8px;
}
```

### SSR Considerations

- CSS custom properties defined in `:root` inside `globals.css` are **server-rendered** — they are included in the initial HTML payload, so there is no flash of unstyled content (FOUC) or hydration mismatch.
- For a single dark theme (no theme switching), simply define all variables in `:root` in `globals.css`. No client-side JavaScript is needed.
- If you need dynamic theming (light/dark toggle), the recommended approach is:
  1. Use `next-themes` to manage theme state via cookies (avoids SSR flash).
  2. Apply theme-specific variables via `[data-theme="dark"]` or `.dark` class selectors.
  3. For a dark-only dashboard, none of this complexity is needed — just set variables in `:root`.
- **Avoid** setting CSS variables via `document.documentElement.style.setProperty()` in server components — this causes hydration mismatches. All variable definitions should live in CSS files.

### Scoping

- `:root` variables are globally available to all components, including CSS Modules.
- CSS Modules can reference `:root` variables with `var(--variable-name)` without importing anything.
- For component-scoped overrides, redefine variables on a specific selector:
  ```css
  .card { --color-bg-primary: #1e293b; }
  ```

### Tailwind v4 Integration (Optional)

If using Tailwind v4, the `@theme` directive in `globals.css` creates tokens that automatically generate utility classes:
```css
@theme {
  --color-primary-base: #3b82f6;
  --color-surface: #0a0e1a;
}
```
These become usable as `bg-primary-base`, `text-surface`, etc.

---

## Topic: Google Fonts Loading Strategy

### Recommended: `next/font/google`

The built-in `next/font/google` module self-hosts font files at build time, eliminating external network requests and preventing layout shift (CLS). This is the recommended approach for Next.js 15:

```js
// app/layout.js
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from 'next/font/google';

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-heading',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-body',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-mono',
});

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

### Using CSS Variables for Font Families

After setting the `variable` property on each font, reference them in `globals.css`:

```css
:root {
  font-family: var(--font-body), system-ui, sans-serif;
}

h1, h2, h3 {
  font-family: var(--font-heading), serif;
}

code, pre {
  font-family: var(--font-mono), monospace;
}
```

### Key Details

- **`display: 'swap'`** — ensures text is visible immediately with a fallback font, then swaps to the custom font once loaded. Prevents Flash of Invisible Text (FOIT).
- **`subsets: ['latin']`** — reduces font file size by only including needed character sets.
- **`weight` array** — only include the weights you actually use. Each additional weight increases bundle size.
- **Self-hosting** — `next/font/google` downloads fonts at build time and serves them from your domain. No external requests to `fonts.googleapis.com` at runtime. This improves both privacy and performance.
- **`@next/font` package** — in Next.js 15, `next/font/google` is built-in. The separate `@next/font` package is deprecated but may still be needed in some configurations.
- **Do NOT use `<link>` tags** for Google Fonts in Next.js — this causes render-blocking requests and layout shift. Always use `next/font/google`.

### Font Name Mapping

Google Font names with spaces use underscores in the import:
- `DM Serif Display` → `DM_Serif_Display`
- `DM Sans` → `DM_Sans`
- `JetBrains Mono` → `JetBrains_Mono`

---

## Topic: CSS Noise/Grain Overlay Technique

### SVG Filter Approach (Recommended)

The most performant and flexible approach uses an inline SVG `feTurbulence` filter as a data URI on a `::before` pseudo-element:

```css
body {
  position: relative;
}

body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  opacity: 0.4;
}
```

### Key Parameters

- **`baseFrequency`** — controls grain density. Lower values (0.5-0.65) = larger, more visible grain. Higher values (0.75-0.9) = finer, subtler texture. For dark dashboards, 0.65-0.8 works well.
- **`numOctaves`** — controls detail layers. 3-4 is standard. Higher values add more detail but increase rendering cost.
- **`opacity`** — the SVG rect opacity (0.03 in the example) combined with the pseudo-element opacity (0.4) controls overall visibility. For dark UIs, keep the combined effect very subtle (overall ~1-5% visible).
- **`stitchTiles='stitch'`** — prevents visible seams when the pattern tiles.

### Implementation Notes

- Use `position: fixed` and `inset: 0` to cover the entire viewport (not just document height).
- `pointer-events: none` is critical — without it, the overlay blocks all user interaction.
- `z-index: 9999` ensures the texture sits above all content. Adjust if you have modals or tooltips.
- Use `inset: 0` instead of separate `top/left/width/height` declarations (shorthand).
- For dark themes, keep the noise very subtle — it should add texture without reducing readability.
- The SVG data URI approach has zero network requests and is generated by the browser, making it very lightweight.

### Alternative: PNG Tile

A small repeating PNG tile (e.g., 200x200px) can also work:
```css
body::before {
  background: url('/textures/noise.png') repeat;
  opacity: 0.03;
}
```
This is simpler but requires an additional asset and offers less runtime configurability.

---

## Topic: IntersectionObserver + CSS Animation Pattern

### Core Pattern

The pattern involves two parts: CSS classes that define the animation states, and JavaScript that toggles a class when elements enter the viewport.

#### CSS Setup

```css
/* Initial state — hidden */
.animate-on-scroll {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* Animated state — visible */
.animate-on-scroll.animate-in {
  opacity: 1;
  transform: translateY(0);
}
```

#### Vanilla JavaScript (for a non-React context or `useEffect`)

```js
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target); // animate once
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.animate-on-scroll').forEach((el) => {
  observer.observe(el);
});
```

### React Hook Pattern

Using the `react-intersection-observer` library:

```jsx
import { useInView } from 'react-intersection-observer';

function AnimatedSection({ children }) {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  return (
    <div
      ref={ref}
      className={`animate-on-scroll ${inView ? 'animate-in' : ''}`}
    >
      {children}
    </div>
  );
}
```

### Custom Hook (No Library)

```jsx
'use client';
import { useEffect, useRef, useState } from 'react';

function useIntersectionObserver(options = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsIntersecting(true);
        observer.unobserve(element);
      }
    }, { threshold: 0.1, ...options });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, isIntersecting };
}
```

### Staggered Animations

Add transition delays for sequential reveal effects:

```css
.animate-on-scroll:nth-child(1) { transition-delay: 0ms; }
.animate-on-scroll:nth-child(2) { transition-delay: 100ms; }
.animate-on-scroll:nth-child(3) { transition-delay: 200ms; }
.animate-on-scroll:nth-child(4) { transition-delay: 300ms; }
```

Or with a CSS custom property:
```css
.animate-on-scroll {
  transition-delay: calc(var(--delay, 0) * 100ms);
}
```

### Accessibility

Always respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  .animate-on-scroll {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

### Important Notes

- This pattern must use a **Client Component** (`'use client'`) in Next.js App Router since it uses `useEffect` and browser APIs.
- The `triggerOnce: true` / `unobserve` approach ensures animations only play once (scroll down to reveal, not re-hide on scroll up).
- `threshold: 0.1` means the animation triggers when 10% of the element is visible.

---

## Topic: Dark Dashboard CSS Architecture

### Design Token Organization

For a dark dashboard, organize CSS custom properties into semantic layers:

```css
:root {
  /* === Base Palette === */
  --navy-900: #0a0e1a;
  --navy-800: #111827;
  --navy-700: #1e293b;
  --navy-600: #334155;
  --gray-400: #94a3b8;
  --gray-300: #cbd5e1;
  --white: #f8fafc;
  --blue-500: #3b82f6;
  --green-500: #22c55e;
  --red-500: #ef4444;

  /* === Semantic Surface Tokens === */
  --surface-base: var(--navy-900);
  --surface-raised: var(--navy-800);
  --surface-overlay: var(--navy-700);
  --surface-border: var(--navy-600);

  /* === Text Tokens === */
  --text-primary: var(--white);
  --text-secondary: var(--gray-300);
  --text-muted: var(--gray-400);

  /* === Interactive Tokens === */
  --accent-primary: var(--blue-500);
  --status-success: var(--green-500);
  --status-error: var(--red-500);

  /* === Spacing Scale === */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;

  /* === Border Radius === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;

  /* === Typography Scale === */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 2rem;

  /* === Shadows (for dark UI, use lighter/accent glow) === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 15px rgba(59, 130, 246, 0.15);
}
```

### Three-Layer Token Architecture

The recommended token strategy uses three layers:

1. **Base tokens** — raw values (colors, pixel sizes). Named by what they are: `--navy-900`, `--blue-500`.
2. **Semantic tokens** — purpose-driven references. Named by what they do: `--surface-base`, `--text-primary`, `--accent-primary`.
3. **Component tokens** — specific overrides for components. Named by where they are used: `--card-bg`, `--sidebar-width`.

Components should reference semantic tokens, not base tokens. This makes global changes safe — changing `--navy-900` automatically updates every surface that references it.

### Dark UI Best Practices

- **Avoid pure black** (`#000`). Use very dark navy or gray (e.g., `#0a0e1a`) for a softer, more professional look.
- **Use elevated surfaces** — cards and panels should be slightly lighter than the base background to create visual hierarchy through surface elevation.
- **Subtle borders** — use `rgba(255, 255, 255, 0.06)` to `rgba(255, 255, 255, 0.12)` for borders instead of solid colors.
- **Text contrast** — primary text should be off-white (`#e2e8f0` or `#f1f5f9`), not pure white. This reduces eye strain.
- **Accent glow** — on dark backgrounds, use `box-shadow` with accent color glow instead of traditional drop shadows.
- **Consistent spacing** — use a spacing scale (4px base) applied via custom properties for consistent rhythm.

---

## Topic: Animation Keyframes Patterns

### fadeUp

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-up {
  animation: fadeUp 0.6s ease-out forwards;
}
```

### pulse

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: pulse 2s ease-in-out infinite;
}
```

A more visible pulse with scale:
```css
@keyframes pulseScale {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}
```

### shimmer

```css
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--surface-raised) 25%,
    var(--surface-overlay) 50%,
    var(--surface-raised) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### fadeIn (simple)

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

### slideInLeft

```css
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### scaleIn

```css
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Performance Notes

- **Only animate `opacity` and `transform`** — these are GPU-accelerated and do not trigger layout or paint. Animating `width`, `height`, `top`, `left`, `margin`, or `padding` causes layout thrashing.
- Use `will-change: transform, opacity` sparingly on elements that will animate (remove after animation completes if possible).
- `animation-fill-mode: forwards` ensures the element stays at its final animated state.
- Always include `prefers-reduced-motion` media query:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## Topic: Responsive CSS Grid Utilities

### Grid Utility Classes Pattern

Define reusable grid classes in `globals.css` for dashboard layouts:

```css
/* === Responsive Grid Utilities === */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg, 1.5rem);
}

.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg, 1.5rem);
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg, 1.5rem);
}

/* Responsive breakpoints */
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  .grid-2,
  .grid-3,
  .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

### Auto-Responsive Grid (No Breakpoints)

Use `auto-fill` or `auto-fit` with `minmax()` for grids that respond to container width without explicit breakpoints:

```css
.grid-auto {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg, 1.5rem);
}

/* auto-fit variant — items stretch to fill remaining space */
.grid-auto-fit {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-lg, 1.5rem);
}
```

**`auto-fill` vs `auto-fit`:**
- `auto-fill` creates as many tracks as fit, leaving empty tracks if items don't fill them.
- `auto-fit` collapses empty tracks, allowing items to stretch and fill remaining space.
- For dashboards with a known number of cards, `auto-fit` is usually preferred.

### Dashboard-Specific Grid Patterns

```css
/* Sidebar + main content */
.layout-sidebar {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: var(--space-lg);
  min-height: 100vh;
}

/* Stats row — 4 equal cards */
.grid-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-md);
}

/* Feature card — 2/3 + 1/3 split */
.grid-feature {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-lg);
}

@media (max-width: 768px) {
  .layout-sidebar {
    grid-template-columns: 1fr;
  }
  .grid-feature {
    grid-template-columns: 1fr;
  }
}
```

### CSS Grid Best Practices for Dark Dashboards

- Use `gap` (not margins) for spacing between grid items — it is consistent, avoids double-margin issues, and respects the grid structure.
- Use `minmax()` to prevent cards from becoming too narrow on medium screens.
- The `280px` minimum in `minmax(280px, 1fr)` is a good starting point for dashboard cards — adjust based on content needs.
- For synchronized skeleton loaders across grid items, use `background-attachment: fixed` so the shimmer gradient aligns across all cards.

---

## Key Implementation Notes

- **Single dark theme simplifies everything.** With no light/dark toggle needed, define all CSS custom properties in `:root` inside `globals.css`. No JavaScript theming libraries, no hydration concerns, no flash of wrong theme.
- **Use `next/font/google` with CSS variables.** Import DM Serif Display, DM Sans, and JetBrains Mono in `layout.js`, assign each a `--font-*` variable, and apply the variable classes to `<html>`. Reference them in `globals.css` via `var()`. This gives zero-CLS font loading with full CSS control.
- **Keep the noise overlay extremely subtle.** Use the SVG `feTurbulence` data URI approach on `body::before` with `position: fixed`, `pointer-events: none`, and a very low combined opacity (1-5%). The grain should be felt more than seen.
- **IntersectionObserver animations require Client Components.** Wrap the observer logic in a `'use client'` component or custom hook. Use `triggerOnce: true` and always include `prefers-reduced-motion` media queries for accessibility.
- **Organize tokens in three layers: base, semantic, component.** Components reference semantic tokens (`--surface-base`, `--text-primary`), which reference base tokens (`--navy-900`). This makes global redesigns safe and localized changes easy.

## Sources

- https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties
- https://medium.com/@shamimhossain01617/how-to-use-tailwind-css-color-variables-globally-in-next-js-15-2c3c23838045
- https://www.reddit.com/r/nextjs/comments/1dxgxfd/setting_css_variables_server_side_or_other_ways/
- https://dzone.com/articles/css-theme-title-message-1234567
- https://medium.com/codetodeploy/how-to-add-google-fonts-properly-in-next-js-15-without-layout-shift-e343531ecbce
- https://oneuptime.com/blog/post/2026-01-24-nextjs-font-loading-issues/view
- https://www.buildwithmatija.com/blog/how-to-use-custom-google-fonts-in-next-js-15-and-tailwind-v4
- https://thelinuxcode.com/fonts-in-nextjs-a-practical-architecture-guide-for-2026/
- https://www.contentful.com/blog/next-js-fonts/
- https://www.reddit.com/r/css/comments/1jiyvwd/how_to_add_a_noise_effect/
- https://nyxui.com/components/animated-grainy-bg
- https://frontendmasters.com/blog/grainy-gradients/
- https://clay.global/blog/web-design-guide/website-texture
- https://thelinuxcode.com/how-to-create-grainy-css-backgrounds-using-svg-filters/
- https://friendlyuser.github.io/posts/tech/css/css_animations_in_react
- https://magicui.design/blog/animation-on-scroll-css
- https://igortrnko.com/article/intersection-observer-in-react-a-practical-guide
- https://blog.sachinchaurasiya.dev/simple-guide-to-using-intersection-observer-api-with-reactjs
- https://building.theatlantic.com/design-tokens-in-webstudio-a-practical-implementation-guide-927af8d36f36
- https://shadisbaih.medium.com/building-a-scalable-design-system-with-shadcn-ui-tailwind-css-and-design-tokens-031474b03690
- https://www.maviklabs.com/blog/design-tokens-tailwind-v4-2026
- https://materialui.co/blog/design-tokens-and-theming-scalable-ui-2025
- https://cloudinary.com/blog/questions/how-are-fade-in-animations-created-using-css-transitions-and-keyframes/
- https://design.dev/guides/css-animations/
- https://freefrontend.com/code/synchronized-pure-css-skeleton-loader-2026-01-22/
- https://frontend-hero.com/how-to-create-skeleton-loader
- https://freefrontend.com/css-shimmer/
- https://docs.automaticcss.com/grids/grid-classes-standard
- https://docs.automaticcss.com/grids/auto-grids
- https://thelinuxcode.com/tailwind-css-grid-template-columns-practical-patterns-for-2026-layouts/
- https://stevekinney.com/courses/tailwind/grid-auto-fit-and-auto-fill-patterns
- https://dev.to/mukitaro/building-a-theme-system-with-nextjs-15-and-tailwind-css-v4-without-dark-prefix-43n6
- https://eastondev.com/blog/en/posts/dev/20251220-nextjs-dark-mode-guide/
