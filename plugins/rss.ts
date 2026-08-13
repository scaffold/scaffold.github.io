import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import type { Plugin } from 'vite';

const SITE = 'https://scaffold.io';
const BLOG_DIR = fileURLToPath(new URL('../content/blog', import.meta.url));

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Emits dist/blog/feed.xml from content/blog/*.md at build time. */
export function rssPlugin(): Plugin {
  return {
    name: 'scaffold-rss',
    apply: 'build',
    generateBundle() {
      // In framework mode the build runs per environment (client + ssr);
      // only emit the feed once, into the client output.
      if (this.environment && this.environment.name !== 'client') return;

      const posts = readdirSync(BLOG_DIR)
        .filter((f) => f.endsWith('.md'))
        .map((file) => {
          const { data } = matter(readFileSync(`${BLOG_DIR}/${file}`, 'utf8'));
          const slug = file.replace(/\.md$/, '');
          return {
            slug,
            ...(data as {
              title?: string;
              date?: string;
              description?: string;
              published?: boolean;
            }),
          };
        })
        // Drafts are hidden from the index and skipped by the prerender, so the
        // feed must drop them too — otherwise subscribers get the one page that
        // isn't supposed to be public. See react-router.config.ts.
        .filter((p) => p.title && p.date && p.published !== false)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)));

      const items = posts
        .map(
          (p) => `    <item>
      <title>${escapeXml(p.title!)}</title>
      <link>${SITE}/blog/${p.slug}</link>
      <guid>${SITE}/blog/${p.slug}</guid>
      <pubDate>${new Date(`${p.date}T00:00:00Z`).toUTCString()}</pubDate>
      <description>${escapeXml(p.description ?? '')}</description>
    </item>`,
        )
        .join('\n');

      this.emitFile({
        type: 'asset',
        fileName: 'blog/feed.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Scaffold Blog</title>
    <link>${SITE}/blog</link>
    <description>Notes from the Scaffold protocol — moving the cloud to the client.</description>
${items}
  </channel>
</rss>
`,
      });
    },
  };
}
