# Phase 5 Research Context -- Interactivity
**Generated:** 2026-02-28
**Phase:** 5 of 7

## Topic: useIntersection Hook Patterns

The standard pattern for a `useIntersection` (or `useIntersectionObserver`) hook in React wraps the browser's `IntersectionObserver` API inside `useEffect` with proper cleanup. The hook returns an `isIntersecting` boolean and accepts configurable `threshold`, `rootMargin`, and `root` options.

### Canonical Implementation Pattern

```jsx
'use client';
import { useState, useEffect, useRef } from 'react';

export function useIntersection(options = {}) {
  const ref = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: options.threshold ?? 0,
        rootMargin: options.rootMargin ?? '0px',
        root: options.root ?? null,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.root]);

  return [ref, isIntersecting];
}
```

### Key Design Decisions

- **Return a ref + boolean tuple**: `[ref, isIntersecting]` -- the consumer attaches `ref` to the target DOM element and reads `isIntersecting` to conditionally render or apply classes.
- **Cleanup in the effect return**: Always call `observer.unobserve(element)` and/or `observer.disconnect()` in the cleanup function to prevent memory leaks when the component unmounts.
- **`once` option**: For scroll-triggered animations that should only fire once (not reverse on scroll-out), add a `once` parameter. When `entry.isIntersecting` is true and `once` is set, call `observer.unobserve(element)` immediately so the animation class persists.
- **Ref callback alternative (React 19)**: Instead of `useRef` + `useEffect`, a ref callback can be used: `const refCallback = (node) => { if (node) observer.observe(node); }`. This avoids the useEffect dance entirely and is cleaner for simple cases, though it requires manual disconnect logic.
- **Avoid re-creating observers**: Put observer options in the dependency array of `useEffect` so a new observer is only created when options change. Use stable references (primitives or memoized objects) to prevent infinite re-render loops.

### Library Alternative

The `react-intersection-observer` package (~2KB gzipped) provides `useInView` with automatic cleanup, SSR safety, and built-in `triggerOnce`. For projects avoiding dependencies, the custom hook above covers all needs.

---

## Topic: useScrollSpy Implementation

A scroll-spy hook tracks which section is currently visible in the viewport and returns the active section ID, enabling navigation highlighting.

### IntersectionObserver-Based Approach (Recommended)

```jsx
'use client';
import { useState, useEffect, useRef } from 'react';

export function useScrollSpy(sectionIds, options = {}) {
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const observers = [];

    sectionIds.forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveId(id);
          }
        },
        {
          threshold: options.threshold ?? 0.3,
          rootMargin: options.rootMargin ?? '-80px 0px -60% 0px',
          // Negative top margin accounts for sticky header
          // Negative bottom margin means "active" when in top 40% of viewport
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [sectionIds, options.threshold, options.rootMargin]);

  return activeId;
}
```

### Key Patterns

- **rootMargin for sticky header offset**: Use a negative top rootMargin (e.g., `'-80px 0px -60% 0px'`) to shift the detection zone below a sticky nav. The negative bottom margin ensures only the top portion of the viewport determines the "active" section.
- **Multiple observers vs. single observer**: Using one observer per section is simpler and more reliable than a single observer watching all sections, because each callback cleanly maps to one section ID.
- **Debouncing is generally unnecessary**: IntersectionObserver already batches callbacks efficiently -- unlike scroll event listeners, it does not fire continuously. However, if rapid section switches cause UI jank, a small `requestAnimationFrame` guard can help.
- **Stable sectionIds array**: Pass `sectionIds` as a stable reference (defined outside the component or memoized with `useMemo`) to avoid re-creating observers on every render.

### Usage with Navigation

```jsx
const SECTIONS = ['about', 'skills', 'experience', 'contact'];
const activeSection = useScrollSpy(SECTIONS, {
  rootMargin: '-80px 0px -60% 0px',
});

// In nav: apply active class
<a className={activeSection === 'about' ? 'nav-active' : ''}>About</a>
```

