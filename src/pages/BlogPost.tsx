import { useParams } from 'react-router-dom';
import { formatDate, posts } from '../lib/content';
import { usePageMeta } from '../lib/usePageMeta';
import { NotFound } from './NotFound';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? posts.get(slug) : undefined;

  const title = (post?.frontmatter.title as string) ?? 'Blog';
  usePageMeta(`${title} — Scaffold Blog`, post?.frontmatter.description as string | undefined);

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
        <article className="prose" dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    </main>
  );
}
