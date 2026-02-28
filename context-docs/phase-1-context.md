# Phase 1 Research Context — Scaffold
**Generated:** 2026-02-28
**Phase:** 1 of 7

## Topic: Next.js 15 App Router Structure

Next.js 15 uses the **App Router** architecture with file-based routing inside the `app/` directory. Each folder represents a route segment mapped to a URL path.

### Correct Directory Layout

```
my-nextjs-project/
├── app/                    # App Router (required)
│   ├── layout.tsx          # Root layout wrapping all pages (required)
│   ├── page.tsx            # Homepage (/) (required)
│   ├── loading.tsx         # Loading UI with React Suspense (optional)
│   ├── error.tsx           # Error boundary (optional)
│   ├── not-found.tsx       # 404 page (optional)
│   └── api/
│       └── route.ts        # API route handlers
├── components/             # Reusable UI components
├── public/                 # Static assets (images, icons, etc.)
├── styles/                 # Global CSS and shared styles
├── utils/                  # Helper functions
├── .env                    # Environment variables
├── next.config.ts          # Next.js configuration (TS supported since Next 15)
├── package.json            # Project dependencies
└── tsconfig.json           # TypeScript configuration
```

### Key Rules
- A route is NOT publicly accessible until a `page.tsx` file exists in the folder.
- `layout.tsx` at root is **required** — it wraps all pages and persists across navigations.
- Routes are defined by nested folders: `app/about/page.tsx` maps to `/about`.
- Dynamic routes use bracket syntax: `app/blog/[slug]/page.tsx`.
- The `src/` directory is optional but commonly used (`src/app/`, `src/components/`, etc.).
- `create-next-app@latest` generates the correct structure by default.
- Node.js 18.17+ is required.

### `layout.tsx` vs `layout.js`
- Next.js 15 supports both `.tsx` and `.js` extensions.
- TypeScript is the default when using `create-next-app` (it asks `Would you like to use TypeScript?` and defaults to Yes).
- The root `layout.tsx` must export a default function that accepts `{ children }` and wraps them in `<html>` and `<body>` tags.

```tsx
// app/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

## Topic: ESM Module Configuration

### `"type": "module"` in package.json
- Next.js 15 does **NOT** require `"type": "module"` in `package.json`. The default `create-next-app` output does not include it.
- Next.js handles module resolution internally via its bundler (Webpack or Turbopack).
- Adding `"type": "module"` can cause issues with tools that expect CommonJS (e.g., Nx monorepo tooling has had bugs with `require()` failing on ESM config files).
- **Recommendation:** Do NOT set `"type": "module"` unless you have a specific reason. Next.js works fine without it.

### Config File Extensions
- `next.config.js` — CommonJS format (`module.exports = {}`)
- `next.config.mjs` — ESM format (`export default {}`)
- `next.config.ts` — TypeScript format (supported natively since Next.js 15 RC2, October 2024)
- If using `.js` extension with `"type": "module"` in package.json, it will be treated as ESM, which can cause compatibility issues with some tooling.

### Pitfalls
- Some older Next.js versions (pre-15) do NOT support `next.config.ts`. If deploying to a platform that uses an older build step, ensure compatibility.
- If you get `ERR_REQUIRE_ESM` errors, it's because a tool is trying to `require()` an ESM file. Solution: use `.mjs` extension or `next.config.ts`.
- The closing recommendation: **Use `next.config.ts`** (TypeScript) for Next.js 15 projects. It's natively supported and avoids ESM/CJS ambiguity.

## Topic: next.config.js Minimal Setup

### Minimal Configuration for Next.js 15
Next.js 15 works with zero configuration. A minimal `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {};

export default nextConfig;
```

Or in CommonJS (`next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = nextConfig;
```

Or ESM (`next.config.mjs`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

### What's Required vs Optional
- **Required:** Nothing beyond the empty config object. Next.js has sensible defaults.
- **Optional but common:**
  - `reactStrictMode: true` — Enabled by default in Next.js 15.
  - `images.domains` or `images.remotePatterns` — Only if loading external images.
  - `output: 'standalone'` — For self-hosting or container deployments. **Important for Cloudflare/OpenNext deployments.**
  - `experimental` block — For features like PPR, React Compiler, etc.

### For Cloudflare/OpenNext Deployment
When targeting Cloudflare Workers via OpenNext, you may need to call `initOpenNextCloudflareForDev()` in your Next.js config for local dev compatibility:

```typescript
import type { NextConfig } from 'next';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {};