---

## Topic: CSS Transition via React Class Toggle

The simplest and most performant way to animate elements on scroll is to toggle a CSS class that triggers CSS transitions. No animation library needed.

### Pattern: Class Toggle with CSS Transition

```css
/* Base state -- element starts hidden/off-position */
.fade-in-section {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

/* Active state -- applied when IntersectionObserver fires */
.fade-in-section.visible {
  opacity: 1;
  transform: translateY(0);
}
```

```jsx
function AnimatedSection({ children }) {
  const [ref, isVisible] = useIntersection({ threshold: 0.1, once: true });

  return (
    <section
      ref={ref}
      className={`fade-in-section ${isVisible ? 'visible' : ''}`}
    >
      {children}
    </section>
  );
}
```

### Key Principles

- **CSS does the animation work**: The browser's compositor handles CSS transitions on `opacity` and `transform` on the GPU, so they run at 60fps without blocking the main thread. Avoid transitioning `width`, `height`, `top`, `left`, `margin`, or `padding` as these trigger layout recalculation.
- **GPU-composited properties**: `opacity`, `transform`, and `filter` are the only properties that can be animated without triggering layout/paint. Use `transform: scaleX()` instead of `width` for progress bars when possible.
- **`will-change` hint**: Add `will-change: opacity, transform` to the base state CSS to tell the browser to optimize for upcoming transitions. Remove after animation completes to free GPU memory.
- **`transition` vs `animation`**: Use `transition` for state-change animations (class toggle). Use `@keyframes` animation for continuous/looping effects. For scroll-triggered reveals, `transition` is the right choice.
- **React Transition Group / CSSTransition**: For mount/unmount animations (e.g., modals, route transitions), `CSSTransition` from `react-transition-group` applies `*-enter`, `*-enter-active`, `*-exit` classes automatically. Not needed for scroll-triggered reveals where elements stay mounted.

### Timing Tips

- Standard ease-out for entrances: `transition: all 0.5s ease-out`
- Staggered children: use `transition-delay` with CSS custom properties: `transition-delay: calc(var(--i) * 0.1s);` and set `--i` per child via `style={{ '--i': index }}`.

---

## Topic: IntersectionObserver Performance

### Multiple Observers on One Page

- **Browser-optimized**: IntersectionObserver is designed to be efficient even with many instances. The browser batches intersection checks at composite time, not on every scroll event.
- **Practical limit**: Dozens of observers (10-30) are fine for typical pages. Hundreds of observers (e.g., a virtualized list with 500+ items) may benefit from a single shared observer.
- **Shared observer pattern**: Create one `IntersectionObserver` instance and `.observe()` multiple elements. Use a `Map` to associate elements with callbacks:

```jsx
const callbackMap = new Map();
const sharedObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const cb = callbackMap.get(entry.target);
    if (cb) cb(entry);
  });
}, { threshold: 0.1 });

// To observe: callbackMap.set(element, myCallback); sharedObserver.observe(element);
// To cleanup: callbackMap.delete(element); sharedObserver.unobserve(element);
```

### Memory Leak Prevention

- **Always disconnect on unmount**: The most common React memory leak with IntersectionObserver is forgetting the cleanup function in `useEffect`. This keeps the observer alive after the component unmounts, holding references to stale DOM nodes.
- **Pattern**: `useEffect(() => { ... return () => observer.disconnect(); }, []);`
- **Ref callback approach**: With React 19 ref callbacks, cleanup happens naturally when the node unmounts, reducing leak risk.
- **Avoid closures over stale state**: If the observer callback references state variables, use `useRef` for the callback or functional state updates (`setState(prev => ...)`) to avoid capturing stale closures.

### Best Practices Summary

1. Always return a cleanup function from `useEffect` that calls `observer.disconnect()`.
2. Use `observer.unobserve(element)` for individual elements before disconnect.
3. For `once`-style animations, unobserve immediately after first intersection.
4. Keep observer options stable (avoid new object references each render).
5. For pages with 50+ observed elements, consider a shared observer singleton.

