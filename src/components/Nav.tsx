import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router';

type Mode = 'light' | 'dark';

export function Nav() {
  // SSR/prerender renders with the 'light' default; the inline script in
  // root.tsx has already applied the real theme to <html> before hydration,
  // so we adopt it on mount (keeping the first client render matching the
  // server to avoid a hydration mismatch).
  const [mode, setMode] = useState<Mode>('light');

  useEffect(() => {
    setMode((document.documentElement.dataset.mode as Mode) || 'light');
  }, []);

  function toggle() {
    const next: Mode = mode === 'light' ? 'dark' : 'light';
    setMode(next);
    document.documentElement.dataset.mode = next;
    localStorage.setItem('scaffold-mode', next);
  }

  return (
    <nav className="top">
      <Link to="/" className="brand">
        <img className="mark dark" src="/logomark-black.png" alt="Scaffold" />
        <img className="mark light" src="/logomark-white.png" alt="" />
        <span className="brandname">Scaffold</span>
        <span className="v">v{__SCAFFOLD_VERSION__}</span>
      </Link>
      <div className="sp" />
      <ul>
        <li>
          <NavLink to="/docs/getting-started">Docs</NavLink>
        </li>
        <li>
          <NavLink to="/docs/whitepaper">Whitepaper</NavLink>
        </li>
        <li>
          <NavLink to="/blog">Blog</NavLink>
        </li>
        <li>
          <a
            href="https://github.com/scaffold/scaffold"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
      <button
        className="modebtn"
        onClick={toggle}
        title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
      >
        {mode === 'light' ? 'Dark' : 'Light'}
      </button>
      <Link to="/docs/getting-started" className="navbtn">
        Get started
      </Link>
    </nav>
  );
}
