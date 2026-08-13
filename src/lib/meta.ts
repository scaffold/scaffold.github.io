import type { MetaDescriptor } from 'react-router';

// Also defined in plugins/rss.ts, which runs in the Node build context and
// can't import from here.
const SITE = 'https://scaffold.io';

/** Absolute URL for a route path, without a trailing slash. */
function canonical(path?: string): string {
  if (!path || path === '/') return SITE;
  return SITE + path.replace(/\/+$/, '');
}

/**
 * Build a route's <head> tags: title + description + matching OG tags.
 *
 * Every leaf route calls this, which is why the site-wide OG tags live here
 * rather than in root.tsx — a route's `meta` export *replaces* its parent's
 * instead of merging, so anything declared only at the root never renders.
 *
 * Pass `path` (usually `location.pathname`) so og:url points at the page being
 * shared rather than the site root.
 */
export function pageMeta(
  title: string,
  description?: string,
  path?: string,
): MetaDescriptor[] {
  const tags: MetaDescriptor[] = [
    { title },
    { property: 'og:title', content: title },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: canonical(path) },
  ];
  if (description) {
    tags.push({ name: 'description', content: description });
    tags.push({ property: 'og:description', content: description });
  }
  return tags;
}