---

## Topic: SSR-Safe Animation in Next.js

### The Problem

`IntersectionObserver` is a browser API -- it does not exist in Node.js. In Next.js with server-side rendering (SSR) or static site generation (SSG), any code that references `IntersectionObserver`, `window`, or `document` at the module level will crash during server rendering.

### Solution: 'use client' Directive

In Next.js 13+ (App Router), mark any component that uses IntersectionObserver with `'use client'` at the top of the file. This ensures the component only runs on the client.

```jsx
'use client';

import { useIntersection } from '@/hooks/useIntersection';

export function ScrollReveal({ children }) {
  const [ref, isVisible] = useIntersection({ threshold: 0.1 });
  // ...
}
```

### Key Patterns for SSR Safety

1. **Keep hooks in `'use client'` files**: The custom `useIntersection` and `useScrollSpy` hooks must be in files with `'use client'`. They can be imported into other client components.

2. **Guard with `typeof window`** (Pages Router or edge cases):
   ```jsx
   useEffect(() => {
     if (typeof window === 'undefined') return;
     // IntersectionObserver code here
   }, []);
   ```
   In practice, `useEffect` only runs on the client, so this guard is redundant in most React 18+ apps -- but it is a safe defensive check.

3. **Initial state matches server render**: Set the initial state to the "not visible" state (`useState(false)`). This avoids hydration mismatches -- the server renders the element as hidden, then the client-side observer triggers the reveal animation.

4. **Component architecture**: Keep the page layout as a Server Component, and wrap only the interactive/animated sections in a Client Component:
   ```
   page.js (Server Component)
     -> <HeroSection />          (Server Component, static)
     -> <AnimatedSkills />       (Client Component, 'use client')
     -> <ScrollSpyNav />         (Client Component, 'use client')
   ```

5. **No `window` checks in module scope**: Never write `const observer = new IntersectionObserver(...)` at the top level of a module. Always instantiate inside `useEffect` or a ref callback.

---

## Topic: Animated Progress Bars in React

### CSS Transition Approach (Recommended)

The simplest pattern for animating a progress bar from 0% to a target width is to use CSS `transition` on the `width` property, triggered by a class or style change.

```css
.progress-bar-fill {
  height: 100%;
  width: 0;
  background: var(--signal-color, #4caf50);
  transition: width 1s ease-out;
  border-radius: inherit;
}

.progress-bar-fill.animate {
  /* width is set via inline style */
}
```

```jsx
function SignalBar({ percentage, color, isVisible }) {
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{
          width: isVisible ? `${percentage}%` : '0%',
          backgroundColor: color,
        }}
      />
    </div>
  );
}
```

### How It Works

1. The bar starts at `width: 0`.
2. When `isVisible` becomes `true` (from IntersectionObserver), the inline `style.width` changes to the target percentage.
3. CSS `transition: width 1s ease-out` interpolates smoothly between 0 and the target.
4. No JavaScript animation loop needed -- the browser handles the interpolation.

### Performance Note on `width` Transitions

- Transitioning `width` does trigger layout recalculation (reflow). For a small number of progress bars (5-10), this is perfectly fine and the simplest approach.
- For maximum performance, use `transform: scaleX()` instead:
  ```css
  .progress-bar-fill {
    width: 100%; /* always full width */
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 1s ease-out;
  }
  ```
  Then set `transform: scaleX(0.75)` for 75%. This avoids layout recalculation entirely. However, it requires the fill to be a separate element, and the track must use `overflow: hidden`.

### Integration with IntersectionObserver

```jsx
function SkillBar({ name, level }) {
  const [ref, isVisible] = useIntersection({ threshold: 0.2, once: true });

  return (
    <div ref={ref} className="skill-bar">
      <span className="skill-name">{name}</span>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: isVisible ? `${level}%` : '0%' }}
        />
      </div>
    </div>
  );
}
```

