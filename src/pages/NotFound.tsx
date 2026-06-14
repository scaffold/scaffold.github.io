import { Link } from 'react-router-dom';
import { usePageMeta } from '../lib/usePageMeta';

export function NotFound() {
  usePageMeta('404 — Scaffold');

  return (
    <main>
      <div className="notfound">
        <div className="inner">
          <div className="crumbs">
            <span>Scaffold</span>
            <span>404</span>
          </div>
          <h1>
            Block <em>not found</em>.
          </h1>
          <p className="sub" style={{ marginTop: 24, maxWidth: '48ch', fontSize: 'var(--fs-xl)', color: 'var(--fg-2)' }}>
            No peer on the network has this address. It may have never been published.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link to="/" className="btn primary">← Back to the root</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
