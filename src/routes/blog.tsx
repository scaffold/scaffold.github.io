import { Link, type MetaFunction } from 'react-router';
import { formatDate, sortedPosts } from '../lib/content';
import { pageMeta } from '../lib/meta';

export const meta: MetaFunction = ({ location }) =>
  pageMeta(
    'Blog — Scaffold',
    'Notes from the Scaffold protocol — moving the cloud to the client.',
    location.pathname,
  );

export default function BlogIndex() {
  const posts = sortedPosts();

  return (
    <main>
      <div className="page-head">
        <div className="inner">
          <div className="crumbs">
            <span>Scaffold</span>
            <span>Blog</span>
          </div>
          <h1>Design and dev thoughts</h1>
        </div>
      </div>

      <section className="band flush" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          <div className="post-list">
            {posts.map(
              (post) =>
                post.published && (
                  <Link
                    to={`/blog/${post.slug}`}
                    className="post"
                    key={post.slug}
                  >
                    <span className="date">{formatDate(post.date)}</span>
                    <div>
                      <h3>{post.title}</h3>
                      <p>{post.description}</p>
                    </div>
                  </Link>
                ),
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
