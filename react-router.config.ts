import type { Config } from '@react-router/dev/config';
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/** Slugs for a content directory, derived at build time so prerender stays in sync. */
function slugs(sub: string): string[] {
  const dir = fileURLToPath(new URL(`./content/${sub}`, import.meta.url));
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export default {
  // Keep the existing src/ layout instead of the default app/ directory.
  appDirectory: 'src',

  // Static output (no runtime server) — matches the Cloudflare/Netlify plan.
  ssr: false,

  // Pre-render every static route to HTML at build time. /docs (redirect)
  // and the * 404 are intentionally client-only via the SPA fallback.
  async prerender() {
    return [
      '/',
      '/how-it-works',
      '/explorer',
      '/community',
      '/blog',
      ...slugs('docs').map((s) => `/docs/${s}`),
      ...slugs('spec').map((s) => `/docs/${s}`),
      ...slugs('blog').map((s) => `/blog/${s}`),
    ];
  },
} satisfies Config;
