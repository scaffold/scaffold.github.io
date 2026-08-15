import MarkdownIt from 'markdown-it';
import matter from 'gray-matter';
import { addClassToHast, createHighlighter, createCssVariablesTheme, type Highlighter } from 'shiki';
import type { Element } from 'hast';
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

const LANGS = ['typescript', 'tsx', 'javascript', 'python', 'rust', 'bash', 'json', 'toml', 'wasm'];

/** Languages where a leading `> ` marks a shell prompt rather than a redirect. */
const SHELL_LANGS = new Set(['bash', 'sh', 'shell', 'zsh', 'console']);

/** The prompt only. The captured indent stays, so wrapped commands keep theirs. */
const PROMPT_RE = /^(\s*)> /;

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

interface FenceLine {
  /** Line text with the shell prompt, if any, already removed. */
  text: string;
  prompt: boolean;
  output: boolean;
}

/**
 * Reads `output=3` / `output=3,4,5` off a fence's info string. Those 1-based
 * lines are the program's response rather than something you'd ever type, so
 * they render dimmed, resist selection, and stay off the clipboard.
 */
function parseOutputLines(attrs: string): Set<number> {
  const match = /(?:^|\s)output=([\d,\s]+)/.exec(attrs);
  if (!match) return new Set();
  return new Set(
    match[1]
      .split(',')
      .map((n) => Number.parseInt(n, 10))
      .filter((n) => Number.isInteger(n) && n > 0),
  );
}

function splitFence(source: string, isShell: boolean, outputLines: Set<number>): FenceLine[] {
  return source
    .replace(/\s+$/, '')
    .split('\n')
    .map((raw, i) => {
      const output = outputLines.has(i + 1);
      const prompt = isShell && !output && PROMPT_RE.test(raw);
      return { text: prompt ? raw.replace(PROMPT_RE, '$1') : raw, prompt, output };
    });
}

/**
 * What the copy button writes to the clipboard. When a block mixes prompted
 * commands with anything else, only the prompted lines survive — the
 * sphinx-copybutton rule — so a session transcript copies as a runnable
 * command and nothing else.
 */
function clipboardText(lines: FenceLine[]): string {
  const runnable = lines.filter((line) => !line.output);
  const prompted = runnable.filter((line) => line.prompt);
  return (prompted.length > 0 ? prompted : runnable).map((line) => line.text).join('\n');
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Newlines survive an attribute value, but encoding them avoids the question. */
function escapeAttr(value: string): string {
  return escapeHtml(value).replace(/\n/g, '&#10;');
}

function promptSpan(): Element {
  return {
    type: 'element',
    tagName: 'span',
    properties: { class: 'prompt' },
    children: [{ type: 'text', value: '> ' }],
  };
}

const COPY_ICON =
  '<svg class="i-copy" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" aria-hidden="true"><path d="M10.5 5.5V2.5h-8v8h3"/><rect x="5.5" y="5.5" width="8" height="9"/></svg>';
const CHECK_ICON =
  '<svg class="i-check" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8.5 6.5 12 13 5"/></svg>';

/**
 * A fence becomes `<div class="code-block">` wrapping Shiki's `<pre>` plus a
 * copy button. The button carries its payload in `data-copy` — precomputed
 * here so the client never has to re-derive it from the DOM (src/components/
 * Prose.tsx just reads the attribute).
 */
function renderFence(highlighter: Highlighter, info: string, source: string): string {
  const [name = '', ...rest] = info.trim().split(/\s+/);
  const lang = highlighter.getLoadedLanguages().includes(name) ? name : 'text';
  const lines = splitFence(source, SHELL_LANGS.has(name), parseOutputLines(rest.join(' ')));

  let code: string;
  try {
    // Prompts come off before highlighting — bash otherwise reads `>` as a
    // redirect and mangles the rest of the line — then go back as their own
    // spans, which is what lets CSS drop them from a selection.
    code = highlighter.codeToHtml(lines.map((line) => line.text).join('\n'), {
      lang,
      theme: 'scaffold-vars',
      transformers: [
        {
          line(node, lineNumber) {
            const line = lines[lineNumber - 1];
            if (!line) return;
            if (line.output) addClassToHast(node, 'output');
            if (line.prompt) node.children.unshift(promptSpan());
          },
        },
      ],
    });
  } catch {
    code = `<pre class="shiki"><code>${escapeHtml(source.replace(/\s+$/, ''))}</code></pre>`;
  }

  const button =
    `<button type="button" class="code-copy" aria-label="Copy code"` +
    ` data-copy="${escapeAttr(clipboardText(lines))}">${COPY_ICON}${CHECK_ICON}</button>`;
  return `<div class="code-block">${code}${button}</div>\n`;
}

function createRenderer(highlighter: Highlighter) {
  const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

  md.renderer.rules.fence = (tokens, idx) =>
    renderFence(highlighter, tokens[idx].info, tokens[idx].content);

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
  let isProduction = false;

  return {
    name: 'scaffold-markdown',
    configResolved(config) {
      isProduction = config.isProduction;
    },
    async transform(src, id) {
      if (!id.endsWith('.md')) return null;

      const { data: fm } = matter(src);

      // A draft's body must not reach the client bundle at all. `posts` is built
      // with an eager import.meta.glob, so filtering that map (src/lib/content.ts)
      // stops the page rendering but still ships the prose inside a JS chunk for
      // anyone who greps it. Emit the frontmatter and an empty body instead —
      // dev keeps the real content so drafts stay previewable.
      if (isProduction && fm.published === false) {
        return {
          code: [
            `export const frontmatter = ${JSON.stringify(fm)};`,
            `export const html = "";`,
            `export const toc = [];`,
          ].join('\n'),
          map: null,
        };
      }

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
