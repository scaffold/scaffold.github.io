import type { Config } from '@react-router/dev/config';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

function contentDir(sub: string): string {
  return fileURLToPath(new URL(`./content/${sub}`, import.meta.url));
}

/** Slugs for a content directory, derived at build time so prerender stays in sync. */
function slugs(sub: string): string[] {
  return readdirSync(contentDir(sub))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

/**
 * Blog slugs excluding drafts. `published: false` only hides a post from the
 * index, so prerendering one would still leave it reachable at its own URL (and
 * indexable). The same filter has to hold in plugins/rss.ts, which builds the
 * feed, and in src/lib/content.ts, which decides what the client can render.
 */
function publishedBlogSlugs(): string[] {
  const dir = contentDir('blog');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .filter(
      (f) => matter(readFileSync(`${dir}/${f}`, 'utf8')).data.published !== false,
    )
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
      ...publishedBlogSlugs().map((s) => `/blog/${s}`),
    ];
  },
} satisfies Config;
