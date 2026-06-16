import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { markdownPlugin } from './plugins/markdown';
import { rssPlugin } from './plugins/rss';

// Local scaffold.io package worktree, served to the dev runtime via `/@fs/` so
// the hero code's `@scaffold/core` import map can resolve to it. Dev/local only
// and machine-specific — see the import map in src/root.tsx. (TODO: replace with
// a published / browser-bundled package for production.)
const SCAFFOLD_PKG_DIR =
  '/Users/joel/proj/scaffold/scaffold/.claude/worktrees/js-compiler-out-of-bundle/npm';

export default defineConfig({
  // reactRouter() provides the React/JSX transform, so no separate
  // @vitejs/plugin-react is needed. Our content plugins run alongside it.
  plugins: [reactRouter(), markdownPlugin(), rssPlugin()],
  server: {
    fs: {
      // Keep the project root allowed and additionally expose the scaffold.io
      // package worktree for `/@fs/` access from the in-browser code runner.
      allow: ['.', SCAFFOLD_PKG_DIR],
    },
  },
});
