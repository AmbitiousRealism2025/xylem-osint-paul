# Phase 7 Research Context — Deploy
**Generated:** 2026-02-28
**Phase:** 7 of 7

## Topic: Kilo.ai Deployment Workflow

Kilo Deploy is a one-click deployment platform built into the Kilo Code ecosystem. It handles Next.js projects and static sites with zero manual configuration.

### How It Works
1. **GitHub Integration Required First** — Before deploying, connect GitHub via Integrations > GitHub in the Kilo Code dashboard. This installs the KiloConnect GitHub App on your account/org.
2. **New Deployment Flow:**
   - Navigate to Organization dashboard or Profile > Deploy tab
   - Click "New Deployment"
   - Choose "GitHub" in the Integration dropdown
   - Select repository and branch
   - Click "Deploy"
3. **Build Process:** Kilo auto-detects your package manager (npm, pnpm, yarn, bun) and runs the appropriate build command. No YAML, no build config files needed.
4. **Artifacts & Provisioning:** Build artifacts are uploaded, infrastructure is provisioned, and logs stream in real time.
5. **Deployment URL:** On success, you receive a public deployment URL.

### Supported Platforms
- **Next.js 14** (latest minor), **Next.js 15** (all versions), **Next.js 16** (partial support)
- **Static Sites** — pre-built HTML/CSS/JS
- **Static Site Generators** — Hugo, Jekyll, Eleventy

### Automatic Rebuilds
Every push to the connected GitHub branch triggers an automatic rebuild. No webhooks or CI/CD pipelines to configure.

### Deployment History & Rollbacks
Each deployment is saved with timestamp, build logs, and deployment URL (preview/production). You can inspect previous builds, redeploy, or delete deployments.

### Environment Variables
Kilo Deploy supports environment variables and secrets. Add key-value pairs during the "Create New Deployment" step. Toggle to mark sensitive values as secrets.

### Database Support
Kilo Deploy does not include built-in database hosting. Connect to any external database service.

---

## Topic: OpenNext for Next.js 15

### What OpenNext Does
OpenNext is a build tool that transforms Next.js applications into packages optimized for deployment on platforms other than Vercel. Originally created for AWS Lambda, it now supports Cloudflare Workers and traditional Node.js servers.

### The `@opennextjs/cloudflare` Adapter
The Cloudflare-specific adapter (`@opennextjs/cloudflare`) bridges the gap between Next.js's feature set and Cloudflare Workers' edge runtime. As of April 2025, the 1.0.0-beta was announced as the **preferred way** to deploy Next.js to Cloudflare, replacing `@cloudflare/next-on-pages`.

### Key Capabilities
- **App Router support** — Full support for Next.js App Router
- **Server-Side Rendering (SSR)** — On-demand page rendering
- **Incremental Static Regeneration (ISR)** — Revalidation of static pages
- **Middleware** — Edge middleware execution
- **Streaming** — React streaming SSR
- **API Routes** — Backend logic within the same deployment
- **Server Components** — React Server Components

### How It Transforms the Build
1. Runs `next build` to generate standard Next.js output
2. Bundles the output using esbuild into a Cloudflare Worker-compatible format
3. Outputs to `.open-next/` directory:
   - `.open-next/worker.js` — The Worker entry point
   - `.open-next/assets/` — Static assets served via Workers Assets
   - `.open-next/server-functions/` — Server function bundles
4. Uses `unenv` to polyfill Node.js APIs not natively available in Workers

### Setup for Existing Next.js Apps
The easiest path is the migrate command:
```bash
npx @opennextjs/cloudflare migrate
```

Manual setup requires:
1. Install `@opennextjs/cloudflare` and `wrangler`
2. Create `wrangler.jsonc` with:
   ```jsonc
   {
     "main": ".open-next/worker.js",
     "name": "my-app",
     "compatibility_date": "2024-12-30",
     "compatibility_flags": ["nodejs_compat"],
     "assets": {
       "directory": ".open-next/assets",
       "binding": "ASSETS"
     }
   }
   ```
3. Create `open-next.config.ts` (optional, for advanced configuration)
4. Add build/preview/deploy scripts to `package.json`

