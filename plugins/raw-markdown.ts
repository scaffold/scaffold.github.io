import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import type { Plugin } from 'vite';

// Also defined in plugins/rss.ts and src/lib/meta.ts. Those three run in
// different contexts — two Node build plugins and the client bundle — and have
// no module they can all import from.
const SITE = 'https://scaffold.io';

/** Verbatim from the home page's meta description (src/routes/home.tsx). */
const SUMMARY =
  'Scaffold is a browser-native protocol that turns your users into infrastructure.';

/**
 * Order of the Docs section in llms.txt, mirroring `DOCS_NAV` in
 * src/lib/content.ts. That module can't be imported here: it's built on
 * `import.meta.glob`, which only resolves inside the client bundle.
 *
 * Docs missing from this list are still indexed — appended alphabetically, and
 * named in a build warning — so adding a page can't silently drop it from the
 * index, it just prints a reminder to place it.
 */
const DOCS_ORDER = ['getting-started', 'concepts', 'faq', 'whitepaper'];

function contentDir(sub: string): string {
  return fileURLToPath(new URL(`../content/${sub}`, import.meta.url));
}

interface Entry {
  slug: string;
  /** Site path with no extension, e.g. `docs/faq`. */
  path: string;
  title: string;
  description: string;
  date: string;
  author: string;
  body: string;
}

interface Frontmatter {
  title?: string;
  description?: string;
  date?: string;
  author?: string;
  published?: boolean;
}

/**
 * Reads one content directory into entries served under `urlBase`.
 *
 * Drafts are dropped here for the same reason plugins/rss.ts drops them: a
 * `published: false` body is already blanked out of the production bundle by
 * plugins/markdown.ts and skipped by the prerender, so emitting the real prose
 * as a `.md` file would republish exactly what those two go out of their way to
 * withhold. See the comment in react-router.config.ts.
 */
function read(sub: string, urlBase: string): Entry[] {
  const dir = contentDir(sub);
  return readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((file) => {
      const { data, content } = matter(readFileSync(`${dir}/${file}`, 'utf8'));
      return {
        slug: file.replace(/\.md$/, ''),
        fm: data as Frontmatter,
        content,
      };
    })
    .filter(({ fm }) => fm.published !== false)
    .map(({ slug, fm, content }) => ({
      slug,
      path: `${urlBase}/${slug}`,
      title: fm.title ?? slug,
      description: fm.description ?? '',
      date: fm.date ?? '',
      author: fm.author ?? '',
      body: content,
    }));
}

/**
 * The file served at `<path>.md`. Frontmatter is site machinery, so it comes
 * off — but anything it carried that the HTML page renders as chrome rather
 * than prose goes back as markdown, so the raw file isn't missing a heading or
 * byline that a reader of the page would have seen.
 *
 * Docs already open with their own `# Title` in the body; blog posts don't,
 * because src/routes/blog-post.tsx renders the title and byline from
 * frontmatter instead. Testing the body rather than the collection keeps that
 * from being a rule about which folder a file lives in.
 */
function document(entry: Entry): string {
  const body = entry.body.replace(/^\n+/, '').replace(/\s+$/, '');
  if (/^\s*#\s+\S/.test(body)) return `${body}\n`;

  const byline = [entry.date, entry.author].filter(Boolean).join(' · ');
  return `${[`# ${entry.title}`, byline && `*${byline}*`, body]
    .filter(Boolean)
    .join('\n\n')}\n`;
}

/** One llms.txt link, pointing at the `.md` rather than the HTML page. */
function link(entry: Entry): string {
  const url = `${SITE}/${entry.path}.md`;
  return entry.description
    ? `- [${entry.title}](${url}): ${entry.description}`
    : `- [${entry.title}](${url})`;
}

function llmsTxt(docs: Entry[], posts: Entry[]): string {
  return `# Scaffold

> ${SUMMARY}

The full text of every page below is also available at ${SITE}/llms-full.txt.

## Docs

${docs.map(link).join('\n')}

## Blog

${posts.map(link).join('\n')}
`;
}

/**
 * Every page concatenated, for clients that would rather take one request than
 * crawl the index. Each section is preceded by the canonical URL of the page it
 * came from so quotes out of it stay attributable.
 */
function llmsFull(entries: Entry[]): string {
  const sections = entries
    .map((entry) => `<!-- ${SITE}/${entry.path} -->\n\n${document(entry)}`)
    .join('\n---\n\n');
  return `<!-- ${SITE}/llms-full.txt — every page of ${SITE}, concatenated. -->

${sections}`;
}

/**
 * Emits the raw markdown behind every published page — `build/client/docs/
 * faq.md` alongside the prerendered `docs/faq/index.html` — plus llms.txt and
 * llms-full.txt at the root.
 *
 * The point is content negotiation without content negotiation: a static host
 * can't vary on `Accept`, but it can serve a second URL per page, which caches
 * cleanly and can be linked and pasted.
 */
export function rawMarkdownPlugin(): Plugin {
  return {
    name: 'scaffold-raw-markdown',
    apply: 'build',
    generateBundle() {
      // In framework mode the build runs per environment (client + ssr); only
      // emit into the client output.
      if (this.environment && this.environment.name !== 'client') return;

      // Both directories serve under /docs/:slug, so slugs are unique across
      // them — src/lib/content.ts relies on the same thing.
      const docs = [...read('docs', 'docs'), ...read('spec', 'docs')];
      const unplaced = docs
        .filter((d) => !DOCS_ORDER.includes(d.slug))
        .sort((a, b) => a.slug.localeCompare(b.slug));
      if (unplaced.length > 0) {
        this.warn(
          `llms.txt: ${unplaced
            .map((d) => d.slug)
            .join(', ')} not in DOCS_ORDER — appended at the end. ` +
            'Place it there (and in DOCS_NAV) or mark it `published: false`.',
        );
      }

      const ordered = [
        ...DOCS_ORDER.map((slug) => docs.find((d) => d.slug === slug)).filter(
          (d): d is Entry => d !== undefined,
        ),
        ...unplaced,
      ];
      const posts = read('blog', 'blog').sort((a, b) =>
        b.date.localeCompare(a.date),
      );

      for (const entry of [...ordered, ...posts]) {
        this.emitFile({
          type: 'asset',
          fileName: `${entry.path}.md`,
          source: document(entry),
        });
      }

      this.emitFile({
        type: 'asset',
        fileName: 'llms.txt',
        source: llmsTxt(ordered, posts),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'llms-full.txt',
        source: llmsFull([...ordered, ...posts]),
      });
    },
  };
}
