import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function getMode(): 'light' | 'dark' {
  return document.documentElement.dataset.mode === 'dark' ? 'dark' : 'light';
}

export function Nav() {
  const [mode, setMode] = useState<'light' | 'dark'>(getMode);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    localStorage.setItem('scaffold-mode', mode);
  }, [mode]);

  return (
    <nav className="top">
      <Link to="/" className="brand">
        <img className="mark dark" src="/logomark-black.png" alt="Scaffold" />
        <img className="mark light" src="/logomark-white.png" alt="" />
        <span className="brandname">Scaffold</span>
        <span className="v">v0.1.0</span>
      </Link>
      <div className="sp" />
      <ul>
        <li><NavLink to="/how-it-works">How it works</NavLink></li>
        <li><NavLink to="/explorer">Explorer</NavLink></li>
        <li><NavLink to="/docs">Docs</NavLink></li>
        <li><NavLink to="/blog">Blog</NavLink></li>
        <li><NavLink to="/community">Community</NavLink></li>
      </ul>
      <button
        className="modebtn"
        onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}
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