### Edge Runtime vs Node.js Runtime
| Aspect | Edge Runtime (`@cloudflare/next-on-pages`) | Node.js Runtime (`@opennextjs/cloudflare`) |
|--------|---------------------------------------------|---------------------------------------------|
| Speed/Weight | Super fast, lightweight | Fast, slightly heavier |
| Next.js Features | Limited; some features won't work | Most features supported (SSR, ISR, middleware, streaming) |
| Node.js APIs | Very restricted | Many supported via Workers' Node.js compatibility |

**Recommendation:** Use `@opennextjs/cloudflare` (Node.js runtime) for full Next.js feature support.

---

## Topic: Next.js on Cloudflare Workers

### What Works
- App Router with React Server Components
- Server-Side Rendering (SSR) with streaming
- Static Site Generation (SSG) and static export
- Incremental Static Regeneration (ISR) — requires R2 bucket for cache
- API Routes
- Middleware
- Image Optimization (with configuration)
- Server Actions
- Dynamic routing

### What Breaks / Constraints
- **No `fs` module** — File system access is not available. Any code that reads/writes files at runtime will fail.
- **No native Node.js `crypto`** — Must use Web Crypto API or polyfills via `unenv`
- **Bundle size limits** — Free plan: 3 MiB compressed. Paid plan: 10 MiB compressed. Large dependencies can push past limits.
- **Memory limits** — Workers have 128 MB memory limit (paid plan)
- **CPU time limits** — 10ms CPU time on free plan, 30s on paid plan
- **No long-running processes** — Workers are request-response; no persistent connections, WebSocket servers, or background processes without Durable Objects
- **No `process.env` at runtime** — Environment variables must be accessed via Cloudflare bindings or set in wrangler config
- **`AsyncLocalStorage` issues** — Some libraries (e.g., Sentry) that use `AsyncLocalStorage` may encounter errors on Workers. The error `Cannot call this AsyncLocalStorage bound function` has been reported with Next.js + Cloudflare Workers.
- **NPM package compatibility** — Packages with Node.js-only exports may fail. Wrangler resolves package exports using the `workerd` condition, falling back to `browser`, then `default`. Packages without appropriate export conditions need workarounds.
- **25 MiB uncompressed limit** for Cloudflare Pages (not Workers) — can be an issue for large Next.js apps

### Compatibility Flags
Must enable `nodejs_compat` in `wrangler.jsonc`:
```jsonc
{
  "compatibility_flags": ["nodejs_compat"]
}
```
Set `compatibility_date` to `"2024-09-23"` or later for best Node.js API support.

---

## Topic: output Setting in next.config.js

### `output: 'standalone'`
- Creates a `.next/standalone` folder with only the necessary files for production deployment
- Includes a minimal `node_modules` subset and a standalone `server.js`
- Designed for Docker/container deployments or self-hosted Node.js servers
- Reduces deployment size dramatically compared to shipping full `node_modules`

### For Cloudflare Workers / OpenNext
- **Do NOT set `output: 'standalone'` when using `@opennextjs/cloudflare`**
- OpenNext handles its own build transformation and bundling via esbuild
- The default output mode (no `output` setting) is what OpenNext expects
- Setting `output: 'standalone'` would interfere with OpenNext's bundling process since it creates a different build output structure
- The `output: 'export'` option (fully static export) can work for static-only sites but loses all server-side features (SSR, ISR, API routes, middleware)

### Recommendation
For Kilo.ai / Cloudflare Workers deployment:
```js
// next.config.js — do NOT set output
const nextConfig = {
  // No output property needed
  // OpenNext handles the build transformation
};
```

---

## Topic: Common Kilo.ai Deployment Failures

### Build Failures
1. **Package manager detection issues** — If your project uses an uncommon setup, auto-detection may fail. Ensure a proper `package.json` with standard scripts (`build`, `dev`, `start`).
2. **Missing dependencies** — If dependencies are in `devDependencies` but needed at build time, the build will fail. Ensure all build-time dependencies are in `dependencies` or that `devDependencies` are installed during the build step.
3. **Environment variables not set** — If your build relies on env vars (e.g., API keys, database URLs), add them in the Kilo Deploy configuration before deploying.

### Next.js-Specific Issues
4. **`useRouter` in Server Components** — Using `useRouter` from `next/navigation` in a Server Component causes build errors. This import is only valid in Client Components (files with `'use client'` directive).
5. **Turbopack compatibility** — Some Next.js 15 features may behave differently with Turbopack vs Webpack during builds.
6. **React 19 peer dependency conflicts** — Some third-party packages may not yet declare React 19 compatibility, causing peer dependency warnings or build failures.

