import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { markdownPlugin } from './plugins/markdown';
import { rssPlugin } from './plugins/rss';

export default defineConfig({
  plugins: [react(), markdownPlugin(), rssPlugin()],
});
