import { Link } from 'react-router-dom';
import { CodeWindow } from '../components/CodeWindow';
import { usePageMeta } from '../lib/usePageMeta';

export function Home() {
  usePageMeta(
    'Scaffold — Foundation for the distributed web',
    'Scaffold is a browser-native protocol that turns your users into infrastructure. WASM contracts, WebRTC transport, results verified by economic collateral.',
  );

  return (
    <main>
      {/* ============ HERO ============ */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-grid">
            <div>
              <h1>
                <span className="l">Move the cloud</span>
                <span className="l">to the <em>client</em>.</span>
              </h1>
              <p className="sub">
                Scaffold is a browser-native protocol that turns your users into infrastructure.
                Contracts are WebAssembly, transport is WebRTC, and every result is backed by
                economic collateral. Your first app is one import and a dozen lines of code.
              </p>
              <div className="ctas">
                <Link to="/docs/getting-started" className="btn primary">
                  Get started →
                </Link>
                <Link to="/how-it-works" className="btn secondary">
                  How it works
                </Link>
              </div>
            </div>
            <div>
              <CodeWindow />
              <div className="install-note">npm install @scaffold/core</div>
            </div>
          </div>

          <div className="hero-spec">
            <div className="cell"><span className="k">Runtime</span><span className="v">WASM</span></div>
            <div className="cell"><span className="k">Transport</span><span className="v">WebRTC + WS</span></div>
            <div className="cell"><span className="k">Consensus</span><span className="v">Tree of verified compute</span></div>
            <div className="cell"><span className="k">License</span><span className="v">Apache 2.0</span></div>
          </div>
        </div>
      </section>

      {/* ============ The cloud is a not-so-necessary evil ============ */}
      <section className="band">
        <div className="section-inner">
          <div className="two-col">
            <h2>The cloud is a not‑so‑necessary evil.</h2>
            <div className="body">
              <p>
                Cloud costs are now the #2 expense at midsize IT companies — behind only payroll. On
                average, organizations spend 10% of revenues on cloud services; AWS alone made over
                $110B last year.
                <a
                  className="fn-ref"
                  href="https://www.cloudzero.com/blog/cloud-computing-statistics/"
                  target="_blank"
                  rel="noreferrer"
                >
                  1
                </a>
              </p>
              <p>
                All of it buys the same thing: computers that sit far away from your users. Scaffold
                is a way to build products that don't run on the conventional cloud at all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ The user is the cloud (inverted) ============ */}
      <section className="band invert">
        <div className="section-inner">
          <h2 className="lead">
            The user <em>is</em> the cloud.
          </h2>
          <p className="lead-sub">
            Every modern browser runs WebAssembly, speaks WebRTC, and has compute to spare. Scaffold
            bridges compute, consensus, and trust — and turns your users into your infrastructure.
          </p>
        </div>
      </section>

      {/* ============ A request shouldn't cross a continent ============ */}
      <section className="band">
        <div className="section-inner">
          <div className="split-2">
            <div className="copy">
              <h2>A request shouldn't cross a continent.</h2>
              <p>
                Talking to a datacenter means paying the speed-of-light tax on every round trip. A
                Scaffold request is routed over WebRTC to the nearest peer that holds the contract —
                often a machine on the same street, sometimes the same room.
              </p>
              <p>
                Capacity scales the same way: every user who opens your app brings their own hardware
                to it. The network grows in proportion to demand, with no scaling plan and nothing to
                go down.
              </p>
            </div>
            <div className="diagram-panel route" aria-hidden="true">
              <svg viewBox="0 0 560 360" role="img" aria-label="A request through the origin cloud crosses ISP, backbone, exchange, and a distant region; a Scaffold request reaches a nearby peer directly.">
                {/* Origin-cloud route */}
                <text x="0" y="22" className="dlabel">VIA THE ORIGIN CLOUD</text>
                <text x="280" y="50" textAnchor="middle" className="dtiny dmute">~12,000 km round trip</text>
                <g className="dnode">
                  <rect x="2" y="64" width="74" height="36" />
                  <text x="39" y="86" textAnchor="middle">YOU</text>
                </g>
                <rect className="dsmall" x="168" y="68" width="28" height="28" />
                <text x="182" y="114" textAnchor="middle" className="dtiny">ISP</text>
                <rect className="dsmall" x="278" y="68" width="28" height="28" />
                <text x="292" y="114" textAnchor="middle" className="dtiny">BACKBONE</text>
                <rect className="dsmall" x="388" y="68" width="28" height="28" />
                <text x="402" y="114" textAnchor="middle" className="dtiny">IX</text>
                <g className="dnode">
                  <rect x="468" y="64" width="90" height="36" />
                  <text x="513" y="86" textAnchor="middle">US-EAST-1</text>
                </g>
                <path
                  className="ddot"
                  d="M76 82 L168 82 M196 82 L278 82 M306 82 L388 82 M416 82 L468 82"
                />

                {/* Scaffold route */}
                <text x="0" y="232" className="dlabel">VIA SCAFFOLD</text>
                <g className="dnode">
                  <rect x="2" y="252" width="74" height="36" />
                  <text x="39" y="274" textAnchor="middle">YOU</text>
                </g>
                <path className="dsolid" d="M76 270 L176 270" />
                <g className="dnode accent">
                  <rect x="176" y="252" width="120" height="36" />
                  <text x="236" y="274" textAnchor="middle">NEAREST PEER</text>
                </g>
                <text x="149" y="312" textAnchor="middle" className="dtiny dmute">the browser next door</text>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Built from primitives (sunken) ============ */}
      <section className="band sunken">
        <div className="section-inner">
          <div className="split-2">
            <div className="copy">
              <h2>Built from primitives the web finally has.</h2>
              <p>
                WebAssembly gives every browser a deterministic runtime. WebRTC connects them
                directly. Web Workers keep contracts off the main thread. Scaffold composes them into
                a tree of verified compute, where correctness is enforced by collateral — not by a
                central authority, and not by a blockchain.
              </p>
              <Link to="/how-it-works" className="btn secondary">
                How it works →
              </Link>
            </div>
            <div className="spec-list">
              <div className="row"><span className="k">API</span><span className="v">fetch()</span></div>
              <div className="row"><span className="k">Contract runtime</span><span className="v">WebAssembly</span></div>
              <div className="row"><span className="k">Transport</span><span className="v">WebRTC + WebSockets</span></div>
              <div className="row"><span className="k">Parallelism</span><span className="v">Web Workers</span></div>
              <div className="row"><span className="k">Data structure</span><span className="v">A tree of immutable, verified blocks</span></div>
              <div className="row"><span className="k">Trust vehicle</span><span className="v">Collateral, not consensus</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Applications change shape ============ */}
      <section className="band">
        <div className="section-inner">
          <h2 className="band-title">Applications change shape under Scaffold.</h2>
          <div className="app-rows">
            <div className="row">
              <span className="label">Social</span>
              <div>
                <h3>No origin to silence.</h3>
                <p>
                  A signed post resolves to the same content from any peer on the network; the
                  author's identity is the address. Fully distributed, always up, and controlled by
                  the user.
                </p>
              </div>
            </div>
            <div className="row">
              <span className="label">Shared state</span>
              <div>
                <h3>Multiplayer without a server.</h3>
                <p>
                  Deterministic WebAssembly plus quick consensus lets every player's browser agree on
                  shared state — a game, a document, a whiteboard — with no central authority hosting
                  the session. The players are the database.
                </p>
              </div>
            </div>
            <div className="row">
              <span className="label">Marketplaces</span>
              <div>
                <h3>Call your ride.</h3>
                <p>
                  A mobile app and a set of contracts handle drivers bidding, pickup, drop-off
                  verification, and payment — an entire marketplace with zero infrastructure behind
                  it.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Final CTA (accent) ============ */}
      <section className="band cta-final">
        <div className="section-inner">
          <h2>
            Ship your app by calling <span className="box">fetch()</span>.
          </h2>
          <p>
            Scaffold takes care of the rest. No servers to rent, no regions to pick, no bill that
            grows with your success.
          </p>
          <div className="ctas">
            <Link to="/docs/getting-started" className="btn on-accent">
              Get started →
            </Link>
            <Link to="/docs" className="btn on-accent-ghost">
              Read the docs
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
