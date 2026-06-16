// monaco-editor's package `exports` map ("./*") doesn't surface a `types`
// condition for the deep ESM entry, so bundler resolution can't find its
// declarations. Re-export the root types for the path we import.
declare module 'monaco-editor/esm/vs/editor/editor.api' {
  import * as monaco from 'monaco-editor';
  export = monaco;
}

// Basic-languages Monarch definitions (no bundled .d.ts under the exports map).
declare module 'monaco-editor/esm/vs/basic-languages/*' {
  import type { languages } from 'monaco-editor';
  export const conf: languages.LanguageConfiguration;
  export const language: languages.IMonarchLanguage;
}
