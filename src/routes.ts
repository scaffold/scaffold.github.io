import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('how-it-works', 'routes/how-it-works.tsx'),
  route('explorer', 'routes/explorer.tsx'),
  route('community', 'routes/community.tsx'),
  route('docs', 'routes/docs-index.tsx'),
  route('docs/:slug', 'routes/docs.tsx'),
  route('blog', 'routes/blog.tsx'),
  route('blog/:slug', 'routes/blog-post.tsx'),
  route('*', 'routes/not-found.tsx'),
] satisfies RouteConfig;