### Cloudflare/OpenNext-Specific Issues
7. **Worker size exceeded** — If the compressed Worker bundle exceeds 3 MiB (free) or 10 MiB (paid), deployment fails. Use the ESBuild Bundle Analyzer with `.open-next/server-functions/default/handler.mjs.meta.json` to find large dependencies.
8. **Node.js API usage at runtime** — Any code using `fs`, `child_process`, `net`, etc. at runtime will fail on Workers. Must be caught before deploy.
9. **AsyncLocalStorage errors** — Libraries using `AsyncLocalStorage` (Sentry, some logging libraries) may fail at runtime on Workers.

### Debugging
- Kilo Deploy streams build logs in real time
- Check deployment history for previous successful builds to compare
- Inspect build logs for specific error messages

---

## Topic: GitHub to Kilo.ai Workflow

### Initial Setup
1. **Connect GitHub** — Go to Kilo dashboard > Integrations > GitHub > Configure
2. **Authorize KiloConnect App** — GitHub redirects to authorize the KiloConnect GitHub App
3. **Choose Repository Access** — Select specific repos or all repos
4. **Install & Authorize** — Confirm to complete the connection

### Deployment Workflow
1. **Create New Deployment** — From the Deploy tab, click New Deployment
2. **Select Repository** — Choose GitHub as integration, pick repo and branch
3. **Configure Environment Variables** — Add any env vars / secrets needed
4. **Deploy** — Click Deploy; Kilo builds, uploads artifacts, provisions, and provides a live URL

### Continuous Deployment
- Every `git push` to the connected branch triggers an automatic rebuild
- No webhooks to configure manually
- No CI/CD pipeline setup required
- Build logs are streamed in real time for each deploy

### Rollbacks
- Previous deployments are saved with full logs
- Can redeploy any previous version from deployment history
- Can delete deployments that are no longer needed

### Cloud Agents (Advanced)
- Kilo also offers Cloud Agents that can work from GitHub repos
- Auto-create branches and push commits continuously
- Run in isolated Linux containers with dev tools preinstalled
- Each session gets its own workspace directory and unique branch

---

## Topic: Cloudflare Workers + React 19 + Next.js 15

### Compatibility Status (2025-2026)
- **Next.js 15 with App Router** — Well supported via `@opennextjs/cloudflare`. The adapter is actively developed and the 1.0.0-beta was released in April 2025.
- **React 19** — React 19 is the default in Next.js 15. Server Components, Server Actions, and the `use` hook all work on Cloudflare Workers via OpenNext.
- **React Server Components** — Fully supported; this is the primary rendering model for App Router.
- **Streaming SSR** — Supported; React 19's streaming capabilities work through the OpenNext adapter.