export default nextConfig;
```

## Topic: React 19 + Next.js 15 Compatibility

### Official Support
- **Next.js 15.0** shipped with React 19 RC support (October 2024).
- **Next.js 15.1** officially supports the stable React 19 release (December 2024).
- React 19 is now the **default** when running `create-next-app@latest`.
- The install command is: `npm install next@latest react@latest react-dom@latest`

### Key Differences from React 18
1. **Async Request APIs (Breaking):** In Next.js 15, request-specific APIs like `cookies()`, `headers()`, `params`, and `searchParams` are now **async**. You must `await` them.
2. **Caching Defaults Changed:** `fetch` requests, `GET` Route Handlers, and client navigations are **no longer cached by default**. You must explicitly opt into caching.
3. **React Compiler (Experimental):** Next.js 15 supports the React Compiler, which automatically optimizes re-renders. Still experimental.
4. **Hydration Error Improvements:** React 19 provides better error messages with source code diffs showing exactly what mismatched between server and client.
5. **`ref` as a prop:** In React 19, `ref` can be passed as a regular prop to function components. No need for `forwardRef` in most cases.
6. **`use()` hook:** New hook for reading resources (promises, context) during render.
7. **Server Components are the default:** Components in the `app/` directory are Server Components by default. Use `'use client'` directive for client components.

### Compatibility Notes
- React 18 can still be used with Next.js 15 (peer dependency allows it), but React 19 is strongly recommended.
- TypeScript enums in `.d.ts` files may behave differently with Next.js 15's build process — use string constants instead.
- The `@next/codemod` CLI can automate migration: `npx @next/codemod@canary upgrade latest`

## Topic: Kilo.ai Deployment Requirements

### What is Kilo.ai?
Kilo.ai (Kilo Code / Kilo Deploy) is a hosting platform that provides one-click deployment for Next.js applications. It deploys apps to Cloudflare Workers infrastructure under the hood.

### Supported Platforms
- **Next.js 14** — latest minor
- **Next.js 15** — all versions (full support)
- **Next.js 16** — partial support (some features may not work)
- **Static Sites** — pre-built HTML/CSS/JS
- **Static Site Generators** — Hugo, Jekyll, Eleventy

### Package Manager Support
Automatically detects: **npm, pnpm, yarn, bun**

### Deployment Process
1. Connect GitHub repository via Integrations settings.
2. Open the Deploy tab in your Organization dashboard.
3. Click "New Deployment" and select your repository and branch.
4. Click Deploy — Kilo handles build, artifact upload, provisioning, and log streaming.
5. Receive a deployment URL upon completion.

### Key Features
- **No manual configuration** — deployment settings are generated automatically.
- **Automatic rebuilds** on every GitHub push.
- **Deployment history** with logs, timestamps, and rollback capability.
- **Preview and Production** deployment URLs.

### Known Constraints
- Since Kilo wraps deployment via Cloudflare Workers + OpenNext, all OpenNext/Cloudflare constraints apply (see next section).
- No explicit documentation on environment variable configuration in the Kilo dashboard beyond what Cloudflare Workers provides.
- Kilo handles the build process, so your `package.json` scripts must be standard (`build`, `start`).

## Topic: OpenNext + Cloudflare Workers Constraints

### What is OpenNext?
OpenNext (`@opennextjs/cloudflare`) converts a Next.js build output into something Cloudflare Workers can run natively. It bridges the gap between Next.js (which expects Node.js APIs) and the Workers runtime.

### Setup Requirements

**1. Install Dependencies:**
```bash
npm install @opennextjs/cloudflare@latest
npm install --save-dev wrangler@latest  # v3.99.0+
```

**2. Create `wrangler.jsonc` (or `wrangler.toml`):**
```jsonc
{
  "name": "my-next-app",
  "main": ".open-next/worker.js",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  },
  "services": [
    {
      "binding": "WORKER_SELF_REFERENCE",
      "service": "my-next-app"
    }
  ]
}
```

**3. Create `open-next.config.ts`:**
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

**4. Add package.json scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
  }
}
```

**5. Add `.open-next` to `.gitignore`.**

**6. Create `public/_headers` for cache control (optional):**
```
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable
```

### Supported Features on Cloudflare Workers
| Feature | Status |
|---------|--------|
| App Router | Supported |
| Pages Router | Supported |
| Route Handlers | Supported |
| React Server Components | Supported |
| Static Site Generation (SSG) | Supported |
| Server-Side Rendering (SSR) | Supported |
| Incremental Static Regeneration (ISR) | Supported |
| Server Actions | Supported |
| Response streaming | Supported |
| Middleware | Supported |
| Image optimization | Supported (via Cloudflare Images) |
| Partial Prerendering (PPR) | Supported (experimental) |
| `'use cache'` | Supported (experimental) |

