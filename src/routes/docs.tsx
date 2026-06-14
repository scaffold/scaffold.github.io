import { NavLink, useParams, type MetaFunction } from 'react-router';
import { DOCS_NAV, docs, docTitle } from '../lib/content';
import { NotFound } from '../components/NotFound';
import { pageMeta } from '../lib/meta';

export const meta: MetaFunction = ({ params }) => {
  const slug = params.slug ?? '';
  return docs.has(slug) ? pageMeta(`${docTitle(slug)} — Scaffold Docs`) : pageMeta('Docs — Scaffold');
};

export default function DocsPage() {
  const { slug = 'getting-started' } = useParams<{ slug: string }>();
  const doc = docs.get(slug);

  if (!doc) return <NotFound />;

  return (
    <main>
      <div className="docs-wrap">
        <aside className="docs-side">
          {DOCS_NAV.map((group) => (
            <div className="group" key={group.label}>
              <div className="group-label">{group.label}</div>
              {group.slugs.map((s) => (
                <NavLink key={s} to={`/docs/${s}`} className={({ isActive }) => (isActive ? 'active' : '')}>
                  {docTitle(s)}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>

        <article className="prose" dangerouslySetInnerHTML={{ __html: doc.html }} />

        <aside className="docs-toc">
          {doc.toc.length > 0 && (
            <>
              <div className="toc-label">On this page</div>
              {doc.toc.map((entry) => (
                <a key={entry.id} href={`#${entry.id}`} className={entry.level === 3 ? 'lvl-3' : ''}>
                  {entry.text}
                </a>
              ))}
            </>
          )}
        </aside>
      </div>
    </main>
  );
}