### Known Issues
1. **AsyncLocalStorage** — React 19 and Next.js 15 internally use `AsyncLocalStorage` for request context. While Workers now support it via the `nodejs_compat` flag, some edge cases with third-party libraries (especially Sentry) can cause runtime errors.
2. **`useFormStatus` / `useActionState`** — These React 19 hooks for Server Actions should work, but are less battle-tested on Workers than on Vercel.
3. **Bundle size pressure** — React 19 + Next.js 15 together produce larger bundles than previous versions. Monitor compressed bundle size against the 10 MiB limit.
4. **Partial Prerendering (PPR)** — Next.js 15's experimental PPR feature is not yet fully supported by `@opennextjs/cloudflare`.
5. **`next/image` optimization** — Requires Cloudflare Image Resizing (paid add-on) or a custom loader. Does not work out-of-the-box like on Vercel.
6. **Containers integration** — An issue was reported (cloudflare/workers-sdk#12033) where Cloudflare's new Container feature did not work with Next.js OpenNext workers due to Build ID assertions.

### Production Examples
- Government sites like techforce.gov, safedc.gov, and americabydesign.gov run Next.js on Cloudflare via OpenNext
- Supermemory.ai serves 20,000+ users on this stack for ~$5/month
- bobadilla.tech reports sub-50ms response times worldwide using Next.js 16 + Cloudflare Workers + OpenNext

### Stability Assessment
The stack is production-ready for content-heavy sites and standard web apps. For projects relying heavily on experimental Next.js features (PPR, Turbopack in production) or complex Node.js runtime APIs, additional testing is recommended.

---

## Key Implementation Notes

- **Do not set `output: 'standalone'` in next.config.js** — OpenNext handles its own build transformation. Leave the `output` property unset so OpenNext can properly bundle the Next.js build output for Cloudflare Workers.
- **Enable `nodejs_compat` compatibility flag** — This is essential in `wrangler.jsonc` for Node.js API polyfill support. Set `compatibility_date` to `"2024-09-23"` or later.
- **Monitor compressed bundle size** — The 10 MiB compressed limit on Cloudflare Workers paid plan is tight. Avoid large server-side dependencies. Use dynamic imports for heavy client-side libraries. Analyze bundles with the ESBuild Bundle Analyzer if builds fail.
- **Avoid Node.js-only APIs in runtime code** — No `fs`, `child_process`, `net`, `dns`, etc. at runtime. Use Web APIs or Cloudflare bindings instead. All data must come from external APIs, KV, R2, or D1 — not the filesystem.
- **Kilo Deploy handles the full pipeline** — No need to manually configure OpenNext, wrangler, or CI/CD. Kilo auto-detects the framework, package manager, and build process. Just connect GitHub, select the repo, and deploy. However, understanding the underlying stack (OpenNext + Cloudflare Workers) is critical for debugging deployment failures.

## Sources

- https://kilo.ai/docs/advanced-usage/deploy (Kilo Deploy docs, updated Jan 2026)
- https://kilo.ai/docs/deploy-secure/deploy (Kilo Deploy docs, alternate path)
- https://blog.kilo.ai/p/kilo-deploy (Kilo Deploy announcement, Dec 2025)
- https://blog.kilo.ai/p/inside-kilo-speed-how-one-engineer-971 (Kilo Speed case study, Jan 2026)
- https://kilo.ai/docs/automate/integrations (Kilo Integrations — GitHub setup)
- https://kilo.ai/docs/code-with-ai/platforms/cloud-agent (Kilo Cloud Agents)
- https://opennext.js.org/cloudflare/get-started (OpenNext Cloudflare getting started)
- https://opennext.js.org/cloudflare/troubleshooting (OpenNext Cloudflare troubleshooting)
- https://blog.cloudflare.com/deploying-nextjs-apps-to-cloudflare-workers-with-the-opennext-adapter/ (Cloudflare blog, April 2025)
- https://www.gperrucci.com/blog/nextjs/deploy-nextjs-to-cloudflare-workers (OpenNext deployment guide, April 2025)
- https://dev.to/prajwolshrestha/deploying-nextjs-app-to-cloudflare-workers-with-opennext-hi0 (Dev.to tutorial, Aug 2025)
- https://davidloor.com/en/blog/deploying-nextjs-cloudflare-opennext-guide (Real-world deployment experience, Jan 2026)
- https://www.blog.brightcoding.dev/2025/11/23/the-ultimate-next-js-15-cloudflare-workers-template-build-full-stack-apps-at-the-edge-in-2025/ (Next.js 15 Cloudflare template, Nov 2025)
- https://bobadilla.tech/blog/cloudflare-workers-nextjs-deployment (Next.js 16 on Cloudflare Workers guide, Feb 2026)
- https://devinvinson.com/2025/11/deploying-fullstack-next-js-on-cloudflare-my-troubleshooting-guide/ (Troubleshooting guide, Nov 2025)
- https://medium.com/@Yasirgaji/migrating-next-js-16-from-vercel-to-cloudflare-overcoming-the-25mb-limit-aa88e8396b29 (Migration + 25MB limit, Dec 2025)
- https://nextjs.org/docs/pages/api-reference/config/next-config-js/output (Next.js output config docs)
- https://focusreactive.com/standalone-next-js-when-serverless-is-not-an-option/ (Standalone Next.js guide, Jan 2025)
- https://developers.cloudflare.com/workers/configuration/compatibility-flags/ (Cloudflare compatibility flags)
- https://github.com/getsentry/sentry-javascript/issues/18842 (AsyncLocalStorage issue with Next.js + Workers, Jan 2026)
- https://github.com/cloudflare/workers-sdk/issues/12033 (Containers + OpenNext issue, Jan 2026)
- https://www.npmjs.com/package/@opennextjs/cloudflare/v/0.3.9 (npm package details)
