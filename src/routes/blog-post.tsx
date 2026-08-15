import { useParams, type MetaFunction } from 'react-router';
import { formatDate, posts } from '../lib/content';
import { NotFound } from '../components/NotFound';
import { Prose } from '../components/Prose';
import { pageMeta } from '../lib/meta';

export const meta: MetaFunction = ({ params, location }) => {
  const post = params.slug ? posts.get(params.slug) : undefined;
  // Unknown slug renders <NotFound />, so the title has to agree with the body —
  // in production that includes drafts, which are dropped from `posts`.
  if (!post) return pageMeta('404 — Scaffold');
  const fm = post.frontmatter as { title?: string; description?: string };
  return pageMeta(
    fm.title ? `${fm.title} — Scaffold Blog` : 'Blog — Scaffold',
    fm.description,
    location.pathname,
  );
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? posts.get(slug) : undefined;

  if (!post) return <NotFound />;
  const fm = post.frontmatter as { title?: string; date?: string; author?: string };

  return (
    <main>
      <div className="article-wrap">
        <div className="post-head">
          <div className="meta">
            {fm.date ? formatDate(fm.date) : ''}
            {fm.author ? ` · ${fm.author}` : ''}
          </div>
          <h1>{fm.title}</h1>
        </div>
        <Prose html={post.html} />
      </div>
    </main>
  );
}