### Staggered Animation for Multiple Bars

Use `transition-delay` to stagger multiple bars:

```jsx
{skills.map((skill, i) => (
  <div
    key={skill.name}
    className="progress-fill"
    style={{
      width: isVisible ? `${skill.level}%` : '0%',
      transitionDelay: `${i * 150}ms`,
    }}
  />
))}
```

---

## Topic: Smooth Scroll + Sticky Nav

### CSS scroll-behavior

The simplest way to enable smooth scrolling for anchor links is the CSS `scroll-behavior` property:

```css
html {
  scroll-behavior: smooth;
}
```

This makes all anchor link clicks (`<a href="#section">`) and programmatic `element.scrollIntoView()` calls animate smoothly instead of jumping.

### scrollMarginTop for Sticky Header Offset

When a page has a sticky/fixed header, anchor links scroll the target section behind the header. The CSS `scroll-margin-top` property solves this:

```css
section[id] {
  scroll-margin-top: 80px; /* matches sticky header height */
}
```

This tells the browser to stop scrolling 80px before the element's top edge, accounting for the header. This property works with both `scroll-behavior: smooth` and `scrollIntoView()`.

### Using a CSS Custom Property for Header Height

```css
:root {
  --header-height: 64px;
}

header {
  position: sticky;
  top: 0;
  height: var(--header-height);
  z-index: 100;
}

section[id] {
  scroll-margin-top: var(--header-height);
}
```

This keeps the offset synchronized -- if the header height changes (e.g., responsive breakpoints), update the custom property in one place.

### Next.js 15 Scroll Behavior

Next.js 15 introduced the `scroll` prop on the `<Link>` component for finer control:

```jsx
import Link from 'next/link';

// Default: scrolls to top on navigation
<Link href="/about">About</Link>

// Disable scroll-to-top
<Link href="/about" scroll={false}>About</Link>
```

For same-page anchor scrolling, standard HTML anchor links work. The CSS `scroll-behavior: smooth` on `html` applies to Next.js pages.

### Programmatic Smooth Scroll with Offset

For cases where CSS `scroll-margin-top` is insufficient (dynamic header heights, custom easing):

```jsx
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (!element) return;

  const headerHeight = document.querySelector('header')?.offsetHeight ?? 0;
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - headerHeight;

  window.scrollTo({
    top: offsetPosition,
    behavior: 'smooth',
  });
}
```

### Combining Scroll-Spy with Smooth Scroll Nav

