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
// `typescript` tokenizer (basic-languages) rather than the full TS language
// service — the hero only needs syntax coloring, and this avoids pulling in the
// multi-megabyte ts.worker / IntelliSense machinery.
import 'monaco-editor/esm/vs/basic-languages/rust/rust.contribution';
import 'monaco-editor/esm/vs/basic-languages/go/go.contribution';
import 'monaco-editor/esm/vs/basic-languages/shell/shell.contribution';
import 'monaco-editor/esm/vs/basic-languages/typescript/typescript.contribution';

import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';

self.MonacoEnvironment = {
  getWorker() {
    return new EditorWorker();
  },
};

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

  monaco.editor.defineTheme(THEME, {
    base: 'vs-dark', // the code panel is dark in both site modes
    inherit: true,
    rules: [
      { token: '', foreground: tok('--code-fg') },
      { token: 'comment', foreground: tok('--code-com'), fontStyle: 'italic' },
      { token: 'keyword', foreground: tok('--code-kw') },
      { token: 'keyword.operator', foreground: tok('--code-punct') },
      { token: 'operator', foreground: tok('--code-punct') },
      { token: 'string', foreground: tok('--code-str') },
      { token: 'string.escape', foreground: tok('--code-str') },
      { token: 'number', foreground: tok('--code-num') },
      { token: 'type', foreground: tok('--code-fn') },
      { token: 'type.identifier', foreground: tok('--code-fn') },
      { token: 'identifier', foreground: tok('--code-fg') },
      { token: 'delimiter', foreground: tok('--code-punct') },
      { token: 'delimiter.parenthesis', foreground: tok('--code-punct') },
      { token: 'delimiter.bracket', foreground: tok('--code-punct') },
      { token: 'delimiter.square', foreground: tok('--code-punct') },
      { token: 'delimiter.angle', foreground: tok('--code-punct') },
      { token: 'annotation', foreground: tok('--code-kw') },
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
  matchBrackets: 'never',
  guides: { indentation: false },
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
