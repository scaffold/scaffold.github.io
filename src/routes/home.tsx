import { Link, type MetaFunction } from 'react-router';
import { CodeWindow } from '../components/CodeWindow';
import { EmailSignup } from '../components/EmailSignup';
import { InstallCommand } from '../components/InstallCommand';
import { pageMeta } from '../lib/meta';

export const meta: MetaFunction = () =>
  pageMeta(
    'Scaffold — Move the cloud to the client',
    'Scaffold is a browser-native protocol that turns your users into infrastructure. WASM contracts, WebRTC transport, results verified by economic collateral.',
  );

export default function Home() {
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
              <EmailSignup />
            </div>
            <div>
              <CodeWindow />
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
            Every modern browser runs WebAssembly, speaks WebRTC, and has compute to spare. A request
            shouldn't have to cross a continent to be answered — Scaffold routes it to the nearest
            capable peer, often a machine on the same street. The network grows with every user who
            opens your app, and there's no origin to scale or to go down.
          </p>
        </div>
      </section>

      {/* ============ Scaffold provides ============ */}
      <section className="band">
        <div className="section-inner">
          <h2 className="band-title">Scaffold provides four things.</h2>
          <div className="manifesto">
            <div className="item">
              <span className="idx">01 · Mesh</span>
              <h3>A peer-to-peer mesh.</h3>
              <p>
                Your users connect directly to one another over WebRTC, forming a network with no
                server in the middle.
              </p>
            </div>
            <div className="item">
              <span className="idx">02 · Routing</span>
              <h3>A request/response protocol.</h3>
              <p>
                Every request is answered by the closest, most efficient peers that hold the
                contract — not by a distant datacenter.
              </p>
            </div>
            <div className="item">
              <span className="idx">03 · Trust</span>
              <h3>Collateralization &amp; verification.</h3>
              <p>
                Peers stake collateral on the answers they return. Incorrect responses are detected
                and penalized, with the cost amortized across the network.
              </p>
            </div>
            <div className="item">
              <span className="idx">04 · Currency</span>
              <h3>A consensus layer.</h3>
              <p>
                A built-in currency settles the low-latency, low-finality micropayments that
                collateral requires — fast enough to back every request.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ The API — three methods ============ */}
      <section className="band sunken">
        <div className="section-inner">
          <div className="section-head">
            <div className="num">The API</div>
            <h2>Three methods.</h2>
          </div>
          <div className="api-methods">
            <div className="m">
              <div className="sig"><span className="fn">fetch</span>(req) <span className="ret">→ Result</span></div>
              <p>
                Ask the network for a value. The request is routed to the nearest peer holding the
                contract, which runs it and returns a verified, collateralized result.
              </p>
            </div>
            <div className="m">
              <div className="sig"><span className="fn">put</span>(bytes) <span className="ret">→ Hash</span></div>
              <p>
                Publish a contract or a value to the network. It's addressed by the hash of its
                bytes, so anyone can fetch it by that address.
              </p>
            </div>
            <div className="m">
              <div className="sig"><span className="fn">send</span>(msg) <span className="ret">→ void</span></div>
              <p>
                Deliver a message to a peer or contract — fire-and-forget, for events, payments, and
                streaming updates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ Contract development environment ============ */}
      <section className="band">
        <div className="section-inner">
          <div className="split-2">
            <div className="copy">
              <span className="ide-tag">In progress</span>
              <h2>A contract development environment.</h2>
              <p>
                Write, compile, publish, and inspect contracts without leaving the browser — then
                watch them resolve across the live network in the explorer.
              </p>
              <Link to="/explorer" className="btn secondary">
                Open the explorer →
              </Link>
            </div>
            <Link
              to="/explorer"
              className="ide-placeholder"
              aria-label="Explorer preview — coming with the testnet"
            >
              <span className="status">● Preview</span>
              <span className="title">Explorer</span>
              <span className="hint">Live with the public testnet · July 2026</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============ Get started (accent) ============ */}
      <section className="band cta-final">
        <div className="section-inner">
          <h2>Get started.</h2>
          <p>
            One import and a dozen lines of code. No servers to rent, no regions to pick, no bill
            that grows with your success.
          </p>
          <InstallCommand command="npm install @scaffold/core" />
          <div className="ctas">
            <a
              href="https://github.com/scaffold"
              target="_blank"
              rel="noreferrer"
              className="btn on-accent"
            >
              ★ Star us on GitHub
            </a>
            <Link to="/docs/getting-started" className="btn on-accent-ghost">
              See some examples →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