```jsx
'use client';

const SECTIONS = ['about', 'skills', 'experience', 'contact'];

export function StickyNav() {
  const activeSection = useScrollSpy(SECTIONS, {
    rootMargin: '-64px 0px -60% 0px', // 64px = header height
  });

  const handleClick = (e, sectionId) => {
    e.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky-nav">
      {SECTIONS.map((id) => (
        <a
          key={id}
          href={`#${id}`}
          onClick={(e) => handleClick(e, id)}
          className={activeSection === id ? 'active' : ''}
        >
          {id}
        </a>
      ))}
    </nav>
  );
}
```

---

## Key Implementation Notes

- **All IntersectionObserver hooks must be in `'use client'` files** in Next.js App Router. Keep page layouts as Server Components and wrap only animated/interactive sections in Client Components.
- **Use CSS transitions (not JS animation loops) for scroll-triggered animations.** Toggle a class or inline style to trigger `transition: opacity, transform` for 60fps GPU-composited animations. Reserve `width` transitions for progress bars where simplicity outweighs the minor layout cost.
- **Always clean up observers in `useEffect` return functions.** Call `observer.disconnect()` on unmount. For `once`-style animations, `unobserve` the element immediately after first intersection to save resources.
- **Use `scroll-margin-top` (not JS offset hacks) to account for sticky headers.** Tie the value to a `--header-height` CSS custom property for maintainability.
- **The `useScrollSpy` hook should use `rootMargin` to define the active detection zone**, with negative top margin matching the sticky header height and negative bottom margin (e.g., `-60%`) so only the top portion of the viewport determines the active section.

## Sources
- https://zoer.ai/posts/zoer/react-intersection-observer-guide (React Intersection Observer Complete 2025 Guide)
- https://medium.com/@kom50/build-a-reusable-useintersectionobserver-hook-in-react-93a70e439730 (Build a Reusable useIntersectionObserver Hook in React)
- https://medium.com/@bhaveshgandhi1999/mastering-intersection-observer-in-react-what-it-is-and-how-to-use-it-4c17532e8d6b (Mastering Intersection Observer in React)
- https://igortrnko.com/article/intersection-observer-in-react-a-practical-guide (Intersection Observer in React - A Practical Guide)
- https://github.com/onderonur/react-intersection-observer-hook (react-intersection-observer-hook GitHub)
- https://javascript.plainenglish.io/building-my-own-react-component-library-part-6-scroll-spy-navigations-221e013170f4 (Building Scroll Spy Navigations Component)
- https://github.com/Purii/react-use-scrollspy (react-use-scrollspy GitHub)
- https://yakhil25.medium.com/css-animations-and-transitions-in-react-74986d7240cc (CSS Animations and Transitions in React, Feb 2026)
- https://www.emoosavi.com/blog/advanced-css-transition-handling-react (Advanced CSS Transition Handling in React)
- https://ozmoroz.com/2019/03/react-css-transitions/ (Painless React Animations via CSS Transitions)
- https://reactcommunity.org/react-transition-group/css-transition/ (CSSTransition Component - React Transition Group)
- https://zoer.ai/posts/zoer/react-intersection-observer-vs-native-api (React Intersection Observer vs Native API)
- https://medium.com/techkoala-insights/7-hidden-react-memory-leaks-eslint-misses-advanced-debugging-strategies-for-production-performance-42d142dcf794 (7 Hidden React Memory Leaks ESLint Misses)
- https://javascript.plainenglish.io/forget-useeffect-using-ref-callbacks-for-clean-infinite-scrolling-in-react-be5c2bb966e3 (Ref Callbacks for Clean Infinite Scrolling)
- https://magicui.design/blog/css-animation-on-scroll (Modern Guide to CSS Animation on Scroll)
- https://medium.com/@victor.okolo/building-a-smooth-appear-on-scroll-effect-with-next-js-and-typescript-without-breaking-your-ux-f888d86eb687 (Appear on Scroll Effect with Next.js)
- https://javascript.plainenglish.io/build-a-lightweight-reveal-on-scroll-animation-with-intersectionobserver-85b324f1234b (Lightweight Reveal-on-Scroll with IntersectionObserver)
- https://www.getfishtank.com/insights/enhance-your-nextjs-application-with-intersection-observer-api (Enhance Next.js with Intersection Observer API)
- https://www.timsanteford.com/posts/creating-a-responsive-css-progress-bar-with-transparent-effects-in-react/ (CSS Progress Bar in React)
- https://toxigon.com/implementing-a-progress-bar-in-react (Smooth Progress Bar in React)
- https://medium.com/@dobulbekovach/how-i-simplified-my-progress-bar-with-css-transitions-71fd18ccc234 (Simplified Progress Bar with CSS Transitions)
- https://medium.com/@MarkAiCode/create-a-custom-react-progress-bar-component-871c2d3eb9fc (Custom React Progress Bar Component)
- https://www.testmuai.com/blog/smooth-scroll-in-css/ (Smooth Scroll in CSS Tutorial 2025)
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scroll-behavior (MDN scroll-behavior)
- https://dev.to/hijazi313/nextjs-15-scroll-behavior-a-comprehensive-guide-387j (Next.js 15 Scroll Behavior Guide)
- https://blog.sachinchaurasiya.dev/simple-guide-to-using-intersection-observer-api-with-reactjs (Intersection Observer API with ReactJS)
