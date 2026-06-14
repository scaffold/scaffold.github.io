import type { MetaDescriptor } from 'react-router';

/** Build a route's <head> tags: title + description + matching OG tags. */
export function pageMeta(title: string, description?: string): MetaDescriptor[] {
  const tags: MetaDescriptor[] = [{ title }, { property: 'og:title', content: title }];
  if (description) {
    tags.push({ name: 'description', content: description });
    tags.push({ property: 'og:description', content: description });
  }
  return tags;
}
