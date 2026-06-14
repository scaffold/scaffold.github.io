import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { markdownPlugin } from './plugins/markdown';
import { rssPlugin } from './plugins/rss';

export default defineConfig({
  // reactRouter() provides the React/JSX transform, so no separate
  // @vitejs/plugin-react is needed. Our content plugins run alongside it.
  plugins: [reactRouter(), markdownPlugin(), rssPlugin()],
});
