import { Link } from 'react-router-dom';
import { formatDate, sortedPosts } from '../lib/content';
import { usePageMeta } from '../lib/usePageMeta';

export function BlogIndex() {
  usePageMeta('Blog — Scaffold', 'Notes from the Scaffold protocol — moving the cloud to the client.');
  const posts = sortedPosts();

  return (
    <main>
      <div className="page-head">
        <div className="inner">
          <div className="crumbs">
            <span>Scaffold</span>
            <span>Blog</span>
          </div>
          <h1>
            Field <em>notes</em>.
          </h1>
          <p className="sub">
            Progress reports, protocol design notes, and the occasional argument about
            distributed systems. <a href="/blog/feed.xml" style={{ textDecoration: 'underline' }}>RSS</a>.
          </p>
        </div>
      </div>

      <section className="band flush" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div className="post-list">
            {posts.map((post) => (
              <Link to={`/blog/${post.slug}`} className="post" key={post.slug}>
                <span className="date">{formatDate(post.date)}</span>
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
