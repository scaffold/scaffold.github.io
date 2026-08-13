import { Link } from 'react-router';

export function NotFound() {
  return (
    <main>
      <div className="notfound">
        <div className="inner">
          <div className="crumbs">
            <span>Scaffold</span>
            <span>404</span>
          </div>
          <h1>
            Page <em>not found</em>.
          </h1>
          <p
            className="sub"
            style={{
              marginTop: 24,
              fontSize: 'var(--fs-xl)',
              color: 'var(--fg-2)',
            }}
          >
            It's not your fault. You probably just clicked on a link. We're
            sorry.
          </p>
          <div style={{ marginTop: 32 }}>
            <Link to="/" className="btn primary">
              ← I just wanna go home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
