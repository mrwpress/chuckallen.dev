# chuckallen.dev

## What this is
Chuck Allen's primary personal brand and parent company. "A ChuckAllen.dev Company" appears on mrwpress.com and chuckallen.ai. Single-page scrollable model with anchor sections. Targets developers and agencies needing senior technical leadership.

## Rules
- **Performance first** — every decision filtered through performance impact
- **No CSS frameworks** — all CSS is component-scoped via Astro `<style>` blocks
- **Single page model** — one `index.astro` with section components, anchor nav. Legal pages (privacy, terms) are the only separate routes.
- **Images in `src/assets/`** — always use `<Picture />` from `astro:assets` for AVIF + WebP
- **SVGs in `public/`** — they don't need processing
- **Never push to main** — always branch → PR → merge
- **noindex/nofollow on all pages** until told otherwise (pre-launch)
- **TypeScript strict mode**, ESNext target
- **Shared components from `@mrwpress/shared`** — import BaseLayout, Header, Footer, Contact, etc.
- **Site config in `src/config/site.ts`** — single `SiteConfig` object, one source of truth

## Stack
- Astro (static SSG)
- Component-scoped CSS + shared design tokens
- Cloudflare Pages + Workers
- GitHub Packages for @mrwpress/shared

## Deployment
Merge to `main` triggers Cloudflare Pages rebuild.
