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
- `plugins/raw-markdown.ts` — emits the raw markdown behind every published
  page (`/docs/faq.md` beside the prerendered `/docs/faq`), plus `/llms.txt`
  and `/llms-full.txt`.
- `plugins/rss.ts` — emits `build/client/blog/feed.xml` at build time.

## Deployment

Static output in `build/client/`. Every route listed in
`react-router.config.ts` is prerendered to HTML; the rest are client-only
and boot React Router's SPA shell.

Both hosts serve that shell the same way — as `404.html`, which is what
they fall back to when no asset matches:

- GitHub Pages (live) — `.github/workflows/deploy.yml`, on push to `main`.
- Cloudflare Pages — build command `bash scripts/build-cloudflare.sh`,
  output directory `build/client`, `NODE_VERSION=22`.

Do not add a `_redirects` file. It does nothing on GitHub Pages, and on
Cloudflare its `/*` splat matches even prerendered paths and loops on the
`.html` → extensionless 308 — see the comment in the build script.

### Markdown for machines

Every published page is served twice: as HTML at its route, and as its source
markdown at the same path plus `.md`. `/llms.txt` indexes those `.md` URLs and
`/llms-full.txt` concatenates them.

They're plain static files, so both hosts serve them with no configuration and
they cache like any other asset. That is the reason for the extra URL rather
than content negotiation on `Accept: text/markdown` — a static host can't vary
one URL by request header, and Cloudflare's edge cache only honours `Vary:
Accept-Encoding`, so a negotiated single URL risks handing HTML to a client
that asked for markdown.

Adding a doc prints a build warning until it's placed in `DOCS_ORDER`
(`plugins/raw-markdown.ts`) next to its `DOCS_NAV` entry.

## Future

- `/explorer` will mount `@scaffold/explorer` (React 19 component,
  `../scaffold/explorer`) once the testnet is public — the mount point is
  `#explorer-root` in `src/pages/ExplorerPage.tsx`. No Scaffold packages are
  imported yet, intentionally.
- Community/GitHub/Discord URLs in `Footer.tsx` and `CommunityPage.tsx` are
  placeholders.
