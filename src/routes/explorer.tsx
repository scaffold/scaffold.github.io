import type { MetaFunction } from 'react-router';
import { pageMeta } from '../lib/meta';

export const meta: MetaFunction = ({ location }) =>
  pageMeta(
    'Explorer — Scaffold',
    'Live view of the Scaffold network. Opens with the public testnet in July 2026.',
    location.pathname,
  );

export default function ExplorerPage() {
  return (
    <main>
      <div className="page-head">
        <div className="inner">
          <div className="crumbs">
            <span>Scaffold</span>
            <span>Explorer</span>
          </div>
          <h1>
            Watch the <em>network</em>.
          </h1>
          <p className="sub">
            Blocks, contracts, peers, and verifications — live, from any browser. The explorer is
            itself a Scaffold application: the data you'll see here is served by the network it
            describes.
          </p>
        </div>
      </div>

      <section className="band flush" style={{ paddingTop: 0 }}>
        <div className="section-inner">
          {/* @scaffold/explorer mounts here once the testnet is public. */}
          <div className="explorer-shell" id="explorer-root">
            <span className="status">● Offline until testnet</span>
            <h2>Opens July 31, 2026</h2>
            <p>
              The explorer goes live with the public testnet — seeded peers, published contracts,
              and the tree of verified compute, explorable in real time.
            </p>
            <div className="rows">
              <div className="row"><span>Nodes</span><span>—</span></div>
              <div className="row"><span>Contracts</span><span>—</span></div>
              <div className="row"><span>Blocks</span><span>—</span></div>
              <div className="row"><span>Status</span><span>awaiting genesis</span></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
