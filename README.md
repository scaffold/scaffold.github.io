# Scaffold website

The marketing site, docs, and blog for [Scaffold](https://scaffold.io) —
Vite + React 19 + TypeScript, styled with the Scaffold Design System
(Raw identity, locked).

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build into dist/
npm run preview    # serve the production build
```

## Layout

- `src/pages/` — one component per route (`/`, `/how-it-works`, `/explorer`,
  `/community`, `/docs/:slug`, `/blog`, `/blog/:slug`).
- `src/styles/tokens.css` — design tokens, trimmed from the design system's
  `colors_and_type.css` to the Raw theme (light + dark via
  `<html data-mode>`).
- `src/styles/site.css` — layout and components, ported from the marketing
  UI kit.
- `src/content/heroCode.ts` — the hero code window's hand-marked snippets
  (Contract / Build / Run × Rust / AssemblyScript). This becomes editable +
  runnable later.
- `content/docs/*.md`, `content/blog/*.md` — all docs and blog posts.
  Markdown with YAML frontmatter; add a file and it ships. Docs sidebar
  order lives in `src/lib/content.ts` (`DOCS_NAV`).
- `plugins/markdown.ts` — Vite plugin: markdown → HTML at build time with
  Shiki highlighting wired to the design system's `--code-*` palette.
- `plugins/rss.ts` — emits `dist/blog/feed.xml` at build time.

## Deployment

Static output in `dist/`, with `public/_redirects` providing the SPA
fallback for Cloudflare Pages / Netlify. The site is a client-rendered SPA
for now; prerendering routes for SEO is a planned follow-up.

## Future

- `/explorer` will mount `@scaffold/explorer` (React 19 component,
  `../scaffold/explorer`) once the testnet is public — the mount point is
  `#explorer-root` in `src/pages/ExplorerPage.tsx`. No Scaffold packages are
  imported yet, intentionally.
- Community/GitHub/Discord URLs in `Footer.tsx` and `CommunityPage.tsx` are
  placeholders.
