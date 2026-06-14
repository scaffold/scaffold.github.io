import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import { createHighlighter, createCssVariablesTheme, type Highlighter } from 'shiki';
import type { Plugin } from 'vite';

/**
 * Transforms `content/**.md` into JS modules:
 *   export const frontmatter: Record<string, unknown>
 *   export const html: string        // rendered article body
 *   export const toc: TocEntry[]     // h2/h3 anchors for the right rail
 *
 * Code fences are highlighted with Shiki using a css-variables theme, so
 * the syntax palette comes from the design tokens (--code-*) and follows
 * light/dark mode for free.
 */

export interface TocEntry {
  level: 2 | 3;
  id: string;
  text: string;
}

const LANGS = ['typescript', 'tsx', 'javascript', 'rust', 'bash', 'json', 'toml', 'wasm'];

const cssVarsTheme = createCssVariablesTheme({
  name: 'scaffold-vars',
  variablePrefix: '--shiki-',
  variableDefaults: {},
  fontStyle: true,
});

let highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({ themes: [cssVarsTheme], langs: LANGS });
  return highlighterPromise;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function createRenderer(highlighter: Highlighter) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(code, lang) {
      const language = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text';
      try {
        return highlighter.codeToHtml(code.trimEnd(), { lang: language, theme: 'scaffold-vars' });
      } catch {
        return '';
      }
    },
  });

  // Anchor ids on headings + table-of-contents collection.
  md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const inline = tokens[idx + 1];
    const text =
      inline?.children
        ?.filter((t) => t.type === 'text' || t.type === 'code_inline')
        .map((t) => t.content)
        .join('') ?? '';
    const seen: Map<string, number> = (env.slugs ??= new Map());
    let id = slugify(text) || 'section';
    const count = seen.get(id) ?? 0;
    seen.set(id, count + 1);
    if (count > 0) id = `${id}-${count}`;
    token.attrSet('id', id);

    const level = Number(token.tag.slice(1));
    if (level === 2 || level === 3) {
      (env.toc as TocEntry[]).push({ level: level as 2 | 3, id, text });
    }
    return self.renderToken(tokens, idx, options);
  };

  return md;
}

export function markdownPlugin(): Plugin {
  let md: MarkdownIt | null = null;

  return {
    name: 'scaffold-markdown',
    async transform(src, id) {
      if (!id.endsWith('.md')) return null;

      if (!md) md = createRenderer(await getHighlighter());
      const { data, content } = matter(src);
      const env = { toc: [] as TocEntry[] };
      const html = md.render(content, env);

      return {
        code: [
          `export const frontmatter = ${JSON.stringify(data)};`,
          `export const html = ${JSON.stringify(html)};`,
          `export const toc = ${JSON.stringify(env.toc)};`,
        ].join('\n'),
        map: null,
      };
    },
  };
}
