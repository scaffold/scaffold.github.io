/**
 * Client-only Monaco bootstrap for the hero code window.
 *
 * This module is loaded with a dynamic import() from inside a useEffect, so it
 * never runs during the Node prerender (Monaco needs a DOM + workers). Importing
 * the trimmed `editor.api` plus only the language contributions we use keeps the
 * chunk small; the workers are wired through Vite's `?worker` imports.
 */
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

// Only the languages used by the hero snippets. We use the lightweight Monarch
// tokenizers (basic-languages) rather than the full TS language service — the
// hero only needs syntax coloring, and this avoids pulling in the multi-megabyte
// ts.worker / IntelliSense machinery. We import the definitions directly (rather
// than the lazy `.contribution`) so we can register them with a customized
// tokenizer and avoid a load-order race.
import { conf as tsConf, language as tsLang } from 'monaco-editor/esm/vs/basic-languages/typescript/typescript';
import { conf as goConf, language as goLang } from 'monaco-editor/esm/vs/basic-languages/go/go';
import { conf as rustConf, language as rustLang } from 'monaco-editor/esm/vs/basic-languages/rust/rust';
import { conf as shellConf, language as shellLang } from 'monaco-editor/esm/vs/basic-languages/shell/shell';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

// Monarch tags every identifier the same, so method calls and variables share a
// colour. Prepend a rule that tags an identifier as `function` when it's
// immediately followed by `(` — i.e. a call or definition (fetch(), log(),
// hello()) — while keywords keep their colour and plain variables (scaffold,
// greeter; not followed by `(`) fall through to the default identifier rule.
function withCallHighlighting(language: monaco.languages.IMonarchLanguage): monaco.languages.IMonarchLanguage {
  const callRule: monaco.languages.IMonarchLanguageRule = [
    /[a-zA-Z_$][\w$]*(?=\s*\()/,
    { cases: { '@keywords': 'keyword', '@default': 'function' } },
  ];
  return {
    ...language,
    tokenizer: { ...language.tokenizer, root: [callRule, ...language.tokenizer.root] },
  };
}

function registerLanguage(
  id: string,
  conf: monaco.languages.LanguageConfiguration,
  language: monaco.languages.IMonarchLanguage,
  highlightCalls: boolean,
) {
  monaco.languages.register({ id });
  monaco.languages.setLanguageConfiguration(id, conf);
  monaco.languages.setMonarchTokensProvider(id, highlightCalls ? withCallHighlighting(language) : language);
}

registerLanguage('typescript', tsConf, tsLang, true);
registerLanguage('go', goConf, goLang, true);
registerLanguage('rust', rustConf, rustLang, true);
registerLanguage('shell', shellConf, shellLang, false);

const THEME = 'scaffold';

/**
 * Define (and apply) the Monaco theme from the live design tokens, so the
 * editor matches the `--code-*` palette in both light and dark mode. Call this
 * on first create and again whenever <html data-mode> flips.
 */
export function applyScaffoldTheme() {
  const s = getComputedStyle(document.documentElement);
  const val = (name: string) => s.getPropertyValue(name).trim();
  const tok = (name: string) => val(name).replace('#', '');

  // inherit:false so unmapped tokens fall to the default (--code-fg) rather
  // than vs-dark's off-theme blues/purples (e.g. Go's `string`/`byte`). Rules
  // match by scope prefix, so `keyword` also covers `keyword.operator`, etc.
  monaco.editor.defineTheme(THEME, {
    base: 'vs-dark', // the code panel is dark in both site modes
    inherit: false,
    rules: [
      { token: '', foreground: tok('--code-fg') },
      { token: 'comment', foreground: tok('--code-com'), fontStyle: 'italic' },
      { token: 'keyword', foreground: tok('--code-kw') },
      { token: 'operator', foreground: tok('--code-punct') },
      { token: 'delimiter', foreground: tok('--code-punct') },
      { token: 'string', foreground: tok('--code-str') },
      { token: 'regexp', foreground: tok('--code-str') },
      { token: 'number', foreground: tok('--code-num') },
      { token: 'type', foreground: tok('--code-fn') },
      { token: 'function', foreground: tok('--code-fn') },
      { token: 'identifier', foreground: tok('--code-fg') },
      { token: 'variable', foreground: tok('--code-fg') },
      { token: 'annotation', foreground: tok('--code-kw') }, // rust #[..], TS decorators
      { token: 'attribute.name', foreground: tok('--code-fn') },
      { token: 'attribute.value', foreground: tok('--code-str') },
      { token: 'tag', foreground: tok('--code-kw') },
    ],
    colors: {
      'editor.background': val('--code-bg'),
      'editor.foreground': val('--code-fg'),
      'editorCursor.foreground': val('--accent'),
      'editor.selectionBackground': val('--accent') + '40',
      'editor.inactiveSelectionBackground': val('--accent') + '22',
      'editor.lineHighlightBackground': '#00000000',
      'editor.lineHighlightBorder': '#00000000',
      'editorLineNumber.foreground': '#00000000',
      'editorGutter.background': val('--code-bg'),
      'editorWidget.background': val('--code-bg'),
      'editorIndentGuide.background1': '#00000000',
      'editorIndentGuide.activeBackground1': '#00000000',
      'scrollbarSlider.background': val('--code-fg') + '20',
      'scrollbarSlider.hoverBackground': val('--code-fg') + '33',
      'scrollbarSlider.activeBackground': val('--code-fg') + '44',
      // Force every bracket-pair-colorization level to the muted punctuation
      // colour. The `enabled: false` option doesn't reliably stop the feature
      // from rendering, so we neutralise its palette here (gold/purple/blue → punct).
      'editorBracketHighlight.foreground1': val('--code-punct'),
      'editorBracketHighlight.foreground2': val('--code-punct'),
      'editorBracketHighlight.foreground3': val('--code-punct'),
      'editorBracketHighlight.foreground4': val('--code-punct'),
      'editorBracketHighlight.foreground5': val('--code-punct'),
      'editorBracketHighlight.foreground6': val('--code-punct'),
      'editorBracketHighlight.unexpectedBracket.foreground': val('--code-punct'),
      // Cursor-adjacent bracket match: soft semi-transparent accent fill, no box.
      'editorBracketMatch.background': val('--accent') + '40',
      'editorBracketMatch.border': '#00000000',
    },
  });
  monaco.editor.setTheme(THEME);
}

/** Shared editor options that reproduce the bare, paddinged snippet look. */
export const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  theme: THEME,
  fontFamily: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 13,
  lineHeight: 22,
  fontLigatures: true,
  lineNumbers: 'off',
  lineDecorationsWidth: 24,
  lineNumbersMinChars: 0,
  glyphMargin: false,
  folding: false,
  minimap: { enabled: false },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  renderLineHighlight: 'none',
  occurrencesHighlight: 'off',
  selectionHighlight: false,
  matchBrackets: 'always', // highlight the bracket next to the cursor + its pair
  // Off — its rainbow levels (gold/orchid/blue) bypass the token theme and
  // clash with the palette; brackets should use the `delimiter` colour.
  bracketPairColorization: { enabled: false },
  scrollBeyondLastLine: false,
  scrollbar: { useShadows: false, verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
  padding: { top: 24, bottom: 24 },
  wordWrap: 'off',
  tabSize: 2,
  contextmenu: false,
  cursorBlinking: 'smooth',
  smoothScrolling: true,
  automaticLayout: true,
  roundedSelection: false,
};

export { monaco };
