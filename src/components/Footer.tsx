import { Link } from 'react-router';

export function Footer() {
  return (
    <footer className="site">
      <div className="finner">
        <div className="big">
          Foundation <em>for</em> the distributed web.
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
            v0.1.0 · Testnet July 2026
          </span>
        </div>
        <div>
          <h5>Docs</h5>
          <ul>
            <li><Link to="/docs/getting-started">Getting started</Link></li>
            <li><Link to="/docs/concepts">Concepts</Link></li>
            <li><Link to="/docs/writing-contracts">Writing contracts</Link></li>
            <li><Link to="/docs/faq">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h5>Site</h5>
          <ul>
            <li><Link to="/how-it-works">How it works</Link></li>
            <li><Link to="/explorer">Explorer</Link></li>
            <li><Link to="/blog">Blog</Link></li>
            <li><Link to="/community">Community</Link></li>
          </ul>
        </div>
        <div>
          <h5>Community</h5>
          <ul>
            <li><a href="https://github.com/scaffold" target="_blank" rel="noreferrer">GitHub</a></li>
            <li><a href="https://discord.gg/scaffold" target="_blank" rel="noreferrer">Discord</a></li>
            <li><a href="https://bsky.app/profile/scaffold.io" target="_blank" rel="noreferrer">Bluesky</a></li>
            <li><a href="/blog/feed.xml">RSS</a></li>
          </ul>
        </div>
      </div>
      <div className="legal">
        <span>© 2026 Scaffold Protocol</span>
        <span>Apache 2.0 · Open source</span>
        <span>0xdda8ecfd22ea</span>
      </div>
    </footer>
  );
}