### Known Constraints and Breakage Points
1. **Worker Size Limit:** Free plan = 3 MiB compressed. Paid plan = 10 MiB compressed. If exceeded, analyze bundle with ESBuild Bundle Analyzer on `.open-next/server-functions/default/handler.mjs.meta.json`.
2. **`nodejs_compat` flag is mandatory** — without it, Node.js APIs will fail.
3. **Compatibility date must be `2024-09-23` or later.**
4. **`export const runtime = "edge"` is NOT supported** — remove any such declarations. OpenNext handles the runtime mapping.
5. **Node.js Middleware is NOT yet supported** (introduced in Next.js 15.2, not available on Cloudflare Workers yet).
6. **Build output structure:** OpenNext generates `.open-next/worker.js` as the entry point and `.open-next/assets/` for static files. If the entry file is missing, deployment fails.
7. **R2 bucket binding** is optional but recommended for ISR caching (`r2IncrementalCache` override in `open-next.config.ts`).
8. **Environment variables:** Use `.dev.vars` file locally with `NEXTJS_ENV=development`. In production, configure via Cloudflare dashboard or wrangler.
9. **NPM package compatibility:** Some packages that rely on Node.js APIs not available in Workers will fail. Check Cloudflare's Node.js compatibility docs.
10. **The `@cloudflare/next-on-pages` package is deprecated** — `@opennextjs/cloudflare` is now the preferred adapter.

### Quick Setup (Automated)
For new projects:
```bash
npm create cloudflare@latest -- my-next-app --framework=next --platform=workers
```

For existing projects:
```bash
npx @opennextjs/cloudflare migrate
```

## Key Implementation Notes

- **Use `next.config.ts` (TypeScript)** for Next.js 15 projects — it's natively supported and avoids ESM/CJS confusion. Do NOT set `"type": "module"` in `package.json`.
- **React 19 is the default** with Next.js 15. The `app/` directory uses Server Components by default; add `'use client'` only where needed. Request APIs (`cookies()`, `headers()`, `params`) are now async.
- **Kilo.ai deploys via Cloudflare Workers + OpenNext.** Your project needs `wrangler.jsonc`, `open-next.config.ts`, and the `@opennextjs/cloudflare` + `wrangler` devDependencies. The `nodejs_compat` flag and compatibility date `>= 2024-09-23` are mandatory.
- **Worker size limits matter.** Keep dependencies lean. Free tier is 3 MiB compressed, paid is 10 MiB. Monitor bundle size early.
- **Do NOT use `export const runtime = "edge"`** anywhere in your code. OpenNext manages the runtime. Also avoid Node.js-specific middleware features (not yet supported on Workers).

## Sources
- https://medium.com/@j.hariharan005/mastering-next-js-15-folder-structure-a-developers-guide-b9b0461e2d27
- https://www.jigz.dev/blogs/how-to-organize-next-js-15-app-router-folder-structure
- https://kitemetric.com/blogs/mastering-next-js-15-2025-best-practices-for-folder-structure
- https://levelup.gitconnected.com/how-to-set-up-a-scalable-next-js-15-app-router-project-structure-pro-tips-3c42778cd737
- https://nextjs.org/blog/next-15
- https://nextjs.org/blog/next-15-2
- https://nextjs.org/blog/next-15-5
- https://nextjs.org/blog/next-15-rc2
- https://github.com/vercel/next.js/discussions/32239
- https://github.com/vercel/next.js/issues/84017
- https://github.com/nrwl/nx/issues/31408
- https://xsoneconsultants.com/blog/next-js-15/
- https://github.com/vercel/next.js/discussions/72795
- https://joodi.medium.com/next-js-15-1-now-officially-supporting-react-19-82acfdad16c4
- https://kilo.ai/docs/advanced-usage/deploy
- https://blog.kilo.ai/p/kilo-deploy
- https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/
- https://opennext.js.org/cloudflare/get-started
- https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/
- https://www.npmjs.com/package/@opennextjs/cloudflare
- https://github.com/opennextjs/opennextjs-cloudflare/releases
- https://github.com/opennextjs/opennextjs-cloudflare/issues/663
- https://opennext.js.org/cloudflare/troubleshooting
- https://davidloor.com/en/blog/deploying-nextjs-cloudflare-opennext-guide
- https://bobadilla.tech/blog/cloudflare-workers-nextjs-deployment
- https://forem.com/prajwolshrestha/deploying-nextjs-app-to-cloudflare-workers-with-opennext-hi0
- https://devinvinson.com/2025/11/deploying-fullstack-next-js-on-cloudflare-my-troubleshooting-guide/
- https://congdinh.com/en/blog/getting-started-nextjs-15
- https://www.npmjs.com/package/create-next-app/v/15.1.7
