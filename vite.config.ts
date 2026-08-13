import { readFileSync } from 'node:fs';
import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { markdownPlugin } from './plugins/markdown';
import { rssPlugin } from './plugins/rss';

// The hero runner resolves `scaffold.io` through a page-level import map that
// names a CDN build at an explicit version (see src/root.tsx). Derive that
// version from the dependency range here so the import map and the installed
// package can't drift apart — bumping package.json is enough.
const pkg = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
) as { dependencies: Record<string, string> };
const scaffoldVersion = pkg.dependencies['scaffold.io'].replace(/^[^\d]*/, '');

export default defineConfig({
  // reactRouter() provides the React/JSX transform, so no separate
  // @vitejs/plugin-react is needed. Our content plugins run alongside it.
  plugins: [reactRouter(), markdownPlugin(), rssPlugin()],
  define: {
    __SCAFFOLD_VERSION__: JSON.stringify(scaffoldVersion),
  },
});
