import { Link } from 'react-router-dom';
import { SectionHead } from '../components/SectionHead';
import { usePageMeta } from '../lib/usePageMeta';

export function HowItWorks() {
  usePageMeta(
    'How it works — Scaffold',
    'The life of a Scaffold request: publish a WASM contract, call it with fetch(), and get a collateralized result from the nearest peer.',
  );

  return (
    <main>
      <div className="page-head">
        <div className="inner">
          <div className="crumbs">
            <span>Scaffold</span>
            <span>How it works</span>
          </div>
          <h1>
            The life of a <em>request</em>.
          </h1>
          <p className="sub">
            Scaffold has one API — <code>fetch()</code> — and one promise: the result comes back
            fast, from the nearest machine that can produce it, with money staked on its
            correctness. Here is everything that happens in between.
          </p>
        </div>
      </div>

      {/* ============ §01 LIFECYCLE ============ */}
      <section className="band">
        <div className="section-inner">
          <SectionHead
            num="§ 01 — Lifecycle"
            title={<>Five steps,<br />one round trip.</>}
          />
          <div className="steps">
            <div className="step">
              <span className="idx">01 · PUBLISH</span>
              <h3>Contract → hash</h3>
              <p>
                A developer compiles a contract to WebAssembly and publishes it with{' '}
                <code>scaffold put</code>. The network addresses it by the hash of its bytes —
                content-addressed, immutable, cache-friendly.
              </p>
            </div>
            <div className="step">
              <span className="idx">02 · CALL</span>
              <h3>fetch()</h3>
              <p>
                An application calls the contract through <code>scaffold.fetch()</code>. No
                endpoints, no regions, no API keys — the hash is the address.
              </p>
            </div>
            <div className="step">
              <span className="idx">03 · ROUTE</span>
              <h3>Find the nearest peer</h3>
              <p>
                The request is routed over WebRTC (or WebSockets) to a peer that has the contract —
                often the device itself, otherwise the closest peer that does.
              </p>
            </div>
            <div className="step">
              <span className="idx">04 · EXECUTE</span>
              <h3>WASM in a worker</h3>
              <p>
                The peer runs the contract in a web worker — deterministic, sandboxed, off the main
                thread. The same binary produces the same output on every runtime.
              </p>
            </div>
            <div className="step">
              <span className="idx">05 · VERIFY</span>
              <h3>Collateralized result</h3>
              <p>
                The result returns with collateral staked on its correctness. Any peer can re-run
                the contract later; a mismatch slashes the collateral and pays whoever caught it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §02 TOPOLOGY ============ */}
      <section className="band">
        <div className="section-inner">
          <SectionHead
            num="§ 02 — Topology"
            title={<>Every user,<br />a <em>host</em>.</>}
          />
          <div className="split-2">
            <div className="copy">
              <h3>Your server connects like any other client.</h3>
              <p>
                There is no special node type. Browsers, CLIs, and servers all speak the same
                protocol: hold contracts, answer calls, verify each other. If you keep a server,
                it becomes one more peer — a useful source of truth for rare queries while the
                network absorbs the hot path.
              </p>
              <p>
                Capacity scales with adoption. Every user who opens your app adds compute, and the
                distance between a request and an answer shrinks as the mesh densifies.
              </p>
            </div>
            <div className="diagram-panel" aria-hidden="true">
              <svg viewBox="0 0 600 600">
                <defs>
                  <pattern id="bp" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M30 0 L0 0 L0 30" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" />
                  </pattern>
                </defs>
                <rect width="600" height="600" fill="url(#bp)" />
                <g stroke="currentColor" fill="none" strokeWidth="1.5">
                  <circle cx="300" cy="300" r="60" strokeDasharray="3 3" />
                  <circle cx="300" cy="300" r="120" strokeDasharray="2 6" opacity="0.4" />
                  <circle cx="300" cy="300" r="200" strokeDasharray="2 10" opacity="0.2" />
                </g>
                <g>
                  <g transform="translate(80,120)">
                    <rect width="60" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="30" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor">peer</text>
                  </g>
                  <g transform="translate(460,100)">
                    <rect width="60" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="30" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor">peer</text>
                  </g>
                  <g transform="translate(50,440)">
                    <rect width="60" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="30" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor">peer</text>
                  </g>
                  <g transform="translate(490,450)">
                    <rect width="60" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="30" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="currentColor">server</text>
                  </g>
                  <g transform="translate(270,30)">
                    <rect width="60" height="36" fill="var(--accent)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="30" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--accent-contrast)">contract</text>
                  </g>
                </g>
                <g transform="translate(260,270)">
                  <rect width="80" height="60" fill="var(--bg)" stroke="currentColor" strokeWidth="2" />
                  <text x="40" y="38" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="11" fill="currentColor" fontWeight="600">client</text>
                </g>
                <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35">
                  <path d="M140 140 L270 280" strokeDasharray="4 3" />
                  <path d="M460 130 L330 280" strokeDasharray="4 3" />
                  <path d="M110 460 L270 320" strokeDasharray="4 3" />
                  <path d="M490 460 L330 320" strokeDasharray="4 3" />
                  <path d="M300 66 L300 270" />
                </g>
                <g fontFamily="JetBrains Mono" fontSize="9" fill="currentColor" opacity="0.5">
                  <text x="10" y="20">0,0</text>
                  <text x="560" y="590">600,600</text>
                </g>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §03 CONSENSUS ============ */}
      <section className="band">
        <div className="section-inner">
          <SectionHead
            num="§ 03 — Consensus"
            title={<>A tree,<br />not a <em>chain</em>.</>}
          />
          <div className="split-2">
            <div className="diagram-panel" aria-hidden="true">
              <svg viewBox="0 0 600 360">
                <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.4">
                  <path d="M300 70 L160 160" />
                  <path d="M300 70 L440 160" />
                  <path d="M160 196 L90 280" />
                  <path d="M160 196 L230 280" />
                  <path d="M440 196 L370 280" />
                  <path d="M440 196 L510 280" />
                </g>
                <g fontFamily="JetBrains Mono" fontSize="10">
                  <g transform="translate(266,34)">
                    <rect width="68" height="36" fill="var(--accent)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="34" y="22" textAnchor="middle" fill="var(--accent-contrast)">block</text>
                  </g>
                  <g transform="translate(126,160)">
                    <rect width="68" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="34" y="22" textAnchor="middle" fill="currentColor">block</text>
                  </g>
                  <g transform="translate(406,160)">
                    <rect width="68" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="34" y="22" textAnchor="middle" fill="currentColor">block</text>
                  </g>
                  <g transform="translate(56,280)">
                    <rect width="68" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="34" y="22" textAnchor="middle" fill="currentColor">block</text>
                  </g>
                  <g transform="translate(196,280)">
                    <rect width="68" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="34" y="22" textAnchor="middle" fill="currentColor">block</text>
                  </g>
                  <g transform="translate(336,280)">
                    <rect width="68" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="34" y="22" textAnchor="middle" fill="currentColor">block</text>
                  </g>
                  <g transform="translate(476,280)">
                    <rect width="68" height="36" fill="var(--bg)" stroke="currentColor" strokeWidth="1.5" />
                    <text x="34" y="22" textAnchor="middle" fill="currentColor">block</text>
                  </g>
                </g>
              </svg>
            </div>
            <div className="copy">
              <h3>Consensus is reached as work continues.</h3>
              <p>
                Scaffold's data structure is a tree of immutable, content-addressed blocks.
                Branches grow in parallel — there is no global ordering to fight over, no mining,
                and no blocks-per-second ceiling. Two transactions that don't touch each other
                never wait on each other.
              </p>
              <p>
                Verification is the network's proof of work: peers re-run each other's
                computations and attest to the results. Agreement accumulates over time, and tiny
                transactions make it economical to verify even small computations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ §04 TRUST ============ */}
      <section className="band">
        <div className="section-inner statement">
          <div className="u-label" style={{ marginBottom: 32 }}>§ 04 — Trust</div>
          <h2>
            You can <em>trust</em> collateral.
          </h2>
          <p className="sub">
            A peer that stakes one dollar to answer a one-cent query has put one hundred times the
            query's value at risk. The answer is not trusted because a quorum voted on it; it is
            trusted because the peer committed real economic weight to its correctness. Correctness
            is priced continuously, and the incentive to catch bad responses is built directly into
            the protocol.
          </p>
        </div>
      </section>

      {/* ============ §05 SPEC ============ */}
      <section className="band">
        <div className="section-inner">
          <SectionHead num="§ 05 — Specification" title={<>At a<br />glance.</>} />
          <div className="spec-table">
            <div className="row">
              <span className="k">API</span>
              <span className="v">fetch()</span>
              <span className="d">One method. Existing projects integrate incrementally, starting with a single call.</span>
            </div>
            <div className="row">
              <span className="k">Contract runtime</span>
              <span className="v">WebAssembly</span>
              <span className="d">Deterministic, sandboxed, near-native. Rust and AssemblyScript SDKs today; WASI languages planned.</span>
            </div>
            <div className="row">
              <span className="k">Transport</span>
              <span className="v">WebRTC + WebSockets</span>
              <span className="d">Peer-to-peer where possible, relayed where necessary.</span>
            </div>
            <div className="row">
              <span className="k">Data structure</span>
              <span className="v">Tree of immutable blocks</span>
              <span className="d">Content-addressed; branches grow in parallel without global ordering.</span>
            </div>
            <div className="row">
              <span className="k">Proof of work</span>
              <span className="v">Verified computation</span>
              <span className="d">Peers earn by re-running and checking each other's results — useful work, not hashing.</span>
            </div>
            <div className="row">
              <span className="k">Trust vehicle</span>
              <span className="v">Collateral</span>
              <span className="d">Every response stakes value against its correctness. Wrong answers are slashed.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="band">
        <div className="section-inner">
          <div className="cta-band">
            <div className="txt">
              <h2>Go deeper.</h2>
              <p>
                The concepts guide covers contracts, blocks, generation versus verification, and
                the collateral lifecycle in detail.
              </p>
            </div>
            <Link to="/docs/concepts" className="go">
              <span>Read the docs</span>
              <span className="arrow">→</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
