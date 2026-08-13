import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="site">
      <div className="finner">
        <div className="big">
          Move the cloud to the <em>client</em>.
          <span
            className="u-mono"
            style={{
              fontSize: 11,
              letterSpacing: '.1em',
              textTransform: 'uppercase',
              color: 'var(--fg-3)',
              display: 'block',
              marginTop: 24,
            }}
          >
            v{__SCAFFOLD_VERSION__}
          </span>
        </div>
        <div>
          <h5>Docs</h5>
          <ul>
            <li>
              <Link to="/docs/getting-started">Getting started</Link>
            </li>
            <li>
              <Link to="/docs/concepts">Concepts</Link>
            </li>
            <li>
              <Link to="/docs/faq">FAQ</Link>
            </li>
          </ul>
        </div>
        <div>
          <h5>Site</h5>
          <ul>
            <li>
              <Link to="/blog">Blog</Link>
            </li>
          </ul>
        </div>
        <div>
          <h5>Community</h5>
          <ul>
            <li>
              <a
                href="https://github.com/scaffold/scaffold"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
            {/*<li>
              <a href="/blog/feed.xml">RSS</a>
            </li>*/}
          </ul>
        </div>
      </div>
      <div className="legal">
        <span>© 2026 Scaffold Protocol</span>
        <span>Apache 2.0 · Open source</span>
        <span>Created by Joel Walker</span>
      </div>
    </footer>
  );
}
