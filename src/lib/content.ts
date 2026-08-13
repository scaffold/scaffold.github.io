export interface MdModule {
  frontmatter: Record<string, unknown>;
  html: string;
  toc: { level: 2 | 3; id: string; text: string }[];
}

function bySlug(...groups: Record<string, unknown>[]): Map<string, MdModule> {
  const map = new Map<string, MdModule>();
  for (const modules of groups) {
    for (const [path, mod] of Object.entries(modules)) {
      const slug = path.split('/').pop()!.replace(/\.md$/, '');
      map.set(slug, mod as MdModule);
    }
  }
  return map;
}

// Both directories are served under /docs/:slug, so filenames must stay unique
// across them (a collision would silently win by load order).
export const docs = bySlug(
  import.meta.glob('../../content/docs/*.md', { eager: true }),
  import.meta.glob('../../content/spec/*.md', { eager: true }),
);
const allPosts = bySlug(
  import.meta.glob('../../content/blog/*.md', { eager: true }),
);

/**
 * Drafts are dropped from the production bundle. The prerender already skips
 * them (react-router.config.ts), but without this the SPA fallback would still
 * render one client-side for anyone who visits the URL directly. They stay
 * available under `npm run dev` so a draft can be previewed at its own URL.
 */
export const posts = import.meta.env.PROD
  ? new Map(
      [...allPosts].filter(([, mod]) => mod.frontmatter.published !== false),
    )
  : allPosts;

/** Sidebar order + grouping. Titles come from each doc's frontmatter. */
export const DOCS_NAV: { label: string; slugs: string[] }[] = [
  { label: 'Start', slugs: ['getting-started'] },
  { label: 'Understand', slugs: ['concepts', 'faq'] },
  // { label: 'Build', slugs: ['writing-contracts'] },
  { label: 'Spec', slugs: ['whitepaper'] },
];

export function docTitle(slug: string): string {
  const doc = docs.get(slug);
  return (doc?.frontmatter.title as string) ?? slug;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  published: boolean;
}

export function sortedPosts(): PostMeta[] {
  return [...posts.entries()]
    .map(([slug, mod]) => ({
      slug,
      title: (mod.frontmatter.title as string) ?? slug,
      date: (mod.frontmatter.date as string) ?? '',
      description: (mod.frontmatter.description as string) ?? '',
      published: (mod.frontmatter.published as boolean) ?? true,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return `${months[(m ?? 1) - 1]} ${d}, ${y}`;
}
